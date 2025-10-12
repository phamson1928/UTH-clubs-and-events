import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsIn } from 'class-validator';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @IsIn(['approved', 'rejected'])
  status: 'approved' | 'rejected';
}
