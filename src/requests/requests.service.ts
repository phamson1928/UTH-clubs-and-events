import { Injectable } from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from './entities/request.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private requestsRepository: Repository<Request>,
  ) {}

  async create(createRequestDto: CreateRequestDto) {
    const request = this.requestsRepository.create(createRequestDto);
    return this.requestsRepository.save(request);
  }

  async findAllApplications() {
    return this.requestsRepository.find({ where: { type: 'join' } });
  }

  async findAllEventRequests() {
    return this.requestsRepository.find({ where: { type: 'create' } });
  }

  async findOne(id: number) {
    return this.requestsRepository.findOne({ where: { id } });
  }

  async update(id: number, updateRequestDto: UpdateRequestDto) {
    return this.requestsRepository.update(id, updateRequestDto);
  }

  async remove(id: number) {
    return this.requestsRepository.delete(id);
  }
}
