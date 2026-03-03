# Bug Tracker — UTH Club Backend & Frontend

> Cập nhật: 03/03/2026 (Critical + High + Medium Backend + Medium Frontend + Low fixes applied)  
> Legend: 🔴 Critical · 🟠 High · 🟡 Medium · 🟢 Low

---

## 🔴 CRITICAL

### Backend

- [x] 🔴 **[memberships.service.ts L88]** Runtime crash: `membership.user.id` trên `undefined` — `repository.create()` không khởi tạo relation objects, gây `TypeError: Cannot set properties of undefined`
- [x] 🔴 **[membership.entity.ts L26]** `join_date` là `@Column()` non-nullable nhưng pending request không có value → DB NOT NULL constraint violation mỗi lần insert
- [x] 🔴 **[app.module.ts L33]** **SMTP App Password hardcode trong source code** (`pass: 'dvdg qjpp hpdz zdxj'`) — phải chuyển sang biến môi trường ngay
- [x] 🔴 **[app.module.ts L52]** `synchronize: true` trong TypeORM config — có thể tự động xóa/thay đổi cột khi khởi động, gây mất dữ liệu trên production
- [x] 🔴 **[jwt.strategy.ts L29]** Fallback JWT secret `'change-me'` — nếu `JWT_SECRET` không có trong env, bất kỳ ai cũng có thể forge token hợp lệ
- [x] 🔴 **[jwt.strategy.ts L34]** `validate()` trả về toàn bộ User entity kể cả `password` hash → `req.user.password` bị set trên mọi authenticated request
- [x] 🔴 **[main.ts]** Không có global `ValidationPipe` → tất cả `@IsNotEmpty()`, `@IsEmail()`, `@MinLength()` trong DTOs **đều không có tác dụng**, mọi payload đều được chấp nhận
- [x] 🔴 **[auth.service.ts L86]** `return { user, token }` trả về `user.password` (bcrypt hash) trong login response
- [x] 🔴 **[user.entity.ts]** `password` column thiếu `select: false` → mọi `find()` trên User đều trả về password hash
- [x] 🔴 **[events.controller.ts L58]** Club owner có thể tự approve event của mình — `PATCH /events/:id` với `UpdateEventDto` chứa `status`, bypass admin-only workflow
- [x] 🔴 **[users.controller.ts L63]** Club owner có thể edit email của **bất kỳ user nào** trong hệ thống — không có scope check
- [x] 🔴 **[clubs.controller.ts L27]** `GET /clubs/:id` không có `JwtAuthGuard` → `req.user` luôn `undefined`, `isRegistered` luôn trả về `false`
- [x] 🔴 **[auth.controller.ts]** Không có rate limiting trên `/login`, `/register`, `/forgot-password`, `/reset-password` → vulnerable to brute-force

### Frontend

- [x] 🔴 **[App.tsx]** Không có Route Guard nào — mọi route `/admin/...`, `/club-owner/...` đều public, không cần đăng nhập hoặc đúng role

---

## 🟠 HIGH

### Backend

- [x] 🟠 **[memberships.service.ts L64]** `findUsersWithoutClub()` query `WHERE club.id IS NULL` trên bảng `Membership` → luôn trả về rỗng vì FK không bao giờ NULL
- [x] 🟠 **[memberships.service.ts L73]** `addUserToClub` save `userId`/`clubId` như plain property trên relation entity — nên dùng `user: { id: userId }`, `club: { id: clubId }`
- [x] 🟠 **[memberships.service.ts]** Không kiểm tra duplicate membership → user có thể gửi nhiều pending request cho cùng một club
- [x] 🟠 **[memberships.service.ts L120]** `getMemberInClub()` không filter theo `status` → trả về cả pending và rejected members
- [x] 🟠 **[memberships.controller.ts L34+]** `@Param` values là string nhưng typed là `number` — thiếu `ParseIntPipe` ở toàn bộ controller
- [x] 🟠 **[auth.service.ts L44]** JWT được cấp ngay sau register, không cần verify email → unverified user có thể authenticate
- [x] 🟠 **[auth.service.ts L67]** Login không kiểm tra `user.isVerified` → unverified/banned user vẫn đăng nhập được
- [x] 🟠 **[auth.controller.ts L28,34]** `forgotPassword` và `resetPassword` dùng raw `@Body('field')` thay vì DTO → không có email format check, không có password length check
- [x] 🟠 **[clubs.service.ts L88]** Khi đổi chủ club, owner cũ không bị revert role từ `club_owner` về `user`
- [x] 🟠 **[clubs.service.ts L23]** `create()` không verify `ownerId` tồn tại → DB foreign key constraint error không có friendly response
- [x] 🟠 **[clubs.controller.ts]** Không có `POST /clubs` route — `ClubsService.create()` tồn tại nhưng không được expose
- [x] 🟠 **[club.entity.ts L31]** `club_image` là `@Column()` non-nullable → tạo club không có ảnh sẽ crash
- [x] 🟠 **[events.service.ts L48]** N+1 query trong `findAll` — mỗi event phát sinh một DB query riêng để check registration status
- [x] 🟠 **[clubs.service.ts L57]** N+1 query trong `findOne` — mỗi event của club phát sinh một DB query riêng
- [x] 🟠 **[event.entity.ts]** `event_image` là `@Column()` non-nullable → tạo event không có ảnh sẽ crash
- [x] 🟠 **[event.entity.ts]** Thiếu `@OneToMany` inverse relation đến `EventRegistration`
- [x] 🟠 **[event_registrations.service.ts L30]** Race condition trong check duplicate registration — check-then-insert không atomic, unique constraint violation sẽ trả về 500 thay vì 409
- [x] 🟠 **[event_registration.entity.ts L19]** `@ManyToOne(() => Event, (event) => event.id)` — `event.id` là column, không phải relation property → TypeORM navigation bị broken
- [x] 🟠 **[users.service.ts]** `findByEmail()` trả về password hash — không có `{ select: false }` hoặc explicit field selection
- [x] 🟠 **[users.controller.ts]** Password hashing logic nằm trong controller thay vì service → nếu `UsersService.create()` được gọi trực tiếp, password lưu plain text

### Frontend

- [x] 🟠 **[Login.tsx, Register.tsx, ForgotPassword.tsx, ResetPassword.tsx]** Dead error-handling code: `if (!res.data) { const data = await res.data; }` — `res.data` không phải Promise, code không bao giờ chạy (copy-paste sai từ `fetch()` pattern)
- [x] 🟠 **[admin/Requests.tsx]** Toàn bộ trang là fake — data hardcode, nút Approve/Reject không có `onClick`, textarea không có state, route `/admin/requests` không đăng ký trong App.tsx
- [x] 🟠 **[club-owner/Members.tsx L290]** Crash khi `member.name` là `null/undefined`: `m.name.toLowerCase()` → `TypeError`
- [x] 🟠 **[club-owner/Applications.tsx L145]** Crash khi `app.name` là `undefined`: `app.name.split(" ")` → `TypeError`
- [x] 🟠 **[club-owner/Events.tsx L237]** Nút "Edit" event không có `onClick` — click không làm gì
- [x] 🟠 **[club-owner/Members.tsx L453]** Dialog "Add Member" không có nút Confirm/Submit — `handleAddMember()` có nhưng không được gọi từ đâu
- [x] 🟠 **[club-owner/Requests.tsx L107]** Event creation payload sai — gửi `title` thay vì `name`, gửi `event_date`+`event_time` riêng thay vì ISO date → event được tạo với `name = null`

---

## 🟡 MEDIUM

### Backend

- [x] 🟡 **[memberships.service.ts L110]** `join_date = undefined` khi reject → TypeORM có thể cố set NULL trên non-nullable column, gây DB constraint error
- [x] 🟡 **[memberships.controller.ts L78]** Route ordering: `DELETE :id` khai báo trước `DELETE members/:id` → `members` có thể bị bắt bởi route trên
- [ ] 🟡 **[memberships.controller.ts L27]** `clubId` lấy từ JWT payload — nếu admin đổi club owner, JWT cũ vẫn dùng `clubId` cũ cho đến khi hết hạn
- [x] 🟡 **[membership.entity.ts L37]** `status` không có DB-level enum constraint — plain `varchar`, bất kỳ string nào đều có thể lưu được
- [x] 🟡 **[create-membership.dto.ts]** `userId` và `clubId` có trong DTO public fields → user có thể gửi `userId` khác để submit request thay mặt người khác
- [x] 🟡 **[clubs.service.ts L93]** `throw new Error(...)` thay vì `throw new NotFoundException(...)` → NestJS trả về 500 thay vì 404
- [x] 🟡 **[clubs.service.ts L28]** `findAll()` load toàn bộ member objects và count cả pending/rejected trong member count
- [x] 🟡 **[events.service.ts L85]** `updateAttendingUsersNumber()` là dead code — không được gọi ở đâu, logic không atomic (race condition)
- [x] 🟡 **[events.controller.ts]** `@Param('id')` thiếu `ParseIntPipe` — `@Patch(':id')` với id = `'approved'` → `NaN`
- [x] 🟡 **[auth.service.ts L29]** `console.log('Checking email:', normalizedEmail)` — logs user email ra stdout, information leak trong production
- [x] 🟡 **[auth.service.ts L104]** User enumeration qua `forgotPassword` — trả `NotFoundException` nếu email không tồn tại → attacker biết email nào đã đăng ký
- [x] 🟡 **[auth.service.ts L125]** `resetPassword` không có password strength check — `newPassword` được chấp nhận không giới hạn
- [x] 🟡 **[users.service.ts L75]** `clearResetToken()` set `resetTokenExpires = new Date()` thay vì `null` — column là `nullable: true`, nên pass `null`
- [x] 🟡 **[users.controller.ts L53]** `@Post('admin/edit/:id')` dùng `@Post` cho partial update — vi phạm REST convention, nên là `@Patch`
- [x] 🟡 **[users.controller.ts]** `@Param('id')` thiếu `ParseIntPipe` xuyên suốt controller
- [x] 🟡 **[user.entity.ts]** `role` column không có DB-level enum constraint
- [x] 🟡 **[event_registrations.service.ts]** Không có endpoint cancel/unregister và decrement `attending_users_number`
- [x] 🟡 **[event_registration.entity.ts]** Tất cả properties đều `optional` (`id?`, `event?`, `user?`) — không cần thiết, làm yếu type safety
- [x] 🟡 **[statistics.service.ts L153]** `getMemberDashboardStatistics` đếm tất cả users kể cả unverified và admin — nên filter `role = 'user' AND isVerified = true`
- [x] 🟡 **[statistics.controller.ts L39+]** `@Query('year') year: number` — query param luôn là string, thiếu `ParseIntPipe`
- [x] 🟡 **[app.module.ts]** `MailerModule` khai báo trước `ConfigModule` → env vars chưa chắc được load khi mailer khởi tạo
- [x] 🟡 **[main.ts L18]** CORS origin hardcode `'http://localhost:5173'` → production deployment sẽ reject mọi cross-origin request
- [x] 🟡 **[main.ts]** Không có `helmet()`, không có rate limiting ở app level
- [x] 🟡 **[data-source.ts]** `synchronize: false` ở CLI datasource mâu thuẫn với `synchronize: true` ở `app.module.ts` → migrations và auto-sync xung đột nhau
- [x] 🟡 **[jwt.strategy.ts L33]** DB query trên mỗi authenticated request (`findByEmail`) — không có caching, bottleneck dưới load

### Frontend

- [x] 🟡 **[pages/auth/Login.tsx L57]** Login redirect về `/` cho mọi role — admin và club owner luôn bị drop vào student home
- [x] 🟡 **[pages/auth/Register.tsx L43]** Dùng `alert()` để thông báo mật khẩu không khớp thay vì error state
- [x] 🟡 **[pages/student/ClubDetail.tsx L453]** Dùng `alert()` cho join-club form thay vì `toast()` như phần còn lại của app
- [x] 🟡 **[Navbar.tsx L24]** Auth state chỉ đọc từ localStorage 1 lần lúc mount — không reactive khi login/logout từ tab khác
- [x] 🟡 **[admin/Events.tsx L205]** `setError()` khi approve/reject thất bại sẽ replace toàn bộ trang bằng full-screen error, không có cách dismiss
- [x] 🟡 **[pages/student/ClubDetail.tsx L282]** Email và MSSV của member hiển thị public — nếu API trả data cho unauthenticated user, thông tin sinh viên bị lộ
- [x] 🟡 **[club-owner/Dashboard.tsx L60]** JWT decode dùng `atob()` thô không fix base64url padding → có thể throw `DOMException` với một số token
- [x] 🟡 **[pages/student/Home.tsx L136]** Hero search chỉ `console.log`, các nút CTA ("Khám Phá", "Tham Gia CLB", v.v.) không có `onClick` handler
- [x] 🟡 **[pages/student/Home.tsx L66]** Stats ("52 CLB", "2,847 Thành viên", v.v.) hardcode, không phản ánh dữ liệu thực từ DB
- [x] 🟡 **[components/SearchAndFilters.tsx L44]** Danh mục filter hardcode `["Technology", "Arts", "Sports", "Music"]`, không match với danh mục thực của clubs
- [x] 🟡 **[admin/Users.tsx L165]** Sau khi PATCH thành công, local state được update bằng `currentUser` pre-edit thay vì `res.data` → hiển thị stale data
- [x] 🟡 **[admin/Clubs.tsx L84]** `GET /clubs` fetch không có auth headers trong khi `GET /users` có — inconsistent
- [x] 🟡 **[pages/auth/Register.tsx L78]** Redirect đến `/login?registered=true` nhưng Login page không đọc query param này — không có success message
- [x] 🟡 **[Navbar.tsx L113]** Notification bell luôn hiện red dot — không có API call, không có notification state
- [x] 🟡 **[pages/auth/ForgotPassword.tsx]** Sau khi submit thành công, form vẫn active và có thể submit lại nhiều lần
- [x] 🟡 **`API_BASE` duplicated]** `const API_BASE = ...` copy-paste trong ~10 file — thư mục `services/` trống rỗng, không có axios client chung

---

## 🟢 LOW

- [x] 🟢 **[common/guards/roles.guard.ts]** Magic string `'roles'` không dùng shared constant với `roles.decorator.ts` — nếu một bên thay đổi, authorization silently break
- [x] 🟢 **[common/decorators/roles.decorator.ts]** Tương tự — nên export `ROLES_KEY = 'roles'` dùng chung
- [x] 🟢 **[admin/Users.tsx L57]** `type UserRole = "ADMIN" | "CLUB_LEADER" | "STUDENT"` định nghĩa nhưng không bao giờ dùng, và conflict với actual values (`"admin"`, `"user"`, `"club_owner"`)
- [x] 🟢 **[admin/Users.tsx L136]** `const res = await axios.delete(...)` — `res` được assign nhưng không bao giờ đọc (unused variable)
- [x] 🟢 **[Navbar.tsx L136]** Dropdown items "Profile" và "Settings" không có `onClick` — click không làm gì
- [x] 🟢 **[admin/Users.tsx L65+]** `active: true` trong sidebar links không có tác dụng gì trong component `Sidebar`
- [x] 🟢 **[pages/student/ClubDetail.tsx L432]** Inline `async` function trong `onSubmit` JSX — recreate mỗi render, nên extract thành named function `handleJoinClub`
- [x] 🟢 **[Dashboard.tsx, Events.tsx, Members.tsx]** `useEffect` thiếu `navigate` trong dependency array — lint violation (exhaustive-deps)

---

## Thống kê

| Mức độ      | Số lượng                                                                |
| ----------- | ----------------------------------------------------------------------- |
| 🔴 Critical | ~~14~~ **0 (tất cả đã fix)**                                            |
| 🟠 High     | ~~27~~ **0 (tất cả đã fix)**                                            |
| 🟡 Medium   | ~~41~~ **1 còn lại (40 đã fix, 1 deferred: memberships JWT staleness)** |
| 🟢 Low      | ~~8~~ **0 (tất cả đã fix)**                                             |
| **Tổng**    | **76**                                                                  |
