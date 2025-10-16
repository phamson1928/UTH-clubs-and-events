import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto) {
    const event = this.eventsRepository.create(createEventDto);
    const savedEvent = await this.eventsRepository.save(event);

    return savedEvent;
  }

  async findAll(status?: 'pending' | 'approved' | 'rejected' | 'canceled') {
    if (status) {
      return await this.eventsRepository
        .createQueryBuilder('event')
        .leftJoinAndSelect('event.club', 'club')
        .select([
          'event.id',
          'event.name',
          'event.description',
          'event.date',
          'event.time',
          'event.location',
          'event.status',
          'club.id',
          'club.name',
        ])
        .where('event.status = :status', { status })
        .getMany();
    }
    return await this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.club', 'club')
      .select([
        'event.id',
        'event.name',
        'event.description',
        'event.date',
        'event.time',
        'event.location',
        'event.status',
        'club.id',
        'club.name',
      ])
      .getMany();
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
