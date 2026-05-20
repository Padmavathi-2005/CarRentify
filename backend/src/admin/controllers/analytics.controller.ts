import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';
import { JwtAuthGuard } from '../../auth/strategies/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  async getSummaryKPIs() {
    return this.analyticsService.getSummaryKPIs();
  }

  @Get('revenue')
  async getRevenueByMonth(@Query('months') months?: string) {
    return this.analyticsService.getRevenueByMonth(months ? parseInt(months) : 6);
  }

  @Get('booking-status')
  async getBookingStatusBreakdown() {
    return this.analyticsService.getBookingStatusBreakdown();
  }

  @Get('top-cars')
  async getTopCars(@Query('limit') limit?: string) {
    return this.analyticsService.getTopCars(limit ? parseInt(limit) : 5);
  }

  @Get('payment-methods')
  async getPaymentMethodBreakdown() {
    return this.analyticsService.getPaymentMethodBreakdown();
  }

  @Get('user-growth')
  async getUserGrowthByMonth(@Query('months') months?: string) {
    return this.analyticsService.getUserGrowthByMonth(months ? parseInt(months) : 6);
  }
}
