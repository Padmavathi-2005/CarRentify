import { Controller, Post, Get, Param, Body, Query, NotFoundException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(@Body() createReviewDto: any) {
    return await this.reviewsService.create(createReviewDto);
  }

  @Get('featured')
  async getFeaturedReviews() {
    return await this.reviewsService.getFeaturedReviews();
  }

  @Get('car/:carId')
  async findByCar(@Param('carId') carId: string) {
    return await this.reviewsService.findByCar(carId);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return await this.reviewsService.findByUser(userId);
  }

  @Get('stats/:userId')
  async getUserStats(@Param('userId') userId: string, @Query('isHost') isHost: string) {
    return await this.reviewsService.getUserStats(userId, isHost === 'true');
  }

  @Get('host/:userId')
  async findByHost(@Param('userId') userId: string) {
    return await this.reviewsService.findByHost(userId);
  }

  @Get('booking/:bookingId')
  async findByBooking(@Param('bookingId') bookingId: string) {
    const review = await this.reviewsService.findByBooking(bookingId);
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }
}
