import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CarsService } from '../cars/cars.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private carsService: CarsService,
  ) {}

  async toggleWishlist(userId: string, carId: string): Promise<string[]> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const index = user.wishlist.indexOf(carId);
    if (index === -1) {
      // Add to wishlist
      user.wishlist.push(carId);
    } else {
      // Remove from wishlist
      user.wishlist.splice(index, 1);
    }

    await user.save();
    return user.wishlist;
  }

  async getWishlist(userId: string): Promise<any[]> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Fetch car details for each ID in wishlist
    const wishlistCars = await Promise.all(
      user.wishlist.map(async (carId) => {
        try {
          return await this.carsService.findOne(carId);
        } catch (err) {
          return null; // Car might have been deleted
        }
      })
    );

    return wishlistCars.filter(car => car !== null);
  }

  // --- ADMIN OPERATIONS ---

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async create(userData: Partial<User>): Promise<User> {
    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(id, userData, { new: true }).exec();
    if (!updatedUser) throw new NotFoundException(`User with ID ${id} not found`);
    return updatedUser;
  }

  async remove(id: string): Promise<any> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`User with ID ${id} not found`);
    return { success: true, deletedId: id };
  }
}
