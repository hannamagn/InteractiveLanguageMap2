import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LanguageService } from './language/language.service';
import { LanguageController } from './language/language.controller';
import { Language, LanguageSchema } from './language/language.schema';  // Import the schema

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/InteractiveLanguageMap'), // Update with your DB connection if needed

    MongooseModule.forFeature([{ name: Language.name, schema: LanguageSchema }]),  // Register Language schema
  ],
  controllers: [LanguageController],
  providers: [LanguageService],
})
export class AppModule {}
