import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
import { MailModule } from './mail/mail.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FeedbackModule } from './feedback/feedback.module';
import { ScheduleModule } from '@nestjs/schedule';
import { Notification } from './notifications/entities/notification.entity';
import { EventFeedback } from './feedback/entities/event_feedback.entity';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 1000,
      },
    ]),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASS'),
          },
        },
        defaults: {
          from: `"UTH Clubs" <${configService.get<string>('MAIL_USER')}>`,
        },
        template: {
          dir: join(__dirname, 'mail', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl:
        process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production', // ⚠️ false trong production
      entities: [User, Club, Membership, Event, EventRegistration, Notification, EventFeedback],
    }),
    UsersModule,
    ClubsModule,
    MembershipsModule,
    EventsModule,
    AuthModule,
    StatisticsModule,
    UploadModule,
    EventRegistrationsModule,
    MailModule,
    NotificationsModule,
    FeedbackModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule { }
