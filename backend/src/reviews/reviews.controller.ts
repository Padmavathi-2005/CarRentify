import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(@Body() createReviewDto: any) {
    return await this.reviewsService.create(createReviewDto);
  }

  @Get('car/:carId')
  async findByCar(@Param('carId') carId: string) {
    return await this.reviewsService.findByCar(carId);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return await this.reviewsService.findByUser(userId);
  }
}
