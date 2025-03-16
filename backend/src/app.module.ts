import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from './language/language.entity';
import { LanguagesController } from './language/language.controller';
import { LanguageService } from './language/language.service';
import { LanguageModule } from './language/language.module';

@Module({
  imports: [TypeOrmModule.forFeature([Language]), LanguageModule],
  controllers: [AppController, LanguagesController],
  providers: [AppService, LanguageService],

})
export class AppModule {}
