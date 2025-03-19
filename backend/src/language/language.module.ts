import { Module } from '@nestjs/common';
import { LanguagesController } from './language.controller';
import { LanguageService } from './language.service';

@Module({
  controllers: [LanguagesController], 
  providers: [LanguageService], 
})
export class LanguageModule {}
