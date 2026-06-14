import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMeDto {
  @ApiPropertyOptional({ example: 'Nguyễn Văn B', description: 'Họ và tên mới' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '2021123456', description: 'Mã số sinh viên mới' })
  @IsOptional()
  @IsString()
  mssv?: string;
}
