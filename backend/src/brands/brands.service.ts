import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from './schemas/brand.schema';

@Injectable()
export class BrandsService implements OnModuleInit {
  constructor(@InjectModel(Brand.name) private brandModel: Model<BrandDocument>) {}

  async onModuleInit() {
    const count = await this.brandModel.countDocuments();
    if (count === 0) {
      const seedBrands = [
        { name: 'Rolls-Royce', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-rolls-royce-8-202758.png' },
        { name: 'Ferrari', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-ferrari-4-202756.png' },
        { name: 'Lamborghini', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-lamborghini-3-202754.png' },
        { name: 'Porsche', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-porsche-12-202755.png' },
        { name: 'Bentley', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-bentley-1-202751.png' },
        { name: 'McLaren', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-mclaren-auto-202759.png' },
        { name: 'Aston Martin', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-aston-martin-2-202757.png' },
        { name: 'Mercedes-Benz', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-mercedes-benz-4-202753.png' },
        { name: 'BMW', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-bmw-10-202752.png' },
        { name: 'Audi', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-audi-3-202750.png' },
        { name: 'Tesla', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png' },
        { name: 'Range Rover', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Land_Rover_logo_2011.svg/1024px-Land_Rover_logo_2011.svg.png' },
      ];
      await this.brandModel.insertMany(seedBrands);
      console.log('Successfully seeded car brands.');
    }
  }

  async findAll() {
    return this.brandModel.find({ isActive: true }).exec();
  }

  async findByName(name: string) {
    return this.brandModel.findOne({ name }).exec();
  }
}
