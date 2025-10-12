import { Club } from 'src/clubs/entities/club.entity';
import { User } from 'src/users/entities/user.entity';
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
  id: number;

  @Column()
  join_reason: string;

  @Column()
  skills: string;

  @CreateDateColumn()
  request_date: Date;

  @Column()
  join_date: Date;

  @Column()
  promise: string;

  @ManyToOne(() => Club, (club) => club.memberships)
  club: Club;

  @ManyToOne(() => User, (user) => user.memberships)
  user: User;

  @Column({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';
}
