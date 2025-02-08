import { Module } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { HotelController } from './hotel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hotel } from '../typeorm/entities/hotel.entity';
import { hotelImage } from '../typeorm/entities/hotelImage.entity';

@Module({
  imports : [
    TypeOrmModule.forFeature([Hotel,hotelImage])
  ],
  providers: [HotelService],
  controllers: [HotelController]
})
export class HotelModule {}
