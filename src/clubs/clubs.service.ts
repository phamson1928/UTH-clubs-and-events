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
    return await this.clubsRepository.save(club);
  }

  async findAll() {
    return await this.clubsRepository
      .createQueryBuilder('clubs')
      .orderBy('clubs.created_at', 'DESC')
      .leftJoinAndSelect('clubs.owner', 'owner')
      .loadRelationCountAndMap('clubs.eventsCount', 'clubs.events')
      .loadRelationCountAndMap('clubs.membershipCount', 'clubs.memberships')
      .getMany();
  }

  async findOne(id: number) {
    return await this.clubsRepository
      .createQueryBuilder('clubs')
      .leftJoinAndSelect('clubs.owner', 'owner')
      .leftJoinAndSelect('clubs.memberships', 'memberships')
      .leftJoinAndSelect('clubs.events', 'events')
      .where('clubs.id = :id', { id })
      .getOne();
  }

  async update(id: number, updateClubDto: UpdateClubDto) {
    return await this.clubsRepository.update(id, updateClubDto);
  }

  async remove(id: number) {
    return await this.clubsRepository.delete(id);
  }
}
