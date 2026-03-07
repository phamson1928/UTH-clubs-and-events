import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Club } from './entities/club.entity';
import { Repository, In } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { EventRegistration } from '../event_registrations/entities/event_registration.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ClubsService {
  constructor(
    @InjectRepository(Club)
    private clubsRepository: Repository<Club>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(EventRegistration)
    private registrationsRepository: Repository<EventRegistration>,
  ) { }

  async create(createClubDto: CreateClubDto) {
    // Verify owner exists
    const owner = await this.usersRepository.findOne({
      where: { id: createClubDto.ownerId },
    });
    if (!owner) {
      throw new NotFoundException(
        `User with ID ${createClubDto.ownerId} not found`,
      );
    }
    owner.role = 'club_owner';
    await this.usersRepository.save(owner);

    const club = this.clubsRepository.create(createClubDto);
    return await this.clubsRepository.save(club);
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 20, search } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.clubsRepository
      .createQueryBuilder('clubs')
      .select([
        'clubs.id',
        'clubs.name',
        'clubs.category',
        'clubs.description',
        'clubs.created_at',
        'clubs.club_image',
      ])
      .orderBy('clubs.created_at', 'DESC')
      .leftJoin('clubs.owner', 'owner')
      .addSelect(['owner.id', 'owner.name'])
      .leftJoinAndSelect('clubs.owner', 'ownerFull')
      // Only count approved memberships
      .loadRelationCountAndMap(
        'clubs.members',
        'clubs.memberships',
        'memberships_count',
        (qb) => qb.where('memberships_count.status = :ms', { ms: 'approved' }),
      )
      .leftJoin('clubs.memberships', 'memberships')
      .leftJoin('memberships.user', 'user')
      .addSelect(['user.id', 'user.name']);

    if (search) {
      query.andWhere(
        '(clubs.name ILIKE :search OR clubs.category ILIKE :search OR clubs.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query.skip(skip).take(limit).getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
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

    // If user is authenticated, check registration status for each event in one batch query
    if (userId && club.events && club.events.length > 0) {
      const eventIds = club.events.map((e) => e.id);
      const registrations = await this.registrationsRepository.find({
        where: { event: { id: In(eventIds) }, user: { id: userId } },
        relations: ['event'],
      });
      const registeredEventIds = new Set(registrations.map((r) => r.event.id));
      return {
        ...club,
        events: club.events.map((event) => ({
          ...event,
          isRegistered: registeredEventIds.has(event.id),
        })),
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
      throw new NotFoundException(`Club with ID ${id} not found`);
    }

    if (updateClubDto.ownerId) {
      // Revert old owner's role back to 'user'
      const oldClub = await this.clubsRepository.findOne({
        where: { id },
        relations: ['owner'],
      });
      if (oldClub?.owner && oldClub.owner.id !== updateClubDto.ownerId) {
        oldClub.owner.role = 'user';
        await this.usersRepository.save(oldClub.owner);
      }

      const newOwner = await this.usersRepository.findOne({
        where: { id: updateClubDto.ownerId },
      });
      if (!newOwner) {
        throw new NotFoundException(
          `User with ID ${updateClubDto.ownerId} not found`,
        );
      }
      newOwner.role = 'club_owner';
      await this.usersRepository.save(newOwner);
    }

    return await this.clubsRepository.save(club);
  }

  async remove(id: number) {
    // 1.4 Find owner before deleting
    const club = await this.clubsRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    const result = await this.clubsRepository.delete(id);

    // 1.4 Revert owner role to 'user' if they no longer own any club
    if (club?.owner) {
      const remainingClubs = await this.clubsRepository.count({
        where: { owner: { id: club.owner.id } },
      });
      if (remainingClubs === 0) {
        club.owner.role = 'user';
        await this.usersRepository.save(club.owner);
      }
    }

    return result;
  }
}
