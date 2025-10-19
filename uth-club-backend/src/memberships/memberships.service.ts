import { Injectable } from '@nestjs/common';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Membership } from './entities/membership.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private membershipRepository: Repository<Membership>,
  ) {}

  async findAllRequests(clubId: number) {
    return await this.membershipRepository
      .createQueryBuilder('membership')
      .leftJoin('membership.user', 'user')
      .addSelect(['user.id', 'user.name', 'user.email', 'user.mssv'])
      .leftJoin('membership.club', 'club')
      .where('membership.status = :status', { status: 'pending' })
      .andWhere('club.id = :clubId', { clubId })
      .getMany();
  }

  async createMembershipRequest(
    createMembershipDto: CreateMembershipDto,
    userId: number,
    clubId: number,
  ) {
    const membership = this.membershipRepository.create(createMembershipDto);
    membership.user.id = userId;
    membership.club.id = clubId;
    return await this.membershipRepository.save(membership);
  }

  async updateMembershipRequest(id: number, status: 'approved' | 'rejected') {
    return await this.membershipRepository.update(id, {
      status,
      join_date: status === 'approved' ? new Date() : undefined,
    });
  }

  async deleteMembershipRequest(id: number) {
    return await this.membershipRepository.delete(id);
  }
  //chưa hoàn thiện
  async getMemberInClub(clubId: number) {
    return await this.membershipRepository
      .createQueryBuilder('membership')
      .leftJoinAndSelect('membership.user', 'user')
      .leftJoin('membership.club', 'club')
      .where('club.id = :clubId', { clubId })
      .getMany();
  }
}
