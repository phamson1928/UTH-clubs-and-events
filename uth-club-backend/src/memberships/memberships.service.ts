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

  async createMembershipRequest(
    createMembershipDto: CreateMembershipDto,
    userId: number,
  ) {
    const membership = this.membershipRepository.create(createMembershipDto);
    membership.user.id = userId;
    return await this.membershipRepository.save(membership);
  }

  async updateMembershipRequest(id: number, status: 'approved' | 'rejected') {
    return await this.membershipRepository.update(id, { status });
  }

  async deleteMembershipRequest(id: number) {
    return await this.membershipRepository.delete(id);
  }
}
