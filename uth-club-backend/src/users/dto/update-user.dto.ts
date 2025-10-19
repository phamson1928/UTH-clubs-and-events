import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  isVerified?: boolean;
  resetToken?: string;
  resetTokenExpires?: Date;
}
