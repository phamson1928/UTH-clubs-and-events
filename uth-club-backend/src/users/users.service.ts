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
      .createQueryBuilder('user')
      .leftJoin('user.memberships', 'membership')
      .leftJoin('user.ownedClubs', 'club')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.role',
        'user.mssv',
        'user.createdAt',
      ])
      .addSelect(['membership.id', 'membership.status'])
      .addSelect(['club.id', 'club.name'])
      .where('user.isVerified = :isVerified', { isVerified: true })
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
