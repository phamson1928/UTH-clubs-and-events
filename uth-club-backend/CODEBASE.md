# CODEBASE REFERENCE — UTH Clubs & Events Backend

> File này mô tả toàn bộ codebase tính đến ngày 02/03/2026.  
> Mục đích: dùng làm context nhanh cho AI/dev, không cần đọc lại từng file nguồn.

---

## Tech Stack

| Layer       | Công nghệ                                                                          |
| ----------- | ---------------------------------------------------------------------------------- |
| Framework   | NestJS 11 (TypeScript)                                                             |
| ORM         | TypeORM 0.3.27                                                                     |
| Database    | PostgreSQL                                                                         |
| Auth        | Passport JWT (`passport-jwt`, `@nestjs/jwt`)                                       |
| Mail        | `@nestjs-modules/mailer` + Nodemailer + Handlebars templates                       |
| File upload | Multer (disk storage → `uploads/images/`)                                          |
| Validation  | `class-validator` + `class-transformer` (nhưng **chưa bật ValidationPipe global**) |
| Password    | `bcrypt`                                                                           |
| Config      | `@nestjs/config` → đọc `.env`                                                      |

---

## Cấu trúc thư mục

```
uth-club-backend/
├── common/
│   ├── decorators/roles.decorator.ts   # @Roles(...roles) decorator
│   └── guards/roles.guard.ts           # RolesGuard kiểm tra req.user.role
├── src/
│   ├── app.module.ts                   # Root module, cấu hình TypeORM + Mailer
│   ├── main.ts                         # Bootstrap, CORS, static files
│   ├── data-source.ts                  # TypeORM DataSource cho CLI migrations
│   ├── auth/                           # Đăng ký, đăng nhập, JWT, reset password
│   ├── users/                          # CRUD user (admin), tìm theo email/token
│   ├── clubs/                          # CRUD club, tìm club + events + members
│   ├── memberships/                    # Đơn tham gia club, duyệt/từ chối
│   ├── events/                         # CRUD event, duyệt/từ chối by admin
│   ├── event_registrations/            # User đăng ký tham gia event
│   ├── statistics/                     # Thống kê dashboard admin/club-owner/member
│   ├── upload/                         # Upload ảnh bằng Multer
│   └── mail/                           # MailService + Handlebars templates
└── uploads/images/                     # Ảnh upload lưu ở đây
```

---

## Database Schema (TypeORM Entities)

### `User` (`src/users/entities/user.entity.ts`)

| Column            | Type      | Ghi chú                                                   |
| ----------------- | --------- | --------------------------------------------------------- |
| id                | PK int    | auto increment                                            |
| name              | string    |                                                           |
| email             | string    | unique                                                    |
| password          | string    | bcrypt hash — **không có `select:false`**                 |
| role              | string    | `'user'` \| `'admin'` \| `'club_owner'`, default `'user'` |
| mssv              | string    | nullable                                                  |
| isVerified        | boolean   | default false                                             |
| verificationToken | string    | nullable                                                  |
| createdAt         | Date      | CreateDateColumn                                          |
| resetToken        | string    | nullable                                                  |
| resetTokenExpires | timestamp | nullable                                                  |

Relations:

- `memberships` → `OneToMany → Membership`
- `ownedClubs` → `OneToMany → Club`

---

### `Club` (`src/clubs/entities/club.entity.ts`)

| Column      | Type   | Ghi chú                                   |
| ----------- | ------ | ----------------------------------------- |
| id          | PK int |                                           |
| name        | string |                                           |
| description | string | nullable                                  |
| ownerId     | int    | FK column (explicit `@JoinColumn`)        |
| category    | string |                                           |
| created_at  | Date   | CreateDateColumn                          |
| club_image  | string | **non-nullable — crash nếu không truyền** |

Relations:

- `owner` → `ManyToOne → User` (join trên `ownerId`)
- `memberships` → `OneToMany → Membership`
- `events` → `OneToMany → Event`

---

### `Membership` (`src/memberships/entities/membership.entity.ts`)

| Column       | Type   | Ghi chú                                                          |
| ------------ | ------ | ---------------------------------------------------------------- |
| id           | PK int |                                                                  |
| join_reason  | string |                                                                  |
| skills       | string |                                                                  |
| request_date | Date   | CreateDateColumn                                                 |
| join_date    | Date   | **non-nullable — crash khi insert pending**                      |
| promise      | string |                                                                  |
| status       | string | `'pending'` \| `'approved'` \| `'rejected'`, default `'pending'` |

Relations:

- `club` → `ManyToOne → Club`
- `user` → `ManyToOne → User`

---

### `Event` (`src/events/entities/event.entity.ts`)

| Column                 | Type   | Ghi chú                                                                          |
| ---------------------- | ------ | -------------------------------------------------------------------------------- |
| id                     | PK int |                                                                                  |
| name                   | string |                                                                                  |
| description            | string | nullable                                                                         |
| status                 | string | `'pending'` \| `'approved'` \| `'rejected'` \| `'canceled'`, default `'pending'` |
| event_image            | string | **non-nullable**                                                                 |
| createdAt              | Date   | CreateDateColumn                                                                 |
| date                   | Date   | ngày diễn ra event                                                               |
| attending_users_number | int    | default 0                                                                        |
| activities             | string |                                                                                  |
| location               | string |                                                                                  |

Relations:

- `club` → `ManyToOne → Club`
- **Không có** `OneToMany → EventRegistration` (thiếu inverse relation)

---

### `EventRegistration` (`src/event_registrations/entities/event_registration.entity.ts`)

| Column     | Type   | Ghi chú                          |
| ---------- | ------ | -------------------------------- |
| id         | PK int | optional (bug)                   |
| created_at | Date   | CreateDateColumn, optional (bug) |

Constraints: `@Unique(['event', 'user'])`

Relations:

- `event` → `ManyToOne(() => Event, (event) => event.id)` — **inverseSide sai** (dùng `event.id` thay vì relation property)
- `user` → `ManyToOne(() => User, (user) => user.id)` — tương tự

---

## Modules & Services

### `AuthModule` (`src/auth/`)

**Imports:** `TypeOrmModule([Club, User])`, `UsersModule`, `JwtModule`, `PassportModule`, `ConfigModule`  
**Providers:** `AuthService`, `JwtStrategy`, `MailService`, `UsersService`

**Controller routes:**
| Method | Path | Guard | Mô tả |
|--------|------|-------|-------|
| POST | `/auth/register` | none | Đăng ký, gửi email verify |
| POST | `/auth/login` | none | Đăng nhập, trả JWT + user (kể cả password hash — bug) |
| GET | `/auth/verify?token=` | none | Xác thực email |
| POST | `/auth/forgot-password` | none | Gửi link reset password |
| POST | `/auth/reset-password` | none | Đổi password bằng token |

**`AuthService` logic:**

- `register()`: hash password → tạo user → sign JWT → gửi email verify → trả `{ user, token }`
- `login()`: tìm user → compare bcrypt → nếu `club_owner` query DB lấy `clubId` → sign JWT với `{ sub, email, role, clubId }` → trả `{ user, token }` (có password hash — bug)
- `forgotPassword()`: tạo `randomUUID()` token, expire 15 phút → lưu DB → gửi mail
- `resetPassword()`: tìm token → check expire → hash new password → update → `clearResetToken()`

**JWT Payload** structure: `{ sub: userId, email, role, clubId? }`

**`JwtStrategy.validate()`**: query DB bằng `payload.email` mỗi request → trả `{ ...user, clubId: payload.clubId }` (có password — bug)

---

### `UsersModule` (`src/users/`)

**Exports:** `UsersService`

**Controller routes:**
| Method | Path | Guard/Roles | Mô tả |
|--------|------|-------------|-------|
| GET | `/users` | JWT + admin | Lấy tất cả users (kèm memberships, ownedClubs) |
| POST | `/users/create` | JWT + admin | Tạo user (hash password trong controller) |
| PATCH | `/users/update/:id` | JWT + admin | Update user |
| DELETE | `/users/delete/:id` | JWT + admin | Xóa user |
| POST | `/users/admin/edit/:id` | JWT + admin | Admin sửa user (hash password nếu có) |
| POST | `/users/club-owner/edit-email/:id` | JWT + club_owner | Chỉ cho sửa email (không scope check — bug) |

**`UsersService` methods:**

- `create(dto)` — `repository.create()` + `save()`
- `findAll()` — find với relations `memberships`, `ownedClubs`, có `select` fields
- `update(id, dto)` — `repository.update()`
- `remove(id)` — `repository.delete()`
- `findByEmail(email)` — `findOne({ where: { email } })`
- `findByVerificationToken(token)` — `findOne({ where: { verificationToken } })`
- `findByResetToken(token)` — `findOne({ where: { resetToken } })`
- `updateResetToken(id, token, expires)` — update `resetToken` + `resetTokenExpires`
- `updatePassword(id, hash)` — update `password`
- `clearResetToken(id)` — set `resetToken = ''`, `resetTokenExpires = new Date()` (**bug:** nên là `null`)

---

### `ClubsModule` (`src/clubs/`)

**Imports:** `TypeOrmModule([Club, User, EventRegistration])`

**Controller routes:**
| Method | Path | Guard/Roles | Mô tả |
|--------|------|-------------|-------|
| GET | `/clubs` | none | Lấy tất cả clubs |
| GET | `/clubs/:id` | none (thiếu guard — bug) | Club detail + events + members |
| PATCH | `/clubs/:id` | JWT + admin | Cập nhật club |
| DELETE | `/clubs/:id` | JWT + admin | Xóa club |
| — | — | — | **Không có `POST /clubs`** (bug) |

**`ClubsService` methods:**

- `create(dto)` — tạo + save
- `findAll()` — QueryBuilder: select fields + join owner + `loadRelationCountAndMap('members')` + join memberships.user
- `findOne(id, userId?)` — join tất cả relations, nếu `userId` thì N+1 query check `isRegistered` mỗi event
- `update(id, dto)` — `preload()` + nếu có `ownerId` → tìm user → set role `'club_owner'` → save (**không revert old owner** — bug)
- `remove(id)` — `delete(id)`

---

### `MembershipsModule` (`src/memberships/`)

**Imports:** `TypeOrmModule([Membership])`

**Controller routes:**
| Method | Path | Guard/Roles | Mô tả |
|--------|------|-------------|-------|
| GET | `/memberships/request` | JWT + club_owner | Lấy pending requests của club |
| POST | `/memberships/:clubId/join` | JWT + user | Tạo đơn xin tham gia |
| GET | `/memberships/members` | JWT + club_owner | Lấy approved members |
| GET | `/memberships/no-club-users` | JWT + club_owner | Users không có club (bug: luôn rỗng) |
| PATCH | `/memberships/:id/approve` | JWT + club_owner | Duyệt đơn |
| PATCH | `/memberships/:id/reject` | JWT + club_owner | Từ chối đơn |
| DELETE | `/memberships/:id` | JWT + club_owner | Xóa đơn |
| DELETE | `/memberships/members/:id` | JWT + club_owner | Xóa member khỏi club |

**Lưu ý routing:** `DELETE :id` được khai báo trước `DELETE members/:id` — có thể conflict.

**`clubId` lấy từ `req.user.clubId`** (JWT payload, không phải DB live — stale nếu reassign).

**`MembershipsService` methods:**

- `findAllRequests(clubId)` — QueryBuilder: pending + join user (select fields)
- `findAllMembers(clubId)` — QueryBuilder: approved + join user
- `findUsersWithoutClub()` — **bug:** query `club.id IS NULL` trên Membership → luôn rỗng
- `addUserToClub(userId, clubId)` — save với plain `userId`/`clubId` (TypeORM relation issue)
- `createMembershipRequest(dto, userId, clubId)` — **bug:** `membership.user.id = userId` crash vì `user` là `undefined`
- `addApprovedMember(userId, clubId)` — đúng cách: dùng `{ id: userId } as User`
- `updateMembershipRequest(id, status)` — update status + `join_date` nếu approved
- `deleteMembershipRequest(id)` — delete
- `getMemberInClub(clubId)` — join user, **không filter status** (trả cả pending/rejected)
- `removeMemberFromClub(membershipId)` — delete

---

### `EventsModule` (`src/events/`)

**Imports:** `TypeOrmModule([Event, EventRegistration])`

**Controller routes:**
| Method | Path | Guard/Roles | Mô tả |
|--------|------|-------------|-------|
| POST | `/events` | JWT + club_owner | Tạo event |
| GET | `/events?status=` | none (bug: req.user undefined) | Lấy events theo status |
| GET | `/events/pending_events` | JWT + club_owner | Pending events của club |
| GET | `/events/club_owner?status=` | JWT + club_owner | Events của club theo status |
| GET | `/events/:id` | none | Lấy event theo id |
| PATCH | `/events/:id` | JWT + club_owner | Sửa event (**không check ownership** — bug) |
| PATCH | `/events/:id/approved` | JWT + admin | Duyệt event |
| PATCH | `/events/:id/rejected` | JWT + admin | Từ chối event |
| DELETE | `/events/:id` | JWT + admin | Xóa event |

**`EventsService` methods:**

- `create(dto)` — create + save
- `findAll(status?, userId?)` — QueryBuilder + nếu userId thì N+1 check `isRegistered`
- `findAllByClub(clubId)` — pending events của club
- `findAllByClubAndStatus(clubId, status?)` — events của club theo status
- `updateAttendingUsersNumber(eventId)` — **dead code:** read-modify-write không atomic
- `findOne(id)` — findOne + join club
- `update(id, dto)` — `repository.update()`
- `remove(id)` — `repository.delete()`

---

### `EventRegistrationsModule` (`src/event_registrations/`)

**Imports:** `TypeOrmModule([EventRegistration, Event])`

**Controller routes:**
| Method | Path | Guard/Roles | Mô tả |
|--------|------|-------------|-------|
| POST | `/event-registrations/:id/register` | JWT + any role | Đăng ký tham gia event |
| GET | `/event-registrations/:id/participants` | JWT + club_owner/admin | Lấy danh sách người tham gia |

**`EventRegistrationsService` methods:**

- `registerUserForEvent(eventId, userId)`:
  1. Check event tồn tại
  2. Check duplicate (non-atomic — race condition)
  3. `create()` + `save()`
  4. `eventsRepository.increment({ id: eventId }, 'attending_users_number', 1)` (atomic)
  5. Trả `{ message: 'Đăng ký thành công' }`
- `getEventParticipants(eventId, user)`:
  1. Tìm event + join club
  2. Check quyền: `role === 'admin'` hoặc `event.club.ownerId === user.id`
  3. Find registrations + join user
  4. Trả event info + participants array

---

### `StatisticsModule` (`src/statistics/`)

**Imports:** `TypeOrmModule([Event, User, Club, Membership])`

**Controller routes:**
| Method | Path | Guard/Roles | Mô tả |
|--------|------|-------------|-------|
| GET | `/statistics/admin_statistics` | JWT + admin | Tổng clubs/members/events/pendingEvents |
| GET | `/statistics/own-club_statistics` | JWT + club_owner | Stats club của mình |
| GET | `/statistics/member_statistics` | none | Stats trang chủ (count all users — bug) |
| GET | `/statistics/admin/events-growth?year=` | JWT + admin | Monthly event growth |
| GET | `/statistics/admin/users-growth?year=` | JWT + admin | Monthly user growth |
| GET | `/statistics/admin/club-categories` | JWT + admin | Count clubs by category |
| GET | `/statistics/admin/events-status` | JWT + admin | Event status distribution |
| GET | `/statistics/admin/events-monthly-status?year=` | JWT + admin | Monthly events by status |
| GET | `/statistics/club-owner/events-growth?year=` | JWT + club_owner | Club's monthly events |
| GET | `/statistics/club-owner/members-growth?year=` | JWT + club_owner | Club's monthly member growth |

**Lưu ý:** `@Query('year') year: number` nhưng thực tế nhận được string — cần `ParseIntPipe`.

---

### `UploadModule` (`src/upload/`)

**Controller routes:**
| Method | Path | Guard | Mô tả |
|--------|------|-------|-------|
| POST | `/upload/image` | none | Upload ảnh, trả `{ filename, path, url }` |
| GET | `/upload/images/:filename` | none | Serve ảnh trực tiếp |

File lưu tại `./uploads/images/`, filename: `file-{timestamp}-{random}{ext}`.  
Chấp nhận: jpg, jpeg, png, gif, webp. Giới hạn: 50MB.  
URL trả về: `process.env.API_URL || 'http://localhost:3000'` + `/uploads/images/{filename}`.

---

### `MailModule` / `MailService` (`src/mail/`)

**Không có module riêng** — `MailService` được provide trực tiếp trong `AuthModule`.  
Dùng `@nestjs-modules/mailer` với Handlebars template.  
Templates nằm tại `src/mail/templates/`.

Methods:

- `sendVerificationEmail(email, token)` — gửi link verify
- `sendForgotPasswordMail(email, token)` — gửi link reset password

---

## Auth & Authorization Flow

### JWT Structure

```json
{
  "sub": 1,
  "email": "user@example.com",
  "role": "club_owner",
  "clubId": 3,
  "iat": ...,
  "exp": ...
}
```

### Guard stack

```
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
```

1. `JwtAuthGuard` (Passport) — validate Bearer token → gọi `JwtStrategy.validate()` → set `req.user = { ...userFromDB, clubId }`
2. `RolesGuard` — đọc metadata `'roles'` → check `req.user.role in requiredRoles`

### `req.user` object (sau khi qua JwtAuthGuard)

```typescript
{
  id: number,
  name: string,
  email: string,
  password: string,  // ⚠️ hash bị expose
  role: 'user' | 'admin' | 'club_owner',
  mssv: string,
  isVerified: boolean,
  verificationToken: string,
  createdAt: Date,
  resetToken: string,
  resetTokenExpires: Date,
  memberships: [...],
  ownedClubs: [...],
  clubId: number | null  // từ JWT payload
}
```

---

## Configuration (`app.module.ts` + `.env`)

### TypeORM config

```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost', // hardcode (không dùng DB_HOST)
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  autoLoadEntities: true,
  synchronize: true, // ⚠️ NGUY HIỂM trên production
  entities: [User, Club, Membership, Event, EventRegistration],
});
```

### Mailer config (hardcode credentials — ⚠️ SECURITY)

```typescript
MailerModule.forRoot({
  transport: {
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: 'pson4282@gmail.com',
      pass: 'dvdg qjpp hpdz zdxj', // App Password bị lộ
    },
  },
});
```

### `.env` variables cần có

```
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
API_URL=           # cho upload URL (fallback: http://localhost:3000)
PORT=              # NestJS port (fallback: 3000)
```

### main.ts

- Static files: `uploads/` → prefix `/uploads/`
- CORS: `origin: ['http://localhost:5173']` (hardcode)
- Port: `process.env.PORT ?? 3000`
- **Không có** `ValidationPipe`, `helmet`, rate limiting

---

## DTOs

### `CreateUserDto`

`name`, `email`, `password`, `mssv`, `verificationToken` — tất cả `@IsNotEmpty()`/`@IsEmail()`

### `CreateClubDto`

`name`, `category`, `club_image`, `ownerId` — required; `description` — optional

### `UpdateClubDto`

`PartialType(CreateClubDto)`

### `CreateEventDto`

`clubId`, `name`, `date`, `event_image`, `activities`, `location` — required; `description`, `attending_users_number` — optional

### `UpdateEventDto`

`PartialType(CreateEventDto)` + `status: 'approved' | 'rejected'` — **⚠️ club_owner có thể gửi status**

### `CreateMembershipDto`

`clubId`, `userId`, `join_reason`, `skills`, `promise` — tất cả `@IsNotEmpty()`  
**⚠️ `userId` và `clubId` không nên để client gửi**

### `LoginDto`

`email` (`@IsEmail()`), `password` (`@IsNotEmpty()`)

### `RegisterDto`

`name`, `email`, `password` (min 6), `mssv`

---

## Patterns & Conventions

### Repository pattern

Mỗi service `@InjectRepository(Entity)` → dùng TypeORM `Repository<T>`.  
Không có custom Repository class, không có base service.

### Module cross-dependency

- `AuthModule` inject `UsersService` (qua `UsersModule` export) + direct inject `Club repo`
- `ClubsService` inject `User repo` + `EventRegistration repo` (khai báo trong `ClubsModule.imports`)
- `EventsService` inject `EventRegistration repo`
- `StatisticsService` inject tất cả 4 repos

### QueryBuilder pattern

Phần lớn queries phức tạp dùng `createQueryBuilder` với explicit `addSelect` để tránh over-fetching.

### Error handling

- Service ném `NotFoundException`, `BadRequestException`, `ConflictException`, `UnauthorizedException`, `ForbiddenException` từ `@nestjs/common`
- Một số chỗ ném `new Error(...)` thay vì NestJS exception → trả 500

---

## Known Issues Summary (xem BUGS.md để đầy đủ)

| Vị trí                   | Tóm tắt                                               |
| ------------------------ | ----------------------------------------------------- |
| `membership.entity.ts`   | `join_date` non-nullable → crash khi insert pending   |
| `memberships.service.ts` | `createMembershipRequest` crash do null dereference   |
| `user.entity.ts`         | `password` không có `select: false` → lộ hash         |
| `auth.service.ts`        | Login trả về `user` có chứa password hash             |
| `jwt.strategy.ts`        | `req.user` chứa password hash                         |
| `main.ts`                | Không có `ValidationPipe` global                      |
| `app.module.ts`          | SMTP credential hardcode, `synchronize: true`         |
| `jwt.strategy.ts`        | Fallback secret `'change-me'`                         |
| `clubs.controller.ts`    | Không có guard trên `GET :id` → `req.user` undefined  |
| `events.controller.ts`   | Club owner có thể tự approve event qua `status` field |
| `users.controller.ts`    | Club owner edit email mọi user (không scope check)    |
| `App.tsx` (frontend)     | Không có route guard nào                              |
