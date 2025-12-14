import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Event } from '../events/entities/event.entity';
import { Club } from '../clubs/entities/club.entity';
import { Membership } from '../memberships/entities/membership.entity';

interface MonthlyData {
  month: string | number;
  count: string | number;
}

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Club)
    private clubRepository: Repository<Club>,
    @InjectRepository(Membership)
    private membershipRepository: Repository<Membership>,
  ) {}

  async getAdminDashboardStatistics() {
    const totalClubs = await this.clubRepository.count();

    const totalMembers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: 'user' })
      .andWhere('user.isVerified = :isVerified', { isVerified: true })
      .getCount();

    const totalEvents = await this.eventsRepository.count();

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

  // New charts: Events status breakdown and monthly status by year
  async getEventStatusDistribution() {
    const result = await this.eventsRepository
      .createQueryBuilder('event')
      .select('event.status', 'status')
      .addSelect('COUNT(event.id)', 'count')
      .groupBy('event.status')
      .getRawMany<{ status: string; count: string | number }>();

    const statuses = ['approved', 'pending', 'rejected', 'canceled'];
    const map = new Map(result.map((r) => [r.status, Number(r.count)]));
    return statuses.map((s) => ({ status: s, count: map.get(s) || 0 }));
  }

  async getMonthlyEventsByStatus(year: number) {
    const rows = await this.eventsRepository
      .createQueryBuilder('event')
      .select('EXTRACT(MONTH FROM event.date)', 'month')
      .addSelect('event.status', 'status')
      .addSelect('COUNT(event.id)', 'count')
      .where('EXTRACT(YEAR FROM event.date) = :year', { year })
      .groupBy('month')
      .addGroupBy('status')
      .orderBy('month', 'ASC')
      .getRawMany<{
        month: string | number;
        status: string;
        count: string | number;
      }>();

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      approved: 0,
      pending: 0,
      rejected: 0,
      canceled: 0,
    }));

    rows.forEach((r) => {
      const idx = Number(r.month) - 1;
      if (idx >= 0 && idx < 12) {
        const key = r.status as
          | 'approved'
          | 'pending'
          | 'rejected'
          | 'canceled';
        if (key in months[idx]) {
          // Assign in a type-safe way
          if (key === 'approved') months[idx].approved = Number(r.count);
          if (key === 'pending') months[idx].pending = Number(r.count);
          if (key === 'rejected') months[idx].rejected = Number(r.count);
          if (key === 'canceled') months[idx].canceled = Number(r.count);
        }
      }
    });

    return months;
  }

  async getOwnClubDashboardStatistics(clubId: number) {
    const totalMembersInClub = await this.membershipRepository
      .createQueryBuilder('membership')
      .leftJoin('membership.club', 'club')
      .leftJoin('membership.user', 'user')
      .where('club.id = :clubId', { clubId })
      .andWhere('membership.status = :status', { status: 'approved' })
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
      .andWhere('event.status = :status', { status: 'approved' })
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

  // Chart Statistics

  async getEventsGrowthStatistics(year: number) {
    const data = await this.eventsRepository
      .createQueryBuilder('event')
      .select('EXTRACT(MONTH FROM event.date)', 'month')
      .addSelect('COUNT(event.id)', 'count')
      .where('EXTRACT(YEAR FROM event.date) = :year', { year })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany<MonthlyData>();

    return this.formatMonthlyData(data);
  }

  async getUserGrowthStatistics(year: number) {
    const data = await this.userRepository
      .createQueryBuilder('user')
      .select('EXTRACT(MONTH FROM user.createdAt)', 'month')
      .addSelect('COUNT(user.id)', 'count')
      .where('EXTRACT(YEAR FROM user.createdAt) = :year', { year })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany<MonthlyData>();

    return this.formatMonthlyData(data);
  }

  async getClubCategoryStatistics() {
    const result = await this.clubRepository
      .createQueryBuilder('club')
      .select('club.category', 'category')
      .addSelect('COUNT(club.id)', 'count')
      .groupBy('club.category')
      .getRawMany<{ category: string; count: string | number }>();

    return result.map((item) => ({
      category: item.category,
      count: Number(item.count),
    }));
  }

  async getClubEventsGrowthStatistics(clubId: number, year: number) {
    const data = await this.eventsRepository
      .createQueryBuilder('event')
      .leftJoin('event.club', 'club')
      .select('EXTRACT(MONTH FROM event.date)', 'month')
      .addSelect('COUNT(event.id)', 'count')
      .where('club.id = :clubId', { clubId })
      .andWhere('EXTRACT(YEAR FROM event.date) = :year', { year })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany<MonthlyData>();

    return this.formatMonthlyData(data);
  }

  async getClubMemberGrowthStatistics(clubId: number, year: number) {
    const data = await this.membershipRepository
      .createQueryBuilder('membership')
      .leftJoin('membership.club', 'club')
      .select('EXTRACT(MONTH FROM membership.join_date)', 'month')
      .addSelect('COUNT(membership.id)', 'count')
      .where('club.id = :clubId', { clubId })
      .andWhere('EXTRACT(YEAR FROM membership.join_date) = :year', { year })
      .andWhere('membership.status = :status', { status: 'approved' })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany<MonthlyData>();

    return this.formatMonthlyData(data);
  }

  private formatMonthlyData(data: MonthlyData[]) {
    const result: number[] = new Array(12).fill(0) as number[];
    data.forEach((item) => {
      const month = Number(item.month);
      const count = Number(item.count);
      const monthIndex = month - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        result[monthIndex] = count;
      }
    });
    return result.map((count, index) => ({
      month: index + 1,
      count,
    }));
  }
}
