import {
    Controller,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    Request,
    UseGuards,
    ParseIntPipe,
    Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'common/guards/roles.guard';
import { Roles } from 'common/decorators/roles.decorator';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
    ApiBody,
} from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user', 'club_owner', 'admin')
@ApiBearerAuth()
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    // ─── Get my notifications ─────────────────────────────────────
    @ApiOperation({ summary: 'Lấy danh sách thông báo của tôi (tối đa 50 mới nhất)' })
    @ApiQuery({ name: 'unread', required: false, type: Boolean, description: 'Lọc chỉ thông báo chưa đọc' })
    @ApiResponse({ status: 200, description: 'Danh sách thông báo + số lượng chưa đọc' })
    @Get()
    getMyNotifications(
        @Request() req: { user: { id: number } },
        @Query('unread') unread?: string,
    ) {
        const onlyUnread = unread === 'true';
        return this.notificationsService.getMyNotifications(req.user.id, onlyUnread);
    }

    // ─── Mark specific notifications as read ──────────────────────
    @ApiOperation({ summary: 'Đánh dấu đọc một hoặc nhiều thông báo' })
    @ApiBody({ schema: { properties: { ids: { type: 'array', items: { type: 'number' } } } } })
    @ApiResponse({ status: 200, description: 'Đánh dấu thành công' })
    @Patch('read')
    markRead(
        @Request() req: { user: { id: number } },
        @Body('ids') ids: number[],
    ) {
        return this.notificationsService.markRead(req.user.id, ids ?? []);
    }

    // ─── Mark ALL as read ────────────────────────────────────────
    @ApiOperation({ summary: 'Đánh dấu tất cả thông báo là đã đọc' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @Patch('read-all')
    markAllRead(@Request() req: { user: { id: number } }) {
        return this.notificationsService.markAllRead(req.user.id);
    }

    // ─── Delete one notification ──────────────────────────────────
    @ApiOperation({ summary: 'Xóa một thông báo' })
    @ApiParam({ name: 'id', type: Number })
    @Delete(':id')
    deleteOne(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: { user: { id: number } },
    ) {
        return this.notificationsService.deleteNotification(req.user.id, id);
    }

    // ─── Clear all notifications ──────────────────────────────────
    @ApiOperation({ summary: 'Xóa tất cả thông báo của tôi' })
    @Delete()
    clearAll(@Request() req: { user: { id: number } }) {
        return this.notificationsService.clearAll(req.user.id);
    }
}
