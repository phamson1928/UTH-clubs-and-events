import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsInt,
  Min,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  clubId!: number;

  @ApiProperty({ example: 'Workshop Lập trình NestJS' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Học NestJS từ cơ bản đến nâng cao' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2025-12-30T09:00:00Z' })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  date!: Date;

  @ApiProperty({ example: 'https://placehold.co/600x400' })
  @IsNotEmpty()
  event_image!: string;

  @ApiProperty({ example: 'Tutorial, Coding, Q&A' })
  @IsNotEmpty()
  @IsString()
  activities!: string;

  @ApiProperty({ example: 'Phòng 201, Tòa A' })
  @IsString()
  @IsNotEmpty()
  location!: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  attending_users_number?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  max_capacity?: number;

  @ApiPropertyOptional({ example: '2025-12-25T00:00:00Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  registration_deadline?: Date;

  @ApiPropertyOptional({ enum: ['public', 'members_only'], default: 'public' })
  @IsOptional()
  @IsIn(['public', 'members_only'])
  visibility?: 'public' | 'members_only';
}
