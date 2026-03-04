import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto) {
    // Hash password if it hasn't been hashed already (doesn't start with bcrypt prefix)
    const dto = { ...createUserDto };
    if (dto.password && !dto.password.startsWith('$2')) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    const user = this.usersRepository.create(dto);
    return await this.usersRepository.save(user);
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.usersRepository.findAndCount({
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
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.usersRepository.update(id, updateUserDto);
  }

  async remove(id: number) {
    return await this.usersRepository.delete(id);
  }

  // 2.3 Lấy profile của user đang đăng nhập
  async findMe(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mssv: true,
        createdAt: true,
        isVerified: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // 2.3 User tự cập nhật name / mssv
  async updateMe(id: number, data: { name?: string; mssv?: string }) {
    await this.usersRepository.update(id, data);
    return this.findMe(id);
  }

  // 2.3 Đổi mật khẩu
  async changePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id })
      .getOne();
    if (!user) throw new NotFoundException('User not found');
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(id, { password: hashed });
    return { message: 'Đổi mật khẩu thành công' };
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
