import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LanguageService } from './language/language.service';
import { LanguageController } from './language/language.controller';
import { Language, LanguageSchema } from './language/language.schema';
import { PolygonData, PolygonDataSchema } from './language/polygon.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb+srv://${configService.get('MONGO_KEY')}@languagemap.uqa8dcu.mongodb.net/LangMap?retryWrites=true&w=majority`,
      }),
    }),
    MongooseModule.forFeature([
      { name: Language.name, schema: LanguageSchema },
      { name: PolygonData.name, schema: PolygonDataSchema },
    ]),
  ],
  controllers: [LanguageController],
  providers: [LanguageService],
})
export class AppModule {}
