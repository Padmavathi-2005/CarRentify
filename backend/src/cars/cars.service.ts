import { Injectable, NotFoundException, OnModuleInit, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Car, CarDocument } from './schemas/car.schema';
import { Brand, BrandDocument } from '../brands/schemas/brand.schema';
import { Booking, BookingDocument, BookingStatus } from '../bookings/schemas/booking.schema';
import { Review, ReviewDocument } from '../reviews/schemas/review.schema';

@Injectable()
export class CarsService implements OnModuleInit {
  constructor(
    @InjectModel(Car.name) private carModel: Model<CarDocument>,
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async onModuleInit() {
    // Migration: Update existing cars with tiered pricing and permalinks if they don't have them
    const cars = await this.carModel.find({
      $or: [
        { pricePerTwoDays: { $exists: false } },
        { distanceIncluded: { $exists: false } },
        { extraDistanceFee: { $exists: false } },
        { pricePerHour: { $exists: true } },
        { pricePerTwoDays: { $exists: true } },
        { pricePerFiveDays: { $exists: true } },
        { permalink: { $exists: false } },
        { permalink: "" }
      ]
    }).exec();

    if (cars.length > 0) {
      console.log(`[Migration] Detected ${cars.length} cars requiring updates...`);
      for (const car of cars) {
        const pd = car.pricePerDay || 100;
        
        // Define sensible defaults:
        const ph = Math.ceil(pd / 8); 
        const p2d = Math.floor(pd * 0.9);
        const p5d = Math.floor(pd * 0.75);

        const tiers: any[] = [];
        tiers.push({ days: 1, pricePerDay: pd, discountPercentage: 0 });
        if ((car as any).pricePerTwoDays || p2d) {
          const price = (car as any).pricePerTwoDays || p2d;
          const disc = Math.round((1 - price / pd) * 100);
          tiers.push({ days: 2, pricePerDay: price, discountPercentage: disc });
        }
        if ((car as any).pricePerFiveDays || p5d) {
          const price = (car as any).pricePerFiveDays || p5d;
          const disc = Math.round((1 - price / pd) * 100);
          tiers.push({ days: 5, pricePerDay: price, discountPercentage: disc });
        }

        const existingTiers = (car as any).priceTiers || [];
        const processedTiers = existingTiers.map((t: any) => ({
          ...t,
          discountPercentage: t.discountPercentage || Math.round((1 - (t.pricePerDay / pd)) * 100)
        }));

        let permalink = (car as any).permalink;
        if (!permalink) {
          const base = car.name || "car";
          permalink = base.toLowerCase().trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-');
        }

        await (this.carModel as any).collection.updateOne(
          { _id: car._id },
          {
            $set: {
               priceTiers: processedTiers.length > 0 ? processedTiers : tiers,
               distanceIncluded: (car as any).distanceIncluded || 200,
               extraDistanceFee: (car as any).extraDistanceFee || 0.50,
               permalink: permalink,
               status: 'approved'
            },
            $unset: {
               pricePerHour: "",
               pricePerTwoDays: "",
               pricePerFiveDays: "",
            }
          }
        );
      }
      console.log('[Migration] Pricing legacy fields decommissioned & Permalinks synchronized.');
    }
  }

  async checkPermalink(permalink: string): Promise<boolean> {
    const car = await this.carModel.findOne({ permalink }).exec();
    return !!car;
  }

  private validatePricing(data: any) {
    const { pricePerDay, priceTiers } = data;
    
    if (Array.isArray(priceTiers) && priceTiers.length > 0) {
      const tiers = priceTiers
        .map((t: any) => ({ days: Number(t.days), pricePerDay: Number(t.pricePerDay) }))
        .filter((t: any) => Number.isFinite(t.days) && Number.isFinite(t.pricePerDay));

      if (tiers.length !== priceTiers.length) {
        throw new BadRequestException('Invalid priceTiers format');
      }

      for (const t of tiers) {
        if (!Number.isInteger(t.days) || t.days < 1) {
          throw new BadRequestException('priceTiers.days must be an integer >= 1');
        }
        if (t.pricePerDay <= 0) {
          throw new BadRequestException('priceTiers.pricePerDay must be > 0');
        }
      }

      // sort + unique days
      tiers.sort((a, b) => a.days - b.days);
      for (let i = 1; i < tiers.length; i++) {
        if (tiers[i].days === tiers[i - 1].days) {
          throw new BadRequestException('priceTiers days must be unique');
        }
      }

      // Ensure there is a 1-day tier and it matches/overrides pricePerDay
      const tier1 = tiers.find((t) => t.days === 1);
      if (!tier1) {
          // If no 1-day tier, we use pricePerDay to create it
          if (pricePerDay > 0) {
              tiers.unshift({ days: 1, pricePerDay: Number(pricePerDay) });
          } else {
              throw new BadRequestException('priceTiers must include a 1-day tier or pricePerDay must be provided');
          }
      }

      // Monotonic discounts: increasing days => <= previous day price
      for (let i = 1; i < tiers.length; i++) {
        const prevPrice = tiers[i - 1].pricePerDay;
        if (tiers[i].pricePerDay > prevPrice) {
          throw new BadRequestException(`Longer tiers (${tiers[i].days} days) must be cheaper than shorter ones (${tiers[i-1].days} days)`);
        }
      }

      data.pricePerDay = tiers.find(t => t.days === 1)?.pricePerDay || pricePerDay;
      data.priceTiers = tiers;
    }
  }

  async create(createCarDto: any, vendorId: string): Promise<any> {
    console.log('[CarsService] Received Create DTO:', JSON.stringify(createCarDto, null, 2));
    const { brandId, vehicleType, ...rest } = createCarDto;

    const doc: any = {
      ...rest,
      brand: brandId,
      vehicleType: vehicleType,
      vendor: vendorId,
      available: true,
    };

    try {
      this.validatePricing(doc);
      const createdCar = new this.carModel(doc);
      return await createdCar.save();
    } catch (error) {
      console.error('[CarsService] Create Error:', error);
      if (error.code === 11000) {
        throw new BadRequestException('A car with this name or permalink already exists.');
      }
      if (error.name === 'ValidationError') {
        throw new BadRequestException(`Validation Failed: ${Object.values(error.errors).map((e: any) => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  async findAll(isAdmin: boolean = false): Promise<any[]> {
    const query: any = {};
    if (isAdmin) {
      // Admin sees everything
    } else {
      query.status = 'approved';
    }

    const cars = await this.carModel
      .find(query)
      .populate('brand')
      .populate('vehicleType')
      .populate('currency')
      .exec();
    
    return this.attachBadgesToCars(cars);
  }

  async findOne(idOrSlug: string): Promise<any> {
    const isObjectId = Types.ObjectId.isValid(idOrSlug);
    let car;
    
    if (isObjectId) {
      car = await this.carModel
        .findById(idOrSlug)
        .populate('brand')
        .populate('vehicleType')
        .populate('currency')
        .populate('vendor', 'firstName lastName displayName profileImage email slug')
        .exec();
    }
    
    if (!car) {
      car = await this.carModel
        .findOne({ permalink: idOrSlug })
        .populate('brand')
        .populate('vehicleType')
        .populate('currency')
        .populate('vendor', 'firstName lastName displayName profileImage email slug')
        .exec();
    }

    if (!car) {
      throw new NotFoundException(`Car with identifier ${idOrSlug} not found`);
    }
    const withBadges = await this.attachBadgesToCars([car]);
    return withBadges[0];
  }

  private async attachBadgesToCars(cars: any[]): Promise<any[]> {
    if (!cars.length) return [];

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const nextSevenDays = new Date();
    nextSevenDays.setDate(today.getDate() + 7);

    // 1. Pre-fetch multi-car data to avoid N+1
    const carIds = cars.map(c => c._id);
    const vendorIds = [...new Set(cars.map(c => c.vendor?._id || c.vendor))].filter(id => !!id);

    // Get average prices for Great Value (grouped by city, brand, vehicleType)
    // We'll calculate it on the fly for the relevant groups
    const distinctGroups = cars.map(c => ({
      city: c.location?.city,
      brand: c.brand?._id || c.brand,
      vehicleType: c.vehicleType?._id || c.vehicleType
    }));

    const avgPrices = await this.carModel.aggregate([
      {
        $group: {
          _id: {
            city: '$location.city',
            brand: '$brand',
            vehicleType: '$vehicleType'
          },
          avgPrice: { $avg: '$pricePerDay' }
        }
      }
    ]);

    const avgPriceMap = new Map(avgPrices.map((a: any) => [JSON.stringify(a._id), a.avgPrice]));

    // Get bookings counts (last 30 days)
    const bookingsSummary = await this.bookingModel.aggregate([
      { 
        $match: { 
          carId: { $in: carIds },
          createdAt: { $gte: thirtyDaysAgo },
          status: { $ne: BookingStatus.CANCELLED } 
        } 
      },
      { $group: { _id: '$carId', count: { $sum: 1 } } }
    ]);
    const bookingsCountMap = new Map(bookingsSummary.map((b: any) => [b._id.toString(), b.count]));

    // Get availability (bookings in next 7 days)
    const upcomingBookings = await this.bookingModel.aggregate([
      {
        $match: {
          carId: { $in: carIds },
          $or: [
            { startDate: { $gte: today.toISOString(), $lte: nextSevenDays.toISOString() } },
            { endDate: { $gte: today.toISOString(), $lte: nextSevenDays.toISOString() } }
          ],
          status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING, BookingStatus.COMPLETED] }
        }
      },
      { $group: { _id: '$carId', count: { $sum: 1 } } }
    ]);
    const upcomingBookingsMap = new Map(upcomingBookings.map((b: any) => [b._id.toString(), b.count]));

    // Get vendor stats (Superhost)
    const vendorStats = await this.bookingModel.aggregate([
      { $match: { vendorId: { $in: vendorIds }, status: BookingStatus.COMPLETED } },
      { $group: { _id: '$vendorId', completedTrips: { $sum: 1 } } }
    ]);
    const vendorTripsMap = new Map(vendorStats.map((v: any) => [v._id.toString(), v.completedTrips]));

    const carStats = await this.reviewModel.aggregate([
      { $match: { car: { $in: carIds } } },
      { 
        $group: { 
          _id: '$car', 
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        } 
      }
    ]);
    const carStatsMap = new Map(carStats.map((c: any) => [c._id.toString(), { avgRating: c.avgRating, count: c.count }]));

    const vendorRatings = await this.reviewModel.aggregate([
      {
        $lookup: {
          from: 'cars',
          localField: 'car',
          foreignField: '_id',
          as: 'carInfo'
        }
      },
      { $unwind: '$carInfo' },
      { $match: { 'carInfo.vendor': { $in: vendorIds } } },
      { $group: { _id: '$carInfo.vendor', avgRating: { $avg: '$rating' } } }
    ]);
    const vendorRatingMap = new Map(vendorRatings.map((v: any) => [v._id.toString(), v.avgRating]));

    return cars.map(car => {
      const carObj = car.toObject ? car.toObject() : car;
      const stats = carStatsMap.get(carObj._id.toString()) || { avgRating: 0.0, count: 0 };
      carObj.rating = stats.avgRating;
      carObj.reviews = stats.count;

      const badges: string[] = [];

      // Logic for badges
      
      // 1. New
      const createdAt = new Date(carObj.createdAt);
      if (createdAt >= sevenDaysAgo) {
        badges.push('New');
      }

      // 2. Instant Book
      if (carObj.bookingType === 'Instant') {
        badges.push('Instant Book');
      }

      // 3. Free Delivery
      const hasFreeDelivery = carObj.pickupLocations?.some((l: any) => l.price === 0);
      if (hasFreeDelivery) {
        badges.push('Free Delivery');
      }

      // 4. Rare Find
      const recentBookings = bookingsCountMap.get(carObj._id.toString()) || 0;
      const bookedDaysNext7 = upcomingBookingsMap.get(carObj._id.toString()) || 0;
      const availabilityNext7 = 7 - bookedDaysNext7; // Simplified
      if (recentBookings > 5 && availabilityNext7 < 3) {
        badges.push('Rare Find');
      }

      // 5. Great Value
      const groupKey = JSON.stringify({
        city: carObj.location?.city,
        brand: carObj.brand?._id?.toString() || carObj.brand?.toString(),
        vehicleType: carObj.vehicleType?._id?.toString() || carObj.vehicleType?.toString()
      });
      const avgPrice = avgPriceMap.get(groupKey);
      if (avgPrice && carObj.pricePerDay < avgPrice * 0.85) {
        badges.push('Great Value');
      }

      // 6. Superhost
      const vendorId = carObj.vendor?._id?.toString() || carObj.vendor?.toString();
      const rating = vendorRatingMap.get(vendorId) || 0;
      const trips = vendorTripsMap.get(vendorId) || 0;
      if (rating >= 4.8 && trips >= 50) {
        badges.push('Superhost');
      }

      // Top Rated logic
      const carRating = carObj.rating || 0;
      const carReviews = carObj.reviews || 0;
      if (carRating >= 4.5 && carReviews >= 5) {
        badges.push('Top Rated');
      }

      // Define Priority Selection
      const priorityOrder = [
        'Rare Find',
        'Great Value',
        'Superhost',
        'Top Rated',
        'Free Delivery',
        'New'
      ];
      
      const topBadge = priorityOrder.find(pb => badges.includes(pb)) || null;

      return {
        ...carObj,
        badge: topBadge, // Legacy support
        badges: topBadge ? [topBadge] : []
      };
    });
  }

  async update(id: string, updateCarDto: UpdateCarDto): Promise<Car> {
    this.validatePricing(updateCarDto as any);
    const updatedCar = await this.carModel
      .findByIdAndUpdate(id, updateCarDto, { returnDocument: 'after' })
      .exec();
    if (!updatedCar) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }
    return updatedCar;
  }

  async updateStatus(id: string, status: 'approved' | 'rejected' | 'pending'): Promise<Car> {
    const updatedCar = await this.carModel
      .findByIdAndUpdate(id, { status }, { returnDocument: 'after' })
      .exec();
    if (!updatedCar) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }
    return updatedCar;
  }

  async remove(id: string): Promise<Car> {
    const deletedCar = await this.carModel.findByIdAndDelete(id).exec();
    if (!deletedCar) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }
    return deletedCar;
  }

  async findByVendor(vendorId: string): Promise<Car[]> {
    return this.carModel
      .find({ vendor: new Types.ObjectId(vendorId) })
      .populate('brand')
      .populate('vehicleType')
      .exec();
  }

  async deactivateAllByVendor(vendorId: string): Promise<any> {
    return this.carModel.updateMany(
      { vendor: new Types.ObjectId(vendorId) },
      { $set: { available: false } }
    ).exec();
  }

  async reactivateAllByVendor(vendorId: string): Promise<any> {
    return this.carModel.updateMany(
      { vendor: new Types.ObjectId(vendorId) },
      { $set: { available: true } }
    ).exec();
  }

  async getTopDestinations(limit: number = 12): Promise<any[]> {
    const results = await this.carModel.aggregate([
      { $match: { 'location.city': { $exists: true, $nin: [null, ''] } } },
      // Group by city + country
      {
        $group: {
          _id: {
            city: { $toLower: '$location.city' },
            country: { $toLower: '$location.country' },
          },
          originalCity: { $first: '$location.city' },
          originalCountry: { $first: '$location.country' },
          count: { $sum: 1 },
          // Collect sample images (first non-empty)
          images: { $push: { $arrayElemAt: ['$images', 0] } },
          // Rough geo center
          lat: { $avg: '$location.latitude' },
          lng: { $avg: '$location.longitude' },
        },
      },
      // Sort by listing count desc
      { $sort: { count: -1 } },
      { $limit: limit },
      // Project clean output
      {
        $project: {
          _id: 0,
          city: '$originalCity',
          country: '$originalCountry',
          count: 1,
          lat: 1,
          lng: 1,
          // Pick first valid image from the collected array
          image: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$images',
                  as: 'img',
                  cond: {
                    $and: [{ $ne: ['$$img', null] }, { $ne: ['$$img', ''] }],
                  },
                },
              },
              0,
            ],
          },
        },
      },
    ]);
    return results;
  }
}
