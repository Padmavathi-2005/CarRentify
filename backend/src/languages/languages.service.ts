import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Language, LanguageDocument } from './schemas/language.schema';

@Injectable()
export class LanguagesService {
  constructor(@InjectModel(Language.name) private model: Model<LanguageDocument>) {}

  async create(dto: any): Promise<Language> {
    const created = new this.model(dto);
    return created.save();
  }

  async findAll(): Promise<Language[]> {
    return this.model.find().sort({ name: 1 }).exec();
  }

  async update(id: string, dto: any): Promise<Language> {
    const updated = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!updated) throw new NotFoundException(`Language #${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<any> {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException(`Language #${id} not found`);
    return { id, deleted: true };
  }
}
