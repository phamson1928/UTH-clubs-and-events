import { Club } from '../../clubs/entities/club.entity';
import { EventRegistration } from '../../event_registrations/entities/event_registration.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Club, (club) => club.events)
  club!: Club;

  @OneToMany(() => EventRegistration, (reg) => reg.event)
  registrations!: EventRegistration[];

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ default: 'pending' })
  status!: 'pending' | 'approved' | 'rejected' | 'canceled';

  @Column({ nullable: true })
  event_image!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column()
  date!: Date;

  @Column({ default: 0 })
  attending_users_number!: number;

  @Column({ nullable: true, type: 'int' })
  max_capacity!: number | null;

  @Column({ nullable: true, type: 'timestamp' })
  registration_deadline!: Date | null;

  @Column({
    type: 'enum',
    enum: ['public', 'members_only'],
    default: 'public',
  })
  visibility!: 'public' | 'members_only';

  @Column()
  activities!: string;

  @Column()
  location!: string;

  @Column({ default: 0 })
  points!: number;

  @Column({ nullable: true })
  proposalUrl!: string;

  @Column({ nullable: true })
  checkInCode!: string;
}
