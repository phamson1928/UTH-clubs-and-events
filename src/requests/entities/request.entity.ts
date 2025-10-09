import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Event } from 'src/events/entities/event.entity';
import { Club } from 'src/clubs/entities/club.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Request {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: 'create' | 'cancel' | 'join'; // join = user gửi request join club

  @ManyToOne(() => User, { nullable: true })
  user: User; // chỉ dùng khi request do user gửi

  @ManyToOne(() => Club, (club) => club.requests, { nullable: true })
  club: Club; // club liên quan (cả request user hay club gửi)

  @ManyToOne(() => Event, (event) => event.requests, { nullable: true })
  event: Event; // nếu request liên quan event

  @Column({ default: 'pending' })
  adminStatus: 'pending' | 'approved' | 'rejected';
}
