import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { Booking, BookingDocument, BookingStatus } from '../../bookings/schemas/booking.schema';
import { Car, CarDocument } from '../../cars/schemas/car.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Car.name) private carModel: Model<CarDocument>,
  ) {}

  /** Returns last N months of revenue and commission data */
  async getRevenueByMonth(months = 6) {
    const result = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const agg = await this.bookingModel.aggregate([
        {
          $match: {
            status: { $in: [BookingStatus.COMPLETED, BookingStatus.CONFIRMED, BookingStatus.ACTIVE] },
            createdAt: { $gte: start, $lt: end },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' },
            totalCommission: { $sum: '$platformFee' },
            count: { $sum: 1 },
          },
        },
      ]);

      result.push({
        month: start.toLocaleString('default', { month: 'short', year: '2-digit' }),
        revenue: agg[0]?.totalRevenue || 0,
        commission: agg[0]?.totalCommission || 0,
        bookings: agg[0]?.count || 0,
      });
    }

    return result;
  }

  /** Returns booking status distribution */
  async getBookingStatusBreakdown() {
    const statuses = [
      BookingStatus.CONFIRMED,
      BookingStatus.COMPLETED,
      BookingStatus.CANCELLED,
      BookingStatus.PENDING,
      BookingStatus.ACTIVE,
      BookingStatus.REJECTED,
      BookingStatus.AWAITING_PAYMENT,
    ];

    const result = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await this.bookingModel.countDocuments({ status }),
      })),
    );

    return result.filter((r) => r.count > 0);
  }

  /** Top 5 cars by bookings */
  async getTopCars(limit = 5) {
    const agg = await this.bookingModel.aggregate([
      { $match: { status: { $in: [BookingStatus.COMPLETED, BookingStatus.CONFIRMED, BookingStatus.ACTIVE] } } },
      { $group: { _id: '$carId', count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $lookup: { from: 'cars', localField: '_id', foreignField: '_id', as: 'car' } },
      { $unwind: '$car' },
      { $project: { name: '$car.name', image: '$car.images', count: 1, revenue: 1 } },
    ]);

    return agg.map((item) => ({
      name: item.name,
      image: Array.isArray(item.image) ? item.image[0] : item.image,
      bookings: item.count,
      revenue: item.revenue,
    }));
  }

  /** Payment method breakdown */
  async getPaymentMethodBreakdown() {
    const agg = await this.bookingModel.aggregate([
      { $match: { status: { $in: [BookingStatus.COMPLETED, BookingStatus.CONFIRMED, BookingStatus.ACTIVE] } } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
      { $sort: { count: -1 } },
    ]);

    return agg.map((item) => ({
      method: item._id || 'Unknown',
      count: item.count,
      revenue: item.revenue,
    }));
  }

  /** New user registrations per month */
  async getUserGrowthByMonth(months = 6) {
    const result = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const count = await this.userModel.countDocuments({
        createdAt: { $gte: start, $lt: end },
      });

      result.push({
        month: start.toLocaleString('default', { month: 'short', year: '2-digit' }),
        users: count,
      });
    }

    return result;
  }

  /** High-level KPI summary */
  async getSummaryKPIs() {
    const [totalBookings, completedBookings, cancelledBookings, totalUsers, totalCars] = await Promise.all([
      this.bookingModel.countDocuments(),
      this.bookingModel.countDocuments({ status: BookingStatus.COMPLETED }),
      this.bookingModel.countDocuments({ status: BookingStatus.CANCELLED }),
      this.userModel.countDocuments(),
      this.carModel.countDocuments(),
    ]);

    const revenueAgg = await this.bookingModel.aggregate([
      { $match: { status: { $in: [BookingStatus.COMPLETED, BookingStatus.CONFIRMED, BookingStatus.ACTIVE] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' }, commission: { $sum: '$platformFee' } } },
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;
    const totalCommission = revenueAgg[0]?.commission || 0;
    const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;
    const cancellationRate = totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0;

    return {
      totalRevenue,
      totalCommission,
      totalBookings,
      completedBookings,
      cancelledBookings,
      completionRate,
      cancellationRate,
      totalUsers,
      totalCars,
    };
  }
}
