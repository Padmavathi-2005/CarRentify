import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AmenityDocument = Amenity & Document;

@Schema({ timestamps: true })
export class Amenity {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: false })
  icon?: string;

  @Prop({ required: false })
  description?: string;
}

export const AmenitySchema = SchemaFactory.createForClass(Amenity);
