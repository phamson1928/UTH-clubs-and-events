import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Membership } from '../../memberships/entities/membership.entity';
import { Event } from '../../events/entities/event.entity';

@Entity()
export class Club {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, (user) => user.ownedClubs)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: number;

  @Column()
  category: string;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  club_image: string;

  @OneToMany(() => Membership, (membership) => membership.club)
  memberships: Membership[];

  @OneToMany(() => Event, (event) => event.club)
  events: Event[];
}
