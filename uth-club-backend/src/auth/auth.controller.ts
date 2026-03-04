import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  // Đăng ký — giới hạn 5 lần / 60 giây
  @ApiOperation({ summary: 'Đăng ký tài khoản sinh viên mới' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công, vui lòng check email để verify' })
  @ApiResponse({ status: 400, description: 'Email đã tồn tại hoặc mã số sinh viên đã tồn tại' })
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // Đăng nhập — giới hạn 5 lần / 60 giây
  @ApiOperation({ summary: 'Đăng nhập vào hệ thống' })
  @ApiResponse({ status: 201, description: 'Đăng nhập thành công, trả về access_token và thông tin user' })
  @ApiResponse({ status: 401, description: 'Email hoặc mật khẩu không chính xác' })
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Xác nhận email
  @ApiOperation({ summary: 'Xác thực email qua token' })
  @ApiQuery({ name: 'token', description: 'Mã xác thực gửi qua email' })
  @ApiResponse({ status: 200, description: 'Xác thực thành công' })
  @ApiResponse({ status: 400, description: 'Token không hợp lệ hoặc đã hết hạn' })
  @Get('verify')
  async verifyEmail(@Query('token') token: string) {
    return await this.authService.verifyEmail(token);
  }

  // Quên mật khẩu — giới hạn 3 lần / 60 giây
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(dto.email);
  }

  // Reset mật khẩu — giới hạn 5 lần / 60 giây
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(dto.token, dto.newPassword);
  }
}
