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
    return await this.usersRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.memberships', 'memberships')
      .leftJoinAndSelect('users.ownedClubs', 'ownedClubs')
      .select([
        'users.id',
        'users.name',
        'users.email',
        'users.role',
        'users.mssv',
        'users.createdAt',
        'memberships.id',
        'memberships.status',
        'ownedClubs.id',
        'ownedClubs.name',
      ])
      .where('users.isVerified = :isVerified', { isVerified: true })
      .getMany();
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.usersRepository.update(id, updateUserDto);
  }

  async remove(id: number) {
    return await this.usersRepository.delete(id);
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findByVerificationToken(token: string) {
    return this.usersRepository.findOne({
      where: { verificationToken: token },
    });
  }
}
