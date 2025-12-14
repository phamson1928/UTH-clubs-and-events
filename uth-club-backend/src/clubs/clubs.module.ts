import { Module } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { ClubsController } from './clubs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Club } from './entities/club.entity';
import { User } from '../users/entities/user.entity';
import { EventRegistration } from '../event_registrations/entities/event_registration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Club, User, EventRegistration])],
  controllers: [ClubsController],
  providers: [ClubsService],
  exports: [ClubsService],
})
export class ClubsModule {}
