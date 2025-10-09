import { IsNotEmpty, IsEnum } from 'class-validator';

export class CreateMembershipDto {
  @IsNotEmpty()
  clubId: number;

  @IsNotEmpty()
  userId: number;

  @IsEnum(['pending', 'approved', 'rejected'])
  status: 'pending' | 'approved' | 'rejected';
}
