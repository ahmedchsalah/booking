import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class UpdateHotel {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  ville?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  prix_par_nuit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tot_chambres?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  res_chambres?: number;
}
