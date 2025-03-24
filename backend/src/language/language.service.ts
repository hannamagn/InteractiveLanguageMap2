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
    console.log(`Searching for language: ${languageName}`);
    return this.languageModel
      .findOne({ Language: { $regex: new RegExp(`^${languageName}$`, 'i') } })
      .exec();
  }

  async createKml(languageName: string): Promise<string> {
    console.log(`Fetching data for language: ${languageName}`);

    const languageData = await this.getLanguageDataFromDB(languageName);
    if (!languageData) {
      console.error(`Language not found: ${languageName}`);
      throw new NotFoundException(`Language "${languageName}" not found`);
    }

    if (!languageData.Regions || languageData.Regions.length === 0) {
      throw new Error(`No regions found for language: ${languageName}`);
    }

    const kmlFragments: string[] = [];

    for (const region of languageData.Regions) {
      const regionData = await this.languageModel.db
        .collection('Regions')
        .findOne({ osm_id: region.osm_id });

      if (!regionData || !regionData.cordinates || regionData.cordinates.length === 0) {
        console.error(`No coordinates found for region: ${region.name}`);
        continue;
      }

      const coordinatesString = regionData.cordinates
        .map(([lng, lat]: [number, number]) => `${lng},${lat},0`)
        .join(' ');

      kmlFragments.push(`
        <Placemark>
          <name>${region.name}</name>
          <Polygon>
            <outerBoundaryIs>
              <LinearRing>
                <coordinates>${coordinatesString}</coordinates>
              </LinearRing>
            </outerBoundaryIs>
          </Polygon>
        </Placemark>
      `);
    }

    if (kmlFragments.length === 0) {
      throw new Error('No valid KML data retrieved');
    }

    return `
      <?xml version="1.0" encoding="UTF-8"?>
      <kml xmlns="http://www.opengis.net/kml/2.2">
        <Document>
          <name>${languageData.Language}</name>
          <description><![CDATA[
            <h3>${languageData.Language}</h3>
            <p><b>ISO Code:</b> ${languageData.iso_code}</p>
            <p><b>Countries:</b> ${(languageData.Countries ?? []).map(c => c.name).join(', ')}</p>
            <p><b>Regions:</b> ${(languageData.Regions ?? []).map(r => r.name).join(', ')}</p>
          ]]></description>
          ${kmlFragments.join('\n')}
        </Document>
      </kml>
    `.trim();
  }
}
