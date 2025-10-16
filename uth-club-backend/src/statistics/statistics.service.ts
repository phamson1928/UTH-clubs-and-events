import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Event } from 'src/events/entities/event.entity';
import { Club } from 'src/clubs/entities/club.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Club)
    private clubRepository: Repository<Club>,
  ) {}

  async getAdminDashboardStatistics() {
    const totalClubs = await this.eventsRepository.count();

    const totalMembers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: 'member' })
      .andWhere('user.isVerified = :isVerified', { isVerified: true })
      .getCount();

    const totalEvents = await this.eventsRepository.count({
      where: { status: 'approved' },
    });

    const pendingEvents = await this.eventsRepository.count({
      where: { status: 'pending' },
    });

    return {
      totalClubs,
      totalMembers,
      totalEvents,
      pendingEvents,
    };
  }

  async getOwnClubDashboardStatistics(clubId: number) {
    const totalMembersInClub = await this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: 'member' })
      .andWhere('user.isVerified = :isVerified', { isVerified: true })
      .leftJoin('user.memberships', 'membership')
      .leftJoin('membership.club', 'club')
      .andWhere('club.id = :clubId', { clubId })
      .getCount();

    const totalEvents = await this.eventsRepository
      .createQueryBuilder('event')
      .leftJoin('event.club', 'club')
      .where('club.id = :clubId', { clubId })
      .andWhere('event.status = :status', { status: 'approved' })
      .getCount();

    const pendingEvents = await this.eventsRepository
      .createQueryBuilder('event')
      .leftJoin('event.club', 'club')
      .where('club.id = :clubId', { clubId })
      .andWhere('event.status = :status', { status: 'pending' })
      .getCount();

    const pastEvents = await this.eventsRepository
      .createQueryBuilder('event')
      .leftJoin('event.club', 'club')
      .where('club.id = :clubId', { clubId })
      .andWhere('event.status = :status', { status: 'pending' })
      .andWhere('event.date < :date', { date: new Date() })
      .getCount();

    return {
      totalMembersInClub,
      totalEvents,
      pendingEvents,
      pastEvents,
    };
  }

  async getMemberDashboardStatistics() {
    const totalClubs = await this.clubRepository.count();
    const totalEvents = await this.eventsRepository.count();
    const totalMembers = await this.userRepository.count();
    return {
      totalClubs,
      totalEvents,
      totalMembers,
    };
  }
}
