import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Hotel } from './hotel.entity';
@Entity('hotel_images')
export class hotelImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  imageUrl: string; // Stores the URL or file path of the image

  @ManyToOne(() => Hotel, (hotel) => hotel.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hotel_id' }) // Foreign key column for the relationship
  hotel: Hotel;
}