import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { Club } from './clubs/entities/club.entity';
import { Membership } from './memberships/entities/membership.entity';
import { Event } from './events/entities/event.entity';
import { EventRegistration } from './event_registrations/entities/event_registration.entity';
import { ClubsModule } from './clubs/clubs.module';
import { MembershipsModule } from './memberships/memberships.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { StatisticsModule } from './statistics/statistics.module';
import { UploadModule } from './upload/upload.module';
import { EventRegistrationsModule } from './event_registrations/event_registrations.module';
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'pson4282@gmail.com',
          pass: 'dvdg qjpp hpdz zdxj', // dùng App Password, không dùng password thật!
        },
      },
      defaults: {
        from: '"UTH Clubs" <pson4282@gmail.com>',
      },
      template: {
        dir: join(__dirname, 'mail', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    ConfigModule.forRoot(), //bắt buộc phải có dòng này
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER, // tài khoản mặc định
      password: process.env.DB_PASSWORD, // thay bằng mật khẩu của bạn
      database: process.env.DB_NAME, // tên database bạn vừa tạo
      autoLoadEntities: true,
      synchronize: true, // Tự tạo bảng khi chạy (chỉ dùng trong dev)
      entities: [User, Club, Membership, Event, EventRegistration],
    }),
    UsersModule,
    ClubsModule,
    MembershipsModule,
    EventsModule,
    AuthModule,
    StatisticsModule,
    UploadModule,
    EventRegistrationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
