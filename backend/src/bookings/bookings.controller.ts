import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  UseGuards,
  Request,
  NotFoundException,
  StreamableFile,
  Header
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('sign-agreement/:id')
  async acceptAgreement(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    const ip = req.headers['x-forwarded-for'] || req.ip || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    return this.bookingsService.acceptAgreement(id, req.user.userId, ip, userAgent, body.signatureBase64);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/agreement/pdf')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="rental-agreement.pdf"')
  async getAgreementPdf(@Param('id') id: string) {
    const pdfDoc = await this.bookingsService.generateAgreementPdf(id);
    return new StreamableFile(pdfDoc as any);
  }

  @Get('availability/:carId')
  async getAvailability(@Param('carId') carId: string) {
    return this.bookingsService.getCarAvailability(carId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-bookings')
  async getMyBookings(@Request() req: any) {
    return this.bookingsService.getUserBookings(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('vendor-bookings')
  async getVendorBookings(@Request() req: any) {
    return this.bookingsService.getVendorBookings(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string, @Request() req: any) {
    return this.bookingsService.getById(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/claim')
  async submitClaim(@Param('id') id: string, @Body() claimData: any, @Request() req: any) {
    return this.bookingsService.submitClaim(id, req.user.userId, claimData);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() bookingData: any, @Request() req: any) {
    return this.bookingsService.create(bookingData, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/approve')
  async approve(@Param('id') id: string, @Request() req: any) {
    return this.bookingsService.approve(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/request-delay')
  async requestDelay(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.bookingsService.requestDelay(id, req.user.userId, body.reason);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/extend')
  async extendTrip(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.bookingsService.extendTrip(id, req.user.userId, body.endDate, body.returnTime);
  }


  @UseGuards(JwtAuthGuard)
  @Patch(':id/reject')
  async reject(@Param('id') id: string, @Request() req: any) {
    return this.bookingsService.reject(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel-vendor')
  async cancelByVendor(@Param('id') id: string, @Request() req: any) {
    return this.bookingsService.cancelByVendor(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel-customer')
  async cancelByCustomer(@Param('id') id: string, @Request() req: any) {
    return this.bookingsService.cancelByCustomer(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/refund-preview')
  async getRefundPreview(@Param('id') id: string, @Request() req: any) {
    const booking = await this.bookingsService.getUserBookings(req.user.userId);
    const target = booking.find(b => b._id.toString() === id);
    if (!target) throw new NotFoundException('Booking not found');
    const percentage = await this.bookingsService.calculateRefundPercentage(target as any);
    return {
      refundPercentage: percentage,
      refundAmount: (target.totalPrice * percentage) / 100
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/verify-condition')
  async verifyConditionHost(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.bookingsService.verifyConditionHost(id, req.user.userId, body.mileage, body.conditionImage);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/accept-condition')
  async acceptConditionCustomer(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.bookingsService.acceptConditionCustomer(id, req.user.userId, body.signature);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/late-response')
  async lateReturnResponse(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.bookingsService.lateReturnResponse(id, req.user.userId, body.response);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/verify-return')
  async verifyReturnHost(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.bookingsService.verifyReturnHost(id, req.user.userId, body.mileage, body.conditionImage);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/accept-return')
  async acceptReturnCustomer(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.bookingsService.acceptReturnCustomer(id, req.user.userId, body.signature);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/reject-condition')
  async rejectConditionCustomer(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.bookingsService.rejectConditionCustomer(id, req.user.userId, body.reason);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/reject-return')
  async rejectReturnCustomer(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.bookingsService.rejectReturnCustomer(id, req.user.userId, body.reason);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/report-host')
  async reportHost(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.bookingsService.reportHost(id, req.user.userId, body.reason, body.details);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/check-in')
  async checkIn(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    return this.bookingsService.checkIn(id, req.user.userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/check-out')
  async checkOut(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    return this.bookingsService.checkOut(id, req.user.userId, data);
  }
}
