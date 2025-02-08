import {
  BadRequestException,
  Body,
  Controller, Delete,
  Get, InternalServerErrorException, NotFoundException, Param, ParseIntPipe, Patch,
  Post, Put, Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { HotelService } from './hotel.service';
import { CreateHotel } from './dtos/CreateHotel.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UpdateHotel } from './dtos/UpdateHotel.dto';

@Controller('hotels')
export class HotelController {
  constructor(private readonly hotelService : HotelService) {
  }
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads/hotel-images',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(
            file.originalname,
          )}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(new BadRequestException('Invalid file type'), false);
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @Body() createHotelDto: CreateHotel,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.hotelService.create(createHotelDto, images); // Pass images to the service
  }


  @Get('count')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('admin')
  async getHotelCount(): Promise<{ count: number }> {
    const count = await this.hotelService.getHotelCount();
    return { count };
  }

  @Get()
  async getAllHotelsWithImages() {
    return this.hotelService.getAllHotelsWithImages(); // Call the service method
  }
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads/hotel-images',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(new BadRequestException('Invalid file type'), false);
        }
        cb(null, true);
      },
    }),
  )
  async update(
    @Param('id') id: number,
    @Body() updateHotelDto: UpdateHotel,
    @UploadedFiles() images: Express.Multer.File[],
    @Body('existingImages') existingImages: string | string[],
  ) {
    let existingImageIds: number[] = [];

    if (Array.isArray(existingImages)) {
      existingImageIds = existingImages.map(Number);
    } else if (existingImages) {
      existingImageIds = [Number(existingImages)];
    }

    return this.hotelService.update(id, updateHotelDto, images, existingImageIds);
  }  @Get(':id')
  async getHotel(@Param('id') id: number) {
    // Call the service method to get the hotel by ID along with its images
    return this.hotelService.getById(id);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('admin')
  async deleteHotel(@Param('id') id: number) {
    try {
      await this.hotelService.delete(id);
      return { message: 'Hotel deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException('Error deleting hotel');
    }
  }
}
