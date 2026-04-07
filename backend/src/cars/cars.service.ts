import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Car, CarDocument } from './schemas/car.schema';
import { Brand, BrandDocument } from '../brands/schemas/brand.schema';

@Injectable()
export class CarsService implements OnModuleInit {
  constructor(
    @InjectModel(Car.name) private carModel: Model<CarDocument>,
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>
  ) {}

  async onModuleInit() {
    const count = await this.carModel.countDocuments();
    if (count === 0) {
      // Ensure brands are seeded (even if BrandsService does it, we check here for safety)
      let brands = await this.brandModel.find().exec();
      
      // If brands aren't ready yet, wait a moment or skip (BrandsService usually handles it)
      if (brands.length === 0) return;

      const getBrandId = (name: string) => brands.find(b => b.name === name)?._id;

      const seedData = [
        {
          brandName: 'Rolls-Royce',
          model: 'Phantom VIII',
          year: 2024,
          pricePerDay: 2500,
          image: 'https://images.unsplash.com/photo-1631214503951-375100d24275?q=80&w=2000&auto=format&fit=crop',
          description: 'The ultimate expression of luxury and refinement.',
          features: ['V12 Engine', 'Handcrafted Wood', 'Starlight Headliner'],
        },
        {
          brandName: 'Ferrari',
          model: 'SF90 Stradale',
          year: 2023,
          pricePerDay: 3500,
          image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?q=80&w=2000&auto=format&fit=crop',
          description: 'A hybrid supercar that redefines performance benchmarks.',
          features: ['Hybrid V8', '1000 HP', 'Active Aero'],
        },
        {
          brandName: 'Lamborghini',
          model: 'Revuelto',
          year: 2024,
          pricePerDay: 3200,
          image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=2014&auto=format&fit=crop',
          description: 'The first V12 High Performance Electrified Vehicle.',
          features: ['V12 Hybrid', 'Carbon Monofuselage', 'Incredible Tech'],
        },
        {
          brandName: 'Porsche',
          model: '911 GT3 RS',
          year: 2024,
          pricePerDay: 1800,
          image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop',
          description: 'Track-focused performance for the road.',
          features: ['Naturally Aspirated', 'Massive Downforce', 'PDK'],
        },
        {
          brandName: 'Bentley',
          model: 'Continental GT Speed',
          year: 2023,
          pricePerDay: 1500,
          image: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?q=80&w=2070&auto=format&fit=crop',
          description: 'Grand touring at its most potent and luxurious.',
          features: ['W12 Engine', 'All-Wheel Drive', 'Quilted Leather'],
        },
        {
          brandName: 'Aston Martin',
          model: 'DBS Volante',
          year: 2023,
          pricePerDay: 1900,
          image: 'https://images.unsplash.com/photo-1603584173870-7f309f8a71c2?q=80&w=2069&auto=format&fit=crop',
          description: 'Beautifully finished, brutally powerful.',
          features: ['Quad Exhaust', 'Carbon Ceramic Brakes', 'Signature Grille'],
        },
        {
          brandName: 'Mercedes-Benz',
          model: 'G 63 AMG',
          year: 2024,
          pricePerDay: 1200,
          image: 'https://images.unsplash.com/photo-1520050206274-a1af44633f7a?q=80&w=2070&auto=format&fit=crop',
          description: 'The icon of off-road luxury and presence.',
          features: ['Biturbo V8', 'Dual Side Pipes', 'Burmester Audio'],
        },
        {
          brandName: 'Tesla',
          model: 'Model S Plaid',
          year: 2024,
          pricePerDay: 800,
          image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop',
          description: 'Unprecedented performance and efficiency.',
          features: ['Tri-Motor', '1020 HP', 'Yoke Steering'],
        },
        {
          brandName: 'Audi',
          model: 'R8 V10 Performance',
          year: 2023,
          pricePerDay: 1400,
          image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=2070&auto=format&fit=crop',
          description: 'A masterpiece of precision and power.',
          features: ['V10 Engine', 'Quattro', 'Laser Lights'],
        },
        {
          brandName: 'BMW',
          model: 'M8 Competition',
          year: 2024,
          pricePerDay: 1300,
          image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2070&auto=format&fit=crop',
          description: 'The pinnacle of BMW luxury and performance.',
          features: ['M xDrive', 'Track Mode', 'Luxury Seating'],
        }
      ];

      const seedCars = seedData
        .map(data => ({
          ...data,
          brand: getBrandId(data.brandName),
          available: true
        }))
        .filter(car => car.brand);

      await this.carModel.insertMany(seedCars);
      console.log('Successfully seeded cars with linked brands.');
    }
  }

  async create(createCarDto: CreateCarDto): Promise<Car> {
    const createdCar = new this.carModel(createCarDto);
    return createdCar.save();
  }

  async findAll(): Promise<Car[]> {
    return this.carModel.find().exec();
  }

  async findOne(id: string): Promise<Car> {
    const car = await this.carModel.findById(id).exec();
    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }
    return car;
  }

  async update(id: string, updateCarDto: UpdateCarDto): Promise<Car> {
    const updatedCar = await this.carModel
      .findByIdAndUpdate(id, updateCarDto, { returnDocument: 'after' })
      .exec();
    if (!updatedCar) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }
    return updatedCar;
  }

  async remove(id: string): Promise<Car> {
    const deletedCar = await this.carModel.findByIdAndDelete(id).exec();
    if (!deletedCar) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }
    return deletedCar;
  }
}
