# UTH Clubs & Events - Project Tech Stack & CV Info

> **Project**: Hệ thống quản lý Câu lạc bộ & Sự kiện cho trường Đại học Giao thông Vận tải (UTH)
> **Vai trò của bạn**: Backend Developer (đồng thời làm Frontend + DevOps)

---

## 1. TỔNG QUAN DỰ ÁN

Hệ thống quản lý CLB và sự kiện sinh viên với 3 vai trò:

- **Admin**: Quản lý toàn bộ hệ thống, duyệt sự kiện, xem thống kê
- **Club Owner**: Quản lý CLB, tạo sự kiện, duyệt thành viên
- **Student (User)**: Tham gia CLB, đăng ký sự kiện, điểm danh, đánh giá

---

## 2. BACKEND — NestJS (Phần mạnh nhất — focus vào đây)

### 2.1. Core Framework & Language

| Công nghệ         | Chi tiết                                                                           |
| ----------------- | ---------------------------------------------------------------------------------- |
| **NestJS** v11    | Framework Node.js theo kiến trúc module, controller, service, dependency injection |
| **TypeScript** v5 | Toàn bộ codebase                                                                   |
| **Node.js** v22   | Runtime (Alpine Linux trên Docker)                                                 |

### 2.2. Database & ORM

| Công nghệ            | Mô tả                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------- |
| **PostgreSQL**       | Cơ sở dữ liệu quan hệ                                                                     |
| **TypeORM** v0.3.27  | ORM — Entity, Repository pattern, migrations, query builder                               |
| **Supabase**         | Hosting PostgreSQL + Storage (images)                                                     |
| **Entity relations** | 7 entities: User, Club, Membership, Event, EventRegistration, Notification, EventFeedback |

### 2.3. Authentication & Authorization

| Công nghệ                                    | Mô tả                                                    |
| -------------------------------------------- | -------------------------------------------------------- |
| **Passport.js** + **passport-jwt**           | Chiến lược xác thực JWT                                  |
| **JWT**                                      | Token-based auth với payload: sub, email, role, clubId   |
| **bcrypt**                                   | Hash password (cost factor 10)                           |
| **JwtAuthGuard**                             | Guard bắt buộc đăng nhập                                 |
| **OptionalJwtAuthGuard**                     | Guard tuỳ chọn (public API vẫn biết user nếu có token)   |
| **RolesGuard** + custom `@Roles()` decorator | Phân quyền RBAC (user / club_owner / admin)              |
| **Rate Limiting**                            | `@nestjs/throttler` — giới hạn login/register 5 lần/phút |

### 2.4. API Documentation

| Công nghệ             | Mô tả                                    |
| --------------------- | ---------------------------------------- |
| **Swagger / OpenAPI** | `@nestjs/swagger` + `swagger-ui-express` |
| **Endpoint docs**     | Auto-generated tại `/api/docs`           |
| **Bearer Auth**       | Swagger UI có nút Authorize gắn JWT      |

### 2.5. Security

| Công nghệ          | Mô tả                                                             |
| ------------------ | ----------------------------------------------------------------- |
| **helmet**         | HTTP security headers (CSP, XSS, etc.)                            |
| **Rate Limiting**  | 1000 requests/min global, 3-5/login/register                      |
| **CORS**           | Cấu hình linh hoạt qua env var (whitelist hoặc wildcard)          |
| **ValidationPipe** | Global — whitelist, transform, class-validator DTOs               |
| **DTO validation** | `class-validator` decorators (@IsEmail, @IsString, @MinLength...) |

### 2.6. File Upload

| Công nghệ                   | Mô tả                                          |
| --------------------------- | ---------------------------------------------- |
| **multer** (memory storage) | Upload file vào bộ nhớ đệm                     |
| **Supabase Storage**        | Bucket `images` — lưu trữ vĩnh viễn            |
| **File validation**         | Chỉ cho phép jpg/jpeg/png/gif/webp, tối đa 5MB |

### 2.7. Email Service

| Công nghệ                                   | Mô tả                                                              |
| ------------------------------------------- | ------------------------------------------------------------------ |
| **@nestjs-modules/mailer** + **nodemailer** | Gửi email SMTP qua Gmail                                           |
| **Handlebars** templates                    | Template email HTML                                                |
| **Email types**                             | Xác thực tài khoản, quên mật khẩu, duyệt membership, duyệt sự kiện |

### 2.8. Scheduled Tasks (Cron Jobs)

| Công nghệ            | Mô tả                                                 |
| -------------------- | ----------------------------------------------------- |
| **@nestjs/schedule** | Cron job chạy mỗi giờ                                 |
| **Task**             | Tự động chuyển trạng thái sự kiện hết hạn → completed |

### 2.9. Statistics & Analytics

| Công nghệ                 | Mô tả                                                                            |
| ------------------------- | -------------------------------------------------------------------------------- |
| **TypeORM Query Builder** | Thống kê raw SQL queries                                                         |
| **Admin Dashboard**       | Tổng CLB, user, sự kiện, phân bố role, trạng thái events, tăng trưởng theo tháng |
| **Club Owner Dashboard**  | Thống kê riêng của từng CLB                                                      |

### 2.10. API Modules (đầy đủ endpoints)

| Module                  | Endpoints chính                                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**                | `POST /auth/register`, `POST /auth/login`, `GET /auth/verify`, `POST /auth/forgot-password`, `POST /auth/reset-password`                                            |
| **Users**               | CRUD users, profile management                                                                                                                                      |
| **Clubs**               | CRUD clubs, categories, lọc                                                                                                                                         |
| **Memberships**         | Đăng ký CLB, duyệt đơn, roles (member, vice_president, secretary, treasurer, other)                                                                                 |
| **Events**              | CRUD events, status workflow (pending→approved/rejected/canceled/completed), capacity, visibility (public/members_only), QR check-in code                           |
| **Event Registrations** | Đăng ký sự kiện, điểm danh, attendance tracking                                                                                                                     |
| **Feedback**            | Đánh giá 1-5 sao + comment (chỉ người đã điểm danh mới đánh giá được)                                                                                               |
| **Notifications**       | 9 loại thông báo in-app (membership approved/rejected, event approved/rejected, new event, event reminder, checkin success, points awarded, new membership request) |
| **Upload**              | Upload image lên Supabase Storage                                                                                                                                   |
| **Statistics**          | Admin + Club Owner analytics                                                                                                                                        |

### 2.11. Additional Backend Libraries

| Library            | Mục đích                                 |
| ------------------ | ---------------------------------------- |
| `qrcode`           | Tạo QR code cho check-in sự kiện         |
| `exceljs`          | Export dữ liệu ra Excel                  |
| `uuid`             | Tạo token xác thực / reset password      |
| `rxjs`             | Reactive programming (NestJS dependency) |
| `reflect-metadata` | Decorator support                        |

### 2.12. Testing

| Công nghệ         | Mô tả                |
| ----------------- | -------------------- |
| **Jest** v30      | Unit testing         |
| **Supertest**     | E2E testing          |
| **jest-e2e.json** | Config riêng cho E2E |

### 2.13. Development Tools

| Công nghệ                        | Mô tả              |
| -------------------------------- | ------------------ |
| **ESLint** v9                    | TypeScript linting |
| **Prettier** v3                  | Code formatter     |
| **Nest CLI** v11                 | Code generation    |
| **ts-node** + **tsconfig-paths** | Chạy seed scripts  |
| **source-map-support**           | Debug stack traces |

---

## 3. FRONTEND — React + TypeScript (bạn có làm nhưng không rành)

### 3.1. Core

| Công nghệ               | Mô tả                          |
| ----------------------- | ------------------------------ |
| **React** 18            | UI library                     |
| **TypeScript** v5       | Toàn bộ codebase               |
| **Vite** v6             | Build tool (fast HMR, ESBuild) |
| **React Router DOM** v6 | Client-side routing            |

## 4. DEPLOYMENT & DEVOPS

### 4.1. Docker

| Công nghệ               | Mô tả                                                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Docker**              | Multi-stage build backend                                                                                                   |
| **Dockerfile**          | Stage 1: builder (`node:22-alpine`, `npm ci`, `npm run build`); Stage 2: production (`node:22-alpine`, chỉ production deps) |
| **Docker Compose** v3.8 | Orchestration backend + env vars + persistent uploads volume                                                                |
| **Port**                | 3000 (backend)                                                                                                              |

### 4.2. Frontend Deployment

| Công nghệ       | Mô tả                                      |
| --------------- | ------------------------------------------ |
| **Vercel**      | Deploy frontend (SPA rewrite → index.html) |
| **vercel.json** | Rewrites all routes to index.html          |

### 4.3. Database & Storage

| Công nghệ            | Mô tả                                         |
| -------------------- | --------------------------------------------- |
| **Supabase**         | PostgreSQL hosting                            |
| **Supabase Storage** | Bucket `images` cho upload files              |
| **SSL**              | Kết nối DB với SSL, rejectUnauthorized: false |
| **Pooler**           | Supabase pooler port 5432                     |

### 4.4. CI/CD

| Công nghệ          | Mô tả                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| **GitHub Actions** | Workflow `keep-supabase-alive.yml` — ping database mỗi 2 ngày (cron `0 0 */2 * *`) để tránh Supabase sleep |

### 4.5. Environment Variables

| Variable                                                  | Mục đích                                   |
| --------------------------------------------------------- | ------------------------------------------ |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Kết nối PostgreSQL                         |
| `DB_SSL`                                                  | Bật/tắt SSL                                |
| `JWT_SECRET`                                              | Khóa ký JWT                                |
| `CORS_ORIGIN`                                             | Whitelist origins (có thể comma-separated) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`                    | Supabase Storage                           |
| `MAIL_USER`, `MAIL_PASS`                                  | Gmail SMTP credentials                     |
| `FRONTEND_URL`                                            | URL frontend (cho email reset password)    |
| `PORT`                                                    | Backend port (default 3000)                |
| `VITE_API_URL`                                            | Frontend → Backend API URL                 |

---

## 5. DATABASE SCHEMA (PostgreSQL)

| Table                   | Columns chính                                                                                                                                                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **user**                | id, name, email, password, role (enum: user/admin/club_owner), mssv, isVerified, verificationToken, resetToken, total_points                                                                                                            |
| **club**                | id, name, description, ownerId (FK→user), category, club_image                                                                                                                                                                          |
| **membership**          | id, userId (FK), clubId (FK), join_reason, skills, promise, status (pending/approved/rejected), club_role (member/vice_president/secretary/treasurer/other)                                                                             |
| **event**               | id, clubId (FK), name, description, status (pending/approved/rejected/canceled/completed), date, endDate, activities, location, points, max_capacity, visibility (public/members_only), registration_deadline, checkInCode, proposalUrl |
| **event_registrations** | id, eventId (FK), userId (FK), attended, attendedAt, unique(event, user)                                                                                                                                                                |
| **notification**        | id, userId (FK), title, body, type (9 types), meta (JSONB), isRead                                                                                                                                                                      |
| **event_feedback**      | id, eventId (FK), userId (FK), rating (1-5), comment, unique(event, user)                                                                                                                                                               |

---

## 6. KIẾN THỨC & KỸ NĂNG CV — Backend Developer Intern

### Backend (mạnh nhất — ghi trước)

| Skill                                                                    | Level      |
| ------------------------------------------------------------------------ | ---------- |
| NestJS (modules, controllers, services, DI, guards, interceptors, pipes) | Thành thạo |
| TypeScript (decorators, generics, types, interfaces)                     | Thành thạo |
| Node.js (REST API, async/await, error handling)                          | Thành thạo |
| PostgreSQL (queries, relations, migrations, indexes)                     | Khá        |
| TypeORM (entities, repositories, query builder, migrations)              | Khá        |
| JWT Authentication + Passport.js                                         | Thành thạo |
| RBAC Authorization (RolesGuard, decorators)                              | Khá        |
| Swagger / OpenAPI documentation                                          | Khá        |
| Rate Limiting, Helmet, CORS, Input Validation                            | Khá        |
| File Upload (multer + cloud storage)                                     | Cơ bản     |
| Email (Nodemailer, SMTP, Handlebars templates)                           | Cơ bản     |
| Cron Jobs / Scheduled Tasks                                              | Cơ bản     |
| Testing (Jest, Supertest E2E)                                            | Cơ bản     |
| QR Code generation                                                       | Cơ bản     |
| Excel export (exceljs)                                                   | Cơ bản     |

### Frontend (có làm nhưng không rành — ghi sau)

| Skill                                      | Level        |
| ------------------------------------------ | ------------ |
| React 18 (components, hooks, props, state) | Cơ bản - Khá |
| TypeScript trong React                     | Cơ bản - Khá |
| Tailwind CSS (utility-first styling)       | Cơ bản       |
| React Router (routing, protected routes)   | Cơ bản       |
| Axios (REST API calls, interceptors)       | Khá          |
| Framer Motion (animations)                 | Cơ bản       |
| Recharts (charts, dashboards)              | Cơ bản       |
| Radix UI / shadcn/ui components            | Cơ bản       |

### DevOps & Deployment

| Skill                                       | Level        |
| ------------------------------------------- | ------------ |
| Docker (multi-stage builds, Docker Compose) | Cơ bản - Khá |
| Supabase (PostgreSQL hosting + Storage)     | Khá          |
| Vercel (SPA deployment)                     | Cơ bản       |
| GitHub Actions (CI/CD workflows)            | Cơ bản       |
| Environment variable management             | Khá          |

### Công cụ phát triển

| Skill                   | Level      |
| ----------------------- | ---------- |
| Git / GitHub            | Khá        |
| ESLint + Prettier       | Khá        |
| npm / Node.js ecosystem | Thành thạo |

---

## 7. GỢI Ý CÁCH TRÌNH BÀY CV

### Project Title

> **UTH Clubs & Events Management System** — Hệ thống quản lý CLB & Sự kiện trường Đại học Giao thông Vận tải

### Mô tả ngắn (1-2 câu)

> Xây dựng nền tảng web quản lý câu lạc bộ và sự kiện sinh viên với 3 vai trò (Admin, Club Owner, Student). Hệ thống hỗ trợ đăng ký CLB, quản lý sự kiện, điểm danh QR code, đánh giá feedback, thông báo realtime và dashboard thống kê.

### Backend Responsibilities (ghi vào CV)

- Thiết kế và phát triển **RESTful API** với **NestJS + TypeScript**
- Xây dựng hệ thống **xác thực JWT** và **phân quyền RBAC** (3 roles)
- Thiết kế cơ sở dữ liệu **PostgreSQL** với **TypeORM** (7 entities, quan hệ phức tạp)
- Tích hợp **Supabase** (database hosting + file storage)
- Viết **Swagger/OpenAPI** documentation tự động
- Implement **email verification**, **forgot/reset password**, **rate limiting**
- Xử lý **file upload** (ảnh CLB, sự kiện)
- Viết **cron job** tự động cập nhật trạng thái sự kiện
- Xây dựng **statistics/analytics** dashboard queries
- **Docker** hóa backend (multi-stage build, compose)

### Frontend Responsibilities

- Phát triển giao diện với **React 18 + TypeScript + Vite**
- Responsive UI với **Tailwind CSS + shadcn/ui**
- Tích hợp biểu đồ **Recharts** cho dashboard
- Routing đa vai trò với **React Router v6**

### DevOps

- Triển khai frontend lên **Vercel**
- Triển khai backend với **Docker + Docker Compose**
- **GitHub Actions** workflow tự động ping database
- Quản lý biến môi trường cho nhiều môi trường

---

## 8. KEY ACHIEVEMENTS (thành tích nổi bật — dùng trong CV)

1. ✅ Xây dựng hệ thống từ **zero → production** với kiến trúc modular, maintainable
2. ✅ Hệ thống hỗ trợ **3 vai trò người dùng** với phân quyền chi tiết
3. ✅ Tích hợp **QR code check-in** cho sự kiện
4. ✅ Hệ thống **email tự động** (xác thực, thông báo, quên mật khẩu)
5. ✅ Dashboard **thống kê trực quan** với biểu đồ (Recharts)
6. ✅ **Docker** hóa toàn bộ backend, dễ dàng triển khai
7. ✅ **9 loại thông báo in-app** cho các sự kiện trong hệ thống
8. ✅ Cơ chế **điểm rèn luyện (points)** cho sinh viên tham gia sự kiện

---

> **Note**: File này tổng hợp toàn bộ tech stack và feature của dự án để bạn dễ dàng trích xuất thông tin cho CV. Tuỳ vào vị trí intern bạn apply, hãy chọn lọc những mục phù hợp nhất.
