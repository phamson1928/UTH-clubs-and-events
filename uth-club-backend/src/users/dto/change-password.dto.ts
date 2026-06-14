import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldpassword123', description: 'Mật khẩu hiện tại' })
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty({ example: 'newpassword123', minLength: 6, description: 'Mật khẩu mới' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword!: string;
}
