import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    Request,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'common/guards/roles.guard';
import { Roles } from 'common/decorators/roles.decorator';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiBody,
} from '@nestjs/swagger';

@ApiTags('feedback')
@Controller('feedback')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) { }

    // ─── Submit Feedback ──────────────────────────────────────────
    @ApiOperation({ summary: 'Gửi đánh giá sự kiện (chỉ dành cho người đã điểm danh)' })
    @ApiBearerAuth()
    @ApiParam({ name: 'eventId', type: Number })
    @ApiBody({
        schema: {
            properties: {
                rating: { type: 'number', minimum: 1, maximum: 5, description: 'Số sao (1–5)' },
                comment: { type: 'string', description: 'Nhận xét (tùy chọn)' },
            },
            required: ['rating'],
        },
    })
    @ApiResponse({ status: 201, description: 'Gửi đánh giá thành công' })
    @ApiResponse({ status: 403, description: 'Chưa điểm danh — không được phép đánh giá' })
    @ApiResponse({ status: 409, description: 'Đã gửi đánh giá rồi' })
    @Post(':eventId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('user', 'club_owner', 'admin')
    submitFeedback(
        @Param('eventId', ParseIntPipe) eventId: number,
        @Body('rating') rating: number,
        @Body('comment') comment: string | undefined,
        @Request() req: { user: { id: number } },
    ) {
        return this.feedbackService.submitFeedback(eventId, req.user.id, Number(rating), comment);
    }

    // ─── My feedback ─────────────────────────────────────────────
    @ApiOperation({ summary: 'Xem các đánh giá tôi đã gửi' })
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Danh sách đánh giá' })
    @Get('my')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('user', 'club_owner', 'admin')
    getMyFeedback(@Request() req: { user: { id: number } }) {
        return this.feedbackService.getMyFeedback(req.user.id);
    }

    // ─── Event summary (public) ───────────────────────────────────
    @ApiOperation({ summary: 'Xem tóm tắt đánh giá của một sự kiện (công khai)' })
    @ApiParam({ name: 'eventId', type: Number })
    @ApiResponse({ status: 200, description: 'Summary gồm averageRating, distribution, và danh sách review' })
    @Get(':eventId/summary')
    getEventSummary(@Param('eventId', ParseIntPipe) eventId: number) {
        return this.feedbackService.getEventFeedbackSummary(eventId);
    }

    // ─── Event detailed (owner/admin) ────────────────────────────
    @ApiOperation({ summary: 'Chi tiết tất cả feedback của sự kiện (Club Owner / Admin)' })
    @ApiBearerAuth()
    @ApiParam({ name: 'eventId', type: Number })
    @ApiResponse({ status: 200, description: 'Danh sách chi tiết với thông tin user' })
    @Get(':eventId/detailed')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('club_owner', 'admin')
    getEventDetailed(@Param('eventId', ParseIntPipe) eventId: number) {
        return this.feedbackService.getEventFeedbackDetailed(eventId);
    }

    // ─── Update my feedback ───────────────────────────────────────
    @ApiOperation({ summary: 'Chỉnh sửa đánh giá của tôi' })
    @ApiBearerAuth()
    @ApiParam({ name: 'id', type: Number, description: 'Feedback ID' })
    @ApiBody({
        schema: {
            properties: {
                rating: { type: 'number', minimum: 1, maximum: 5 },
                comment: { type: 'string' },
            },
        },
    })
    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('user', 'club_owner', 'admin')
    updateFeedback(
        @Param('id', ParseIntPipe) id: number,
        @Body('rating') rating: number | undefined,
        @Body('comment') comment: string | undefined,
        @Request() req: { user: { id: number } },
    ) {
        return this.feedbackService.updateFeedback(id, req.user.id, rating ? Number(rating) : undefined, comment);
    }

    // ─── Delete feedback ──────────────────────────────────────────
    @ApiOperation({ summary: 'Xóa đánh giá (chủ nhân hoặc admin)' })
    @ApiBearerAuth()
    @ApiParam({ name: 'id', type: Number, description: 'Feedback ID' })
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('user', 'club_owner', 'admin')
    deleteFeedback(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: { user: { id: number; role: string } },
    ) {
        return this.feedbackService.deleteFeedback(id, req.user.id, req.user.role);
    }
}
