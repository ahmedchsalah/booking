import { PartialType } from '@nestjs/mapped-types';
import { CreateReservationDto } from './CreateReservation.dto';

export class UpdateReservationDto extends PartialType(CreateReservationDto) {}