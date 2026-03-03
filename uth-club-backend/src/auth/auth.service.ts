import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { randomUUID } from 'crypto';
import { MailService } from '../mail/mail.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Club } from '../clubs/entities/club.entity';
import { User } from '../users/entities/user.entity';
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
    const userExists = await this.usersService.findByEmail(normalizedEmail);

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

    try {
      await this.mailService.sendVerificationEmail(
        newUser.email,
        verificationToken,
      );
    } catch (e) {
      console.error('sendVerificationEmail failed', e);
    }
    // Không trả token — user phải verify email trước khi login
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...safeUser } = newUser as User & {
      password: string;
    };
    return { user: safeUser, message: 'Kiểm tra email để xác thực tài khoản' };
  }

  async login(dto: LoginDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const user =
      await this.usersService.findByEmailWithPassword(normalizedEmail);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // Kiểm tra email đã xác thực chưa
    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Vui lòng xác thực email trước khi đăng nhập',
      );
    }

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
    // Strip password hash from login response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...safeUser } = user as User & {
      password: string;
    };
    return { user: safeUser, token };
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
    // Always return success to prevent user enumeration
    if (!user)
      return { message: 'Link đặt lại mật khẩu đã được gửi qua email' };

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

    if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
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
