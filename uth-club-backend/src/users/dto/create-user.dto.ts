import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  mssv: string;

  @IsString()
  @IsNotEmpty()
  verificationToken: string;

  @IsString()
  @IsNotEmpty()
  role?: 'user' | 'admin' | 'club_owner';

  @IsNotEmpty()
  total_points?: number;
}
