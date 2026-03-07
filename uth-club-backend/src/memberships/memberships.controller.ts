import {
  Controller,
  Post,
  Body,
  Request,
  Patch,
  Param,
  Delete,
  Get,
  ParseIntPipe,
  Query,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { createClient } from '@supabase/supabase-js';
import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'common/guards/roles.guard';
import { Roles } from 'common/decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';

@ApiTags('memberships')
@Controller('memberships')
export class MembershipsController {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  );

  constructor(private readonly membershipsService: MembershipsService) { }

  // ─── Pending Requests ──────────────────────────────────────────
  @ApiOperation({ summary: 'Lấy danh sách đơn đăng ký gia nhập CLB (Club Owner only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Lấy hồ sơ thành công' })
  @Get('request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner')
  findAllRequests(
    @Request() req: { user: { clubId: number } },
    @Query() paginationDto: PaginationDto,
  ) {
    return this.membershipsService.findAllRequests(req.user.clubId, paginationDto);
  }

  // ─── My Clubs ──────────────────────────────────────────────────
  @ApiOperation({ summary: 'Lấy danh sách CLB mà người dùng hiện tại đang tham gia' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu thành công' })
  @Get('my-clubs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'club_owner', 'admin')
  getMyClubs(@Request() req: { user: { id: number } }) {
    return this.membershipsService.getMyClubs(req.user.id);
  }

  // ─── Admin: All Pending ───────────────────────────────────────
  @Get('admin/all-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAllPendingForAdmin() {
    return this.membershipsService.findAllPendingForAdmin();
  }

  // ─── Members List ─────────────────────────────────────────────
  @Get('members')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner', 'admin')
  findAllMembers(
    @Request() req: { user: { role: string; clubId: number } },
    @Query('clubId') queryClubId?: number,
  ) {
    const clubId = req.user.role === 'admin' ? queryClubId : req.user.clubId;
    if (!clubId) throw new BadRequestException('Vui lòng cung cấp clubId');
    return this.membershipsService.findAllMembers(Number(clubId));
  }

  // ─── Phase 2: Club Roster (with roles) ───────────────────────
  @ApiOperation({ summary: 'Xem ban điều hành & vai trò trong CLB (thành viên / owner / admin)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiResponse({ status: 200, description: 'Danh sách thành viên kèm vai trò' })
  @Get('roster/:clubId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'club_owner', 'admin')
  getClubRoster(
    @Param('clubId', ParseIntPipe) clubId: number,
    @Request() req: { user: { id: number; role: string; clubId: number } },
  ) {
    return this.membershipsService.getClubRoster(
      clubId,
      req.user.id,
      req.user.role,
      req.user.clubId,
    );
  }

  // ─── Phase 2: Assign Role ─────────────────────────────────────
  @ApiOperation({ summary: 'Gán vai trò nội bộ cho thành viên CLB (Club Owner / Admin)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'membershipId', description: 'Membership ID' })
  @ApiBody({
    schema: {
      properties: {
        role: {
          type: 'string',
          enum: ['member', 'vice_president', 'secretary', 'treasurer', 'other'],
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Cập nhật vai trò thành công' })
  @Patch(':membershipId/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner', 'admin')
  assignRole(
    @Param('membershipId', ParseIntPipe) membershipId: number,
    @Body('role') role: 'member' | 'vice_president' | 'secretary' | 'treasurer' | 'other',
    @Request() req: { user: { id: number; role: string; clubId: number } },
  ) {
    if (!role) throw new BadRequestException('Vui lòng cung cấp role');
    const validRoles = ['member', 'vice_president', 'secretary', 'treasurer', 'other'];
    if (!validRoles.includes(role))
      throw new BadRequestException(`Role không hợp lệ. Các giá trị cho phép: ${validRoles.join(', ')}`);
    return this.membershipsService.assignRole(membershipId, role, req.user);
  }

  // ─── Phase 2: Batch Assign Roles ─────────────────────────────
  @ApiOperation({ summary: 'Gán vai trò hàng loạt cho nhiều thành viên (Club Owner / Admin)' })
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      properties: {
        updates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              membershipId: { type: 'number' },
              role: { type: 'string', enum: ['member', 'vice_president', 'secretary', 'treasurer', 'other'] },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Kết quả cập nhật hàng loạt' })
  @Patch('roles/batch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner', 'admin')
  batchAssignRoles(
    @Body('updates') updates: Array<{ membershipId: number; role: 'member' | 'vice_president' | 'secretary' | 'treasurer' | 'other' }>,
    @Request() req: { user: { id: number; role: string; clubId: number } },
  ) {
    if (!updates || !Array.isArray(updates) || updates.length === 0)
      throw new BadRequestException('Vui lòng cung cấp danh sách updates');
    return this.membershipsService.batchAssignRoles(updates, req.user);
  }

  // ─── Phase 2: Upload Proposal PDF ────────────────────────────
  @ApiOperation({ summary: 'Upload file đề án sự kiện PDF (Club Owner only) — trả về URL' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary', description: 'PDF File (max 10MB)' } },
    },
  })
  @ApiResponse({ status: 201, description: 'Upload thành công, trả về url' })
  @Post('upload/proposal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner', 'admin')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(pdf)$/)) {
          return callback(
            new BadRequestException('Chỉ cho phép upload file PDF!'),
            false,
          );
        }
        callback(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async uploadProposal(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Không có file được tải lên');

    const filename = `proposals/${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;

    const { error } = await this.supabase.storage
      .from('proposals')
      .upload(filename, file.buffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (error) throw new BadRequestException(`Upload thất bại: ${error.message}`);

    const { data } = this.supabase.storage
      .from('proposals')
      .getPublicUrl(filename);

    return {
      filename,
      url: data.publicUrl,
    };
  }

  // ─── No-club users ────────────────────────────────────────────
  @Get('no-club-users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner')
  findUsersWithoutClub() {
    return this.membershipsService.findUsersWithoutClub();
  }

  // ─── Approve / Reject ────────────────────────────────────────
  @ApiOperation({ summary: 'Duyệt đơn gia nhập CLB' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Duyệt hồ sơ thành công' })
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner', 'admin')
  async approve(@Param('id', ParseIntPipe) id: number) {
    return this.membershipsService.updateMembershipRequest(id, 'approved');
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner', 'admin')
  async reject(@Param('id', ParseIntPipe) id: number) {
    return this.membershipsService.updateMembershipRequest(id, 'rejected');
  }

  // ─── Join Club ───────────────────────────────────────────────
  @ApiOperation({ summary: 'Nộp đơn đăng ký tham gia CLB' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Nộp đơn thành công' })
  @ApiResponse({ status: 400, description: 'Lỗi nghiệp vụ (đã đủ 3 CLB)' })
  @Post(':clubId/join')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async requestJoin(
    @Body() createMembershipDto: CreateMembershipDto,
    @Request() req: { user: { id: number } },
    @Param('clubId', ParseIntPipe) clubId: number,
  ) {
    return this.membershipsService.createMembershipRequest(
      createMembershipDto,
      req.user.id,
      clubId,
    );
  }

  // ─── Remove / Leave ──────────────────────────────────────────
  @Delete('members/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner')
  async removeMember(@Param('id', ParseIntPipe) id: number) {
    return this.membershipsService.removeMemberFromClub(id);
  }

  @ApiQuery({ name: 'clubId', type: Number })
  @Delete('leave/:clubId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'club_owner')
  async leaveClub(
    @Param('clubId', ParseIntPipe) clubId: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.membershipsService.leaveClub(req.user.id, clubId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.membershipsService.deleteMembershipRequest(id);
  }
}
