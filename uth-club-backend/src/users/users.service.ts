import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Hash password if it hasn't been hashed already (doesn't start with bcrypt prefix)
    const dto = { ...createUserDto };
    if (dto.password && !dto.password.startsWith('$2')) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    const user = this.usersRepository.create(dto);
    return await this.usersRepository.save(user);
  }

  async findAll() {
    return await this.usersRepository.find({
      relations: ['memberships', 'ownedClubs'],
      order: {
        createdAt: 'DESC',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mssv: true,
        createdAt: true,
        isVerified: true,
        memberships: {
          id: true,
          status: true,
        },
        ownedClubs: {
          id: true,
          name: true,
          category: true,
        },
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.usersRepository.update(id, updateUserDto);
  }

  async remove(id: number) {
    return await this.usersRepository.delete(id);
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  // Used only for authentication — explicitly selects password hash
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findByVerificationToken(token: string) {
    return this.usersRepository.findOne({
      where: { verificationToken: token },
    });
  }

  async findByResetToken(token: string) {
    return this.usersRepository.findOne({ where: { resetToken: token } });
  }

  async updateResetToken(id: number, token: string, expires: Date) {
    await this.usersRepository.update(id, {
      resetToken: token,
      resetTokenExpires: expires,
    });
  }

  async updatePassword(id: number, hashedPassword: string) {
    await this.usersRepository.update(id, { password: hashedPassword });
  }

  async clearResetToken(id: number) {
    await this.usersRepository.update(id, {
      resetToken: null,
      resetTokenExpires: null,
    });
  }
}
