import { Controller, Get, Param, Res, HttpException, HttpStatus } from '@nestjs/common';
import { LanguageService } from './language.service';
import { Response } from 'express';

@Controller('language')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Get('geojson/:language')
  async getGeoJson(@Param('language') language: string, @Res() res: Response) {
    try {
      const geoJsonContent = await this.languageService.createGeoJson(language);

      res.header('Content-Type', 'application/geo+json');
      res.json(geoJsonContent);
    } catch (error) {
      console.error('Error while creating GeoJSON:', error);

      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to create GeoJSON',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('all-names')
  async getAllNames(@Res() res: Response) {
    try {
      const names = await this.languageService.getAllLanguageNames();
      res.json(names);
    } catch (error) {
      console.error('Error fetching language names:', error);
      throw new HttpException('Failed to fetch language names', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('region-details/:name')
async getDetailedLanguages(@Param('name') name: string, @Res() res: Response) {
  try {
    const result = await this.languageService.getDetailedLanguagesByRegion(name);
    res.json(result);
  } catch (error) {
    console.error('Error fetching region details:', error);
    throw new HttpException('Failed to fetch detailed region data', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

  @Get('by-region/:name')
  async getLanguagesByRegion(@Param('name') name: string, @Res() res: Response) {
    try {
      const result = await this.languageService.getLanguagesByRegion(name);
      res.json(result);
    } catch (error) {
      console.error('Error fetching languages for region:', error);
      throw new HttpException('Failed to fetch data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
