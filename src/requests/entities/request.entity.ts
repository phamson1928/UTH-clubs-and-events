import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Event } from 'src/events/entities/event.entity';
import { Club } from 'src/clubs/entities/club.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Request {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: 'create' | 'join'; // join = user gửi request join club

  @ManyToOne(() => User, { nullable: true })
  user: User; // chỉ dùng khi request do user gửi

  @ManyToOne(() => Club, (club) => club.requests, { nullable: true })
  club: Club; // club liên quan (cả request user hay club gửi)

  @ManyToOne(() => Event, (event) => event.requests, { nullable: true })
  event: Event; // nếu request liên quan event

  @Column()
  reason: string;

  @Column()
  experiance: string;

  @Column()
  apply_date: Date;

  @Column({ default: 'pending' })
  request_status: 'pending' | 'approved' | 'rejected';
}
