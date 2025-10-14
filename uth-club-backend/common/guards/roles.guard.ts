import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lấy danh sách role yêu cầu từ decorator @Roles()
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) return true; // không có yêu cầu gì đặc biệt

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { role: string } }>();
    const user = request.user; // do JwtAuthGuard thêm vào
    if (!user) throw new ForbiddenException('Bạn chưa đăng nhập');

    // Kiểm tra role
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }

    return true;
  }
}
