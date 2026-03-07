import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

interface CreateNotificationPayload {
    userId: number;
    title: string;
    body: string;
    type: NotificationType;
    meta?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly notifRepo: Repository<Notification>,
    ) { }

    // ─── Core create ─────────────────────────────────────────────
    async create(payload: CreateNotificationPayload): Promise<Notification> {
        const notif = this.notifRepo.create({
            user: { id: payload.userId },
            title: payload.title,
            body: payload.body,
            type: payload.type,
            meta: payload.meta ?? null,
        });
        return this.notifRepo.save(notif);
    }

    // ─── Bulk create (fan-out to multiple users) ──────────────────
    async createBulk(userIds: number[], payload: Omit<CreateNotificationPayload, 'userId'>): Promise<void> {
        if (!userIds.length) return;
        const entities = userIds.map((uid) =>
            this.notifRepo.create({
                user: { id: uid },
                title: payload.title,
                body: payload.body,
                type: payload.type,
                meta: payload.meta ?? null,
            }),
        );
        await this.notifRepo.save(entities);
    }

    // ─── Query ───────────────────────────────────────────────────
    async getMyNotifications(userId: number, onlyUnread = false) {
        const qb = this.notifRepo
            .createQueryBuilder('n')
            .where('n.userId = :userId', { userId })
            .orderBy('n.createdAt', 'DESC')
            .take(50);

        if (onlyUnread) qb.andWhere('n.isRead = false');

        const [notifications, total] = await qb.getManyAndCount();
        const unreadCount = onlyUnread
            ? total
            : await this.notifRepo.count({ where: { user: { id: userId }, isRead: false } });

        return { notifications, unreadCount };
    }

    // ─── Mark read ───────────────────────────────────────────────
    async markRead(userId: number, ids: number[]) {
        if (!ids.length) return { updated: 0 };
        const result = await this.notifRepo
            .createQueryBuilder()
            .update(Notification)
            .set({ isRead: true })
            .where('id IN (:...ids)', { ids })
            .andWhere('userId = :userId', { userId }) // security: own notifications only
            .execute();
        return { updated: result.affected ?? 0 };
    }

    async markAllRead(userId: number) {
        const result = await this.notifRepo.update(
            { user: { id: userId }, isRead: false },
            { isRead: true },
        );
        return { updated: result.affected ?? 0 };
    }

    async deleteNotification(userId: number, id: number) {
        await this.notifRepo.delete({ id, user: { id: userId } });
        return { message: 'Đã xóa thông báo' };
    }

    async clearAll(userId: number) {
        await this.notifRepo.delete({ user: { id: userId } });
        return { message: 'Đã xóa tất cả thông báo' };
    }

    // ─── Trigger helpers (called by other services) ───────────────

    async notifyMembershipApproved(userId: number, clubName: string, clubId: number) {
        return this.create({
            userId,
            title: `Đơn gia nhập CLB "${clubName}" được duyệt! 🎉`,
            body: `Chúc mừng! Bạn đã trở thành thành viên chính thức của CLB ${clubName}.`,
            type: 'membership_approved',
            meta: { clubId },
        });
    }

    async notifyMembershipRejected(userId: number, clubName: string, clubId: number) {
        return this.create({
            userId,
            title: `Đơn gia nhập CLB "${clubName}" bị từ chối`,
            body: `Rất tiếc, đơn đăng ký của bạn vào CLB ${clubName} không được chấp thuận lần này.`,
            type: 'membership_rejected',
            meta: { clubId },
        });
    }

    async notifyEventApproved(ownerId: number, eventName: string, eventId: number) {
        return this.create({
            userId: ownerId,
            title: `Sự kiện "${eventName}" đã được duyệt! ✅`,
            body: `Sự kiện của bạn đã được Admin phê duyệt và sẽ hiển thị công khai trên hệ thống.`,
            type: 'event_approved',
            meta: { eventId },
        });
    }

    async notifyEventRejected(ownerId: number, eventName: string, eventId: number) {
        return this.create({
            userId: ownerId,
            title: `Sự kiện "${eventName}" bị từ chối`,
            body: `Admin đã từ chối phê duyệt sự kiện của bạn. Vui lòng chỉnh sửa và gửi lại.`,
            type: 'event_rejected',
            meta: { eventId },
        });
    }

    async notifyNewEvent(memberUserIds: number[], eventName: string, clubName: string, eventId: number) {
        return this.createBulk(memberUserIds, {
            title: `CLB ${clubName} có sự kiện mới: "${eventName}" 📅`,
            body: `Đừng bỏ lỡ! Đăng ký tham gia ngay để nhận điểm rèn luyện.`,
            type: 'new_event',
            meta: { eventId },
        });
    }

    async notifyCheckInSuccess(userId: number, eventName: string, points: number, eventId: number) {
        return this.create({
            userId,
            title: `Điểm danh thành công: "${eventName}" ✅`,
            body: `Bạn đã điểm danh thành công và nhận được ${points} điểm rèn luyện!`,
            type: 'checkin_success',
            meta: { eventId, points },
        });
    }

    async notifyNewMembershipRequest(clubOwnerId: number, applicantName: string, clubName: string, membershipId: number) {
        return this.create({
            userId: clubOwnerId,
            title: `${applicantName} muốn gia nhập CLB "${clubName}" 📨`,
            body: `Bạn có đơn xin gia nhập mới. Vào trang quản lý để duyệt hoặc từ chối.`,
            type: 'new_membership_request',
            meta: { membershipId },
        });
    }
}
