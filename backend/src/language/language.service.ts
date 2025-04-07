import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Language } from './language.schema';
import { PolygonData } from './polygon.schema';

@Injectable()
export class LanguageService {
  private readonly logger = new Logger(LanguageService.name);

  constructor(
    @InjectModel(Language.name) private languageModel: Model<Language>,
    @InjectModel(PolygonData.name) private polygonModel: Model<PolygonData>,
  ) {}

  private async getLanguageDataFromDB(languageName: string): Promise<Language | null> {
    const result = await this.languageModel
      .findOne({ Language: { $regex: `^${languageName}$`, $options: 'i' } })
      .exec();
    return result;
  }
  

  private async getPolygonData(osmId: string | number, name: string, type: 'region' | 'country') {
    const query = { osm_id: typeof osmId === 'string' ? Number(osmId) : osmId };

    const polygonData = await this.polygonModel.findOne(query).exec();

    if (!polygonData) {
      this.logger.warn(`No polygon data for ${type}: ${name}`);
      return null;
    }

    if (polygonData.geometry) {
      return polygonData.geometry;
    }

    return null;
  }

  async createGeoJson(languageName: string): Promise<object> {
    const languageData = await this.getLanguageDataFromDB(languageName);
    if (!languageData) {
      throw new NotFoundException(`Language "${languageName}" not found`);
    }

    if ((!languageData.Regions || languageData.Regions.length === 0) &&
        (!languageData.Countries || languageData.Countries.length === 0)) {
      throw new NotFoundException(
        `No countries or regions found for: ${languageName}`,
      );
    }

    const countryFeatures: any[] = [];
    const regionFeatures: any[] = [];
    
    for (const country of languageData.Countries || []) {
      const geometry = await this.getPolygonData(country.country_osm_id, country.name, 'country');
      if (!geometry) continue;
    
      countryFeatures.push({
        type: 'Feature',
        properties: {
          country: country.name,
          type: 'country',
          language: languageData.Language,
        },
        geometry,
      });
    }
    
    for (const region of languageData.Regions || []) {
      const geometry = await this.getPolygonData(region.region_osm_id, region.name, 'region');
      if (!geometry) continue;
    
      regionFeatures.push({
        type: 'Feature',
        properties: {
          region: region.name,
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
