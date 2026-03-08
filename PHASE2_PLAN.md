# Kế hoạch Nâng cấp Hệ thống Quản lý CLB & Sự kiện UTH - Giai đoạn 2

Tài liệu này phác thảo kế hoạch chi tiết để triển khai các tính năng nghiệp vụ nâng cao cho hệ thống, tập trung vào tối ưu hóa quản lý và tăng tương tác cho sinh viên.

## Giai đoạn 1: Quản lý Điểm danh & Dữ liệu (Ưu tiên cao) ✅ HOÀN THÀNH

Mục tiêu: Xây dựng cơ chế xác nhận tham gia thực tế và hỗ trợ báo cáo văn phòng.

- [x] **Tính năng Điểm danh bằng mã QR (QR Check-in)**
  - [x] **Backend:** Cập nhật Entity `EventRegistration` thêm field `attended` (boolean) và `attendedAt`. (Done)
  - [x] **Backend:** Tạo logic sinh mã QR bảo mật cho mỗi sự kiện. (Done — `POST /event-registrations/:id/qr`)
  - [x] **Backend:** API điểm danh bằng code — `POST /event-registrations/:id/checkin` với `{ code }`.
  - [x] **Tính năng Điểm danh bằng mã QR (QR Check-in)**
  - [x] **Backend:** Cập nhật Entity `EventRegistration` thêm field `attended` (boolean) và `attendedAt`. (Done)
  - [x] **Backend:** Tạo logic sinh mã QR bảo mật cho mỗi sự kiện. (Done — `POST /event-registrations/:id/qr`)
  - [x] **Backend:** API điểm danh bằng code — `POST /event-registrations/:id/checkin` với `{ code }`.
  - [x] **Frontend (Club Owner):** Hiển thị mã QR tại trang quản lý chi tiết sự kiện để sinh viên quét. (Done)
  - [x] **Frontend (Student):** Tích hợp Camera Scanner để quét mã QR (Hiện tại mới chỉ có nhập mã thủ công).

- [x] **Quản lý Điểm rèn luyện (Activity Points)**
  - [x] **Backend:** Cập nhật Entity `Event` thêm field `points` (Điểm rèn luyện dự kiến). (Done)
  - [x] **Backend:** Logic tự động tính tổng điểm rèn luyện đã tích lũy — cộng điểm khi check-in thành công. (Done)
  - [x] **Backend:** `User.total_points` được trả về trong `GET /users/me`. (Done)
  - [x] **Backend:** `Event.points` được trả về trong `GET /events`. (Done)
  - [x] **Frontend:** Hiển thị điểm rèn luyện trên card sự kiện tại trang Danh sách sự kiện và Chi tiết CLB (Đã có trong Profile).

- [x] **Xuất báo cáo Excel (Export Data)**
  - [x] **Backend:** Cài đặt thư viện `exceljs` + `uuid` + `qrcode`. (Done)
  - [x] **Backend:** API xuất danh sách thành viên CLB — `GET /event-registrations/export/members?clubId=X`. (Done)
  - [x] **Backend:** API xuất danh sách điểm danh sự kiện — `GET /event-registrations/export/attendance/:id`. (Done)
  - [x] **Frontend (Club Owner):** Nút "Xuất Excel" danh sách tham gia sự kiện. (Done)
  - [x] **Frontend (Club Owner):** Nút "Xuất Excel" danh sách thành viên CLB tại trang Quản lý thành viên.
  - [x] **Frontend (Admin):** Nút "Xuất Excel" danh sách tham gia tại trang Quản lý sự kiện toàn hệ thống.

---

## Giai đoạn 2: Quản trị Nội bộ & Văn bản

Mục tiêu: Nâng cao hiệu quả quản lý đội ngũ thực hiện và quy trình thủ tục.

- [x] **Phân cấp vai trò trong CLB (Internal Roles)**
  - [x] **Backend:** Cập nhật `Membership` thêm `club_role` enum. (Done)
  - [x] **Backend:** `PATCH /memberships/:membershipId/role` — gán vai trò cho thành viên. (Done)
  - [x] **Backend:** `PATCH /memberships/roles/batch` — gán vai trò hàng loạt. (Done)
  - [x] **Backend:** `GET /memberships/roster/:clubId` — xem ban điều hành CLB (thành viên cũng xem được). (Done)
  - [x] **Backend:** `GET /memberships/members` trả về `club_role` và `total_points`. (Done)
  - [ ] **Backend:** Phân quyền API để cho phép Thư ký/Phó chủ nhiệm thực hiện một số thao tác thay Chủ nhiệm.
  - [x] **Frontend:** Trang quản lý vai trò cho thành viên trong dashboard của Club Owner. (Done)
  - [x] **Frontend:** Tối ưu Dashboard Club Owner: Hiển thị danh sách "Thành viên mới xin gia nhập" để duyệt nhanh.

- [x] **Quản lý Đề án & Tài liệu (Proposal Management)**
  - [x] **Backend:** `proposalUrl` field trong `Event` entity. (Done)
  - [x] **Backend:** `POST /memberships/upload/proposal` — upload file PDF đề án, trả về URL. (Done)
  - [x] **Backend:** `proposalUrl` được hỗ trợ trong `CreateEventDto` và `UpdateEventDto`. (Done)
  - [x] **Frontend:** Form tạo sự kiện cho phép đính kèm file kế hoạch chi tiết để Admin duyệt. (Done)
  - [x] **Frontend (Admin):** Hiển thị link xem Đề án PDF tại trang quản lý sự kiện. (Done)

## Giai đoạn 3: Tương tác & Trải nghiệm (Engagement)

Mục tiêu: Tăng cường giao tiếp giữa hệ thống và sinh viên.

- [x] **Hệ thống Thông báo (Notification System)**
  - [x] **Backend:** Tạo bảng `Notification` lưu trữ thông báo in-app. (Done)
  - [x] **Backend:** Đặt Trigger tại các Action quan trọng (Đơn được duyệt, Event mới, Nhận điểm rèn luyện). (Done)
  - [x] **Frontend:** Widget Thông báo (hình chuông) trên Navbar với trạng thái Đọc/Chưa đọc. (Done)

- [x] **Đánh giá & Phản hồi (Feedback & Survey)**
  - [x] **Backend:** Entity `EventFeedback` (Rating sao + Comment). (Done)
  - [x] **Backend:** API Gửi/Sửa/Xóa đánh giá (chỉ dành cho người đã điểm danh). (Done — `POST /feedback/:eventId`)
  - [x] **Backend:** API Lấy summary đánh giá sự kiện (rating trung bình, phân bổ sao). (Done — `GET /feedback/:eventId/summary`)
  - [x] **Frontend (Student):** Form gửi feedback sau khi sự kiện kết thúc. (Done)
  - [x] **Frontend (Club Owner):** Hiển thị thống kê đánh giá sự kiện. (Done)

---

## API Endpoints Mới (Giai đoạn 1)

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `POST` | `/event-registrations/:id/qr` | Club Owner / Admin | Tạo / Làm mới mã QR check-in |
| `POST` | `/event-registrations/:id/checkin` | User | Điểm danh bằng mã (body: `{code}`) |
| `GET`  | `/event-registrations/export/attendance/:id` | Club Owner / Admin | Xuất Excel danh sách điểm danh |
| `GET`  | `/event-registrations/export/members?clubId=X` | Club Owner / Admin | Xuất Excel danh sách thành viên CLB |

## API Endpoints Mới (Giai đoạn 2)

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `GET`  | `/memberships/roster/:clubId` | Member / Owner / Admin | Xem ban điều hành CLB với vai trò |
| `PATCH`| `/memberships/:membershipId/role` | Club Owner / Admin | Gán vai trò cho thành viên |
| `PATCH`| `/memberships/roles/batch` | Club Owner / Admin | Gán vai trò hàng loạt (body: `{updates:[{membershipId,role}]}`) |
| `POST` | `/memberships/upload/proposal` | Club Owner / Admin | Upload PDF đề án → trả về `{filename, url}` |

## API Endpoints Mới (Giai đoạn 3)

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `GET`  | `/notifications` | User | Lấy danh sách thông báo cá nhân |
| `PATCH`| `/notifications/read` | User | Đánh dấu đọc các thông báo (body: `{ids:[]}`) |
| `POST` | `/feedback/:eventId` | Student (Attended) | Gửi đánh giá sự kiện |
| `GET`  | `/feedback/:eventId/summary` | Public | Xem thống kê đánh giá của sự kiện |
| `GET`  | `/feedback/:eventId/detailed`| Club Owner / Admin | Xem chi tiết tất cả feedback của sự kiện |


## Ghi chú triển khai:
1. **Bảo mật:** Mã QR điểm danh cần có Logic chống gian lận (ví dụ: QR chỉ có hiệu lực theo tọa độ GPS hoặc trong khoảng thời gian nhất định).
2. **Hiệu năng:** Khi xuất Excel danh sách lớn, cần xử lý Stream dữ liệu để tránh treo Server.
3. **UX/UI:** Tiếp tục duy trì phong cách thiết kế Premium và các hiệu ứng Framer Motion đã xây dựng ở Giai đoạn 1.
