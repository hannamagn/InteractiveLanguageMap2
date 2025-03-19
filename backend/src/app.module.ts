import { Module } from '@nestjs/common';
import { LanguageModule } from './language/language.module';

@Module({
  imports: [LanguageModule], 
})
export class AppModule {}
