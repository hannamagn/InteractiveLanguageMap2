import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Language } from './language.schema';

interface Region {
  name: string;
  region_Country?: string;
  region_osm_id?: string;
  osm_id?: string;
}

const COUNTRY_ALIASES: Record<string, string> = {
  'China': "People's Republic of China",
  'United States of America': 'United States',
  'Russia': 'Russian Federation',
  'Dem. Rep. Congo': 'Democratic Republic of the Congo',
  'Czechia': 'Czech Republic',
  'South Korea': 'Republic of Korea',
  'North Korea': "Democratic People's Republic of Korea",
  'Iran': 'Islamic Republic of Iran',
  'Syria': 'Syrian Arab Republic',
  'Laos': "Lao People's Democratic Republic",
  'Moldova': 'Republic of Moldova',
  'Tanzania': 'United Republic of Tanzania',
  'Venezuela': 'Venezuela (Bolivarian Republic of)',
  'Vietnam': 'Viet Nam',
  'eSwatini': 'Eswatini',
  'Eq. Guinea': 'Equatorial Guinea',
  'Congo': 'Republic of the Congo',
  'Palestine': 'State of Palestine',
  'Gambia': 'The Gambia',
  'W. Sahara': 'Western Sahara',
  'Bosnia and Herz.': 'Bosnia and Herzegovina',
  "Côte d'Ivoire": "Ivory Coast",
  "S. Sudan": "South Sudan",
  'Central African Rep.': 'Central African Republic',
  'N. Cyprus': 'Northern Cyprus',
  'Solomon Is.': 'Solomon Islands',
  'Fr. Polynesia': 'French Polynesia',
  "Falkland Is.": "Falkland Islands",
  "S. Geo. and the Is.": "South Georgia and the South Sandwich Islands",
  "South Georgia": "South Georgia and the South Sandwich Islands",
  'Bahamas': 'The Bahamas',
  'Dominican Rep.': 'Dominican Republic',
  'St. Vin. and Gren.': 'Saint Vincent and the Grenadines',
  'Cook Is.': 'Cook Islands',
  'Fr. S. Antarctic Lands': 'French Southern and Antarctic Lands',
  'Turks and Caicos Is.': 'Turks and Caicos Islands',
  'Cabo Verde': 'Cape Verde',
  'Puerto Rico': 'Puerto Rico',
  'Vatican': 'Vatican City'
};

@Injectable()
export class LanguageService {
  private readonly logger = new Logger(LanguageService.name);

  constructor(
    @InjectModel(Language.name) private languageModel: Model<Language>,
  ) {}

  private async getLanguageDataFromDB(languageName: string): Promise<Language | null> {
    return await this.languageModel
      .findOne({ Language: { $regex: `^${languageName}$`, $options: 'i' } })
      .exec();
  }

  async getAllLanguageNames(): Promise<string[]> {
    const languages = await this.languageModel
      .find({}, { Language: 1, _id: 0 })
      .exec();

    return languages
      .map(doc => doc.Language)
      .filter((name): name is string => typeof name === 'string')
      .sort((a, b) => a.localeCompare(b));
  }

  async getLanguagesByRegion(name: string): Promise<{ language: string; isOfficial: boolean }[]> {
    const cleanedName = name.trim().toLowerCase();
  
    const languages = await this.languageModel.find({
      $or: [
        { 'Countries.name': new RegExp(`^${cleanedName}$`, 'i') },
        { 'Regions.name': new RegExp(`^${cleanedName}$`, 'i') },
      ]
    }).exec();
  
    return languages
      .filter(lang => typeof lang.Language === 'string')
      .map(lang => {
        const isOfficial = (lang.Countries || []).some(c =>
          typeof c.name === 'string' &&
          c.name.toLowerCase() === cleanedName &&
          (c.is_official_language === true || c.is_official_language === 'true')
        );
        return {
          language: lang.Language!,
          isOfficial
        };
      });
  }  

  private async getPolygonData(
    osmId: string | number,
    name: string,
    type: 'region' | 'country',
    isOfficial: boolean,
  ) {
    const query = { osm_id: typeof osmId === 'string' ? Number(osmId) : osmId };
    const polygonData = await this.languageModel.db
      .collection('PolygonData')
      .findOne(query);

    if (!polygonData) {
      this.logger.warn(`No polygon data for ${type}: ${name}`);
      return null;
    }

    let geometry = polygonData.geometry;
    if (!geometry && polygonData.cordinates) {
      geometry = {
        type: 'Polygon',
        coordinates: [polygonData.cordinates],
      };
    }
    return { geometry };
  }

  async getDetailedLanguagesByRegion(name: string): Promise<{ language: string; isOfficial: boolean }[]> {
    const possibleNames = [name, COUNTRY_ALIASES[name]].filter(Boolean);
  
    const languages = await this.languageModel.find({
      $or: possibleNames.flatMap(n => [
        { 'Countries.name': new RegExp(`^${n}$`, 'i') },
        { 'Regions.name': new RegExp(`^${n}$`, 'i') }
      ])
    }).exec();
  
    const result = languages
      .filter(lang => typeof lang.Language === 'string' && lang.Language.trim() !== '')
      .map(lang => {
        const isOfficial = (lang.Countries || []).some(c =>
          possibleNames.some(n =>
            typeof c.name === 'string' && c.name.toLowerCase() === n.toLowerCase()
          ) &&
          (c.is_official_language === true || c.is_official_language === 'true')
        );
  
        return {
          language: lang.Language!,
          isOfficial,
        };
      });
  
    return result;
  }  

  async createGeoJson(languageName: string): Promise<object> {
    const languageData = await this.getLanguageDataFromDB(languageName);
    if (!languageData) {
      throw new NotFoundException(`Language "${languageName}" not found`);
    }

    if (
      (!languageData.Regions || languageData.Regions.length === 0) &&
      (!languageData.Countries || languageData.Countries.length === 0)
    ) {
      throw new NotFoundException(`No countries or regions found for: ${languageName}`);
    }

    const languageFamily = Array.isArray(languageData.immediate_Language_Families)
    ? languageData.immediate_Language_Families.filter(f => f && f !== 'Missing')
    : [];  

    const speakerInfo = (languageData.number_of_speakers ?? [])
      .map(entry => {
        const num = entry.number;
        if (!num || num === 'Missing') return null;
        return {
          number: parseInt(num, 10),
          placeSurveyed: entry['place surveyed'] !== 'Missing' ? entry['place surveyed'] : null,
          appliesTo: entry['number applies to'] !== 'Missing' ? entry['number applies to'] : null,
          timeSurveyed: entry['time surveyed'] || null,
        };
      })
      .filter(entry => entry !== null);

    const countryFeatures: any[] = [];
    for (const country of languageData.Countries || []) {
      if (!country.country_osm_id && !country.osm_id) continue;

      const isOfficial =
        country.is_official_language === 'true' || country.is_official_language === true;

      const polygonResult = await this.getPolygonData(
        country.country_osm_id || country.osm_id,
        country.name,
        'country',
        isOfficial,
      );

      if (!polygonResult || !polygonResult.geometry) continue;

      const { geometry} = polygonResult;

      countryFeatures.push({
        type: 'Feature',
        properties: {
          country: country.name,
          type: 'country',
          language: languageData.Language,
          official: isOfficial,
        },
        geometry,
      });
    }

    const regionFeatures: any[] = [];
    const countryNamesSet = new Set(
      (languageData.Countries || []).map(c => (c.name))
    );
    
    for (const region of (languageData.Regions as Region[]) || []) {
      const regionName = region.name;
      if (!regionName) continue;
    
      if (countryNamesSet.has(regionName)) {
        continue;
      }
    
      const rawId = region.region_osm_id ?? region.osm_id;
      if (!rawId) continue;
    
      const matchId = Number(rawId);
      const polygonData = await this.languageModel.db
        .collection('PolygonData')
        .findOne({ osm_id: matchId });
    
      if (!polygonData) continue;
    
      let geometry = polygonData.geometry;
      if (!geometry && polygonData.cordinates) {
        geometry = {
          type: 'Polygon',
          coordinates: [polygonData.cordinates],
        };
      }
    
      if (!geometry) continue;
    
      const country = region.region_Country || 'Unknown';
    
      regionFeatures.push({
        type: 'Feature',
        properties: {
          region: regionName,
          country,
          type: 'region',
          language: languageData.Language,
          official: false
        },
        geometry,
      });
    }       

    const geoJsonFeatures = [...countryFeatures, ...regionFeatures];

    if (geoJsonFeatures.length === 0) {
      throw new NotFoundException('No valid GeoJSON-data found');
    }

    return {
      type: 'FeatureCollection',
      properties: {
        language: languageData.Language,
        iso_code: languageData.iso_code,
        countries: languageData.Countries?.map(c => c.name) || [],
        regions: languageData.Regions?.map(r => r.name) || [],
        language_family: languageFamily,
        number_of_speakers: speakerInfo,
      },
      features: geoJsonFeatures,
    };
  }
}