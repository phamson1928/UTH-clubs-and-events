import {
  Controller,
  Post,
  Body,
  Request,
  Patch,
  Param,
  Delete,
  Get,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from 'common/guards/roles.guard';
import { Roles } from 'common/decorators/roles.decorator';

@Controller('memberships')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  // Lấy danh sách đơn xin tham gia club
  @Get('request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner')
  findAllRequests(@Request() req: { clubId: number }) {
    return this.membershipsService.findAllRequests(req.clubId);
  }

  @Post(':clubId/join')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async requestJoin(
    @Body() createMembershipDto: CreateMembershipDto,
    @Request() req: { user: { id: number } },
    @Param('clubId') clubId: number,
  ) {
    const userId = req.user.id;
    return this.membershipsService.createMembershipRequest(
      createMembershipDto,
      userId,
      clubId,
    );
  }

  @Get('members')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner')
  findAllMembers(@Request() req: { clubId: number }) {
    return this.membershipsService.findAllMembers(req.clubId);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner')
  async approve(@Param('id') id: number) {
    return this.membershipsService.updateMembershipRequest(id, 'approved');
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner')
  async reject(@Param('id') id: number) {
    return this.membershipsService.updateMembershipRequest(id, 'rejected');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner')
  async delete(@Param('id') id: number) {
    return this.membershipsService.deleteMembershipRequest(id);
  }
}
