import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarTypesService } from './car-types.service';
import { CarTypesController } from './car-types.controller';
import { CarType, CarTypeSchema } from './schemas/car-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CarType.name, schema: CarTypeSchema }]),
  ],
  controllers: [CarTypesController],
  providers: [CarTypesService],
  exports: [CarTypesService],
})
export class CarTypesModule {}
