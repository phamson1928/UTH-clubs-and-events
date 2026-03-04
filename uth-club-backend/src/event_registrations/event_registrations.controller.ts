import { Controller, Post, Param, Get, Delete } from '@nestjs/common';
import { EventRegistrationsService } from './event_registrations.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'common/guards/roles.guard';
import { Roles } from 'common/decorators/roles.decorator';
import { Request, ParseIntPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('event-registrations')
@Controller('event-registrations')
export class EventRegistrationsController {
  constructor(
    private readonly eventRegistrationsService: EventRegistrationsService,
  ) { }

  // 2.1 Danh sách event đã đăng ký của user
  @ApiOperation({ summary: 'Lấy danh sách các sự kiện mà người dùng hiện tại đã đăng ký tham gia' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'club_owner', 'admin')
  @Get('my-events')
  getMyEvents(@Request() req: { user: { id: number } }) {
    return this.eventRegistrationsService.getMyEvents(req.user.id);
  }

  @ApiOperation({ summary: 'Đăng ký tham gia sự kiện' })
  @ApiBearerAuth()
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'club_owner', 'admin')
  @Delete(':id/cancel')
  cancelRegistration(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.eventRegistrationsService.cancelRegistration(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner', 'admin')
  @Get(':id/participants')
  getEventParticipants(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number; role: string } },
  ) {
    return this.eventRegistrationsService.getEventParticipants(id, req.user);
  }
}
