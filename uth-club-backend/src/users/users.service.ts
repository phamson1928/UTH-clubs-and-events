import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
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
      resetToken: '',
      resetTokenExpires: new Date(),
    });
  }
}
