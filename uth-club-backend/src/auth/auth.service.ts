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
    const userExists = await this.usersService.findByEmail(dto.email);
    if (userExists) throw new BadRequestException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    const verificationToken = randomUUID();
    const newUser = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
      mssv: Number(dto.mssv),
      verificationToken: verificationToken,
    });

    const token = this.jwtService.sign({
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    await this.mailService.sendVerificationEmail(
      newUser.email,
      verificationToken,
    );
    return { user: newUser, token };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
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
}
