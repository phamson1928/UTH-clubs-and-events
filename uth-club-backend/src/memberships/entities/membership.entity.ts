import { Club } from '../../clubs/entities/club.entity';
import { User } from '../../users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Membership {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  join_reason!: string;

  @Column()
  skills!: string;

  @CreateDateColumn()
  request_date!: Date;

  @Column({ type: 'timestamp', nullable: true })
  join_date!: Date | null;

  @Column()
  promise!: string;

  @ManyToOne(() => Club, (club) => club.memberships)
  club!: Club;

  @ManyToOne(() => User, (user) => user.memberships)
  user!: User;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status!: 'pending' | 'approved' | 'rejected';

  @Column({
    type: 'enum',
    enum: ['member', 'vice_president', 'secretary', 'treasurer', 'other'],
    default: 'member',
  })
  club_role!: 'member' | 'vice_president' | 'secretary' | 'treasurer' | 'other';
}
