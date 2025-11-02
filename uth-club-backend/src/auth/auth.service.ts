import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { randomUUID } from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Club } from 'src/clubs/entities/club.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    @InjectRepository(Club)
    private clubsRepository: Repository<Club>,
  ) {}

  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    console.log('Checking email:', normalizedEmail);
    const userExists = await this.usersService.findByEmail(normalizedEmail);
    console.log('userExists =', userExists);

    if (userExists) throw new BadRequestException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    const verificationToken = randomUUID();
    const newUser = await this.usersService.create({
      name: dto.name,
      email: normalizedEmail,
      password: hashed,
      mssv: dto.mssv,
      verificationToken: verificationToken,
    });

    const token = this.jwtService.sign({
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    try {
      await this.mailService.sendVerificationEmail(
        newUser.email,
        verificationToken,
      );
    } catch (e) {
      console.error('sendVerificationEmail failed', e);
    }
    return { user: newUser, token };
  }

  async login(dto: LoginDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    // Nếu user là owner, lấy clubId
    let clubId: number | null = null;
    if (user.role === 'club_owner') {
      const club = await this.clubsRepository.findOne({
        where: { owner: { id: user.id } },
        select: ['id'],
      });
      clubId = club ? club.id : null;
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      clubId: clubId,
    });
    return { user, token };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) throw new BadRequestException('Token không hợp lệ');

    await this.usersService.update(user.id, {
      isVerified: true,
      verificationToken: '',
    });

    return { message: 'Xác thực tài khoản thành công ' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('Email không tồn tại');

    // Tạo token ngẫu nhiên
    const token = randomUUID();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    // Lưu token vào DB
    await this.usersService.updateResetToken(user.id, token, expires);

    // Gửi mail xác nhận
    await this.mailService.sendForgotPasswordMail(user.email, token);

    return { message: 'Link đặt lại mật khẩu đã được gửi qua email' };
  }

  /**
   * Đặt lại mật khẩu bằng token
   */
  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);
    if (!user) throw new BadRequestException('Token không hợp lệ');

    if (user.resetTokenExpires < new Date()) {
      throw new BadRequestException('Token đã hết hạn');
    }

    // Hash mật khẩu mới
    const hashed = await bcrypt.hash(newPassword, 10);

    await this.usersService.updatePassword(user.id, hashed);

    // Xóa token để không reuse
    await this.usersService.clearResetToken(user.id);

    return { message: 'Mật khẩu đã được đặt lại thành công' };
  }
}
