import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  getDashboardData() {
    return {
      stats: {
        totalCars: 10,
        totalUsers: 5,
        totalBookings: 20,
      },
      message: 'Welcome to the Admin Dashboard API',
    };
  }
}
