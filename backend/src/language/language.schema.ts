import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'LanguageMetaData' }) 
export class Language extends Document {
  @Prop()
  Language?: string;  

  @Prop()
  iso_code?: string;  

  @Prop([Object])
  Regions?: Array<{ name: string; osm_id?: string; region_osm_id?: string }>;  

  @Prop([Object])
  Countries?: Array<{
    osm_id: any;
    country_osm_id: any; name: string 
}>;  

  @Prop([String])
  Instances?: Array<string>; 

  @Prop([String])
  immediate_Language_Families?: Array<string>;

  @Prop([Object])
  number_of_speakers?: Array<{
    number?: string;
    'place surveyed'?: string;
    'number applies to'?: string;
    'time surveyed'?: string;
  }>;
}

export const LanguageSchema = SchemaFactory.createForClass(Language);