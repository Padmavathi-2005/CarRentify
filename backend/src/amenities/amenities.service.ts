import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Amenity, AmenityDocument } from './schemas/amenity.schema';

@Injectable()
export class AmenitiesService implements OnModuleInit {
  constructor(
    @InjectModel(Amenity.name) private amenityModel: Model<AmenityDocument>,
  ) {}

  async onModuleInit() {
    const count = await this.amenityModel.countDocuments();
    if (count === 0) {
      const defaultAmenities = [
        { name: 'Leather upholstery' },
        { name: 'Heated seats' },
        { name: 'Ventilated seats' },
        { name: 'Memory seats' },
        { name: 'Massage seats' },
        { name: 'Premium sound system' },
        { name: 'Wireless charging' },
        { name: 'Navigation system' },
        { name: 'Sunroof / Moonroof' },
        { name: 'Adaptive Cruise Control' },
        { name: 'Apple CarPlay / Android Auto' },
        { name: 'Backup Camera' },
        { name: 'Bluetooth connectivity' },
        { name: 'Keyless entry' },
      ];
      await this.amenityModel.insertMany(defaultAmenities);
      console.log('Successfully seeded default amenities');
    }
  }

  async findAll(): Promise<Amenity[]> {
    return this.amenityModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<Amenity> {
    const amenity = await this.amenityModel.findById(id).exec();
    if (!amenity)
      throw new NotFoundException(`Amenity with ID ${id} not found`);
    return amenity;
  }
}
