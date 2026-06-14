import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';
import { IsIn, IsOptional } from 'class-validator';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @ApiPropertyOptional({ example: 'approved', enum: ['approved', 'rejected', 'pending', 'canceled'], description: 'Trạng thái sự kiện' })
  @IsOptional()
  @IsIn(['approved', 'rejected', 'pending', 'canceled'])
  status?: 'approved' | 'rejected' | 'pending' | 'canceled';
}
