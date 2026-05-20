import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from './coupon.schema';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
  ) {}

  async create(data: any): Promise<Coupon> {
    const exists = await this.couponModel.findOne({ code: data.code.toUpperCase() });
    if (exists) throw new BadRequestException('Coupon code already exists');
    return new this.couponModel(data).save();
  }

  async findAll(): Promise<Coupon[]> {
    return this.couponModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Coupon> {
    const coupon = await this.couponModel.findById(id).exec();
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async update(id: string, data: any): Promise<Coupon> {
    const coupon = await this.couponModel.findByIdAndUpdate(id, data, { returnDocument: 'after' }).exec();
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async remove(id: string): Promise<any> {
    const result = await this.couponModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Coupon not found');
    return result;
  }

  async validateCoupon(code: string, userId: string, subtotal: number): Promise<Coupon> {
    const coupon = await this.couponModel.findOne({ code: code.toUpperCase(), status: 'publish' }).exec();
    
    if (!coupon) throw new BadRequestException('Invalid or expired coupon code');

    // Check expiry
    if (coupon.endDate && new Date() > new Date(coupon.endDate)) {
        throw new BadRequestException('This coupon has expired');
    }

    // Check usage limit
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        throw new BadRequestException('This coupon has reached its usage limit');
    }

    // Check min spend
    if (coupon.minSpend > 0 && subtotal < coupon.minSpend) {
        throw new BadRequestException(`Minimum spend of $${coupon.minSpend} required for this coupon`);
    }

    // Check max spend
    if (coupon.maxSpend > 0 && subtotal > coupon.maxSpend) {
        throw new BadRequestException('Order exceeds maximum spend for this coupon');
    }

    // Check user restriction
    if (coupon.onlyForUsers?.length > 0 && !coupon.onlyForUsers.includes(userId)) {
        throw new BadRequestException('This coupon is not available for your account');
    }

    // User limit check would require checking booking history, 
    // for now we trust the client or handle it during booking creation.

    return coupon;
  }
}
