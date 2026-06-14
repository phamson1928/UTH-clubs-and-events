import {
  Controller,
  Get,
  Request,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'common/guards/roles.guard';
import { Roles } from 'common/decorators/roles.decorator';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) { }

  // Lấy thống kê admin
  @Get('admin_statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Lấy thống kê tổng quan cho Admin (dashboard)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Thống kê dashboard admin' })
  getAdminDashboardStatistics() {
    return this.statisticsService.getAdminDashboardStatistics();
  }

  // Lấy thống kê club owner
  @Get('own-club_statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner')
  @ApiOperation({ summary: 'Lấy thống kê CLB cho Club Owner (dashboard)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Thống kê dashboard club owner' })
  getOwnClubDashboardStatistics(@Request() req: { user: { clubId: number } }) {
    const clubId = req.user.clubId;
    return this.statisticsService.getOwnClubDashboardStatistics(clubId);
  }

  // Lấy thống kê trang chủ
  @Get('member_statistics')
  @ApiOperation({ summary: 'Lấy thống kê trang chủ cho sinh viên' })
  @ApiResponse({ status: 200, description: 'Thống kê dashboard sinh viên' })
  getMemberDashboardStatistics() {
    return this.statisticsService.getMemberDashboardStatistics();
  }

  // Chart Statistics for Admin
  @Get('admin/events-growth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Thống kê tăng trưởng sự kiện theo năm (Admin)' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Năm thống kê (mặc định năm hiện tại)' })
  @ApiResponse({ status: 200, description: 'Dữ liệu tăng trưởng sự kiện theo tháng' })
  getEventsGrowthStatistics(
    @Query('year', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe)
    year: number,
  ) {
    return this.statisticsService.getEventsGrowthStatistics(year);
  }

  @Get('admin/users-growth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Thống kê tăng trưởng người dùng theo năm (Admin)' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Năm thống kê (mặc định năm hiện tại)' })
  @ApiResponse({ status: 200, description: 'Dữ liệu tăng trưởng người dùng theo tháng' })
  getUserGrowthStatistics(
    @Query('year', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe)
    year: number,
  ) {
    return this.statisticsService.getUserGrowthStatistics(year);
  }

  @Get('admin/role-distribution')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Thống kê phân bố vai trò người dùng (Admin)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Phân bố role' })
  getRoleDistribution() {
    return this.statisticsService.getRoleDistribution();
  }

  @Get('admin/club-categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Thống kê CLB theo danh mục (Admin)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Thống kê CLB theo category' })
  getClubCategoryStatistics() {
    return this.statisticsService.getClubCategoryStatistics();
  }

  @Get('admin/events-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Thống kê trạng thái sự kiện (Admin)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Phân bố trạng thái sự kiện' })
  getEventsStatusDistribution() {
    return this.statisticsService.getEventStatusDistribution();
  }

  @Get('admin/events-monthly-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Thống kê sự kiện theo tháng và trạng thái (Admin)' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Năm thống kê (mặc định năm hiện tại)' })
  @ApiResponse({ status: 200, description: 'Sự kiện theo tháng và trạng thái' })
  getMonthlyEventsByStatus(
    @Query('year', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe)
    year: number,
  ) {
    return this.statisticsService.getMonthlyEventsByStatus(year);
  }

  // Chart Statistics for Club Owner
  @Get('club-owner/events-growth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner')
  getClubEventsGrowthStatistics(
    @Request() req: { user: { clubId: number } },
    @Query('year', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe)
    year: number,
  ) {
    const clubId = req.user.clubId;
    return this.statisticsService.getClubEventsGrowthStatistics(clubId, year);
  }

  @Get('club-owner/members-growth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner')
  getClubMemberGrowthStatistics(
    @Request() req: { user: { clubId: number } },
    @Query('year', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe)
    year: number,
  ) {
    const clubId = req.user.clubId;
    return this.statisticsService.getClubMemberGrowthStatistics(clubId, year);
  }
}
