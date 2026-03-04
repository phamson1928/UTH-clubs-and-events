# UTH Clubs & Events — System Review

> Ngày đánh giá: 03/03/2026

---

## 1. Những gì đã hoàn thiện ✅

| Nhóm                    | Chi tiết                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------ |
| **Auth**                | Register, Login, Verify email, Forgot/Reset password, JWT, Rate limiting (throttler) |
| **Roles**               | 3 role hoạt động đúng: `admin`, `club_owner`, `user` — guard + decorator             |
| **Clubs**               | CRUD đầy đủ (admin), list + detail (public), member count                            |
| **Events**              | CRUD, workflow duyệt pending → approved/rejected (admin), filter by status           |
| **Memberships**         | Xin vào club, duyệt/từ chối (club_owner/admin), xóa thành viên                       |
| **Event Registrations** | Đăng ký / hủy đăng ký event, `attending_users_number` tự động tăng/giảm              |
| **Statistics**          | Dashboard admin + club owner, charts tăng trưởng events/users theo năm               |
| **Upload**              | Ảnh lên Supabase Storage                                                             |
| **Mail**                | Xác thực email, forgot password                                                      |

---

## 2. Thiếu sót cần xử lý ❌

### 2.1 Frontend — Student (thiếu nhiều nhất)

| Tính năng                   | Ghi chú                                                                     |
| --------------------------- | --------------------------------------------------------------------------- |
| Trang **"Sự kiện của tôi"** | Không có trang liệt kê event đã đăng ký; backend chưa có endpoint tương ứng |
| Trang **"CLB của tôi"**     | Không xem được status đơn xin vào club của bản thân (pending/approved)      |
| **Nút hủy đăng ký event**   | Backend đã có `DELETE /event-registrations/:id/cancel`, frontend chưa dùng  |
| **Profile cá nhân**         | Không có trang xem/sửa thông tin (tên, MSSV, đổi mật khẩu)                  |
| **Tìm kiếm / lọc event**    | Trang chủ student không filter event được theo tên, danh mục, ngày          |

### 2.2 Frontend — Club Owner

| Tính năng                          | Ghi chú                                                              |
| ---------------------------------- | -------------------------------------------------------------------- |
| **Danh sách người tham gia event** | Backend có `GET /event-registrations/:id/participants`, UI chưa dùng |
| **Thông báo đơn mới**              | Không có badge/notification khi có sinh viên xin vào club            |

### 2.3 Backend — Toàn hệ thống

| Vấn đề                                     | Ghi chú                                                                                                                                               |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pagination**                             | Tất cả list API trả về nguyên bảng — khi data lớn sẽ chậm. Cần thêm `?page=&limit=`                                                                   |
| **`attending_users_number` desync**        | Seed data đặt giá trị giả (200, 120…) không khớp với số rows thực trong `event_registrations`. Nên tính bằng `COUNT` query hoặc đồng bộ qua migration |
| **Refresh token**                          | JWT hết hạn → user bị đá ra không báo. Cần silent refresh hoặc intercept 401                                                                          |
| **Notification / Email duyệt đơn**         | Không gửi mail khi membership được approved/rejected                                                                                                  |
| **Global error boundary**                  | Frontend không có error boundary — crashed component làm trắng cả trang                                                                               |
| **Backend `GET /events` thiếu auth guard** | `userId` lấy từ `req?.user?.id` nhưng route không dùng `OptionalJwtAuthGuard` → `isRegistered` luôn `false` với user đã login ở trang chủ             |

### 2.4 Security nhỏ

| Vấn đề                          | Ghi chú                                                   |
| ------------------------------- | --------------------------------------------------------- |
| **Upload không auth**           | `POST /upload/image` không yêu cầu JWT — ai cũng gọi được |
| **Club owner tự approve event** | Đã strip `status` ở backend, nhưng chưa có test bảo vệ    |

---

## 3. Đánh giá cho CV Intern Backend

### 3.1 Điểm mạnh

- **RESTful NestJS API** với module hóa rõ ràng (auth, clubs, events, memberships, statistics, upload)
- **JWT authentication + role-based authorization** chuẩn — guard + decorator pattern
- **TypeORM** với relations, QueryBuilder, batch query tránh N+1
- **Rate limiting** chống brute-force (throttler)
- **Email verification + reset password** flow đúng chuẩn (token 1 lần, expire 15 phút)
- **Supabase Storage** cho upload file — tách biệt storage khỏi server
- **Statistics API** với aggregation query (GROUP BY tháng, COUNT) cho chart

### 3.2 Còn yếu — nên bổ sung trước khi đưa vào CV

| Thiếu                     | Ảnh hưởng đến CV                                                             |
| ------------------------- | ---------------------------------------------------------------------------- |
| Pagination (`page/limit`) | Kỹ năng design API chuẩn REST — **very common** trong interview              |
| Unit test / E2E test      | Folder `test/` gần như trống — nên có ít nhất 1–2 test case mẫu              |
| Swagger / OpenAPI docs    | `@nestjs/swagger` — docs tự động, dễ demo khi interview                      |
| `.env.example`            | Không có — thiếu good practices về config management                         |
| Database migration clean  | File migration chỉ có 1 — nên có migration đầy đủ thay vì dùng seed thủ công |

### 3.3 Gợi ý thêm để CV nổi hơn

1. **Thêm Swagger** (`@nestjs/swagger`) — 1–2 giờ setup, tạo ấn tượng rất tốt khi demo
2. **Pagination** cho `GET /clubs`, `GET /events`, `GET /users` — pattern chuẩn cursor-based hoặc offset
3. **Thêm ít nhất 3 unit test** cho `AuthService` (register, login, verifyEmail) — chứng minh biết test
4. **WebSocket / SSE** cho notification real-time (nâng cao) — xuất sắc nếu làm được
5. **Docker Compose** — backend + PostgreSQL — deploy dễ dàng, cộng điểm mạnh

---

## 4. Tóm tắt mức độ sẵn sàng

| Tiêu chí          | Mức      | Ghi chú                                |
| ----------------- | -------- | -------------------------------------- |
| Chức năng core    | ⭐⭐⭐⭐ | Đầy đủ, hoạt động                      |
| Code quality      | ⭐⭐⭐   | Cấu trúc tốt, thiếu test               |
| Production-ready  | ⭐⭐     | Thiếu pagination, error handling, docs |
| CV intern backend | ⭐⭐⭐⭐ | Đủ để nộp — nên thêm Swagger + test    |

> **Kết luận:** Đây là project đủ mạnh để đưa vào CV intern backend. Nên hoàn thiện thêm Swagger + 1 vài test + pagination trước khi nộp để tạo ấn tượng tốt khi được hỏi sâu về API design.

---

## 5. Phân tích Nghiệp vụ (Business Logic)

### 5.1 Luồng nghiệp vụ đã đúng ✅

| Luồng                               | Mô tả                                                                    | Trạng thái |
| ----------------------------------- | ------------------------------------------------------------------------ | ---------- |
| **Tạo club**                        | Chỉ admin tạo được, tự động nâng role ownerId thành `club_owner`         | ✅ Đúng    |
| **Xin vào club**                    | Student nộp đơn → club_owner duyệt/từ chối → `pending/approved/rejected` | ✅ Đúng    |
| **Tạo event**                       | Club_owner tạo → admin duyệt → `pending/approved/rejected`               | ✅ Đúng    |
| **Club_owner không tự duyệt event** | Backend strip field `status` trong PATCH của club_owner                  | ✅ Đúng    |
| **Đăng ký event**                   | Chỉ event `approved` mới đăng ký được, tự tăng `attending_users_number`  | ✅ Đúng    |
| **Không đăng ký trùng**             | Unique constraint `(eventId, userId)` ở DB                               | ✅ Đúng    |
| **Xóa club → cascade**              | Membership, event, registration theo xóa — FK CASCADE                    | ✅ Đúng    |
| **Email verify trước login**        | Kiểm tra `isVerified` trước khi cấp JWT                                  | ✅ Đúng    |
| **Reset token dùng 1 lần**          | Token xóa sau khi reset thành công, expire 15 phút                       | ✅ Đúng    |

### 5.2 Quy tắc nghiệp vụ còn thiếu hoặc chưa xử lý ❌

#### Về Membership

| Thiếu                                                      | Hệ quả thực tế                                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Không giới hạn số club mỗi user**                        | Student có thể xin vào 50 club cùng lúc — vô lý                                       |
| **User đã là club_owner vẫn xin vào club khác làm member** | Không bị chặn ở backend                                                               |
| **Không có luồng "rời club" cho student**                  | Chỉ admin/owner xóa được member, student không tự rời được                            |
| **Membership không có ngày hết hạn**                       | Thực tế theo kỳ học — không có auto-expire                                            |
| **Thay owner club**                                        | Admin đổi ownerId → role cũ về `user`, đúng. Nhưng thành viên cũ không được thông báo |

#### Về Event

| Thiếu                                         | Hệ quả thực tế                                                                            |
| --------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Không có giới hạn số chỗ (capacity)**       | Event nào cũng đăng ký không giới hạn — phi thực tế                                       |
| **Không có deadline đăng ký**                 | Đăng ký sau khi event đã diễn ra vẫn cho phép                                             |
| **Không phân biệt "đã diễn ra" vs "sắp tới"** | Logic hoàn toàn dựa vào `status=approved`, không kiểm tra `date < now()`                  |
| **Không có trạng thái `canceled`**            | Entity có field `canceled` nhưng không có endpoint/flow để hủy event                      |
| **Attending ≠ Attended**                      | `attending_users_number` là số đăng ký, không phải số thực sự tham dự — không có check-in |
| **Student ngoài club vẫn đăng ký event được** | Một số event nên chỉ dành cho thành viên club — không có rule này                         |

#### Về User / Role

| Thiếu                            | Hệ quả thực tế                                                       |
| -------------------------------- | -------------------------------------------------------------------- |
| **Không thể hạ role club_owner** | Nếu xóa club thì sao? Owner mất club nhưng vẫn giữ role `club_owner` |
| **Admin tự xóa chính mình**      | Không có guard ngăn admin xóa account chính mình                     |
| **Không có audit log**           | Không ghi lại ai duyệt đơn nào, khi nào — không truy vết được        |

### 5.3 So sánh với hệ thống thật

| Tiêu chí             | Hệ thống hiện tại | Hệ thống thật cần                       |
| -------------------- | ----------------- | --------------------------------------- |
| Quản lý số chỗ event | Không có          | `max_capacity`, tự động đóng khi đủ     |
| Deadline đăng ký     | Không có          | `registration_deadline` field           |
| Xác nhận tham dự     | Chỉ đăng ký       | Check-in / QR code                      |
| Thông báo            | Chỉ verify email  | Push notification / email khi có update |
| Lịch sử hoạt động    | Không có          | Activity log per user/club              |
| Kỳ học (semester)    | Không có          | Membership theo kỳ, event theo kỳ       |
| Phí thành viên       | Không có          | Phí đóng CLB, quản lý thu chi           |

### 5.4 Đề xuất ưu tiên bổ sung nghiệp vụ

> Sắp xếp theo mức độ ảnh hưởng thực tế và độ khó implement:

1. **[Dễ - Quan trọng]** Thêm `max_capacity` vào Event — block đăng ký khi đủ chỗ
2. **[Dễ - Quan trọng]** Kiểm tra `event.date > now()` trước khi cho đăng ký
3. **[Dễ]** Student tự rời club — `DELETE /memberships/leave/:clubId`
4. **[Trung bình]** Giới hạn mỗi user chỉ là member của tối đa N club
5. **[Trung bình]** Phân loại event: `public` (ai cũng đăng ký) vs `members-only` (chỉ thành viên club)
6. **[Trung bình]** Hạ role owner về `user` khi club bị xóa (hiện chưa xử lý)
7. **[Khó - Nâng cao]** Check-in event bằng mã xác nhận (QR / token)
8. **[Khó - Nâng cao]** Semester-based membership với auto-expiry
