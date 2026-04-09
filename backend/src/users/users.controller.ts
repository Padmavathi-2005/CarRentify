import { Controller, Post, Get, Param, Body, NotFoundException, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('wishlist/toggle')
  async toggleWishlist(
    @Body('userId') userId: string,
    @Body('carId') carId: string,
  ) {
    if (!userId || !carId) throw new NotFoundException('Incomplete data');
    const wishlist = await this.usersService.toggleWishlist(userId, carId);
    return { success: true, wishlist };
  }

  @Get('wishlist/:userId')
  async getWishlist(@Param('userId') userId: string) {
    if (!userId) throw new NotFoundException('User ID required');
    const wishlist = await this.usersService.getWishlist(userId);
    return { success: true, wishlist };
  }

  // --- ADMIN ROUTES ---

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  async create(@Body() userData: any) {
    return this.usersService.create(userData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() userData: any) {
    return this.usersService.update(id, userData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
