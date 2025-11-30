import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  UseGuards,
  Body,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'common/guards/roles.guard';
import { Roles } from 'common/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Lấy danh sách user
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }

  // Tạo user mới
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('create')
  async create(@Body() createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  // Cập nhật user
  @Patch('update/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  // Xóa user
  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
