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

  private validateCoordinates(coords: any): boolean {
    return (
      Array.isArray(coords) &&
      coords.every(pair => 
        Array.isArray(pair) &&
        pair.length === 2 &&
        typeof pair[0] === 'number' &&
        typeof pair[1] === 'number' &&
        pair[1] >= -90 && pair[1] <= 90 &&  
        pair[0] >= -180 && pair[0] <= 180   
      )
    );
  }

  async createGeoJson(languageName: string): Promise<object> {
    const languageData = await this.getLanguageDataFromDB(languageName);
    if (!languageData) {
      throw new NotFoundException(`Language "${languageName}" not found`);
    }
  
    if (!languageData.Regions || languageData.Regions.length === 0) {
      throw new NotFoundException(`No regions found for language: ${languageName}`);
    }
  
    const geoJsonFeatures: any[] = [];
    const countries = languageData.Countries ?? [];
  
    for (const region of languageData.Regions) {
      const regionData = await this.languageModel.db
        .collection('Regions')
        .findOne({ osm_id: region.osm_id });
  
      if (!regionData) {
        continue;
      }
  
      let geometry = regionData.geometry;
      if (!geometry && regionData.cordinates) {
        const coordinates = regionData.cordinates;
        if (!this.validateCoordinates(coordinates)) {
          console.warn(`Invalid coordinates for region: ${region.name}`, coordinates);
          continue;
        }
        geometry = {
          type: "Polygon",
          coordinates: [coordinates],
        };
      }
  
      if (!geometry) {
        continue;
      }
  
      const country = regionData.address?.country ||
                      (countries.length > 0 ? countries.map(c => c.name).join(', ') : "Unknown");
  
      geoJsonFeatures.push({
        type: "Feature",
        properties: {
          name: region.name,
          country: country,
          state: regionData.address?.state || "Unknown",
        },
        geometry,
      });
    }
  
    if (geoJsonFeatures.length === 0) {
      throw new NotFoundException('No valid GeoJSON data retrieved');
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
