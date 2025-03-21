// src/language/language.controller.ts
import { Controller, Get, Param, Res, HttpException, HttpStatus } from '@nestjs/common';
import { LanguageService } from './language.service';
import { Response } from 'express';

@Controller('language')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Get('kml/:language')
  async getKml(@Param('language') language: string, @Res() res: Response) {
    try {
      // Call the service to generate KML
      const kmlContent = await this.languageService.createKml(language);

      // Set the response headers to indicate this is KML data
      res.header('Content-Type', 'application/vnd.google-earth.kml+xml');
      res.send(kmlContent);
    } catch (error) {
      console.error('Error while creating KML:', error);

      // Handle errors and send an appropriate response
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to create KML',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
