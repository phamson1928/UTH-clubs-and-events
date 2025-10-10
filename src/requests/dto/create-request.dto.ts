import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateRequestDto {
  @IsEnum(['create', 'join'])
  type: 'create' | 'join';

  @IsOptional()
  userId?: number; // chỉ dùng khi user gửi join request

  @IsOptional()
  clubId?: number;

  @IsOptional()
  eventId?: number;

  @IsOptional()
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  experiance: string;

  @IsOptional()
  @IsDate()
  apply_date: Date;

  @IsEnum(['pending', 'approved', 'rejected'])
  @IsOptional()
  adminStatus?: 'pending' | 'approved' | 'rejected';
}
