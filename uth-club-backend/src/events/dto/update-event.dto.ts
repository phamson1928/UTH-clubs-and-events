import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsIn, IsOptional } from 'class-validator';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @IsOptional()
  @IsIn(['approved', 'rejected', 'pending', 'canceled'])
  status?: 'approved' | 'rejected' | 'pending' | 'canceled';
}
