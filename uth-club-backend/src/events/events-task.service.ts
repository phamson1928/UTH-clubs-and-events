import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Event } from './entities/event.entity';
import { EventRegistration } from '../event_registrations/entities/event_registration.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class EventsTaskService {
    private readonly logger = new Logger(EventsTaskService.name);

    constructor(
        @InjectRepository(Event)
        private readonly eventsRepository: Repository<Event>,
        @InjectRepository(EventRegistration)
        private readonly registrationsRepository: Repository<EventRegistration>,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) { }

    // Run every hour to check for completed events
    @Cron(CronExpression.EVERY_HOUR)
    async handleCron() {
        this.logger.debug('Running Cron: Checking for completed events...');
        const now = new Date();

        // 1. Find approved events that should be completed
        const eventsToComplete = await this.eventsRepository.find({
            where: {
                status: 'approved',
                endDate: LessThan(now),
            },
        });

        if (eventsToComplete.length === 0) {
            return;
        }

        this.logger.log(`Found ${eventsToComplete.length} events to complete.`);

        for (const event of eventsToComplete) {
            try {
                // 2. Update event status to completed
                event.status = 'completed';
                await this.eventsRepository.save(event);

                this.logger.log(`Event ${event.id} (${event.name}) marked as completed.`);
            } catch (error) {
                this.logger.error(`Failed to complete event ${event.id}:`, error);
            }
        }
    }
}
