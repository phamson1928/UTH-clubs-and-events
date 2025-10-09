import { Club } from 'src/clubs/entities/club.entity';
import { Request } from 'src/requests/entities/request.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Club, (club) => club.events)
  club: Club;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected' | 'canceled';

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  date: Date;

  @OneToMany(() => Request, (request) => request.event)
  requests: Request[];
}
