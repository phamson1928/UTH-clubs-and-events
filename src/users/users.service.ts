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

  create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll() {
    return this.usersRepository.find({
      relations: ['memberships', 'ownedClubs'],
    });
  }

  async findOne(id: number) {
    return this.usersRepository.findOne({
      where: { id },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.usersRepository.update(id, updateUserDto);
  }

  remove(id: number) {
    return this.usersRepository.delete(id);
  }

  findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }
}
