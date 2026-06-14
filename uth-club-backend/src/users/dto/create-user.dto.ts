import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Họ và tên người dùng' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'student@uth.edu.vn', description: 'Địa chỉ email người dùng' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Mật khẩu của người dùng' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '2021123456', description: 'Mã số sinh viên' })
  @IsString()
  @IsNotEmpty()
  mssv: string;

  @ApiProperty({ example: 'token-xyz...', description: 'Mã xác thực tài khoản' })
  @IsString()
  @IsNotEmpty()
  verificationToken: string;

  @ApiProperty({ example: 'user', enum: ['user', 'admin', 'club_owner'], description: 'Vai trò của người dùng' })
  @IsString()
  @IsNotEmpty()
  role?: 'user' | 'admin' | 'club_owner';

  @ApiPropertyOptional({ example: 0, description: 'Tổng số điểm tích lũy' })
  @IsNotEmpty()
  total_points?: number;
}
