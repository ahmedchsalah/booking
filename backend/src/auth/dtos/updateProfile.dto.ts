import { IsEmail, IsString, IsOptional, MinLength, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message: 'Nom must contain only letters, spaces, hyphens and apostrophes'
  })
  nom?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message: 'Prenom must contain only letters, spaces, hyphens and apostrophes'
  })
  prenom?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character'
  })
  password?: string;
}