import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClubDto {
  @ApiProperty({ example: 'CLB Lập trình', description: 'Tên câu lạc bộ' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'CLB dành cho sinh viên yêu thích lập trình', description: 'Mô tả câu lạc bộ' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Công nghệ', description: 'Thể loại câu lạc bộ' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', description: 'Ảnh đại diện của câu lạc bộ' })
  @IsNotEmpty()
  club_image: string;

  @ApiProperty({ example: 1, description: 'ID của chủ sở hữu câu lạc bộ' })
  @IsNotEmpty()
  ownerId: number;
}
