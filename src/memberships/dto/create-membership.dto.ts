import { IsNotEmpty } from 'class-validator';

export class CreateMembershipDto {
  @IsNotEmpty()
  clubId: number;

  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  join_reason: string;

  @IsNotEmpty()
  skills: string;

  @IsNotEmpty()
  promise: string;
}
