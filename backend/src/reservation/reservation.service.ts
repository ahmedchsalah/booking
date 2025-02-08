import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../typeorm/entities/reservation.entity';
import { CreateReservationDto } from './dtos/CreateReservation.dto';
import { UpdateReservationDto } from './dtos/UpdateReservation.dto';
import { User } from '../typeorm/entities/user.entity';
import { Hotel } from '../typeorm/entities/hotel.entity';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(userId: number, createReservationDto: CreateReservationDto) {
    const hotel = await this.hotelRepository.findOne({
      where: { id: createReservationDto.hotelId }
    });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate total price based on number of days
    const startDate = new Date(createReservationDto.date_debut);
    const endDate = new Date(createReservationDto.date_fin);
    const numberOfDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = numberOfDays * hotel.prix_par_nuit;

    const reservation = this.reservationRepository.create({
      user,
      hotel,
      date_debut: createReservationDto.date_debut,
      date_fin: createReservationDto.date_fin,
      prix_total: totalPrice
    });

    return await this.reservationRepository.save(reservation);
  }

  async findAll() {
    return await this.reservationRepository.find({
      relations: ['user', 'hotel'],
      order: {
        creeLe: 'DESC'
      }
    });
  }

  async findUserReservations(userId: number) {
    return await this.reservationRepository.find({
      where: {
        user: { id: userId }
      },
      relations: ['hotel'],
      order: {
        creeLe: 'DESC'
      }
    });
  }

  async findOne(id: number) {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['user', 'hotel']
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return reservation;
  }

  async update(id: number, userId: number, updateReservationDto: UpdateReservationDto) {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['user', 'hotel']
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.user.id !== userId) {
      throw new BadRequestException('You can only update your own reservations');
    }

    // If hotel is being changed
    if (updateReservationDto.hotelId && updateReservationDto.hotelId !== reservation.hotel.id) {
      const newHotel = await this.hotelRepository.findOne({
        where: { id: updateReservationDto.hotelId }
      });

      if (!newHotel) {
        throw new NotFoundException('New hotel not found');
      }

      reservation.hotel = newHotel;
    }

    // Update dates if provided
    if (updateReservationDto.date_debut) {
      reservation.date_debut = new Date(updateReservationDto.date_debut);
    }
    if (updateReservationDto.date_fin) {
      reservation.date_fin = new Date(updateReservationDto.date_fin);
    }

    return await this.reservationRepository.save(reservation);
  }
  async remove(id: number, userId: number) {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['user']
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.user.id !== userId) {
      throw new BadRequestException('You can only delete your own reservations');
    }

    await this.reservationRepository.remove(reservation);
  }

  async getReservationsCount(): Promise<number> {
    return this.reservationRepository.count();
  }

  async getReservationAnalytics() {
    // Reservations per month
    const monthlyReservations = await this.reservationRepository
      .createQueryBuilder('reservation')
      .select(['MONTH(reservation.date_debut) as month', 'COUNT(*) as count'])
      .groupBy('month')
      .getRawMany();

    // Total revenue per month
    const monthlyRevenue = await this.reservationRepository
      .createQueryBuilder('reservation')
      .select(['MONTH(reservation.date_debut) as month', 'SUM(reservation.prix_total) as revenue'])
      .groupBy('month')
      .getRawMany();

    return {
      monthlyReservations,
      monthlyRevenue
    };
  }

  async getHotelPerformance() {
    // Most booked hotels
    const topHotels = await this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.hotel', 'hotel')
      .select(['hotel.nom as hotel_name', 'COUNT(*) as booking_count'])
      .groupBy('hotel.id')
      .orderBy('booking_count', 'DESC')
      .limit(5)
      .getRawMany();

    // Revenue by hotel
    const hotelRevenue = await this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.hotel', 'hotel')
      .select(['hotel.nom as hotel_name', 'SUM(reservation.prix_total) as total_revenue'])
      .groupBy('hotel.id')
      .orderBy('total_revenue', 'DESC')
      .getRawMany();

    return {
      topHotels,
      hotelRevenue
    };
  }

  async getUserBookingPatterns() {
    // Most active users
    const activeUsers = await this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.user', 'user')
      .select(['user.email as user_email', 'COUNT(*) as booking_count'])
      .groupBy('user.id')
      .orderBy('booking_count', 'DESC')
      .limit(10)
      .getRawMany();

    // Average stay duration
    const avgStayDuration = await this.reservationRepository
      .createQueryBuilder('reservation')
      .select('AVG(DATEDIFF(reservation.date_fin, reservation.date_debut)) as avg_stay')
      .getRawOne();

    return {
      activeUsers,
      avgStayDuration
    };
  }
}