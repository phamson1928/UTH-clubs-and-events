import { Injectable } from '@nestjs/common';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Membership } from './entities/membership.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Club } from 'src/clubs/entities/club.entity';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private membershipRepository: Repository<Membership>,
  ) {}

  // Lấy đơn xin tham gia club
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
        'membership.join_reason',
        'membership.skills',
        'membership.request_date',
        'membership.join_date',
        'membership.promise',
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
        'membership.join_date',
        'membership.join_reason',
        'membership.skills',
        'membership.promise',
      ])
      .leftJoin('membership.club', 'club')
      .where('club.id = :clubId', { clubId })
      .andWhere('membership.status = :status', { status: 'approved' })
      .getMany();
  }

  // Lấy danh sách những người chưa có trong club nào
  async findUsersWithoutClub() {
    return await this.membershipRepository
      .createQueryBuilder('membership')
      .leftJoin('membership.user', 'user')
      .leftJoin('membership.club', 'club')
      .where('club.id IS NULL')
      .getMany();
  }

  // Thêm user vào club
  async addUserToClub(userId: number, clubId: number) {
    return await this.membershipRepository.save({
      userId,
      clubId,
      status: 'approved',
      join_date: new Date(),
    });
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

  // Club owner thêm thành viên trực tiếp (approved)
  async addApprovedMember(userId: number, clubId: number) {
    const membership = new Membership();
    membership.join_reason = '';
    membership.skills = '';
    membership.promise = '';
    membership.status = 'approved';
    membership.join_date = new Date();
    membership.user = { id: userId } as unknown as User;
    membership.club = { id: clubId } as unknown as Club;
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

  // Xóa thành viên khỏi club
  async removeMemberFromClub(membershipId: number) {
    return await this.membershipRepository.delete(membershipId);
  }
}
