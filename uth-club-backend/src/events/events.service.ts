import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Repository, In } from 'typeorm';
import { EventRegistration } from '../event_registrations/entities/event_registration.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Membership } from '../memberships/entities/membership.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(EventRegistration)
    private registrationsRepository: Repository<EventRegistration>,
    @InjectRepository(Membership)
    private membershipRepository: Repository<Membership>,
    private mailService: MailService,
    private notificationsService: NotificationsService,
  ) { }

  async create(createEventDto: CreateEventDto) {
    const event = this.eventsRepository.create(createEventDto);
    const savedEvent = await this.eventsRepository.save(event);
    return savedEvent;
  }

  async findAll(
    paginationDto: PaginationDto,
    status?: 'pending' | 'approved' | 'rejected' | 'canceled' | 'completed',
    userId?: number,
  ) {
    const { page = 1, limit = 20, search } = paginationDto;
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
      query.andWhere('event.status = :status', { status });
    } else {
      // Return both approved and completed by default
      query.andWhere('event.status IN (:...statuses)', {
        statuses: ['approved', 'completed'],
      });
    }

    if (search) {
      query.andWhere(
        '(event.name ILIKE :search OR event.description ILIKE :search OR event.location ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [events, total] = await query
      .orderBy('event.date', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // userId is ONLY used to determine isRegistered status, NOT to filter events by ownership
    let data = events.map((event) => ({ ...event, isRegistered: false }));

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

    return { data, total, page, limit };
  }

  async findAllByClub(clubId: number) {
    return await this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.club', 'club')
      .where('club.id = :clubId', { clubId })
      .andWhere('event.status = :status', { status: 'pending' })
      .getMany();
  }

  async findAllByClubAndStatus(
    clubId: number,
    status?: 'pending' | 'approved' | 'rejected' | 'canceled' | 'completed',
  ) {
    const query = this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.club', 'club')
      .where('club.id = :clubId', { clubId });

    if (status) query.andWhere('event.status = :status', { status });

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

    if (!event) throw new NotFoundException(`Event with ID ${id} not found`);

    if (clubId && event.club.id !== clubId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa sự kiện của CLB khác');
    }

    const oldStatus = event.status;
    await this.eventsRepository.update(id, updateEventDto);

    // ── Event approved ────────────────────────────────────────
    if (updateEventDto.status === 'approved' && oldStatus !== 'approved') {
      // Email to club owner
      try {
        if (event.club.owner?.email) {
          await this.mailService.sendEventApprovedEmail(event.club.owner.email, event.name);
        }
      } catch (error) {
        console.error('Failed to send event approval email:', error);
      }

      // In-app notification to club owner
      if (event.club.owner) {
        this.notificationsService
          .notifyEventApproved(event.club.owner.id, event.name, event.id)
          .catch((e) => console.error('Notification error:', e));
      }

      // Fan-out new_event notification to all approved members of the club
      this.fanOutNewEventToMembers(event.club.id, event.name, event.club.name, event.id);
    }

    // ── Event rejected ────────────────────────────────────────
    if (updateEventDto.status === 'rejected' && oldStatus !== 'rejected') {
      if (event.club.owner) {
        this.notificationsService
          .notifyEventRejected(event.club.owner.id, event.name, event.id)
          .catch((e) => console.error('Notification error:', e));
      }
    }

    return { message: 'Updated successfully' };
  }

  /**
   * Fan-out a new_event notification to all approved club members (excluding owner).
   * Fire-and-forget — errors are swallowed gracefully.
   */
  private async fanOutNewEventToMembers(
    clubId: number,
    eventName: string,
    clubName: string,
    eventId: number,
  ) {
    try {
      const memberships = await this.membershipRepository.find({
        where: { club: { id: clubId }, status: 'approved' },
        relations: ['user', 'club'],
      });
      const memberIds = memberships.map((m) => m.user.id);
      if (memberIds.length > 0) {
        await this.notificationsService.notifyNewEvent(memberIds, eventName, clubName, eventId);
      }
    } catch (e) {
      console.error('Fan-out notification error:', e);
    }
  }

  async remove(id: number) {
    return await this.eventsRepository.delete(id);
  }
}
