import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Serve images from uploads directory as fallback
  @Get('uploads/images/:filename')
  async serveImage(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', 'images', filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Image not found');
    }

    return res.sendFile(filePath);
  }
}
