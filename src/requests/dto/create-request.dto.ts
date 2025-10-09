import { IsEnum, IsOptional } from 'class-validator';

export class CreateRequestDto {
  @IsEnum(['create', 'cancel', 'join'])
  type: 'create' | 'cancel' | 'join';

  @IsOptional()
  userId?: number; // chỉ dùng khi user gửi join request

  @IsOptional()
  clubId?: number;

  @IsOptional()
  eventId?: number;

  @IsEnum(['pending', 'approved', 'rejected'])
  @IsOptional()
  adminStatus?: 'pending' | 'approved' | 'rejected';
}
