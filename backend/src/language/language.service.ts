import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
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

  private createOSMQuery(osmId: string): string {
    return `https://nominatim.openstreetmap.org/lookup?osm_ids=R${osmId}&polygon_kml=1`;
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
  
    // Hämta KML-data för alla regioner
    const kmlFragments: string[] = [];
    for (const region of languageData.Regions) {
      const queryUrl = this.createOSMQuery(region.osm_id);
      console.log(`Fetching OSM data from: ${queryUrl}`);
  
      try {
        const response = await axios.get(queryUrl, {
          headers: { 'User-Agent': 'YourAppName - contact@yourdomain.com' },
          responseType: 'text',
        });
  
        if (typeof response.data !== 'string') {
          throw new Error('Unexpected response format from OSM');
        }
  
        const geokmlMatch = response.data.match(/<geokml>(.*?)<\/geokml>/);
        if (!geokmlMatch || geokmlMatch.length < 2) {
          console.error(`Invalid geokml data from OSM for region: ${region.name}`);
          continue; 
        }
  
        kmlFragments.push(`
          <Placemark>
            <name>${region.name}</name>
            ${geokmlMatch[1]}
          </Placemark>
        `);
  
      } catch (error) {
        console.error(`Error fetching OSM data for region: ${region.name}`, error);
      }
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
