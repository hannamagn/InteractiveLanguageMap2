import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class Geometry extends Document {
  @Prop({ required: true })
  type!: string;

  @Prop({ required: true, type: Array })
  coordinates!: any[];
}

export const GeometrySchema = SchemaFactory.createForClass(Geometry);
