import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventFeedback } from './entities/event_feedback.entity';
import { EventRegistration } from '../event_registrations/entities/event_registration.entity';
import { Event } from '../events/entities/event.entity';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';

@Module({
    imports: [TypeOrmModule.forFeature([EventFeedback, EventRegistration, Event])],
    controllers: [FeedbackController],
    providers: [FeedbackService],
    exports: [FeedbackService],
})
export class FeedbackModule { }
