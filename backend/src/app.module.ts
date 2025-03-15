import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from './language.entity';
import { LanguagesController } from './language.controller';
import { LanguageService } from './language.service';

@Module({
  imports: [TypeOrmModule.forFeature([Language])],
  controllers: [AppController, LanguagesController],
  providers: [AppService, LanguageService],

})
export class AppModule {}
