import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Repository } from 'typeorm';
import { EventRegistration } from '../event_registrations/entities/event_registration.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(EventRegistration)
    private registrationsRepository: Repository<EventRegistration>,
  ) {}

  async create(createEventDto: CreateEventDto) {
    const event = this.eventsRepository.create(createEventDto);
    const savedEvent = await this.eventsRepository.save(event);

    return savedEvent;
  }

  async findAll(
    status?: 'pending' | 'approved' | 'rejected' | 'canceled',
    userId?: number,
  ) {
    let query = this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.club', 'club')
      .select([
        'event.id',
        'event.name',
        'event.description',
        'event.date',
        'event.location',
        'event.status',
        'event.activities',
        'event.event_image',
        'event.attending_users_number',
        'club.id',
        'club.name',
      ]);

    if (status) {
      query = query.where('event.status = :status', { status });
    }

    const events = await query.getMany();

    // If user is authenticated, check registration status for each event
    if (userId) {
      const eventsWithRegistration = await Promise.all(
        events.map(async (event) => {
          const registration = await this.registrationsRepository.findOne({
            where: {
              event: { id: event.id },
              user: { id: userId },
            },
          });
          return {
            ...event,
            isRegistered: !!registration,
          };
        }),
      );
      return eventsWithRegistration;
    }

    return events.map((event) => ({ ...event, isRegistered: false }));
  }

  // Lấy event theo club cho request của club owner
  async findAllByClub(clubId: number) {
    return await this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.club', 'club')
      .where('club.id = :clubId', { clubId })
      .andWhere('event.status = :status', { status: 'pending' })
      .getMany();
  }

  // Cập nhật khi user register tham gia event
  async updateAttendingUsersNumber(eventId: number) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
    });
    if (!event) {
      throw new Error('Event not found');
    }

    const newNumber = (event.attending_users_number || 0) + 1;
    return await this.eventsRepository.update(eventId, {
      attending_users_number: newNumber,
    });
  }

  // Lấy event theo club và status cho member của club owner
  async findAllByClubAndStatus(
    clubId: number,
    status?: 'pending' | 'approved' | 'rejected' | 'canceled',
  ) {
    const query = this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.club', 'club')
      .where('club.id = :clubId', { clubId });

    if (status) {
      query.andWhere('event.status = :status', { status });
    }

    return await query.getMany();
  }

  async findOne(id: number) {
    return await this.eventsRepository.findOne({
      where: { id },
      relations: ['club'],
    });
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    return await this.eventsRepository.update(id, updateEventDto);
  }

  async remove(id: number) {
    return await this.eventsRepository.delete(id);
  }
}
