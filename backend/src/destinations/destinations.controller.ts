import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DestinationsService } from './destinations.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';

@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  /** Public: home page card data */
  @Get()
  findAll() {
    return this.destinationsService.findAll();
  }

  /** Admin: all (including inactive) */
  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  findAllAdmin() {
    return this.destinationsService.findAllAdmin();
  }

  /** Admin: create a new destination */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: any) {
    return this.destinationsService.create(dto);
  }

  /** Admin: update destination fields */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.destinationsService.update(id, dto);
  }

  /** Admin: upload/replace destination image */
  @UseGuards(JwtAuthGuard)
  @Post(':id/image')
  async uploadImage(
    @Param('id') id: string,
    @Body() body: { fileName: string; base64: string },
  ) {
    const url = await this.destinationsService.uploadImage(id, body.fileName, body.base64);
    return { url };
  }

  /** Admin: reorder destinations */
  @UseGuards(JwtAuthGuard)
  @Post('reorder')
  reorder(@Body() body: { orderedIds: string[] }) {
    return this.destinationsService.reorder(body.orderedIds);
  }

  /** Admin: delete destination */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.destinationsService.remove(id);
  }
}
