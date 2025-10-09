import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClubDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNotEmpty()
  ownerId: number; // id của user sở hữu club
}
