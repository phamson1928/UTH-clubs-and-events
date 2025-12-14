import { Controller, Post, Param, Get } from '@nestjs/common';
import { EventRegistrationsService } from './event_registrations.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'common/guards/roles.guard';
import { Roles } from 'common/decorators/roles.decorator';
import { Request } from '@nestjs/common';

@Controller('event-registrations')
export class EventRegistrationsController {
  constructor(
    private readonly eventRegistrationsService: EventRegistrationsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'club_owner', 'admin')
  @Post(':id/register')
  registerForEvent(
    @Param('id') id: string,
    @Request() req: { user: { id: number } },
  ) {
    return this.eventRegistrationsService.registerUserForEvent(
      +id,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner', 'admin')
  @Get(':id/participants')
  getEventParticipants(
    @Param('id') id: string,
    @Request() req: { user: { id: number; role: string } },
  ) {
    return this.eventRegistrationsService.getEventParticipants(+id, req.user);
  }
}
