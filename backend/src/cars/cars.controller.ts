import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get('destinations')
  getTopDestinations() {
    console.log('API: Fetching top destinations');
    return this.carsService.getTopDestinations(12);
  }

  @Post('ai-autofill')
  async aiAutofill(@Body('prompt') prompt: string) {
    if (!prompt) {
      throw new BadRequestException('Prompt is required');
    }
    return this.carsService.generateAiAutofill(prompt);
  }

  @Get('check-permalink/:permalink')
  checkPermalink(@Param('permalink') permalink: string) {
    return this.carsService.checkPermalink(permalink);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createCarDto: CreateCarDto, @Request() req: any) {
    const userId = req.user.id || req.user.sub || req.user._id;
    return this.carsService.create(createCarDto, userId);
  }

  @Get()
  findAll(@Request() req: any) {
    // Check if user is admin (this depends on how your auth is set up, 
    // usually req.user has roles. For now we'll check if they are authenticated and have admin role if possible)
    const isAdmin = req.user?.role === 'admin'; 
    return this.carsService.findAll(isAdmin);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all/admin_view')
  findAllAdmin(@Request() req: any) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Access denied');
    }
    return this.carsService.findAll(true);
  }

  @UseGuards(JwtAuthGuard)
  @Get('vendor/me')
  findMyCars(@Request() req: any) {
    const userId = req.user.id || req.user.sub || req.user.userId;
    return this.carsService.findByVendor(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarDto: UpdateCarDto) {
    return this.carsService.update(id, updateCarDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: 'approved' | 'rejected' | 'pending', @Body('rejectionReason') rejectionReason: string, @Request() req: any) {
    // Ideally check if user is admin here
    if (req.user?.role !== 'admin' && req.user?.userType !== 'admin') {
      // throw new ForbiddenException();
    }
    return this.carsService.updateStatus(id, status, rejectionReason);
  }

  @Get('vendor/:id')
  findByVendor(@Param('id') id: string) {
    return this.carsService.findByVendor(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carsService.remove(id);
  }
}
