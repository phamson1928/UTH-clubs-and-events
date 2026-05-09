# 🔐 Danh Sách Tài Khoản Thử Nghiệm (Test Accounts)

Bạn có thể sử dụng bộ tài khoản dưới đây để kiểm thử toàn bộ các tính năng của hệ thống **UTH Clubs & Events**.

---

### 📊 Tóm tắt nhanh

| Vai trò | Email đăng nhập | Mật khẩu | Đặc quyền chính |
| :--- | :--- | :--- | :--- |
| **🛡️ Admin** | `admin@uth.edu.vn` | `Admin@123` | Toàn quyền hệ thống |
| **🏠 Club Owner** | `an.nguyen@uth.edu.vn` | `Owner@123` | Quản lý CLB & Sự kiện |
| **🎓 Student** | `quynh.ly@uth.edu.vn` | `Student@123` | Tham gia CLB & Sự kiện |

---

### 🛡️ 1. Quản trị viên (Admin)
- **Email:** `admin@uth.edu.vn`
- **Mật khẩu:** `Admin@123`
- **Khả năng:**
    - Quản lý danh sách tất cả các câu lạc bộ.
    - Duyệt/Từ chối các đề xuất sự kiện từ các CLB.
    - Xem báo cáo Analytics toàn hệ thống.
    - Cấu hình các thiết lập hệ thống chung.

### 🏠 2. Chủ câu lạc bộ (Club Owner)
- **Email:** `an.nguyen@uth.edu.vn` *(Hoặc bất kỳ email chủ CLB nào trong `seed.sql`)*
- **Mật khẩu:** `Owner@123`
- **Khả năng:**
    - Tạo, chỉnh sửa và xóa các bài viết/sự kiện của riêng CLB mình.
    - Duyệt đơn đăng ký tham gia CLB của sinh viên.
    - Xem danh sách thành viên và báo cáo hoạt động của CLB.

### 🎓 3. Sinh viên (Student)
- **Email:** `quynh.ly@uth.edu.vn`
- **Mật khẩu:** `Student@123`
- **Khả năng:**
    - Tìm kiếm CLB và đăng ký tham gia.
    - Đăng ký tham gia các sự kiện, nhận điểm rèn luyện và huy hiệu.
    - Bình luận, đánh giá và quản lý hồ sơ cá nhân.

---
> [!TIP]
> Bạn có thể tìm thêm danh sách các tài khoản khác trong tệp `database/seed.sql` nếu cần kiểm thử với nhiều dữ liệu hơn.