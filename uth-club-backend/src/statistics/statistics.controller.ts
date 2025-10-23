import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'common/guards/roles.guard';
import { Roles } from 'common/decorators/roles.decorator';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  // Lấy thống kê admin
  @Get('admin_statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getAdminDashboardStatistics() {
    return this.statisticsService.getAdminDashboardStatistics();
  }

  // Lấy thống kê club owner
  @Get('own-club_statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner')
  getOwnClubDashboardStatistics(@Request() req: { user: { clubId: number } }) {
    const clubId = req.user.clubId;
    return this.statisticsService.getOwnClubDashboardStatistics(clubId);
  }

  // Lấy thống kê member
  @Get('member_statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('member')
  getMemberDashboardStatistics() {
    return this.statisticsService.getMemberDashboardStatistics();
  }
}
