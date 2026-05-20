import { Controller, Get, Param } from '@nestjs/common';
import { AmenitiesService } from './amenities.service';
import { Amenity } from './schemas/amenity.schema';

@Controller('amenities')
export class AmenitiesController {
  constructor(private readonly amenitiesService: AmenitiesService) {}

  @Get()
  async findAll(): Promise<Amenity[]> {
    return this.amenitiesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Amenity> {
    return this.amenitiesService.findOne(id);
  }
}
