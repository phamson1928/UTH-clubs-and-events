# UTH Clubs & Events

A university club and event management platform built for **Ho Chi Minh City University of Transport (UTH)**.  
Students can discover and register for events, club owners can manage their clubs and organize activities, and admins oversee the entire system.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts |
| **Backend** | NestJS 11, TypeScript, TypeORM, PostgreSQL |
| **Database** | Supabase (PostgreSQL + connection pooler) |
| **Auth** | JWT (Passport), role-based guards (admin, club_owner, student) |
| **Infra** | Docker, Nginx reverse proxy, VPS (Ubuntu) |
| **CI/CD** | GitHub Actions |
| **API Docs** | Swagger (OpenAPI) |

## Features

### Student
- Browse and search events with real-time filtering (upcoming, ongoing, past)
- Register for events, track registrations, earn activity points
- Explore clubs, join with membership requests
- QR check-in, event feedback

### Club Owner
- Create and manage events with full CRUD
- Track member registrations and attendance
- View club dashboard with statistics
- Accept/reject membership requests

### Admin
- System-wide dashboard with charts and statistics
- Approve/reject events submitted by clubs
- Manage clubs and users
- View registration analytics

## Architecture

```
┌─────────────────────────────────────────────────┐
│                    Frontend                       │
│         React + Vite (Vercel/HTTPS)              │
└──────────────────┬──────────────────────────────┘
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────────┐
│              Nginx Reverse Proxy                  │
│              (VPS / HTTP → Backend)               │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│              NestJS API (Docker)                  │
│         Port 3001 → PostgreSQL                    │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│             Supabase PostgreSQL                   │
│           (via Supavisor pooler)                  │
└─────────────────────────────────────────────────┘
```

## Project Structure

```
uth-clubs-and-events/
├── database/                    # SQL seed scripts & data migrations
├── ops/                         # Deployment & operations configs
│   ├── deploy.ps1               # VPS deployment script
│   └── nginx_config             # Nginx reverse proxy config
├── scripts/                     # Utility scripts
├── uth-club-backend/            # NestJS API
│   ├── src/
│   │   ├── auth/                # JWT auth, guards, strategies
│   │   ├── clubs/               # Club management
│   │   ├── events/              # Events CRUD + scheduling
│   │   ├── event_registrations/ # Registration & check-in
│   │   ├── feedback/            # Event feedback & ratings
│   │   ├── memberships/         # Club membership management
│   │   ├── notifications/       # In-app notifications
│   │   ├── statistics/          # Analytics & dashboards
│   │   ├── users/               # User management
│   │   └── common/              # Shared DTOs, guards, decorators
│   ├── test/
│   └── Dockerfile
└── uth-club-frontend/           # React SPA
    └── src/
        ├── pages/
        │   ├── student/         # Student-facing pages
        │   ├── admin/           # Admin dashboard pages
        │   └── club-owner/      # Club owner pages
        └── components/          # Shared UI components
```

## Quick Start

### Prerequisites
- Node.js 22+
- Docker & Docker Compose
- PostgreSQL / Supabase account

### Backend Setup

```bash
cd uth-club-backend
cp .env.example .env    # Fill in your database credentials
npm install
npm run start:dev       # http://localhost:3000
```

### Frontend Setup

```bash
cd uth-club-frontend
npm install
npm run dev             # http://localhost:5173
```

### Docker (Production)

```bash
cd uth-club-backend
docker-compose up --build -d
```

### Seed Database

```bash
PGPASSWORD="your_password" psql -h [host] -U [user] -d postgres -f database/seed.sql
PGPASSWORD="your_password" psql -h [host] -U [user] -d postgres -f database/refresh-dates.sql
```

## API Documentation

Once the backend is running, visit:
```
http://localhost:3000/api/docs
```

## Test Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `Admin@123` |
| Club Owner | `club_owner` | `Owner@123` |
| Student | `student` | `Student@123` |
