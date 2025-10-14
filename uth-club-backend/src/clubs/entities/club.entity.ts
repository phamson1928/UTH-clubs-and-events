import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Membership } from 'src/memberships/entities/membership.entity';
import { Event } from 'src/events/entities/event.entity';

@Entity()
export class Club {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, (user) => user.ownedClubs)
  owner: User;

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
