import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../events/entities/event.entity';
import { EventRegistration } from './entities/event_registration.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { User } from '../users/entities/user.entity';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { Workbook } from 'exceljs';
import type { Response } from 'express';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class EventRegistrationsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(EventRegistration)
    private readonly registrationsRepository: Repository<EventRegistration>,
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) { }

  // ─────────────────────────────────────────────────
  // Registration
  // ─────────────────────────────────────────────────

  async registerUserForEvent(eventId: number, userId: number) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
      relations: ['club'],
    });
    if (!event) throw new NotFoundException('Event not found');

    if (event.status === 'completed' || event.date <= new Date())
      throw new BadRequestException('Sự kiện đã diễn ra hoặc đã kết thúc');

    if (event.status === 'canceled' || event.status === 'rejected')
      throw new BadRequestException('Sự kiện không khả dụng để đăng ký');

    if (event.registration_deadline && event.registration_deadline <= new Date())
      throw new BadRequestException('Đã hết hạn đăng ký sự kiện');

    if (
      event.max_capacity !== null &&
      event.max_capacity !== undefined &&
      event.attending_users_number >= event.max_capacity
    )
      throw new BadRequestException('Sự kiện đã đủ chỗ');

    if (event.visibility === 'members_only') {
      const membership = await this.membershipRepository.findOne({
        where: {
          user: { id: userId },
          club: { id: event.club.id },
          status: 'approved',
        },
        relations: ['user', 'club'],
      });
      if (!membership)
        throw new ForbiddenException('Sự kiện này chỉ dành cho thành viên của CLB');
    }

    const existed = await this.registrationsRepository.findOne({
      where: { event: { id: eventId }, user: { id: userId } },
      relations: ['event', 'user'],
    });
    if (existed) throw new ConflictException('Bạn đã đăng ký tham gia event này rồi');

    const registration = this.registrationsRepository.create({
      event: { id: eventId } as Event,
      user: { id: userId },
    });

    try {
      await this.registrationsRepository.save(registration);
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      const isUniqueViolation =
        e.code === '23505' || e.message?.includes('duplicate') === true;
      if (isUniqueViolation)
        throw new ConflictException('Bạn đã đăng ký tham gia event này rồi');
      throw err;
    }

    await this.eventsRepository.increment({ id: eventId }, 'attending_users_number', 1);

    return { message: 'Đăng ký thành công' };
  }

  async cancelRegistration(eventId: number, userId: number) {
    const registration = await this.registrationsRepository.findOne({
      where: { event: { id: eventId }, user: { id: userId } },
      relations: ['event', 'user'],
    });
    if (!registration) throw new NotFoundException('Bạn chưa đăng ký tham gia event này');

    if (registration.event.status === 'completed' || registration.event.date <= new Date()) {
      throw new BadRequestException('Không thể hủy đăng ký sự kiện đã diễn ra hoặc đã kết thúc');
    }

    if (registration.event.status === 'canceled') {
      throw new BadRequestException('Sự kiện này đã bị hủy');
    }

    await this.registrationsRepository.delete(registration.id);
    await this.eventsRepository
      .createQueryBuilder()
      .update(Event)
      .set({ attending_users_number: () => 'GREATEST(attending_users_number - 1, 0)' })
      .where('id = :id', { id: eventId })
      .execute();

    return { message: 'Hủy đăng ký thành công' };
  }

  async getMyEvents(userId: number) {
    const registrations = await this.registrationsRepository
      .createQueryBuilder('reg')
      .leftJoinAndSelect('reg.event', 'event')
      .leftJoinAndSelect('event.club', 'club')
      .where('reg.userId = :userId', { userId })
      .orderBy('event.date', 'DESC')
      .getMany();

    return registrations.map((r) => ({
      eventId: r.event.id,
      eventName: r.event.name,
      clubName: r.event.club?.name ?? null,
      date: r.event.date,
      location: r.event.location,
      status: r.event.status,
      points: r.event.points,
      attended: r.attended,
      attendedAt: r.attendedAt,
      registeredAt: r.created_at,
    }));
  }

  async getEventParticipants(eventId: number, user: { id: number; role: string }) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
      relations: ['club'],
    });
    if (!event) throw new NotFoundException('Event not found');

    if (user.role !== 'admin' && event.club?.ownerId !== user.id)
      throw new ForbiddenException('Bạn không có quyền xem danh sách này');

    const registrations = await this.registrationsRepository.find({
      where: { event: { id: eventId } },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });

    return {
      event: {
        id: event.id,
        name: event.name,
        status: event.status,
        date: event.date,
        activities: event.activities,
        location: event.location,
        points: event.points,
        checkInCode: event.checkInCode,
        attending_users_number: event.attending_users_number,
      },
      participants: registrations.map((r) => ({
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
        mssv: r.user.mssv,
        attended: r.attended,
        attendedAt: r.attendedAt,
        registered_at: r.created_at,
      })),
    };
  }

  // ─────────────────────────────────────────────────
  // QR Check-in
  // ─────────────────────────────────────────────────

  /**
   * Generate a fresh check-in code for an event and return a QR image (base64).
   * Only the club owner or admin can call this.
   */
  async generateQrCode(eventId: number, user: { id: number; role: string }) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
      relations: ['club'],
    });
    if (!event) throw new NotFoundException('Event not found');
    if (event.status !== 'approved')
      throw new BadRequestException('Sự kiện chưa được duyệt');
    if (user.role !== 'admin' && event.club?.ownerId !== user.id)
      throw new ForbiddenException('Bạn không có quyền tạo QR cho sự kiện này');

    // Generate a unique, hard-to-guess code
    const code = `UTH-${eventId}-${uuidv4().split('-')[0].toUpperCase()}`;
    await this.eventsRepository.update(eventId, { checkInCode: code });

    // Build QR data payload
    const payload = JSON.stringify({ eventId, code });
    const qrDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
    });

    return {
      eventId,
      code,
      qrImage: qrDataUrl, // base64 PNG — frontend renders <img src={qrImage} />
    };
  }

  /**
   * Student submits a check-in code (scanned from QR or typed manually).
   * Marks the registration as attended and awards activity points.
   */
  async checkIn(eventId: number, code: string, userId: number) {
    const event = await this.eventsRepository.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    if (!event.checkInCode || event.checkInCode !== code)
      throw new BadRequestException('Mã check-in không hợp lệ');

    const registration = await this.registrationsRepository.findOne({
      where: { event: { id: eventId }, user: { id: userId } },
      relations: ['user'],
    });
    if (!registration)
      throw new NotFoundException('Bạn chưa đăng ký sự kiện này');
    if (registration.attended)
      return { message: 'Bạn đã điểm danh sự  kiện này rồi', alreadyAttended: true };

    // Mark attendance
    registration.attended = true;
    registration.attendedAt = new Date();
    await this.registrationsRepository.save(registration);

    // Award activity points to user
    if (event.points > 0) {
      await this.usersRepository.increment({ id: userId }, 'total_points', event.points);
    }

    // In-app notification
    this.notificationsService
      .notifyCheckInSuccess(userId, event.name, event.points, event.id)
      .catch((e) => console.error('Notification error:', e));

    return {
      message: `Điểm danh thành công! Bạn nhận được ${event.points} điểm rèn luyện.`,
      pointsEarned: event.points,
      attendedAt: registration.attendedAt,
    };
  }

  // ─────────────────────────────────────────────────
  // Excel Export
  // ─────────────────────────────────────────────────

  /**
   * Export attendance list for a specific event as Excel.
   */
  async exportAttendanceExcel(
    eventId: number,
    user: { id: number; role: string },
    res: Response,
  ) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
      relations: ['club'],
    });
    if (!event) throw new NotFoundException('Event not found');
    if (user.role !== 'admin' && event.club?.ownerId !== user.id)
      throw new ForbiddenException('Bạn không có quyền xuất dữ liệu này');

    const registrations = await this.registrationsRepository.find({
      where: { event: { id: eventId } },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });

    const workbook = new Workbook();
    workbook.creator = 'UTH Clubs System';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Danh sách điểm danh');

    // Header row styling
    sheet.columns = [
      { header: 'STT', key: 'stt', width: 6 },
      { header: 'MSSV', key: 'mssv', width: 14 },
      { header: 'Họ và tên', key: 'name', width: 28 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Ngày đăng ký', key: 'registeredAt', width: 20 },
      { header: 'Đã điểm danh', key: 'attended', width: 14 },
      { header: 'Thời điểm điểm danh', key: 'attendedAt', width: 22 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1565C0' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 20;

    registrations.forEach((r, idx) => {
      const row = sheet.addRow({
        stt: idx + 1,
        mssv: r.user.mssv ?? '',
        name: r.user.name,
        email: r.user.email,
        registeredAt: r.created_at ? new Date(r.created_at).toLocaleString('vi-VN') : '',
        attended: r.attended ? 'Có' : 'Không',
        attendedAt: r.attendedAt ? new Date(r.attendedAt).toLocaleString('vi-VN') : '',
      });
      if (r.attended) {
        row.getCell('attended').font = { color: { argb: 'FF2E7D32' }, bold: true };
      } else {
        row.getCell('attended').font = { color: { argb: 'FFC62828' } };
      }
      // Alternate row shading
      if (idx % 2 === 1) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
      }
    });

    // Summary rows
    const total = registrations.length;
    const attended = registrations.filter((r) => r.attended).length;
    sheet.addRow([]);
    const summaryRow = sheet.addRow([
      '',
      '',
      `Tổng đăng ký: ${total} | Đã điểm danh: ${attended} | Vắng: ${total - attended}`,
    ]);
    summaryRow.font = { bold: true, italic: true };

    const filename = `diemdanh_event_${eventId}_${Date.now()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Export members of a club as Excel.
   */
  async exportClubMembersExcel(
    clubId: number,
    user: { id: number; role: string; clubId: number },
    res: Response,
  ) {
    if (user.role !== 'admin' && user.clubId !== clubId)
      throw new ForbiddenException('Bạn không có quyền xuất dữ liệu này');

    const members = await this.membershipRepository.find({
      where: { club: { id: clubId }, status: 'approved' },
      relations: ['user'],
      order: { join_date: 'ASC' },
    });

    const workbook = new Workbook();
    workbook.creator = 'UTH Clubs System';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Danh sách thành viên');

    sheet.columns = [
      { header: 'STT', key: 'stt', width: 6 },
      { header: 'MSSV', key: 'mssv', width: 14 },
      { header: 'Họ và tên', key: 'name', width: 28 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Vai trò CLB', key: 'club_role', width: 16 },
      { header: 'Ngày tham gia', key: 'joinDate', width: 18 },
      { header: 'Điểm rèn luyện', key: 'total_points', width: 16 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B5E20' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 20;

    members.forEach((m, idx) => {
      const row = sheet.addRow({
        stt: idx + 1,
        mssv: m.user.mssv ?? '',
        name: m.user.name,
        email: m.user.email,
        club_role: m.club_role,
        joinDate: m.join_date ? new Date(m.join_date).toLocaleDateString('vi-VN') : '',
        total_points: m.user.total_points,
      });
      if (idx % 2 === 1) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F8E9' } };
      }
    });

    const filename = `thanhvien_club_${clubId}_${Date.now()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  }
}
