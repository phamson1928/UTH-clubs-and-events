import { Injectable } from '@nestjs/common';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Membership } from './entities/membership.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private membershipRepository: Repository<Membership>,
  ) {}

  async create(createMembershipDto: CreateMembershipDto) {
    const membership = this.membershipRepository.create(createMembershipDto);
    return this.membershipRepository.save(membership);
  }

  async findAll() {
    return this.membershipRepository.find();
  }

  async findOne(id: number) {
    return this.membershipRepository.findOne({ where: { id } });
  }

  async update(id: number, updateMembershipDto: UpdateMembershipDto) {
    return this.membershipRepository.update(id, updateMembershipDto);
  }

  async remove(id: number) {
    return this.membershipRepository.delete(id);
  }
}
