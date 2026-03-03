import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Giống JwtAuthGuard nhưng KHÔNG reject unauthenticated request.
 * Nếu token hợp lệ → req.user được set.
 * Nếu không có token / token lỗi → req.user = null (request vẫn tiếp tục).
 * Dùng cho các route cần đọc user khi có nhưng vẫn cho phép anonymous.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest(_err: any, user: any, _info: any, _context: ExecutionContext) {
    // Trả về user nếu hợp lệ, null nếu không (không throw exception)
    return user || null;
  }
}
