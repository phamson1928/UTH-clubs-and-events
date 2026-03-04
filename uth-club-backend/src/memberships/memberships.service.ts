import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Membership } from './entities/membership.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Club } from '../clubs/entities/club.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private membershipRepository: Repository<Membership>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailService: MailService,
  ) { }

  // Lấy đơn xin tham gia club
  async findAllRequests(clubId: number, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.membershipRepository
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
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
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

  // Lấy những user chưa là thành viên của club nào (approved)
  async findUsersWithoutClub() {
    const approvedUserIds = await this.membershipRepository
      .createQueryBuilder('membership')
      .select('DISTINCT membership.userId', 'userId')
      .where('membership.status = :status', { status: 'approved' })
      .getRawMany();

    const ids = approvedUserIds.map((r: { userId: string | number }) =>
      Number(r.userId),
    );

    if (ids.length === 0) {
      return this.userRepository.find({
        where: { role: 'user' },
        select: ['id', 'name', 'email', 'mssv'],
      });
    }

    const { In, Not } = await import('typeorm');
    return this.userRepository.find({
      where: { role: 'user', id: Not(In(ids)) },
      select: ['id', 'name', 'email', 'mssv'],
    });
  }

  // Thêm user vào club
  async addUserToClub(userId: number, clubId: number) {
    return await this.membershipRepository.save({
      user: { id: userId } as unknown as User,
      club: { id: clubId } as unknown as Club,
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
    // 1.3 Kiểm tra user chưa có membership (bất kỳ status) trong club này
    const existingAny = await this.membershipRepository.findOne({
      where: {
        user: { id: userId },
        club: { id: clubId },
      },
      relations: ['user', 'club'],
    });
    if (existingAny) {
      throw new ConflictException(
        'Bạn đã có đơn hoặc đã là thành viên của club này',
      );
    }

    // 1.3 Giới hạn tối đa 3 club (approved + pending)
    const activeCount = await this.membershipRepository.count({
      where: [
        { user: { id: userId }, status: 'approved' },
        { user: { id: userId }, status: 'pending' },
      ],
    });
    if (activeCount >= 3) {
      throw new BadRequestException(
        'Bạn đã tham gia hoặc đang chờ duyệt tối đa 3 club',
      );
    }

    const membership = this.membershipRepository.create({
      join_reason: createMembershipDto.join_reason,
      skills: createMembershipDto.skills,
      promise: createMembershipDto.promise,
      user: { id: userId } as unknown as User,
      club: { id: clubId } as unknown as Club,
    });
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
    const membership = await this.membershipRepository.findOne({
      where: { id },
      relations: ['user', 'club'],
    });

    if (!membership) {
      throw new NotFoundException(`Membership with ID ${id} not found`);
    }

    await this.membershipRepository.update(id, {
      status,
      // null when rejected to avoid setting a value on nullable column
      join_date: status === 'approved' ? new Date() : null,
    });

    // Send email notification
    try {
      if (status === 'approved') {
        await this.mailService.sendMembershipApprovedEmail(
          membership.user.email,
          membership.club.name,
        );
      } else {
        await this.mailService.sendMembershipRejectedEmail(
          membership.user.email,
          membership.club.name,
        );
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      // Don't throw exception, just log it. The request update is already done.
    }

    return { message: `Request ${status} successfully` };
  }

  // Xóa đơn xin tham gia club
  async deleteMembershipRequest(id: number) {
    return await this.membershipRepository.delete(id);
  }

  // Lấy danh sách thành viên trong club (chỉ approved)
  async getMemberInClub(clubId: number) {
    return await this.membershipRepository
      .createQueryBuilder('membership')
      .leftJoinAndSelect('membership.user', 'user')
      .leftJoin('membership.club', 'club')
      .where('club.id = :clubId', { clubId })
      .andWhere('membership.status = :status', { status: 'approved' })
      .getMany();
  }

  // Xóa thành viên khỏi club
  async removeMemberFromClub(membershipId: number) {
    return await this.membershipRepository.delete(membershipId);
  }

  // 1.3 Student tự rời club
  async leaveClub(userId: number, clubId: number) {
    const membership = await this.membershipRepository.findOne({
      where: {
        user: { id: userId },
        club: { id: clubId },
        status: 'approved',
      },
      relations: ['user', 'club'],
    });
    if (!membership) {
      throw new NotFoundException('Bạn không phải thành viên của club này');
    }
    await this.membershipRepository.delete(membership.id);
    return { message: 'Rời club thành công' };
  }

  // 2.2 Lấy tất cả club của user hiện tại (mọi status)
  async getMyClubs(userId: number) {
    const memberships = await this.membershipRepository
      .createQueryBuilder('membership')
      .leftJoinAndSelect('membership.club', 'club')
      .where('membership.userId = :userId', { userId })
      .orderBy('membership.request_date', 'DESC')
      .getMany();

    return memberships.map((m) => ({
      clubId: m.club.id,
      clubName: m.club.name,
      clubImage: m.club.club_image ?? null,
      membershipStatus: m.status,
      requestDate: m.request_date,
      joinDate: m.join_date ?? null,
    }));
  }

  // Admin: lấy tất cả pending memberships across all clubs
  async findAllPendingForAdmin(): Promise<Membership[]> {
    return await this.membershipRepository
      .createQueryBuilder('membership')
      .leftJoin('membership.user', 'user')
      .leftJoin('membership.club', 'club')
      .addSelect([
        'user.id',
        'user.name',
        'user.email',
        'user.mssv',
        'club.id',
        'club.name',
        'membership.join_reason',
        'membership.skills',
        'membership.request_date',
        'membership.promise',
      ])
      .where('membership.status = :status', { status: 'pending' })
      .orderBy('membership.request_date', 'DESC')
      .getMany();
  }
}
