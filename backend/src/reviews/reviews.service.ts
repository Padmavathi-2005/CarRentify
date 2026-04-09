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
}
