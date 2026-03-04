import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../events/entities/event.entity';
import { EventRegistration } from './entities/event_registration.entity';
import { Membership } from '../memberships/entities/membership.entity';

@Injectable()
export class EventRegistrationsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(EventRegistration)
    private readonly registrationsRepository: Repository<EventRegistration>,
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
  ) {}

  // Đăng ký tham gia event, đảm bảo mỗi user chỉ đăng ký một lần
  async registerUserForEvent(eventId: number, userId: number) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
      relations: ['club'],
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // 1.1 Kiểm tra sự kiện đã diễn ra chưa
    if (event.date <= new Date()) {
      throw new BadRequestException('Sự kiện đã diễn ra');
    }

    // 1.1 Kiểm tra registration_deadline
    if (
      event.registration_deadline &&
      event.registration_deadline <= new Date()
    ) {
      throw new BadRequestException('Đã hết hạn đăng ký sự kiện');
    }

    // 1.1 Kiểm tra đủ chỗ
    if (
      event.max_capacity !== null &&
      event.max_capacity !== undefined &&
      event.attending_users_number >= event.max_capacity
    ) {
      throw new BadRequestException('Sự kiện đã đủ chỗ');
    }

    // 1.2 Kiểm tra visibility members_only
    if (event.visibility === 'members_only') {
      const membership = await this.membershipRepository.findOne({
        where: {
          user: { id: userId },
          club: { id: event.club.id },
          status: 'approved',
        },
        relations: ['user', 'club'],
      });
      if (!membership) {
        throw new ForbiddenException(
          'Sự kiện này chỉ dành cho thành viên của CLB',
        );
      }
    }

    const existed = await this.registrationsRepository.findOne({
      where: { event: { id: eventId }, user: { id: userId } },
      relations: ['event', 'user'],
    });
    if (existed) {
      throw new ConflictException('Bạn đã đăng ký tham gia event này rồi');
    }

    const registration = this.registrationsRepository.create({
      event: { id: eventId } as Event,
      user: { id: userId },
    });

    try {
      await this.registrationsRepository.save(registration);
    } catch (err: unknown) {
      // Handle unique constraint violation (race condition)
      const e = err as { code?: string; message?: string };
      const isUniqueViolation =
        e.code === '23505' || // PostgreSQL unique violation
        e.message?.includes('duplicate') === true;
      if (isUniqueViolation) {
        throw new ConflictException('Bạn đã đăng ký tham gia event này rồi');
      }
      throw err;
    }

    await this.eventsRepository.increment(
      { id: eventId },
      'attending_users_number',
      1,
    );

    return { message: 'Đăng ký thành công' };
  }

  // Hủy đăng ký tham gia event
  async cancelRegistration(eventId: number, userId: number) {
    const registration = await this.registrationsRepository.findOne({
      where: { event: { id: eventId }, user: { id: userId } },
      relations: ['event', 'user'],
    });

    if (!registration) {
      throw new NotFoundException('Bạn chưa đăng ký tham gia event này');
    }

    await this.registrationsRepository.delete(registration.id);

    // Decrement attending_users_number (min 0)
    await this.eventsRepository
      .createQueryBuilder()
      .update(Event)
      .set({
        attending_users_number: () => 'GREATEST(attending_users_number - 1, 0)',
      })
      .where('id = :id', { id: eventId })
      .execute();

    return { message: 'Hủy đăng ký thành công' };
  }

  // Lấy danh sách người tham gia một sự kiện dành cho chủ CLB hoặc admin
  async getEventParticipants(
    eventId: number,
    user: { id: number; role: string },
  ) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
      relations: ['club'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (user.role !== 'admin' && event.club?.ownerId !== user.id) {
      throw new ForbiddenException('Bạn không có quyền xem danh sách này');
    }

    const registrations = await this.registrationsRepository.find({
      where: { event: { id: eventId } },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });

    return {
      event: {
        id: event.id,
        name: event.name,
        status: event.status,
        date: event.date,
        activities: event.activities,
        location: event.location,
        attending_users_number: event.attending_users_number,
      },
      participants: registrations.map((r) => ({
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
        mssv: r.user.mssv,
        registered_at: r.created_at,
      })),
    };
  }

  // 2.1 Danh sách event user đã đăng ký
  async getMyEvents(userId: number) {
    const registrations = await this.registrationsRepository
      .createQueryBuilder('reg')
      .leftJoinAndSelect('reg.event', 'event')
      .leftJoinAndSelect('event.club', 'club')
      .where('reg.userId = :userId', { userId })
      .orderBy('event.date', 'DESC')
      .getMany();

    return registrations.map((r) => ({
      eventId: r.event.id,
      eventName: r.event.name,
      clubName: r.event.club?.name ?? null,
      date: r.event.date,
      location: r.event.location,
      status: r.event.status,
      registeredAt: r.created_at,
    }));
  }
}
