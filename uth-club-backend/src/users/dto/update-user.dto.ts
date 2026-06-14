import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: true, description: 'Trạng thái xác thực tài khoản' })
  isVerified?: boolean;

  @ApiPropertyOptional({ example: 'token-xyz...', description: 'Mã đặt lại mật khẩu' })
  resetToken?: string;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00Z', description: 'Thời gian hết hạn mã đặt lại mật khẩu' })
  resetTokenExpires?: Date;
}
