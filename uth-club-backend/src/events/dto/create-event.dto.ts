import { IsString, IsNotEmpty, IsOptional, IsDate } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsOptional()
  attending_users_number?: number;
}
