import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../events/entities/event.entity';
import { EventRegistration } from './entities/event_registration.entity';

@Injectable()
export class EventRegistrationsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(EventRegistration)
    private readonly registrationsRepository: Repository<EventRegistration>,
  ) {}

  // Đăng ký tham gia event, đảm bảo mỗi user chỉ đăng ký một lần
  async registerUserForEvent(eventId: number, userId: number) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
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
    await this.registrationsRepository.save(registration);

    await this.eventsRepository.increment(
      { id: eventId },
      'attending_users_number',
      1,
    );

    return { message: 'Đăng ký thành công' };
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
}
