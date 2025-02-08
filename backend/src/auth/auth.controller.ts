import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Put,
  UseGuards,
  HttpCode,
  BadRequestException,
  Req
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { SignUpDto } from './dtos/signup.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdateProfileDto } from './dtos/updateProfile.dto';
import { User } from '../typeorm/entities/user.entity';
// DTO to validate the login input
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // Validate the user's credentials (email and password)
    const user = await this.authService.validateUser(loginDto.email, loginDto.mdp);
    console.log(user);
    if (!user) {
      // If the user is not found or credentials are invalid, throw an error
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    // Generate the JWT token for the user
    const token = await this.authService.login(user);

    // Return both the token and user information (e.g., role)
    return {
      access_token: token.access_token,
      user: {
        nom : user.nom,
        prenom : user.prenom,
        email : user.email,
        role : user.role
      }
    };
  }
  @Post('signup')
  async signup(@Body() signUpDto: SignUpDto) {
    try {
      return await this.authService.signup(signUpDto);
    } catch (error) {
      if (error.status === HttpStatus.CONFLICT) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Registration failed',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Req() req: Request, // Explicitly type as express.Request
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const userId = req.user?.id; // Ensure req.user exists
    if (!userId) {
      throw new BadRequestException('Invalid user');
    }

    const updatedUser = await this.authService.updateProfile(userId, updateProfileDto);

    return {
      message: 'Profile updated successfully',
      user: updatedUser,
    };
  }

}
