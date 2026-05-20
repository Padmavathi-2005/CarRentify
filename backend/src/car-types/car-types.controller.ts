import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CarTypesService } from './car-types.service';

@Controller('car-types')
export class CarTypesController {
  constructor(private readonly carTypesService: CarTypesService) {}

  @Post()
  create(@Body() data: any) {
    return this.carTypesService.create(data);
  }

  @Get()
  findAll() {
    return this.carTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carTypesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.carTypesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carTypesService.remove(id);
  }
}
