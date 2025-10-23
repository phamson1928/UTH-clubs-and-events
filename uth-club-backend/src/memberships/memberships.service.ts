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

  // Đơn xin tham gia club
  async findAllRequests(clubId: number) {
    return await this.membershipRepository
      .createQueryBuilder('membership')
      .leftJoin('membership.user', 'user')
      .addSelect([
        'user.id',
        'user.name',
        'user.email',
        'user.mssv',
        'user.createdAt',
      ])
      .leftJoin('membership.club', 'club')
      .where('membership.status = :status', { status: 'pending' })
      .andWhere('club.id = :clubId', { clubId })
      .getMany();
  }

  // Lấy danh sách thành viên trong club
  async findAllMembers(clubId: number) {
    return await this.membershipRepository
      .createQueryBuilder('membership')
      .leftJoin('membership.user', 'user')
      .addSelect([
        'user.id',
        'user.name',
        'user.email',
        'user.mssv',
        'user.createdAt',
      ])
      .leftJoin('membership.club', 'club')
      .where('club.id = :clubId', { clubId })
      .andWhere('membership.status = :status', { status: 'approved' })
      .getMany();
  }

  // Tạo đơn xin tham gia club
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

  // Cập nhật đơn xin tham gia club
  async updateMembershipRequest(id: number, status: 'approved' | 'rejected') {
    return await this.membershipRepository.update(id, {
      status,
      join_date: status === 'approved' ? new Date() : undefined,
    });
  }

  // Xóa đơn xin tham gia club
  async deleteMembershipRequest(id: number) {
    return await this.membershipRepository.delete(id);
  }

  // Lấy danh sách thành viên trong club
  async getMemberInClub(clubId: number) {
    return await this.membershipRepository
      .createQueryBuilder('membership')
      .leftJoinAndSelect('membership.user', 'user')
      .leftJoin('membership.club', 'club')
      .where('club.id = :clubId', { clubId })
      .getMany();
  }
}
