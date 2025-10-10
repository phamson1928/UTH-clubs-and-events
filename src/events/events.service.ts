import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Repository } from 'typeorm';
import { Request } from 'src/requests/entities/request.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(Request)
    private requestsRepository: Repository<Request>,
  ) {}

  async create(createEventDto: CreateEventDto) {
    const event = this.eventsRepository.create(createEventDto);
    const request = this.requestsRepository.create({
      type: 'create',
      request_status: 'pending',
    });
    const savedEvent = await this.eventsRepository.save(event);
    const savedRequest = await this.requestsRepository.save(request);

    return { savedEvent, savedRequest };
  }

  async findAll() {
    return this.eventsRepository.find({ relations: ['club'] });
  }

  async findOne(id: number) {
    return this.eventsRepository.findOne({
      where: { id },
      relations: ['club'],
    });
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    return this.eventsRepository.update(id, updateEventDto);
  }

  async remove(id: number) {
    return this.eventsRepository.delete(id);
  }
}
