import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './typeorm/entities/user.entity';
import { Hotel } from './typeorm/entities/hotel.entity';
import { Reservation } from './typeorm/entities/reservation.entity';
import { hotelImage } from './typeorm/entities/hotelImage.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { HotelModule } from './hotel/hotel.module';
import { ReservationModule } from './reservation/reservation.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'booking',
      entities: [User, Hotel, Reservation,hotelImage],
      synchronize: true
    }),
    UserModule,
    AuthModule,
    HotelModule,
    ReservationModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
