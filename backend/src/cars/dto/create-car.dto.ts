export class CreateCarDto {
  name: string;
  brandId: string;
  model: string;
  year: number;
  rentalType: string;
  pricePerDay: number;
  images: string[];
  description?: string;
  content?: string;
  location?: {
    country: string;
    state: string;
    city: string;
    address: string;
    latitude?: number;
    longitude?: number;
  };
  vehicleType?: string;
  transmission?: string;
  fuelType?: string;
  licensePlate?: string;
  vin?: string;
  mileage?: number;
  horsepower?: number;
  seats?: number;
  doors?: number;
  driveType?: string;
  cylinders?: number;
  insuranceInfo?: string;
  isUsed?: boolean;
  tags?: string[];
  amenities?: string[];
  colors?: string[];
}
