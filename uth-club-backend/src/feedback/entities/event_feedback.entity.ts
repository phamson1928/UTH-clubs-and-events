import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    Unique,
    Check,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

@Entity('event_feedback')
@Unique(['event', 'user']) // 1 feedback per user per event
export class EventFeedback {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Event, { onDelete: 'CASCADE' })
    event!: Event;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user!: User;

    // Star rating 1–5
    @Column({ type: 'smallint' })
    @Check('"rating" BETWEEN 1 AND 5')
    rating!: number;

    // Optional comment
    @Column({ type: 'text', nullable: true })
    comment!: string | null;

    @CreateDateColumn()
    createdAt!: Date;
}
