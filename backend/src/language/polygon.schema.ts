import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Geometry, GeometrySchema } from './geometry.schema';

@Schema({ collection: 'PolygonData' })
export class PolygonData extends Document {
  @Prop({ required: true })
  osm_id!: number;

  @Prop({ required: true, type: GeometrySchema })
  geometry!: Geometry;
}

export const PolygonDataSchema = SchemaFactory.createForClass(PolygonData);
