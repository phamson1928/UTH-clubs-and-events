import { Module } from '@nestjs/common';
import { EventRegistrationsService } from './event_registrations.service';
import { EventRegistrationsController } from './event_registrations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventRegistration } from './entities/event_registration.entity';
import { Event } from '../events/entities/event.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventRegistration, Event, Membership, User]),
    NotificationsModule,
  ],
  controllers: [EventRegistrationsController],
  providers: [EventRegistrationsService],
  exports: [EventRegistrationsService],
})
export class EventRegistrationsModule { }
