import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PageDocument = HydratedDocument<Page>;

@Schema({ timestamps: true })
export class Page {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Object, default: {} })
  translations: Record<string, { title: string; content: string; metaDescription?: string }>;

  @Prop({ default: 'Draft' })
  status: string;

  @Prop({ default: '' })
  metaDescription: string;

  @Prop({ default: 'Default Template' })
  template: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: 'Show in Main Menu' })
  navigationVisibility: string;
}

export const PageSchema = SchemaFactory.createForClass(Page);
