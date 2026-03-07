import {
  Controller,
  Post,
  Param,
  Get,
  Delete,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
  Res,
  Query,
} from '@nestjs/common';
import { EventRegistrationsService } from './event_registrations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'common/guards/roles.guard';
import { Roles } from 'common/decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('event-registrations')
@Controller('event-registrations')
export class EventRegistrationsController {
  constructor(
    private readonly eventRegistrationsService: EventRegistrationsService,
  ) { }

  // ─── My Events ───────────────────────────────────────────────
  @ApiOperation({ summary: 'Lấy danh sách sự kiện đã đăng ký của user hiện tại' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Thành công' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'club_owner', 'admin')
  @Get('my-events')
  getMyEvents(@Request() req: { user: { id: number } }) {
    return this.eventRegistrationsService.getMyEvents(req.user.id);
  }

  // ─── Register ────────────────────────────────────────────────
  @ApiOperation({ summary: 'Đăng ký tham gia sự kiện' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  @ApiResponse({ status: 400, description: 'Lỗi nghiệp vụ (hết chỗ, quá hạn, đã đăng ký)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'club_owner', 'admin')
  @Post(':id/register')
  registerForEvent(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.eventRegistrationsService.registerUserForEvent(id, req.user.id);
  }

  // ─── Cancel ──────────────────────────────────────────────────
  @ApiOperation({ summary: 'Hủy đăng ký tham gia sự kiện' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'club_owner', 'admin')
  @Delete(':id/cancel')
  cancelRegistration(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.eventRegistrationsService.cancelRegistration(id, req.user.id);
  }

  // ─── Participants ─────────────────────────────────────────────
  @ApiOperation({ summary: 'Lấy danh sách người tham gia sự kiện (Club Owner / Admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner', 'admin')
  @Get(':id/participants')
  getEventParticipants(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number; role: string } },
  ) {
    return this.eventRegistrationsService.getEventParticipants(id, req.user);
  }

  // ─── QR Check-in: Generate ───────────────────────────────────
  @ApiOperation({ summary: 'Tạo mã QR check-in cho sự kiện (Club Owner / Admin)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Trả về mã QR base64 và check-in code' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner', 'admin')
  @Post(':id/qr')
  generateQrCode(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number; role: string } },
  ) {
    return this.eventRegistrationsService.generateQrCode(id, req.user);
  }

  // ─── QR Check-in: Submit ─────────────────────────────────────
  @ApiOperation({ summary: 'Điểm danh bằng mã check-in (Student)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiBody({ schema: { properties: { code: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Điểm danh thành công, cộng điểm rèn luyện' })
  @ApiResponse({ status: 400, description: 'Mã check-in không hợp lệ' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'club_owner', 'admin')
  @Post(':id/checkin')
  checkIn(
    @Param('id', ParseIntPipe) id: number,
    @Body('code') code: string,
    @Request() req: { user: { id: number } },
  ) {
    return this.eventRegistrationsService.checkIn(id, code, req.user.id);
  }

  // ─── Export: Attendance ───────────────────────────────────────
  @ApiOperation({ summary: 'Xuất Excel danh sách điểm danh sự kiện (Club Owner / Admin)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Event ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner', 'admin')
  @Get('export/attendance/:id')
  exportAttendance(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number; role: string } },
    @Res() res: Response,
  ) {
    return this.eventRegistrationsService.exportAttendanceExcel(id, req.user, res);
  }

  // ─── Export: Club Members ────────────────────────────────────
  @ApiOperation({ summary: 'Xuất Excel danh sách thành viên CLB (Club Owner / Admin)' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'clubId', type: Number, description: 'Club ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner', 'admin')
  @Get('export/members')
  exportMembers(
    @Query('clubId', ParseIntPipe) clubId: number,
    @Request() req: { user: { id: number; role: string; clubId: number } },
    @Res() res: Response,
  ) {
    return this.eventRegistrationsService.exportClubMembersExcel(clubId, req.user, res);
  }
}
