import { Controller, Get, Request, UseGuards, Query } from '@nestjs/common';
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

  // Lấy thống kê trang chủ
  @Get('member_statistics')
  getMemberDashboardStatistics() {
    return this.statisticsService.getMemberDashboardStatistics();
  }

  // Chart Statistics for Admin
  @Get('admin/events-growth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getEventsGrowthStatistics(@Query('year') year: number) {
    return this.statisticsService.getEventsGrowthStatistics(
      year || new Date().getFullYear(),
    );
  }

  @Get('admin/users-growth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getUserGrowthStatistics(@Query('year') year: number) {
    return this.statisticsService.getUserGrowthStatistics(
      year || new Date().getFullYear(),
    );
  }

  @Get('admin/club-categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getClubCategoryStatistics() {
    return this.statisticsService.getClubCategoryStatistics();
  }

  @Get('admin/events-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getEventsStatusDistribution() {
    return this.statisticsService.getEventStatusDistribution();
  }

  @Get('admin/events-monthly-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getMonthlyEventsByStatus(@Query('year') year: number) {
    return this.statisticsService.getMonthlyEventsByStatus(
      year || new Date().getFullYear(),
    );
  }

  // Chart Statistics for Club Owner
  @Get('club-owner/events-growth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner')
  getClubEventsGrowthStatistics(
    @Request() req: { user: { clubId: number } },
    @Query('year') year: number,
  ) {
    const clubId = req.user.clubId;
    return this.statisticsService.getClubEventsGrowthStatistics(
      clubId,
      year || new Date().getFullYear(),
    );
  }

  @Get('club-owner/members-growth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner')
  getClubMemberGrowthStatistics(
    @Request() req: { user: { clubId: number } },
    @Query('year') year: number,
  ) {
    const clubId = req.user.clubId;
    return this.statisticsService.getClubMemberGrowthStatistics(
      clubId,
      year || new Date().getFullYear(),
    );
  }
}
