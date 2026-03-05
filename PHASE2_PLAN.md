# Kế hoạch Nâng cấp Hệ thống Quản lý CLB & Sự kiện UTH - Giai đoạn 2

Tài liệu này phác thảo kế hoạch chi tiết để triển khai các tính năng nghiệp vụ nâng cao cho hệ thống, tập trung vào tối ưu hóa quản lý và tăng tương tác cho sinh viên.

## Giai đoạn 1: Quản lý Điểm danh & Dữ liệu (Ưu tiên cao) ✅ HOÀN THÀNH

Mục tiêu: Xây dựng cơ chế xác nhận tham gia thực tế và hỗ trợ báo cáo văn phòng.

- [x] **Tính năng Điểm danh bằng mã QR (QR Check-in)**
  - [x] **Backend:** Cập nhật Entity `EventRegistration` thêm field `attended` (boolean) và `attendedAt`. (Done)
  - [x] **Backend:** Tạo logic sinh mã QR bảo mật cho mỗi sự kiện. (Done — `POST /event-registrations/:id/qr`)
  - [x] **Backend:** API điểm danh bằng code — `POST /event-registrations/:id/checkin` với `{ code }`.
  - [ ] **Frontend (Club Owner):** Hiển thị mã QR tại trang quản lý chi tiết sự kiện để sinh viên quét.
  - [ ] **Frontend (Student):** Giao diện quét mã (hoặc nhập mã manual) để xác nhận tham gia.

- [x] **Quản lý Điểm rèn luyện (Activity Points)**
  - [x] **Backend:** Cập nhật Entity `Event` thêm field `points` (Điểm rèn luyện dự kiến). (Done)
  - [x] **Backend:** Logic tự động tính tổng điểm rèn luyện đã tích lũy — cộng điểm khi check-in thành công. (Done)
  - [x] **Backend:** `User.total_points` được trả về trong `GET /users/me`. (Done)
  - [x] **Backend:** `Event.points` được trả về trong `GET /events`. (Done)
  - [ ] **Frontend:** Hiển thị điểm rèn luyện trên card sự kiện và trong Profile cá nhân.

- [x] **Xuất báo cáo Excel (Export Data)**
  - [x] **Backend:** Cài đặt thư viện `exceljs` + `uuid` + `qrcode`. (Done)
  - [x] **Backend:** API xuất danh sách thành viên CLB — `GET /event-registrations/export/members?clubId=X`. (Done)
  - [x] **Backend:** API xuất danh sách điểm danh sự kiện — `GET /event-registrations/export/attendance/:id`. (Done)
  - [ ] **Frontend:** Thêm các nút "Xuất Excel" trực quan tại trang quản lý CLB và quản lý sự kiện.

---

## Giai đoạn 2: Quản trị Nội bộ & Văn bản

Mục tiêu: Nâng cao hiệu quả quản lý đội ngũ thực hiện và quy trình thủ tục.

- [ ] **Phân cấp vai trò trong CLB (Internal Roles)**
  - [x] **Backend:** Cập nhật `Membership` hoặc tạo bảng `Role` nội bộ (Phó chủ nhiệm, Thư ký, Trưởng ban...). (Done)
  - [ ] **Backend:** Phân quyền API để cho phép Thư ký/Phó chủ nhiệm thực hiện một số thao tác thay Chủ nhiệm.
  - [ ] **Frontend:** Trang quản lý vai trò cho thành viên trong dashboard của Club Owner.

- [ ] **Quản lý Đề án & Tài liệu (Proposal Management)**
  - [x] **Backend:** Hỗ trợ upload và lưu trữ file PDF đề án sự kiện (`proposalUrl`). (Database field added)
  - [ ] **Frontend:** Form tạo sự kiện cho phép đính kèm file kế hoạch chi tiết để Admin duyệt.

## Giai đoạn 3: Tương tác & Trải nghiệm (Engagement)

Mục tiêu: Tăng cường giao tiếp giữa hệ thống và sinh viên.

- [ ] **Hệ thống Thông báo (Notification System)**
  - [ ] **Backend:** Tạo bảng `Notification` lưu trữ thông báo in-app.
  - [ ] **Backend:** Đặt Trigger tại các Action quan trọng (Đơn được duyệt, Event mới, Nhắc lịch sự kiện).
  - [ ] **Frontend:** Widget Thông báo (hình chuông) trên Navbar với trạng thái Đọc/Chưa đọc.

- [ ] **Đánh giá & Phản hồi (Feedback & Survey)**
  - [ ] **Backend:** Entity `EventFeedback` (Rating sao + Comment).
  - [ ] **Frontend:** Form gửi feedback sau khi sự kiện kết thúc (chỉ dành cho những người đã Check-in).

---

## API Endpoints Mới (Giai đoạn 1)

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `POST` | `/event-registrations/:id/qr` | Club Owner / Admin | Tạo / Làm mới mã QR check-in |
| `POST` | `/event-registrations/:id/checkin` | User | Điểm danh bằng mã (body: `{code}`) |
| `GET`  | `/event-registrations/export/attendance/:id` | Club Owner / Admin | Xuất Excel danh sách điểm danh |
| `GET`  | `/event-registrations/export/members?clubId=X` | Club Owner / Admin | Xuất Excel danh sách thành viên CLB |

## Ghi chú triển khai:
1. **Bảo mật:** Mã QR điểm danh cần có Logic chống gian lận (ví dụ: QR chỉ có hiệu lực theo tọa độ GPS hoặc trong khoảng thời gian nhất định).
2. **Hiệu năng:** Khi xuất Excel danh sách lớn, cần xử lý Stream dữ liệu để tránh treo Server.
3. **UX/UI:** Tiếp tục duy trì phong cách thiết kế Premium và các hiệu ứng Framer Motion đã xây dựng ở Giai đoạn 1.
