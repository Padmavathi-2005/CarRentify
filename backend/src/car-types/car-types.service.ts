import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CarType, CarTypeDocument } from './schemas/car-type.schema';

@Injectable()
export class CarTypesService implements OnModuleInit {
  constructor(
    @InjectModel(CarType.name) private carTypeModel: Model<CarTypeDocument>,
  ) {}

  async onModuleInit() {
    const count = await this.carTypeModel.countDocuments();
    if (count === 0) {
      const types = ['Hatchback', 'Sedan', 'SUV', 'MUV', 'Electric'];
      await this.carTypeModel.insertMany(types.map((name) => ({ name })));
      console.log('Seed: CarTypes initialized successfully.');
    }
  }

  async findAll() {
    return this.carTypeModel.find({ isActive: true }).exec();
  }

  async findOne(id: string) {
    return this.carTypeModel.findById(id).exec();
  }

  async create(data: any) {
    return new this.carTypeModel(data).save();
  }

  async update(id: string, data: any) {
    return this.carTypeModel.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  }

  async remove(id: string) {
    return this.carTypeModel.findByIdAndDelete(id);
  }
}
