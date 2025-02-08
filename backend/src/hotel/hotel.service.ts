import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../typeorm/entities/user.entity';
import { Repository } from 'typeorm';
import { Hotel } from '../typeorm/entities/hotel.entity';
import { hotelImage } from '../typeorm/entities/hotelImage.entity';
import { CreateHotel } from './dtos/CreateHotel.dto';
import * as path from 'path';
import * as fs from 'fs';
import { UpdateHotel } from './dtos/UpdateHotel.dto';
@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
    @InjectRepository(hotelImage)
    private hotelImageRepository: Repository<hotelImage>
  ) {
  }
  async create(createHotelDto: CreateHotel, images: Express.Multer.File[]): Promise<Hotel> {
    // Step 1: Create the hotel entity
    const hotel = this.hotelRepository.create(createHotelDto);
    await this.hotelRepository.save(hotel);

    // Step 2: Save image URLs to the database
    const imageEntities = images.map((image) =>
      this.hotelImageRepository.create({
        imageUrl: `/uploads/hotel-images/${image.filename}`, // Use the filename from Multer
        hotel,
      }),
    );

    // Save image entities
    await this.hotelImageRepository.save(imageEntities);

    // Step 3: Return the hotel with its associated images
    return this.hotelRepository.findOne({
      where: { id: hotel.id },
      relations: ['images'], // Ensure images are included
    });
  }


  async getHotelCount(): Promise<number> {
    return this.hotelRepository.count(); // TypeORM's `count` method
  }

  async getAllHotelsWithImages(): Promise<Hotel[]> {
    return this.hotelRepository.find({
      relations: ['images'], // Include the 'images' relation
    });
  }
  async getById(id: number): Promise<Hotel> {
    const hotel = await this.hotelRepository.findOne({
      where: { id },
      relations: ['images'],
    });
    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }
    return hotel;
  }

  async update(
    id: number,
    updateHotelDto: UpdateHotel,
    newImages?: Express.Multer.File[],
    existingImages?: number[], // Array of existing image IDs to keep
  ): Promise<Hotel> {
    const hotel = await this.hotelRepository.findOne({
      where: { id },
      relations: ['images'],
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }

    // Find images that need to be removed (images not in existingImages array)
    const imagesToRemove = hotel.images.filter(
      (image) => !existingImages?.includes(image.id)
    );

    // Remove images that were deleted in the frontend
    for (const image of imagesToRemove) {
      // Delete file from filesystem
      const imagePath = path.join(
        process.cwd(),
        'uploads',
        'hotel-images',
        path.basename(image.imageUrl)
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      // Remove from database
      await this.hotelImageRepository.remove(image);
    }

    // Update hotel basic details
    Object.assign(hotel, updateHotelDto);
    await this.hotelRepository.save(hotel);

    // Add new images if provided
    if (newImages && newImages.length > 0) {
      const imageEntities = newImages.map((image) =>
        this.hotelImageRepository.create({
          imageUrl: `/uploads/hotel-images/${image.filename}`,
          hotel,
        }),
      );
      await this.hotelImageRepository.save(imageEntities);
    }

    // Return updated hotel with all images
    return this.hotelRepository.findOne({
      where: { id: hotel.id },
      relations: ['images'],
    });
  }
  async delete(id: number): Promise<void> {
    const hotel = await this.hotelRepository.findOne({
      where: { id },
      relations: ['images'],
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }

    // Remove images from the filesystem and database
    if (hotel.images.length > 0) {
      for (const image of hotel.images) {
        const imagePath = path.join(process.cwd(), 'uploads', 'hotel-images', path.basename(image.imageUrl));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
        await this.hotelImageRepository.remove(image);
      }
    }

    await this.hotelRepository.remove(hotel);
  }


}
