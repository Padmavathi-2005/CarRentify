import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { Booking, BookingDocument, BookingStatus } from '../../bookings/schemas/booking.schema';
import { Car, CarDocument } from '../../cars/schemas/car.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Car.name) private carModel: Model<CarDocument>,
  ) {}

  async getStats() {
    const totalRevenue = await this.bookingModel.aggregate([
      { $match: { status: { $in: [BookingStatus.COMPLETED, BookingStatus.ACTIVE, BookingStatus.CONFIRMED] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const activeUsers = await this.userModel.countDocuments();
    
    const totalCars = await this.carModel.countDocuments();
    const availableCars = await this.carModel.countDocuments({ available: true });
    const fleetStatus = totalCars > 0 ? Math.round((availableCars / totalCars) * 100) : 0;

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const newBookings = await this.bookingModel.countDocuments({ createdAt: { $gte: lastMonth } });

    // Mock changes for now as we don't have historical snapshots yet
    return {
      revenue: { value: totalRevenue[0]?.total || 0, change: '+12.5%', up: true },
      users: { value: activeUsers, change: '+5.2%', up: true },
      fleet: { value: fleetStatus, change: '0%', up: true },
      bookings: { value: newBookings, change: '+18.4%', up: true }
    };
  }

  async getRecentActivity() {
    const bookings = await this.bookingModel.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('carId')
      .populate('customerId')
      .exec();

    return bookings.map(b => ({
      car: (b.carId as any)?.name || 'Unknown Car',
      user: (b.customerId as any)?.displayName || (b.customerId as any)?.firstName || 'Guest',
      status: b.status,
      time: this.formatTime((b as any).createdAt || new Date())
    }));
  }

  private formatTime(date: Date) {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }
}
