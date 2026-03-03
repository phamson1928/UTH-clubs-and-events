import { IsNotEmpty } from 'class-validator';

// clubId comes from @Param, userId comes from JWT — do NOT expose them in the body
export class CreateMembershipDto {
  @IsNotEmpty()
  join_reason: string;

  @IsNotEmpty()
  skills: string;

  @IsNotEmpty()
  promise: string;
}
