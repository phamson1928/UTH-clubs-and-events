import { Membership } from '../../memberships/entities/membership.entity';
import { Club } from '../../clubs/entities/club.entity';
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
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password!: string;

  // type: 'enum' adds a DB-level enum constraint (requires migration if column already exists as varchar)
  @Column({
    type: 'enum',
    enum: ['user', 'admin', 'club_owner'],
    default: 'user',
  })
  role!: 'user' | 'admin' | 'club_owner';

  @Column({ nullable: true })
  mssv!: string;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ nullable: true })
  verificationToken!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  resetToken!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpires!: Date | null;

  @OneToMany(() => Membership, (membership) => membership.user)
  memberships!: Membership[];

  @OneToMany(() => Club, (club) => club.owner)
  ownedClubs!: Club[];

  @Column({ default: 0 })
  total_points!: number;
}
