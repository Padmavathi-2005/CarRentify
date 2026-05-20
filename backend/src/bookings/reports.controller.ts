import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reports')
export class ReportsController {
  constructor(
    @InjectModel('Report') private reportModel: Model<any>
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll() {
    return this.reportModel.find()
      .populate({ path: 'reporterId', select: 'firstName lastName email' })
      .populate({ path: 'reportedId', select: 'firstName lastName email' })
      .populate({ path: 'bookingId', select: 'totalPrice startDate endDate' })
      .sort({ createdAt: -1 });
  }
}
