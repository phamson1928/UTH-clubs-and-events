import { Membership } from 'src/memberships/entities/membership.entity';
import { Club } from 'src/clubs/entities/club.entity';
import { Request } from 'src/requests/entities/request.entity';
import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: 'user' | 'admin' | 'club_owner';

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Club, (club) => club.owner)
  clubs: Club[];

  @OneToMany(() => Membership, (membership) => membership.user)
  memberships: Membership[];

  @OneToMany(() => Request, (request) => request.user)
  requests: Request[];

  @OneToMany(() => Club, (club) => club.owner)
  ownedClubs: Club[];
}
