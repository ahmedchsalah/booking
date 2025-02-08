import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpStatus
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dtos/CreateReservation.dto';
import { UpdateReservationDto } from './dtos/UpdateReservation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @Roles('user')
  async create(@Request() req, @Body() createReservationDto: CreateReservationDto) {
    const reservation = await this.reservationService.create(req.user.id, createReservationDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Reservation created successfully',
      data: reservation
    };
  }

  @Get()
  @Roles('admin')
  async findAll() {
    const reservations = await this.reservationService.findAll();
    return {
      statusCode: HttpStatus.OK,
      data: reservations
    };
  }

  @Get('my-reservations')
  async getUserReservations(@Request() req) {
    const reservations = await this.reservationService.findUserReservations(req.user.id);
    return {
      statusCode: HttpStatus.OK,
      data: reservations
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const reservation = await this.reservationService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      data: reservation
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Request() req,
    @Body() updateReservationDto: UpdateReservationDto
  ) {
    const reservation = await this.reservationService.update(id, req.user.id, updateReservationDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Reservation updated successfully',
      data: reservation
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: number, @Request() req) {
    await this.reservationService.remove(id, req.user.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Reservation deleted successfully'
    };
  }
  @Get('admin/reservations-count')
  @Roles('admin')
  async getReservationsCount() {
    const count = await this.reservationService.getReservationsCount();
    return {
      statusCode: HttpStatus.OK,
      data: { count },
      message: 'Reservations count retrieved successfully'
    };
  }

  @Get('admin/analytics')
  @Roles('admin')
  async getAnalytics() {
    const reservationAnalytics = await this.reservationService.getReservationAnalytics();
    const hotelPerformance = await this.reservationService.getHotelPerformance();
    const userPatterns = await this.reservationService.getUserBookingPatterns();

    return {
      statusCode: HttpStatus.OK,
      data: {
        reservationAnalytics,
        hotelPerformance,
        userPatterns
      }
    };
  }
}