import { Controller, Get, Param } from '@nestjs/common';
import { LanguageService } from './language.service';
import { Language } from './language.entity';

@Controller('languages') 
export class LanguagesController {
  constructor(private readonly languageService: LanguageService) {}

  @Get() // Hämtar alla språk- men kanske inte komme gå
  getAll(): Promise<Language[]> {
    return this.languageService.findAll();
  }

  @Get(':id') // Hämtar ett specifikt språk med specifikt languageID
  getOne(@Param('id') id: number): Promise<Language | null> {
    return this.languageService.findOne(id);
  }
}
