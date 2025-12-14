import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';
import { Club } from '../clubs/entities/club.entity';
import { Membership } from '../memberships/entities/membership.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, User, Club, Membership])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
