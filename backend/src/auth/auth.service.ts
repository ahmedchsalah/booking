import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../typeorm/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dtos/updateProfile.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    // console.log(user)
    // console.log(password)
    if (!user || !password || !user.mdp) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid =await bcrypt.compare(password,user.mdp);
    console.log(isPasswordValid)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(user: Partial<User>) {
    const existingUser = await this.userService.findByEmail(user.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    user.role = 'user';
    user.mdp = await bcrypt.hash(user.mdp,10);

    try {
      const createdUser = await this.userService.create(user);

      const payload = {
        sub: createdUser.id,
        email: createdUser.email,
        role: createdUser.role
      };

      const token = this.jwtService.sign(payload);

      return {
        access_token: token,
        user: {
          id: createdUser.id,
          nom: createdUser.nom,
          prenom: createdUser.prenom,
          email: createdUser.email,
          role: createdUser.role
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to create user');
    }
  }
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update fields if provided
    if (updateProfileDto.nom) user.nom = updateProfileDto.nom;
    if (updateProfileDto.prenom) user.prenom = updateProfileDto.prenom;
    if (updateProfileDto.email) {
      if (updateProfileDto.email !== user.email) {
        const existingUser = await this.userService.findByEmail(updateProfileDto.email);
        if (existingUser) throw new ConflictException('Email already exists');
        user.email = updateProfileDto.email;
      }
    }
    if (updateProfileDto.password) {
      user.mdp = await bcrypt.hash(updateProfileDto.password, 10);
    }

    // Save and get updated user
    await this.userService.update(userId, user);
    const updatedUser = await this.userService.findOne(userId);

    return {
      id: updatedUser.id,
      nom: updatedUser.nom,
      prenom: updatedUser.prenom,
      email: updatedUser.email,
      role: updatedUser.role
    };
  }


}
