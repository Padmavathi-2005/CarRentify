import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async create(reviewData: any): Promise<Review> {
    const newReview = new this.reviewModel({
      ...reviewData,
      user: new Types.ObjectId(reviewData.user),
      car: new Types.ObjectId(reviewData.car),
      booking: reviewData.booking ? new Types.ObjectId(reviewData.booking) : undefined,
    });
    return await newReview.save();
  }

  async findByCar(carId: string): Promise<Review[]> {
    return await this.reviewModel
      .find({ car: new Types.ObjectId(carId) })
      .populate('user', 'name profileImage') // Get reviewer details
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUser(userId: string): Promise<Review[]> {
    return await this.reviewModel
      .find({ user: new Types.ObjectId(userId) })
      .populate('car', 'name images brandName model') // Get car details for the user dashboard
      .sort({ createdAt: -1 })
      .exec();
  }

  async getUserStats(userId: string, isHost: boolean = false): Promise<{ averageScore: string, totalReviews: number }> {
    if (isHost) {
      // Find all cars belonging to this host
      const CarModel = this.reviewModel.db.model('Car');
      const hostCars = await CarModel.find({ vendor: new Types.ObjectId(userId) }).select('_id').exec();
      const carIds = hostCars.map(c => c._id);
      
      const reviews = await this.reviewModel.find({ car: { $in: carIds } });
      if (!reviews.length) return { averageScore: "0.0", totalReviews: 0 };
      
      const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      return { averageScore: avg.toFixed(1), totalReviews: reviews.length };
    } else {
      // For renter, maybe just reviews they wrote, or if they have reviews as a renter. 
      // For now, let's return their written feedback score as a placeholder.
      const reviews = await this.reviewModel.find({ user: new Types.ObjectId(userId) });
      if (!reviews.length) return { averageScore: "0.0", totalReviews: 0 };
      
      const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      return { averageScore: avg.toFixed(1), totalReviews: reviews.length };
    }
  }

  async findByHost(userId: string): Promise<Review[]> {
    const CarModel = this.reviewModel.db.model('Car');
    const hostCars = await CarModel.find({ vendor: new Types.ObjectId(userId) }).select('_id').exec();
    const carIds = hostCars.map(c => c._id);
    
    return await this.reviewModel
      .find({ car: { $in: carIds } })
      .populate('user', 'name profileImage') // Get reviewer details
      .populate('car', 'name images') // Get car details
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByBooking(bookingId: string): Promise<Review | null> {
    return await this.reviewModel
      .findOne({ booking: new Types.ObjectId(bookingId) })
      .exec();
  }
}
