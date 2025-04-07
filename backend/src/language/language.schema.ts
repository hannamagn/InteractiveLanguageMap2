import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'LanguageMetaData' })
export class Language extends Document {
  @Prop()
  Language?: string;

  @Prop()
  iso_code?: string;

  @Prop([Object])
  Regions?: Array<{ name: string; region_osm_id: string }>;

  @Prop([Object])
  Countries?: Array<{ name: string; country_osm_id: string }>;

  @Prop([String])
  Instances?: Array<string>;
}

export const LanguageSchema = SchemaFactory.createForClass(Language);
