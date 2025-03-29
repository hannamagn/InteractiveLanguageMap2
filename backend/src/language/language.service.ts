import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Language } from './language.schema';

@Injectable()
export class LanguageService {
  constructor(
    @InjectModel(Language.name) private languageModel: Model<Language>,
  ) {}

  private async getLanguageDataFromDB(languageName: string) {
    return this.languageModel
      .findOne({ Language: { $regex: new RegExp(`^${languageName}$`, 'i') } })
      .exec();
  }

  async createGeoJson(languageName: string): Promise<object> {
    const languageData = await this.getLanguageDataFromDB(languageName);
    if (!languageData) {
      throw new NotFoundException(`Language "${languageName}" not found`);
    }

    if (!languageData.Regions || languageData.Regions.length === 0) {
      throw new Error(`No regions found for language: ${languageName}`);
    }

    const geoJsonFeatures: any[] = [];

    for (const region of languageData.Regions) {
      const regionData = await this.languageModel.db
        .collection('Regions')
        .findOne({ osm_id: region.osm_id });

      if (!regionData) {
        continue;
      }

      let geometry = regionData.geometry;
      if (!geometry && regionData.cordinates) {
        geometry = {
          type: "Polygon",
          coordinates: regionData.cordinates,
        };
      }
      
      if (!geometry) {
        continue;
      }
    
      geoJsonFeatures.push({
        type: "Feature",
        properties: {
          name: region.name,
          country: regionData.address?.country || "Unknown",
          state: regionData.address?.state || "Unknown",
        },
        geometry,
      });
    }

    if (geoJsonFeatures.length === 0) {
      throw new Error('No valid GeoJSON data retrieved');
    }

    return {
      type: "FeatureCollection",
      properties: {
        language: languageData.Language,
        iso_code: languageData.iso_code,
        countries: (languageData.Countries ?? []).map(c => c.name),
      },
      features: geoJsonFeatures,
    };
  }
}
