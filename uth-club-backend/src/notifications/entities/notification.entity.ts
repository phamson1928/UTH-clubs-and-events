import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type NotificationType =
    | 'membership_approved'   // Đơn gia nhập CLB được duyệt
    | 'membership_rejected'   // Đơn gia nhập CLB bị từ chối
    | 'event_approved'        // Sự kiện được duyệt
    | 'event_rejected'        // Sự kiện bị từ chối
    | 'new_event'             // CLB đăng sự kiện mới
    | 'event_reminder'        // Nhắc lịch sự kiện (24h trước)
    | 'checkin_success'       // Điểm danh thành công
    | 'points_awarded'        // Nhận điểm rèn luyện
    | 'new_membership_request'; // Club Owner có đơn xin gia nhập mới

@Entity('notification')
@Index(['user', 'isRead'])
@Index(['user', 'createdAt'])
export class Notification {
    @PrimaryGeneratedColumn()
    id!: number;

    // Recipient
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user!: User;

    @Column()
    title!: string;

    @Column({ type: 'text' })
    body!: string;

    @Column({
        type: 'enum',
        enum: [
            'membership_approved',
            'membership_rejected',
            'event_approved',
            'event_rejected',
            'new_event',
            'event_reminder',
            'checkin_success',
            'points_awarded',
            'new_membership_request',
        ],
    })
    type!: NotificationType;

    // Optional: deep-link metadata (e.g. {eventId: 5} or {clubId: 2})
    @Column({ type: 'jsonb', nullable: true })
    meta!: Record<string, unknown> | null;

    @Column({ default: false })
    isRead!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
}
