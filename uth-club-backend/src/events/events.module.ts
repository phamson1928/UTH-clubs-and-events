import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventRegistration } from '../event_registrations/entities/event_registration.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { User } from '../users/entities/user.entity';
import { EventsTaskService } from './events-task.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, EventRegistration, Membership, User]),
    NotificationsModule,
  ],
  controllers: [EventsController],
  providers: [EventsService, EventsTaskService],
  exports: [EventsService, EventsTaskService],
})
export class EventsModule { }
