# UTH Clubs & Events — Backend Implementation Plan

> Cập nhật: 03/03/2026  
> Mục tiêu: Hoàn thiện nghiệp vụ + kỹ thuật để hệ thống sẵn sàng thực tế và đủ mạnh cho CV intern backend.

---

## Phase 1 — Nghiệp vụ cốt lõi còn thiếu (ưu tiên cao)

### 1.1 Event — Capacity & Thời gian

- [x] Thêm column `max_capacity` (INT, nullable) vào entity `Event` và migration
- [x] Thêm `max_capacity` vào `CreateEventDto` và `UpdateEventDto` (optional, min 1)
- [x] Trong `registerUserForEvent`: kiểm tra `attending_users_number < max_capacity` trước khi cho đăng ký — throw `BadRequestException('Sự kiện đã đủ chỗ')` nếu vượt
- [x] Trong `registerUserForEvent`: kiểm tra `event.date > new Date()` — throw `BadRequestException('Sự kiện đã diễn ra')` nếu quá hạn
- [x] Thêm `registration_deadline` (TIMESTAMP, nullable) vào entity `Event` và migration
- [x] Trong `registerUserForEvent`: kiểm tra `registration_deadline` nếu có — throw nếu quá deadline
- [x] Expose `max_capacity` và `registration_deadline` trong response của `GET /events` và `GET /clubs/:id`

### 1.2 Event — Phân loại Public / Members-Only

- [x] Thêm column `visibility` ENUM `('public', 'members_only')` default `'public'` vào entity `Event` và migration
- [x] Thêm `visibility` vào `CreateEventDto` / `UpdateEventDto`
- [x] Trong `registerUserForEvent`: nếu `visibility = 'members_only'`, kiểm tra user có membership `approved` trong club tổ chức event không — throw `ForbiddenException` nếu không
- [x] Expose `visibility` trong response API event

### 1.3 Membership — Giới hạn & Tự rời

- [x] Thêm endpoint `DELETE /memberships/leave/:clubId` — student tự rời club (xóa membership `approved` của chính mình)
- [x] Trong `createMembershipRequest`: đếm số membership `approved` + `pending` của user — throw `BadRequestException` nếu >= 3 (hoặc config N)
- [x] Trong `createMembershipRequest`: kiểm tra user chưa có membership (bất kỳ status) trong club đó — throw nếu đã tồn tại

### 1.4 Role — Cleanup khi xóa Club

- [x] Trong `ClubsService.remove`: sau khi xóa club, tìm owner cũ và set `role = 'user'` nếu họ không còn own club nào khác
- [x] Thêm guard trong `UsersController`: admin không thể `DELETE` hoặc hạ role chính mình — throw `ForbiddenException('Không thể xóa tài khoản admin đang đăng nhập')`

---

## Phase 2 — API còn thiếu cho Student

### 2.1 Endpoint "Sự kiện của tôi"

- [x] Thêm `GET /event-registrations/my-events` — trả về danh sách event user đã đăng ký (join với event + club), sắp xếp theo `event.date DESC`
- [x] Trả về đủ field: `eventId`, `eventName`, `clubName`, `date`, `location`, `status`, `registeredAt`

### 2.2 Endpoint "CLB của tôi"

- [x] Thêm `GET /memberships/my-clubs` — trả về tất cả membership của user hiện tại (mọi status: pending/approved/rejected)
- [x] Trả về đủ field: `clubId`, `clubName`, `clubImage`, `membershipStatus`, `requestDate`, `joinDate`

### 2.3 Profile cá nhân

- [x] Thêm `GET /users/me` — trả về thông tin user đang login (không trả `password`)
- [x] Thêm `PATCH /users/me` — user tự sửa `name`, `mssv` (không cho đổi `email`, `role`)
- [x] Thêm `PATCH /users/me/password` — đổi mật khẩu: nhận `currentPassword` + `newPassword`, verify bcrypt trước khi update

---

## Phase 3 — Kỹ thuật & API Design

### 3.1 Pagination

- [x] Tạo helper `PaginationDto` (`page: number`, `limit: number`, default page=1, limit=20)
- [x] Áp dụng pagination cho `GET /clubs` — trả về `{ data, total, page, limit }`
- [x] Áp dụng pagination cho `GET /events` — trả về `{ data, total, page, limit }`
- [x] Áp dụng pagination cho `GET /users` (admin) — trả về `{ data, total, page, limit }`
- [x] Áp dụng pagination cho `GET /memberships/request` (club owner)

### 3.2 Fix Bug isRegistered trên GET /events

- [x] Thêm `@UseGuards(OptionalJwtAuthGuard)` và `@Request() req` vào `GET /events` trong `EventsController`
- [x] Truyền `userId` vào `eventsService.findAll(status, userId)` — đã có logic, chỉ thiếu guard
- [x] Test lại: login → gọi `GET /events?status=approved` → `isRegistered` phải đúng

### 3.3 Security

- [x] Thêm `@UseGuards(JwtAuthGuard)` vào `POST /upload/image` — chặn upload ẩn danh
- [x] Validate file size tối đa (ví dụ 5MB) trong `FileInterceptor` filter
- [x] Thêm guard trong `EventsController.update`: kiểm tra event thuộc về club của owner đang login — chặn owner sửa event club khác

### 3.4 Email Notifications

- [x] Thêm `sendMembershipApprovedEmail(email, clubName)` vào `MailService`
- [x] Thêm `sendMembershipRejectedEmail(email, clubName)` vào `MailService`
- [x] Gọi mail trong `MembershipsService.updateMembershipRequest` sau khi update status
- [x] Thêm `sendEventApprovedEmail(ownerEmail, eventName)` — notify club_owner khi admin duyệt event

---

## Phase 4 — Swagger / OpenAPI Docs

- [x] Cài `@nestjs/swagger` và `swagger-ui-express`
- [x] Cấu hình `SwaggerModule.setup('api/docs', app, document)` trong `main.ts`
- [x] Thêm `@ApiTags(...)` cho từng controller
- [x] Thêm `@ApiBearerAuth()` cho các endpoint cần auth
- [x] Thêm `@ApiOperation({ summary: '...' })` cho các endpoint chính
- [x] Thêm `@ApiResponse(...)` cho các status code thường gặp (200, 201, 400, 401, 403, 404)
- [x] Thêm `@ApiProperty(...)` vào các DTO quan trọng (CreateEventDto, CreateMembershipDto, RegisterDto, PaginationDto)

---

## Phase 5 — Unit Test

- [ ] Cài `@nestjs/testing`, `jest` (đã có trong package.json, cần viết test)
- [ ] Viết test `AuthService.register` — happy path + email đã tồn tại
- [ ] Viết test `AuthService.login` — happy path + sai password + chưa verify
- [ ] Viết test `AuthService.verifyEmail` — token hợp lệ + token không tồn tại
- [ ] Viết test `EventRegistrationsService.registerUserForEvent` — happy path + trùng + event đã qua + đủ chỗ (sau khi thêm capacity)
- [ ] Viết test `MembershipsService.createMembershipRequest` — happy path + đã có membership

---

## Phase 6 — DevOps (Bonus cho CV)

- [ ] Tạo `.env.example` liệt kê đủ các biến môi trường cần thiết (không chứa giá trị thật)
- [ ] Tạo `Dockerfile` cho backend (node:20-alpine, multi-stage build)
- [ ] Tạo `docker-compose.yml` với services: `backend`, `postgres`
- [ ] Thêm `healthcheck` endpoint `GET /health` trả về `{ status: 'ok', timestamp }` — dùng cho Docker/K8s

---

## Checklist tổng kết

| Phase   | Nội dung                                                           | Độ khó        | Ưu tiên         |
| ------- | ------------------------------------------------------------------ | ------------- | --------------- |
| Phase 1 | Nghiệp vụ cốt lõi (capacity, visibility, leave club, role cleanup) | Trung bình    | 🔴 Cao          |
| Phase 2 | API còn thiếu cho student (my-events, my-clubs, profile)           | Dễ            | 🔴 Cao          |
| Phase 3 | Pagination + bug fix + security                                    | Dễ–Trung bình | 🟠 Cao          |
| Phase 4 | Swagger docs                                                       | Dễ            | 🟠 Trung bình   |
| Phase 5 | Unit test                                                          | Trung bình    | 🟡 Trung bình   |
| Phase 6 | Docker + .env.example                                              | Dễ            | 🟢 Thấp (bonus) |
