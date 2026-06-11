# UTH Clubs & Events — Backend API

NestJS REST API for the UTH Clubs & Events management platform.  
Provides role-based endpoints for students, club owners, and administrators.

## Tech Stack

- **Runtime:** Node.js 22, TypeScript
- **Framework:** NestJS 11
- **ORM:** TypeORM 0.3 with PostgreSQL
- **Auth:** Passport.js + JWT, role-based guards
- **Validation:** class-validator + class-transformer
- **Docs:** Swagger (OpenAPI) via `@nestjs/swagger`
- **Security:** Helmet, Throttler (rate limiting)
- **Email:** Nodemailer + Handlebars templates
- **Background Jobs:** `@nestjs/schedule` (cron-based event completion)

## Modules

| Module | Description |
|--------|-------------|
| `auth` | JWT authentication, login/register/reset-password |
| `users` | User CRUD, role management |
| `clubs` | Club CRUD, owner assignment |
| `events` | Event CRUD, status workflow (pending→approved→completed) |
| `event_registrations` | Registration, cancellation, QR check-in |
| `memberships` | Join requests, member management per club |
| `feedback` | Event feedback and ratings |
| `notifications` | In-app notifications |
| `statistics` | Dashboard analytics (member, event counts, charts) |
| `upload` | File/image uploads |

## Event Status Workflow

```
[Club Owner]          [Admin]           [System Cron]
    │                    │                    │
    │  Create Event      │                    │
    ├──→ pending ────────┤                    │
    │                    │ Approve/Reject     │
    │                    ├──→ approved        │
    │                    ├──→ rejected        │
    │                    │                    │
    │              [Event starts]             │
    │                    │                    │
    │              [Event ends]               │
    │                    │     Auto-complete  │
    │                    ├─────→ completed    │
    │                    │                    │
    │              Cancel Event               │
    │                    ├──→ canceled         │
```

## Setup

```bash
# Install dependencies
npm install

# Configuration
cp .env.example .env
# Edit .env with your Supabase/PostgreSQL credentials

# Development
npm run start:dev

# Production build
npm run build
npm run start:prod

# Tests
npm test
npm run test:e2e
```

## Docker

```bash
docker-compose up --build -d
```

## API Docs

Available at `/api/docs` when the server is running.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DB_HOST` | PostgreSQL host / Supavisor pooler |
| `DB_PORT` | Database port |
| `DB_USER` | Database user (format: `postgres.project_ref`) |
| `DB_PASSWORD` | Database password |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Secret key for JWT signing |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `MAIL_USER` | SMTP email for notifications |
| `MAIL_PASS` | SMTP app password |
| `PORT` | Server port (default: 3000) |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) |
