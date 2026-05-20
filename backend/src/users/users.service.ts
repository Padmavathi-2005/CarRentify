import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CarsService } from '../cars/cars.service';
import { Booking, BookingDocument } from '../bookings/schemas/booking.schema';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
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
        } catch {
          return null; // Car might have been deleted
        }
      }),
    );

    return wishlistCars.filter((car) => car !== null);
  }

  // --- ADMIN OPERATIONS ---

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findAllSafe(): Promise<Partial<User>[]> {
    return this.userModel.find({}, 'firstName lastName email profileImage _id role').exec();
  }

  async findOne(idOrSlug: string): Promise<User> {
    let user;
    if (Types.ObjectId.isValid(idOrSlug)) {
      user = await this.userModel.findById(idOrSlug).exec();
    } else {
      user = await this.userModel.findOne({ slug: idOrSlug }).exec();
    }

    if (!user) throw new NotFoundException(`User ${idOrSlug} not found`);
    return user;
  }

  async create(userData: Partial<User>): Promise<User> {
    if (!userData.slug && (userData.displayName || (userData.firstName && userData.lastName))) {
      userData.slug = this.generateSlug(userData.displayName || `${userData.firstName} ${userData.lastName}`);
    }
    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    // Security: Prevent changing email through standard update
    delete userData.email;
    delete (userData as any).password;

    // Check displayName uniqueness
    if (userData.displayName) {
      const existing = await this.userModel.findOne({ 
        displayName: userData.displayName,
        _id: { $ne: id }
      });
      if (existing) {
        throw new Error('Display name is already taken');
      }
    }

    // Auto-verify logic: If any social is verified, the user gets the badge
    if (userData.isGoogleVerified || userData.isFacebookVerified || userData.isTwitterVerified) {
      userData.isVerified = true;
    }

    // Generate slug if not present
    if (!userData.slug && (userData.displayName || userData.firstName || userData.lastName)) {
      const name = userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
      if (name) {
        userData.slug = this.generateSlug(name);
      }
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { $set: userData }, { returnDocument: 'after' })
      .exec();
    if (!updatedUser)
      throw new NotFoundException(`User with ID ${id} not found`);
    return updatedUser;
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  async remove(id: string): Promise<any> {
    // 1. Safety Check: No active bookings/payments
    const activeStatuses = ['pending', 'approved', 'pickup'];
    const activeBookings = await this.bookingModel.findOne({
      $or: [{ customerId: id }, { vendorId: id }],
      status: { $in: activeStatuses }
    }).exec();

    if (activeBookings) {
      throw new BadRequestException('Cannot deactivate account while you have active bookings or ongoing trips.');
    }

    // 2. Hide all vehicle listings automatically
    await this.carsService.deactivateAllByVendor(id);

    // 3. Initiate Grace Period (7 Days)
    // We DON'T anonymize yet. We just freeze it.
    const result = await this.userModel.findByIdAndUpdate(id, { 
      $set: { 
        isActive: false,
        deactivatedAt: new Date() 
      } 
    }, { returnDocument: 'after' }).exec();

    if (!result) throw new NotFoundException(`User with ID ${id} not found`);
    
    return { success: true, message: 'Account deactivated. You have 7 days to recover it before permanent deletion.' };
  }

  async recoverByEmail(email: string): Promise<any> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) throw new NotFoundException('User not found');
    return this.recover(user._id.toString());
  }

  async recover(id: string): Promise<any> {
    const result = await this.userModel.findByIdAndUpdate(id, {
      $set: { 
        isActive: true,
        deactivatedAt: null 
      }
    }, { returnDocument: 'after' }).exec();

    if (!result) throw new NotFoundException(`User with ID ${id} not found`);

    // Optionally reactivate listings
    await this.carsService.reactivateAllByVendor(id);

    return { success: true, message: 'Welcome back! Your account has been recovered.' };
  }
}
