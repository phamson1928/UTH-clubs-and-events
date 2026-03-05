import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Repository, In } from 'typeorm';
import { EventRegistration } from '../event_registrations/entities/event_registration.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(EventRegistration)
    private registrationsRepository: Repository<EventRegistration>,
    private mailService: MailService,
  ) { }

  async create(createEventDto: CreateEventDto) {
    const event = this.eventsRepository.create(createEventDto);
    const savedEvent = await this.eventsRepository.save(event);

    return savedEvent;
  }

  async findAll(
    paginationDto: PaginationDto,
    status?: 'pending' | 'approved' | 'rejected' | 'canceled',
    userId?: number,
  ) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

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
        'event.max_capacity',
        'event.registration_deadline',
        'event.visibility',
        'event.points',
        'event.proposalUrl',
        'club.id',
        'club.name',
      ]);

    if (status) {
      query = query.where('event.status = :status', { status });
    } else {
      // Mặc định chỉ hiển thị các sự kiện đã được duyệt cho danh sách công khai
      query = query.where('event.status = :status', { status: 'approved' });
    }

    const [events, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    let data = events.map((event) => ({ ...event, isRegistered: false }));

    // If user is authenticated, batch-check registration in ONE query (no N+1)
    if (userId && events.length > 0) {
      const eventIds = events.map((e) => e.id);
      const registrations = await this.registrationsRepository.find({
        where: { event: { id: In(eventIds) }, user: { id: userId } },
        relations: ['event'],
      });
      const registeredEventIds = new Set(registrations.map((r) => r.event.id));
      data = events.map((event) => ({
        ...event,
        isRegistered: registeredEventIds.has(event.id),
      }));
    }

    return {
      data,
      total,
      page,
      limit,
    };
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

  async update(id: number, updateEventDto: UpdateEventDto, clubId?: number) {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['club', 'club.owner'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    if (clubId && event.club.id !== clubId) {
      throw new ForbiddenException(
        'Bạn không có quyền chỉnh sửa sự kiện của CLB khác',
      );
    }

    const oldStatus = event.status;
    await this.eventsRepository.update(id, updateEventDto);

    // Notify club owner if admin approved the event
    if (updateEventDto.status === 'approved' && oldStatus !== 'approved') {
      try {
        if (event.club.owner && event.club.owner.email) {
          await this.mailService.sendEventApprovedEmail(
            event.club.owner.email,
            event.name,
          );
        }
      } catch (error) {
        console.error('Failed to send event approval email:', error);
      }
    }

    return { message: 'Updated successfully' };
  }

  async remove(id: number) {
    return await this.eventsRepository.delete(id);
  }
}
