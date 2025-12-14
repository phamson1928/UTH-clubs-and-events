import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import type { Response } from 'express';
import { existsSync } from 'fs';

@Controller('upload')
export class UploadController {
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/images',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return {
      filename: file.filename,
      path: `/uploads/images/${file.filename}`,
      url: `${process.env.API_URL || 'http://localhost:3000'}/uploads/images/${file.filename}`,
    };
  }

  // Serve images directly
  @Get('images/:filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', 'images', filename);

    if (!existsSync(filePath)) {
      throw new BadRequestException('Image not found');
    }

    return res.sendFile(filePath);
  }
}
