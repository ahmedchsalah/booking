import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put, UseGuards,
  Request, Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/CreateUser.dto';
import { UpdateUserDto } from './dtos/UpdateUser.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { plainToInstance } from 'class-transformer';
import { User } from '../typeorm/entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(
    private readonly userService: UserService
  ) {}

  @Get()
  @Roles('admin')
  async getAllUsers(@Query('page') page: number, @Query('limit') limit: number) {
    return this.userService.findAll(page, limit);
  }
  @Post('create')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      data: plainToInstance(User, user, { excludeExtraneousValues: false }),
    };
  }
  @Put(':id')
  @Roles('admin','user')
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      await this.userService.update(id, updateUserDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'User updated successfully',
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: number) {
    await this.userService.remove(id);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'User deleted successfully',
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)  // Protect this route
  getProfile(@Request() req) {
    return req.user;  // The user's data is available here
  }
  @Get('count')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  async getUserCount(): Promise<{ count: number }> {
    const count = await this.userService.getUserCount();
    return { count };
  }
}
