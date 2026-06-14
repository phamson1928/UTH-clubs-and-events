import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AppService } from './app.service';
import type { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Kiểm tra trạng thái server' })
  @ApiResponse({ status: 200, description: 'Server đang chạy' })
  getHello(): string {
    return this.appService.getHello();
  }

  // Serve images from uploads directory as fallback
  @Get('uploads/images/:filename')
  @ApiOperation({ summary: 'Phục vụ file ảnh từ thư mục uploads' })
  @ApiParam({ name: 'filename', type: String, description: 'Tên file ảnh' })
  @ApiResponse({ status: 200, description: 'File ảnh' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy ảnh' })
  async serveImage(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', 'images', filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Image not found');
    }

    return res.sendFile(filePath);
  }
}
