import { PartialType } from '@nestjs/mapped-types';
import { CreateMembershipDto } from './create-membership.dto';
import { IsIn } from 'class-validator';

export class UpdateMembershipDto extends PartialType(CreateMembershipDto) {
  @IsIn(['approved', 'rejected'])
  status: 'approved' | 'rejected';
}
