import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Language } from './language.schema';

@Injectable()
export class LanguageService {
  private readonly logger = new Logger(LanguageService.name);

  constructor(
    @InjectModel(Language.name) private languageModel: Model<Language>,
  ) {}

  private async getLanguageDataFromDB(languageName: string): Promise<Language | null> {
    const result = await this.languageModel
      .findOne({ Language: { $regex: `^${languageName}$`, $options: 'i' } })
      .exec();
    return result;
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


  private async getPolygonData(osmId: string | number, name: string, type: 'region' | 'country', isOfficial: boolean) {
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
      const coordinates = polygonData.cordinates;
      geometry = {
        type: 'Polygon',
        coordinates: [coordinates],
      };
    }
    const color = isOfficial ? 'green' : 'yellow';

    return {geometry, color};
  }

  async createGeoJson(languageName: string): Promise<object> {
    const languageData = await this.getLanguageDataFromDB(languageName);
    if (!languageData) {
      throw new NotFoundException(`Language "${languageName}" not found`);
    }

    if ((!languageData.Regions || languageData.Regions.length === 0) &&
        (!languageData.Countries || languageData.Countries.length === 0)) {
      throw new NotFoundException(`No countries or regions found for: ${languageName}`);
    }

    const countryFeatures: any[] = [];
    const regionFeatures: any[] = [];
    
    for (const country of languageData.Countries || []) {
      if (!country.country_osm_id && !country.osm_id) continue;
    
      const isOfficial = country.is_official_language === 'true' || country.is_official_language === true;
    
      const polygonResult = await this.getPolygonData(
        country.country_osm_id || country.osm_id,
        country.name,
        'country',
        isOfficial
      );
    
      if (!polygonResult || !polygonResult.geometry) continue;
    
      const { geometry, color } = polygonResult;
    
      countryFeatures.push({
        type: 'Feature',
        properties: {
          country: country.name,
          type: 'country',
          language: languageData.Language,
          color,
        },
        geometry,
      });
    }
    
    for (const region of languageData.Regions || []) {
      const rawId = region.region_osm_id ?? region.osm_id;
      if (!rawId) {
        this.logger.warn(`Skipping region with no ID: ${region.name}`);
        continue;
      }
      const matchId = Number(rawId);
      const polygonData = await this.languageModel.db
        .collection('PolygonData')
        .findOne({ osm_id: matchId });
      
      if (!polygonData) {
        this.logger.warn(`No polygon data found for region osm_id: ${matchId}`);
        continue;
      }
      
      let geometry = polygonData.geometry;
      if (!geometry && polygonData.cordinates) {
        const coordinates = polygonData.cordinates;
        geometry = {
          type: 'Polygon',
          coordinates: [coordinates],
        };
      }
      
      if (!geometry) {
        this.logger.warn(`No valid geometry for region: ${region.name}`);
        continue;
      }
      
      const country = polygonData.address?.country ||
        (languageData.Countries && languageData.Countries.length > 0
          ? languageData.Countries.map(c => c.name).join(', ')
          : 'Unknown');
      
      regionFeatures.push({
        type: 'Feature',
        properties: {
          region: region.name,
          country: country,
          type: 'region',
          language: languageData.Language,
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
        regions: languageData.Regions ? languageData.Regions.map(r => r.name) : [],
        countries: languageData.Countries ? languageData.Countries.map(c => c.name) : [],
      },
      features: geoJsonFeatures,
    };
  }
}
