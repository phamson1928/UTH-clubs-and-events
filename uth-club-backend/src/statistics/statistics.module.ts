import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from 'src/events/entities/event.entity';
import { User } from 'src/users/entities/user.entity';
import { Club } from 'src/clubs/entities/club.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, User, Club])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
