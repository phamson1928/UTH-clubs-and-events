import { Injectable } from '@nestjs/common';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Club } from './entities/club.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { EventRegistration } from '../event_registrations/entities/event_registration.entity';

@Injectable()
export class ClubsService {
  constructor(
    @InjectRepository(Club)
    private clubsRepository: Repository<Club>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(EventRegistration)
    private registrationsRepository: Repository<EventRegistration>,
  ) {}

  async create(createClubDto: CreateClubDto) {
    const club = this.clubsRepository.create(createClubDto);
    return await this.clubsRepository.save(club);
  }

  async findAll() {
    return await this.clubsRepository
      .createQueryBuilder('clubs')
      .select([
        'clubs.id',
        'clubs.name',
        'clubs.category',
        'clubs.created_at',
        'clubs.club_image',
      ])
      .orderBy('clubs.created_at', 'DESC')
      .leftJoin('clubs.owner', 'owner')
      .addSelect(['owner.id', 'owner.name'])
      .loadRelationCountAndMap('clubs.members', 'clubs.memberships')
      .leftJoin('clubs.memberships', 'memberships')
      .leftJoin('memberships.user', 'user')
      .addSelect(['user.id', 'user.name'])
      .getMany();
  }

  async findOne(id: number, userId?: number) {
    const club = await this.clubsRepository
      .createQueryBuilder('clubs')
      .leftJoinAndSelect('clubs.owner', 'owner')
      .leftJoinAndSelect('clubs.memberships', 'memberships')
      .leftJoinAndSelect('memberships.user', 'user')
      .leftJoinAndSelect('clubs.events', 'events')
      .where('clubs.id = :id', { id })
      .getOne();

    if (!club) {
      return null;
    }

    // If user is authenticated, check registration status for each event
    if (userId && club.events) {
      const eventsWithRegistration = await Promise.all(
        club.events.map(async (event) => {
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
      return {
        ...club,
        events: eventsWithRegistration,
      };
    }

    return club;
  }

  async update(id: number, updateClubDto: UpdateClubDto) {
    const club = await this.clubsRepository.preload({
      id: id,
      ...updateClubDto,
    });

    if (!club) {
      throw new Error(`Club with ID ${id} not found`);
    }

    if (updateClubDto.ownerId) {
      const owner = await this.usersRepository.findOne({
        where: { id: updateClubDto.ownerId },
      });
      if (!owner) {
        throw new Error(`Owner with ID ${updateClubDto.ownerId} not found`);
      }
      owner.role = 'club_owner';
      await this.usersRepository.save(owner);
    }

    return await this.clubsRepository.save(club);
  }

  async remove(id: number) {
    return await this.clubsRepository.delete(id);
  }
}
