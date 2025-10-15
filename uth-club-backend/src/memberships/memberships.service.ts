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

  async findAllRequests() {
    return await this.membershipRepository
      .createQueryBuilder('membership')
      .leftJoinAndSelect('membership.user', 'user')
      .leftJoinAndSelect('membership.club', 'club')
      .select([
        'membership.id',
        'user.id',
        'user.name',
        'club.id',
        'club.name',
        'membership.join_reason',
        'membership.skills',
        'membership.request_date',
        'membership.promise',
        'membership.status',
      ])
      .where('membership.status = :status', { status: 'pending' })
      .getMany();
  }

  async createMembershipRequest(
    createMembershipDto: CreateMembershipDto,
    userId: number,
  ) {
    const membership = this.membershipRepository.create(createMembershipDto);
    membership.user.id = userId;
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
}
