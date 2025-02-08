import { IsString, IsEmail, MinLength, IsNotEmpty, Matches } from 'class-validator';

export class LoginDto {
  @IsEmail()  // Ensure the email is valid
  email: string;

  @IsString()  // Ensure the password is a string
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character'
  })
  mdp: string;
}
