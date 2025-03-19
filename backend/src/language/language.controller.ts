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
      throw new HttpException('Failed to create KML', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
