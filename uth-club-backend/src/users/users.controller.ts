import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  UseGuards,
  Body,
  Post,
  Request,
  ForbiddenException,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'common/guards/roles.guard';
import { Roles } from 'common/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import * as bcrypt from 'bcrypt';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // Lấy danh sách user
  @ApiOperation({ summary: 'Lấy danh sách người dùng (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Lấy danh mục thành công' })
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  // 2.3 Profile của user đang đăng nhập
  @ApiOperation({ summary: 'Lấy thông tin cá nhân của người dùng đang đăng nhập' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req: { user: { id: number } }) {
    return this.usersService.findMe(req.user.id);
  }

  // 2.3 User tự sửa name / mssv
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân (tên, mssv)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@Request() req: { user: { id: number } }, @Body() dto: UpdateMeDto) {
    return this.usersService.updateMe(req.user.id, dto);
  }

  // 2.3 Đổi mật khẩu
  @ApiOperation({ summary: 'Đổi mật khẩu' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Đổi mật khẩu thành công' })
  @ApiResponse({ status: 401, description: 'Mật khẩu cũ không chính xác' })
  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Request() req: { user: { id: number } },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(
      req.user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }
  // Tạo user mới
  @ApiOperation({ summary: 'Tạo người dùng mới (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('create')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Cập nhật user
  @Patch('update/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  // Xóa user
  @ApiOperation({ summary: 'Xóa người dùng (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 403, description: 'Không thể xóa chính mình' })
  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ) {
    // 1.4 Admin không thể xóa chính mình
    if (id === req.user.id) {
      throw new ForbiddenException(
        'Không thể xóa tài khoản admin đang đăng nhập',
      );
    }
    return this.usersService.remove(id);
  }

  // Sửa thông tin user bởi admin
  @Patch('admin/edit/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async adminEditUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: { user: { id: number } },
  ) {
    // 1.4 Admin không thể hạ role chính mình
    if (
      id === req.user.id &&
      (updateUserDto as Record<string, unknown>)['role'] !== undefined
    ) {
      throw new ForbiddenException(
        'Không thể thay đổi role của tài khoản admin đang đăng nhập',
      );
    }
    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      updateUserDto.password = hashedPassword;
    }
    return this.usersService.update(id, updateUserDto);
  }

  // Sửa thông tin email user bởi club owner (chỉ được sửa email của chính mình)
  @Post('club-owner/edit-email/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('club_owner')
  async clubOwnerEditUserEmail(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: { user: { id: number } },
  ) {
    if (id !== req.user.id) {
      throw new ForbiddenException(
        'Bạn chỉ có thể chỉnh sửa email của chính mình',
      );
    }
    const allowedFields: Partial<UpdateUserDto> = {
      email: updateUserDto.email,
    };
    return this.usersService.update(id, allowedFields);
  }
}
