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
import { ClubsModule } from './clubs/clubs.module';
import { MembershipsModule } from './memberships/memberships.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    ConfigModule.forRoot(), // 👈 bắt buộc phải có dòng này
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: process.env.DB_USER, // tài khoản mặc định
      password: process.env.DB_PASSWORD, // thay bằng mật khẩu của bạn
      database: process.env.DB_NAME, // tên database bạn vừa tạo
      autoLoadEntities: true,
      synchronize: true, // Tự tạo bảng khi chạy (chỉ dùng trong dev)
      entities: [User, Club, Membership, Event],
    }),
    UsersModule,
    ClubsModule,
    MembershipsModule,
    EventsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
