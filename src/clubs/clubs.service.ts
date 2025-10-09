import { Injectable } from '@nestjs/common';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Club } from './entities/club.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClubsService {
  constructor(
    @InjectRepository(Club)
    private clubsRepository: Repository<Club>,
  ) {}

  async create(createClubDto: CreateClubDto) {
    const club = this.clubsRepository.create(createClubDto);
    return this.clubsRepository.save(club);
  }

  async findAll() {
    return this.clubsRepository
      .createQueryBuilder('clubs')
      .leftJoinAndSelect('clubs.owner', 'owner')
      .loadRelationCountAndMap('clubs.eventsCount', 'clubs.events')
      .loadRelationCountAndMap('clubs.membershipCount', 'clubs.memberships')
      .getMany();
  }

  async findOne(id: number) {
    return this.clubsRepository
      .createQueryBuilder('clubs')
      .leftJoinAndSelect('clubs.owner', 'owner')
      .leftJoinAndSelect('clubs.memberships', 'memberships')
      .leftJoinAndSelect('clubs.events', 'events')
      .where('clubs.id = :id', { id })
      .getOne();
  }

  async update(id: number, updateClubDto: UpdateClubDto) {
    await this.clubsRepository.update(id, updateClubDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    return this.clubsRepository.delete(id);
  }
}
