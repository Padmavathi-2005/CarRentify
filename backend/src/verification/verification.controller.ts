import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { VerificationService } from './verification.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  // User: Submit documents
  @Post('submit')
  @UseGuards(JwtAuthGuard)
  async submit(@Req() req: any, @Body('documents') documents: any[]) {
    return this.verificationService.submit(req.user.userId, documents);
  }

  // User: Get my verification status
  @Get('my-status')
  @UseGuards(JwtAuthGuard)
  async getMyStatus(@Req() req: any) {
    const status = await this.verificationService.getMyStatus(req.user.userId);
    return status || { status: 'not_submitted' };
  }

  // Admin: Get all submissions
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll() {
    return this.verificationService.findAll();
  }

  // Admin: Approve
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async approve(@Param('id') id: string, @Body('adminNote') adminNote?: string) {
    return this.verificationService.approve(id, adminNote);
  }

  // Admin: Reject
  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async reject(@Param('id') id: string, @Body('adminNote') adminNote: string) {
    return this.verificationService.reject(id, adminNote);
  }
}
