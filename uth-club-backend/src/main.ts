import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('UTH Clubs & Events API')
    .setDescription('The API documentation for UTH Clubs & Events management system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // HTTP security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      contentSecurityPolicy: false,
    }),
  );

  // Serve static files from uploads directory
  const uploadsPath = join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // Allow multiple origins via comma-separated CORS_ORIGIN env var
  const corsOrigins = process.env.CORS_ORIGIN
    ? (process.env.CORS_ORIGIN === '*' ? true : process.env.CORS_ORIGIN.split(','))
    : true; // Set to true to allow all origins during development

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
