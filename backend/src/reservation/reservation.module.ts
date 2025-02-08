import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from '../typeorm/entities/reservation.entity';
import { User } from '../typeorm/entities/user.entity';
import { Hotel } from '../typeorm/entities/hotel.entity';

@Module({
  imports : [
    TypeOrmModule.forFeature([Reservation,User,Hotel])
  ],
  providers: [ReservationService],
  controllers: [ReservationController]
})
export class ReservationModule {}
