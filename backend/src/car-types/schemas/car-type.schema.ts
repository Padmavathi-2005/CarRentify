import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CarTypeDocument = CarType & Document;

@Schema({ timestamps: true })
export class CarType {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  icon?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const CarTypeSchema = SchemaFactory.createForClass(CarType);
