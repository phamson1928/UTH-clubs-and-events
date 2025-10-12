import {
  Controller,
  Post,
  Body,
  Request,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@Controller('memberships')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Post('request')
  @UseGuards(JwtAuthGuard)
  async requestJoin(
    @Body() createMembershipDto: CreateMembershipDto,
    @Request() req: { user: { id: number } },
  ) {
    const userId = req.user.id;
    return this.membershipsService.createMembershipRequest(
      createMembershipDto,
      userId,
    );
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard)
  async approve(@Param('id') id: number) {
    return this.membershipsService.updateMembershipRequest(id, 'approved');
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard)
  async reject(@Param('id') id: number) {
    return this.membershipsService.updateMembershipRequest(id, 'rejected');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: number) {
    return this.membershipsService.deleteMembershipRequest(id);
  }
}
