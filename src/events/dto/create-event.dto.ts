import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDate,
} from 'class-validator';

export class CreateEventDto {
  @IsNotEmpty()
  clubId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @IsNotEmpty()
  date: Date;

  @IsNotEmpty()
  event_image: string;

  @IsNotEmpty()
  @IsString()
  activities: string;

  @IsEnum(['pending', 'approved', 'rejected', 'canceled'])
  @IsOptional()
  status?: 'pending' | 'approved' | 'rejected' | 'canceled';
}
