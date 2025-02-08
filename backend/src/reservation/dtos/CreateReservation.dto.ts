import { IsDate, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReservationDto {
  @IsNotEmpty()
  @IsNumber()
  hotelId: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date_debut: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date_fin: Date;
}
