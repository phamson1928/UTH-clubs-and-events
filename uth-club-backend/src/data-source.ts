import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Club } from './clubs/entities/club.entity';
import { Membership } from './memberships/entities/membership.entity';
import { Event } from './events/entities/event.entity';
import { EventRegistration } from './event_registrations/entities/event_registration.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Match the SSL config used by the runtime datasource in app.module.ts
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  entities: [User, Club, Membership, Event, EventRegistration],
  migrations: ['src/migrations/*.ts'],
  // CLI datasource must NEVER synchronize — always use migrations
  synchronize: false,
});
