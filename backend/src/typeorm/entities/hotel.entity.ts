import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { hotelImage } from './hotelImage.entity';

@Entity('hotels')
export class Hotel{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  location: string;

  @Column()
  ville: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  prix_par_nuit: number;

  @Column('decimal', { precision: 10, scale: 2 })
  tot_chambres: number;

  @Column('decimal', { precision: 10, scale: 2 })
  res_chambres: number;

  @OneToMany(() => hotelImage, (image) => image.hotel)
  images: hotelImage[];



}