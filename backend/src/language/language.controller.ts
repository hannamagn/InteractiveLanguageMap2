import { Controller, Get, Param, Res, HttpException, HttpStatus } from '@nestjs/common';
import { LanguageService } from './language.service';
import { Response } from 'express';

@Controller('language')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Get('kml/:language')
  async getKml(@Param('language') language: string, @Res() res: Response) {
    try {
      const kmlContent = await this.languageService.createKml(language);
      res.header('Content-Type', 'application/vnd.google-earth.kml+xml');
      res.send(kmlContent);
    } catch (error) {
      // Log the error to the console for more details
      console.error('Error while creating KML:', error);

      // Throw an HTTP exception with a custom message and status code
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to create KML',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
