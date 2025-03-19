import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { AxiosError } from 'axios';


@Injectable()
export class LanguageService {

  private loadLanguagesFromFile(): any[] {
    const filePath = path.join(__dirname, '..', '..', 'languages.json'); // Adjust path to root directory
    console.log('Loading languages from file:', filePath); // Debugging
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData);
  }
  

  private async getLanguageDataFromDB(languageName: string): Promise<any> {
    const languages = this.loadLanguagesFromFile();
    console.log('Loaded languages:', languages); // Debugging
    return languages.find(language => language.languageLabel === languageName);
  }

  private createOSMQuery(osmId: string): string {
    const queryUrl = `https://nominatim.openstreetmap.org/lookup?osm_ids=R${osmId}&polygon_kml=1`;
    console.log('OSM Query URL:', queryUrl); // Debugging
    return queryUrl;
  }
  

  async createKml(languageName: string): Promise<string> {
    console.log('Creating KML for language:', languageName); // Debugging
    const languageData = await this.getLanguageDataFromDB(languageName);
    
    if (!languageData) {
      console.error('Language not found:', languageName); // Error debugging
      throw new Error('Language not found');
    }

    const queryUrl = this.createOSMQuery(languageData.region_osm);
    console.log('OSM query URL:', queryUrl); // Debugging

    try {
      let response;
      try {
        response = await axios.get(queryUrl, {
          headers: {
            'User-Agent': 'YourAppName - contact@yourdomain.com',
          },
          responseType: 'text',
        });
        console.log('OSM Response:', response.data); // Debugging
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          console.error('Error fetching OSM data:', error.response ? error.response.data : error.message);
        } else {
          console.error('Unknown error:', error);
        }
        throw new Error('Failed to fetch OSM data');
      }
      

      console.log('OSM Response:', response.data); // Debugging

      const newKml = `
        <?xml version="1.0" encoding="UTF-8"?>
        <kml xmlns="http://www.opengis.net/kml/2.2">
          <Document>
            <Placemark>
              <name>${languageData.languageLabel}</name>
              <description><![CDATA[
                <h3>${languageData.languageLabel}</h3>
                <p><b>Countries:</b> ${languageData.countries}</p>
                <p><b>Regions:</b> ${languageData.regions}</p>
              ]]></description>
              <!-- Optionally include coordinates from the API response -->
            </Placemark>
          </Document>
        </kml>
      `;
      return newKml.trim();
    } catch (error) {
      console.error('Error while fetching OSM data:', error); // Error debugging
      throw new Error('Failed to fetch OSM data');
    }
  }
}
