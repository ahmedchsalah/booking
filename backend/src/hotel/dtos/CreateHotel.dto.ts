// src/hotel/dto/create-hotel.dto.ts

import { IsString, IsDecimal, IsNotEmpty } from 'class-validator';

export class CreateHotel {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  ville: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDecimal()
  prix_par_nuit: number;

  @IsDecimal()
  tot_chambres: number;

  @IsDecimal()
  res_chambres: number;
}
