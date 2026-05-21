import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { BrandsService } from './brands.service';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  async findAll(@Query('all') all: string) {
    return this.brandsService.findAll(all === 'true');
  }

  @Post()
  async create(@Body() createBrandDto: any) {
    return this.brandsService.create(createBrandDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBrandDto: any) {
    return this.brandsService.update(id, updateBrandDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}
