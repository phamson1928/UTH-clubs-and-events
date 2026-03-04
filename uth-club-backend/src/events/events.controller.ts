import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RolesGuard } from 'common/guards/roles.guard';
import { Roles } from 'common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  // Gửi đơn tạo event
  @ApiOperation({ summary: 'Gửi đơn tạo event mới (Club Owner only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Tạo event thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner')
  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  // Lấy event theo status
  @ApiOperation({ summary: 'Lấy danh sách event (phân trang)' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'approved', 'rejected', 'canceled'] })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: 'pending' | 'approved' | 'rejected' | 'canceled',
    @Request() req?: { user?: { id: number } },
  ) {
    const userId = req?.user?.id;
    return this.eventsService.findAll(paginationDto, status, userId);
  }

  // Lấy event theo club với status pending
  @ApiOperation({ summary: 'Lấy danh sách event đang chờ duyệt của CLB (Club Owner only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @Get('pending_events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner')
  findAllByClub(@Request() req: { user: { clubId: number } }) {
    return this.eventsService.findAllByClub(req.user.clubId);
  }

  // Lấy event theo status cho club owner
  @Get('club_owner')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner')
  findAllByClubAndStatus(
    @Request() req: { user: { clubId: number } },
    @Query('status') status?: 'pending' | 'approved' | 'rejected' | 'canceled',
  ) {
    return this.eventsService.findAllByClubAndStatus(req.user.clubId, status);
  }

  // Lấy event theo id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  // Cập nhật event (club_owner — status bị loại bỏ để ngăn tự approve)
  @ApiOperation({ summary: 'Cập nhật thông tin event (Club Owner only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req: { user: { clubId: number } },
  ) {
    // Strip status to prevent club_owner from self-approving events
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { status: _status, ...safeDto } = updateEventDto;
    return this.eventsService.update(
      id,
      safeDto as UpdateEventDto,
      req.user.clubId,
    );
  }

  // Duyệt event
  @ApiOperation({ summary: 'Duyệt event (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Duyệt thành công' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/approved')
  clickApproved(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.update(id, { status: 'approved' });
  }

  // Từ chối event
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/rejected')
  clickRejected(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.update(id, { status: 'rejected' });
  }

  // Xóa event
  @ApiOperation({ summary: 'Xóa event (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.remove(id);
  }
}
