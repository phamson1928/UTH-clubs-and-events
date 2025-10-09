import { Club } from 'src/clubs/entities/club.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Membership {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Club, (club) => club.memberships)
  club: Club;

  @ManyToOne(() => User, (user) => user.memberships)
  user: User;

  @Column({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';
}
