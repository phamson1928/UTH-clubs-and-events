import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'student@uth.edu.vn', description: 'Địa chỉ email đăng nhập' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Mật khẩu đăng nhập' })
  @IsNotEmpty()
  password: string;
}
