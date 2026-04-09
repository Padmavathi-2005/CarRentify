import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Currency, CurrencyDocument } from './schemas/currency.schema';

@Injectable()
export class CurrenciesService {
  constructor(@InjectModel(Currency.name) private model: Model<CurrencyDocument>) {}

  async create(dto: any): Promise<Currency> {
    const created = new this.model(dto);
    return created.save();
  }

  async findAll(): Promise<Currency[]> {
    return this.model.find().sort({ name: 1 }).exec();
  }

  async update(id: string, dto: any): Promise<Currency> {
    const updated = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!updated) throw new NotFoundException(`Currency #${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<any> {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException(`Currency #${id} not found`);
    return { id, deleted: true };
  }
}
