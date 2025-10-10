// src/auth/auth.service.ts
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

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const userExists = await this.usersService.findByEmail(dto.email);
    if (userExists) throw new BadRequestException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    const newUser = await this.usersService.create({
      ...dto,
      password: hashed,
    });

    const token = this.jwtService.sign({
      sub: newUser.id,
      email: newUser.email,
    });
    return { user: newUser, token };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user, token };
  }
}
