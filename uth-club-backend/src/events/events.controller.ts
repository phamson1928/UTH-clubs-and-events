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
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'common/guards/roles.guard';
import { Roles } from 'common/decorators/roles.decorator';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // Gửi đơn tạo event
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner')
  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  // Lấy event theo status
  @Get()
  findAll(
    @Query('status') status?: 'pending' | 'approved' | 'rejected' | 'canceled',
  ) {
    return this.eventsService.findAll(status);
  }

  // Lấy event theo club
  @Get('events')
  findAllByClub(@Request() req: { clubId: number }) {
    return this.eventsService.findAllByClub(req.clubId);
  }

  // Lấy event theo id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  // Cập nhật event
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(+id, updateEventDto);
  }

  // Duyệt event
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/approved')
  clickApproved(@Param('id') id: string) {
    return this.eventsService.update(+id, { status: 'approved' });
  }

  // Từ chối event
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/rejected')
  clickRejected(@Param('id') id: string) {
    return this.eventsService.update(+id, { status: 'rejected' });
  }

  // Xóa event
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }
}
