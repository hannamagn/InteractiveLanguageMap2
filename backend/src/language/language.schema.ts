import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'LanguageMetaData' }) // Specify the collection name
export class Language extends Document {
  @Prop()
  Language?: string;  // Mark as optional

  @Prop()
  iso_code?: string;  // Mark as optional

  @Prop([Object])
  Regions?: Array<{ name: string; osm_id: string }>; // Mark as optional

  @Prop([Object])
  Countries?: Array<{ name: string }>;  // Mark as optional

  @Prop([String])
  Instances?: Array<string>;  // Mark as optional
}

export const LanguageSchema = SchemaFactory.createForClass(Language);