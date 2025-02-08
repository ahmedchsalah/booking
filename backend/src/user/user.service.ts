import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../typeorm/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { classToPlain } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async findAll(page: number = 1, limit: number = 10) {
    // Fetch users with pagination
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      select: ['id', 'nom', 'prenom', 'email', 'role'], // Explicitly select fields
    });

    return {
      data: classToPlain(users), // Transform users to plain objects
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }


  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return classToPlain(user);
  }

  async create(user: Partial<User>) {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: user.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    return await this.userRepository.save(user);
  }

  async update(id: number, user: Partial<User>) {
    const existingUser = await this.findOne(id); // Reuse findOne to check existence

    // Encrypt password if provided
    if (user.mdp) {
      user.mdp = await bcrypt.hash(user.mdp, 10);
    }

    return await this.userRepository.update(id, user);
  }

  async remove(id: number) {
    const existingUser = await this.findOne(id); // Reuse findOne to check existence
    return await this.userRepository.delete(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });  // Use TypeORM's findOne method
  }
  async getUserCount(): Promise<number> {
    return this.userRepository.count(); // TypeORM's `count` method
  }

}
