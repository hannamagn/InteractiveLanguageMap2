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
}