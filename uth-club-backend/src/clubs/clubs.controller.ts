import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RolesGuard } from 'common/guards/roles.guard';
import { Roles } from 'common/decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('clubs')
@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) { }

  // Tạo club mới (admin only)
  @ApiOperation({ summary: 'Tạo club mới (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Tạo club thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền (Cần quyền admin)' })
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createClubDto: CreateClubDto) {
    return this.clubsService.create(createClubDto);
  }

  // Lấy danh sách club
  @ApiOperation({ summary: 'Lấy danh sách các club (phân trang)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.clubsService.findAll(paginationDto);
  }

  // Lấy club theo id (click vào club) — optional auth để populate isRegistered nếu đăng nhập
  @ApiOperation({ summary: 'Lấy thông tin chi tiết club theo ID' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy club' })
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user?: { id: number } },
  ) {
    const userId = req?.user?.id;
    return this.clubsService.findOne(id, userId);
  }

  // Cập nhật club
  @ApiOperation({ summary: 'Cập nhật thông tin club (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClubDto: UpdateClubDto,
  ) {
    return this.clubsService.update(id, updateClubDto);
  }

  // Xóa club
  @ApiOperation({ summary: 'Xóa club (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clubsService.remove(id);
  }
}
