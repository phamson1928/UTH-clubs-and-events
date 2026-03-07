-- =============================================================================
-- SEED DATA — UTH Clubs & Events
-- Ngày tạo: 03/03/2026
-- Mô tả: Dữ liệu mẫu đầy đủ, đa dạng cho môi trường dev/test.
--
-- Mật khẩu mặc định:
--   admin        → Admin@123
--   club_owner   → Owner@123
--   user (SV)    → Student@123
--
-- Thứ tự chạy (tránh FK violation):
--   1. user
--   2. club
--   3. membership
--   4. event
--   5. event_registrations
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 0. TRUNCATE (reset sạch trước khi seed)
-- ---------------------------------------------------------------------------
TRUNCATE TABLE
  event_registrations,
  membership,
  event,
  club,
  "user"
RESTART IDENTITY CASCADE;

-- ===========================================================================
-- 1. USERS
-- ===========================================================================
-- 1 admin · 12 club_owner · 27 sinh viên (user)
-- Tất cả isVerified = true để có thể đăng nhập ngay
-- Hash: Admin@123 / Owner@123 / Student@123 (bcrypt cost=10)
-- ===========================================================================

INSERT INTO "user"
  (id, name, email, password, role, mssv, "isVerified", "verificationToken", "createdAt", "resetToken", "resetTokenExpires", "total_points")
VALUES

-- ── Admin ──────────────────────────────────────────────────────────────────
(1,
 'Admin UTH',
 'admin@uth.edu.vn',
 '$2b$10$NomkQzY13MmquY9.8A3vVuyeqoSbL/vjf/qifSADqZgb8NMO3bt66',
 'admin',
 NULL,
 TRUE, NULL,
 '2025-08-01 07:00:00',
 NULL, NULL, 0),

-- ── Club Owners (id 2–13) ──────────────────────────────────────────────────
(2,
 'Nguyễn Văn An',
 'an.nguyen@uth.edu.vn',
 '$2b$10$cxPKBmPtPFYCA0ph6YgvPupLeX9Y0JrR4QK3Y2uvKKl1x6diAsJka',
 'club_owner',
 'SV2021001',
 TRUE, NULL,
 '2025-08-05 08:00:00',
 NULL, NULL, 0),

(3,
 'Trần Thị Bình',
 'binh.tran@uth.edu.vn',
 '$2b$10$cxPKBmPtPFYCA0ph6YgvPupLeX9Y0JrR4QK3Y2uvKKl1x6diAsJka',
 'club_owner',
 'SV2021002',
 TRUE, NULL,
 '2025-08-05 08:10:00',
 NULL, NULL, 0),

(4,
 'Lê Hoàng Cường',
 'cuong.le@uth.edu.vn',
 '$2b$10$cxPKBmPtPFYCA0ph6YgvPupLeX9Y0JrR4QK3Y2uvKKl1x6diAsJka',
 'club_owner',
 'SV2021003',
 TRUE, NULL,
 '2025-08-06 08:00:00',
 NULL, NULL, 0),

(5,
 'Phạm Minh Đức',
 'duc.pham@uth.edu.vn',
 '$2b$10$cxPKBmPtPFYCA0ph6YgvPupLeX9Y0JrR4QK3Y2uvKKl1x6diAsJka',
 'club_owner',
 'SV2021004',
 TRUE, NULL,
 '2025-08-06 08:20:00',
 NULL, NULL, 0),

(6,
 'Hoàng Thị Kim Dung',
 'dung.hoang@uth.edu.vn',
 '$2b$10$cxPKBmPtPFYCA0ph6YgvPupLeX9Y0JrR4QK3Y2uvKKl1x6diAsJka',
 'club_owner',
 'SV2021005',
 TRUE, NULL,
 '2025-08-07 08:00:00',
 NULL, NULL, 0),

(7,
 'Vũ Thanh Hà',
 'ha.vu@uth.edu.vn',
 '$2b$10$cxPKBmPtPFYCA0ph6YgvPupLeX9Y0JrR4QK3Y2uvKKl1x6diAsJka',
 'club_owner',
 'SV2021006',
 TRUE, NULL,
 '2025-08-08 08:00:00',
 NULL, NULL, 0),

(8,
 'Đặng Quốc Hùng',
 'hung.dang@uth.edu.vn',
 '$2b$10$cxPKBmPtPFYCA0ph6YgvPupLeX9Y0JrR4QK3Y2uvKKl1x6diAsJka',
 'club_owner',
 'SV2021007',
 TRUE, NULL,
 '2025-08-09 08:00:00',
 NULL, NULL, 0),

(9,
 'Bùi Thị Lan',
 'lan.bui@uth.edu.vn',
 '$2b$10$cxPKBmPtPFYCA0ph6YgvPupLeX9Y0JrR4QK3Y2uvKKl1x6diAsJka',
 'club_owner',
 'SV2021008',
 TRUE, NULL,
 '2025-08-10 08:00:00',
 NULL, NULL, 0),

(10,
 'Ngô Văn Minh',
 'minh.ngo@uth.edu.vn',
 '$2b$10$cxPKBmPtPFYCA0ph6YgvPupLeX9Y0JrR4QK3Y2uvKKl1x6diAsJka',
 'club_owner',
 'SV2021009',
 TRUE, NULL,
 '2025-08-11 08:00:00',
 NULL, NULL, 0),

(11,
 'Đinh Thị Nga',
 'nga.dinh@uth.edu.vn',
 '$2b$10$cxPKBmPtPFYCA0ph6YgvPupLeX9Y0JrR4QK3Y2uvKKl1x6diAsJka',
 'club_owner',
 'SV2021010',
 TRUE, NULL,
 '2025-08-12 08:00:00',
 NULL, NULL, 0),

(12,
 'Phan Trọng Nghĩa',
 'nghia.phan@uth.edu.vn',
 '$2b$10$cxPKBmPtPFYCA0ph6YgvPupLeX9Y0JrR4QK3Y2uvKKl1x6diAsJka',
 'club_owner',
 'SV2021011',
 TRUE, NULL,
 '2025-08-13 08:00:00',
 NULL, NULL, 0),

(13,
 'Cao Thị Phương',
 'phuong.cao@uth.edu.vn',
 '$2b$10$cxPKBmPtPFYCA0ph6YgvPupLeX9Y0JrR4QK3Y2uvKKl1x6diAsJka',
 'club_owner',
 'SV2021012',
 TRUE, NULL,
 '2025-08-14 08:00:00',
 NULL, NULL, 0),

-- ── Sinh viên (id 14–40) ───────────────────────────────────────────────────
(14, 'Lý Thị Quỳnh',       'quynh.ly@uth.edu.vn',       '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2022001', TRUE, NULL, '2025-09-01 08:00:00', NULL, NULL, 0),
(15, 'Trương Văn Sơn',     'son.truong@uth.edu.vn',     '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2022002', TRUE, NULL, '2025-09-01 08:05:00', NULL, NULL, 0),
(16, 'Đoàn Thị Thu',       'thu.doan@uth.edu.vn',       '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2022003', TRUE, NULL, '2025-09-01 08:10:00', NULL, NULL, 0),
(17, 'Lương Quốc Toàn',    'toan.luong@uth.edu.vn',     '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2022004', TRUE, NULL, '2025-09-01 08:15:00', NULL, NULL, 0),
(18, 'Hà Thị Uyên',        'uyen.ha@uth.edu.vn',        '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2022005', TRUE, NULL, '2025-09-02 08:00:00', NULL, NULL, 0),
(19, 'Tạ Minh Việt',       'viet.ta@uth.edu.vn',        '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2022006', TRUE, NULL, '2025-09-02 08:05:00', NULL, NULL, 0),
(20, 'Nguyễn Thị Xuân',    'xuan.nguyen@uth.edu.vn',    '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2022007', TRUE, NULL, '2025-09-02 08:10:00', NULL, NULL, 0),
(21, 'Võ Văn Yên',         'yen.vo@uth.edu.vn',         '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2022008', TRUE, NULL, '2025-09-03 08:00:00', NULL, NULL, 0),
(22, 'Kim Thị Zing',       'zing.kim@uth.edu.vn',       '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2022009', TRUE, NULL, '2025-09-03 08:05:00', NULL, NULL, 0),
(23, 'Bạch Thái Bình',     'binh.bach@uth.edu.vn',      '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2022010', TRUE, NULL, '2025-09-04 08:00:00', NULL, NULL, 0),
(24, 'Châu Gia Cát',       'cat.chau@uth.edu.vn',       '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2022011', TRUE, NULL, '2025-09-04 08:10:00', NULL, NULL, 0),
(25, 'Đỗ Thị Diệu',        'dieu.do@uth.edu.vn',        '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2022012', TRUE, NULL, '2025-09-05 08:00:00', NULL, NULL, 0),
(26, 'Giang Văn Hải',      'hai.giang@uth.edu.vn',      '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2022013', TRUE, NULL, '2025-09-05 08:10:00', NULL, NULL, 0),
(27, 'Lâm Thị Hoa',        'hoa.lam@uth.edu.vn',        '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2022014', TRUE, NULL, '2025-09-06 08:00:00', NULL, NULL, 0),
(28, 'Mai Quốc Khánh',     'khanh.mai@uth.edu.vn',      '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2022015', TRUE, NULL, '2025-09-06 08:10:00', NULL, NULL, 0),
(29, 'Nhan Thị Linh',      'linh.nhan@uth.edu.vn',      '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2022016', TRUE, NULL, '2025-09-07 08:00:00', NULL, NULL, 0),
(30, 'Phan Văn Lộc',       'loc.phan@uth.edu.vn',       '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2022017', TRUE, NULL, '2025-09-07 08:10:00', NULL, NULL, 0),
(31, 'Quách Thị Mai',      'mai.quach@uth.edu.vn',      '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2022018', TRUE, NULL, '2025-09-08 08:00:00', NULL, NULL, 0),
(32, 'Răng Văn Nam',       'nam.rang@uth.edu.vn',       '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2023001', TRUE, NULL, '2025-09-09 08:00:00', NULL, NULL, 0),
(33, 'Sầm Thị Nhung',      'nhung.sam@uth.edu.vn',      '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2023002', TRUE, NULL, '2025-09-09 08:10:00', NULL, NULL, 0),
(34, 'Thái Bảo Phúc',      'phuc.thai@uth.edu.vn',      '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2023003', TRUE, NULL, '2025-09-10 08:00:00', NULL, NULL, 0),
(35, 'Ứng Thị Quế',        'que.ung@uth.edu.vn',        '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2023004', TRUE, NULL, '2025-09-10 08:10:00', NULL, NULL, 0),
(36, 'Viên Quốc Sang',     'sang.vien@uth.edu.vn',      '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2023005', TRUE, NULL, '2025-09-11 08:00:00', NULL, NULL, 0),
(37, 'Xa Thị Tâm',         'tam.xa@uth.edu.vn',         '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2023006', TRUE, NULL, '2025-09-11 08:10:00', NULL, NULL, 0),
(38, 'Ý Trọng Tín',        'tin.y@uth.edu.vn',          '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2023007', TRUE, NULL, '2025-09-12 08:00:00', NULL, NULL, 0),
(39, 'Dương Thị Trúc',     'truc.duong@uth.edu.vn',     '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2023008', TRUE, NULL, '2025-09-12 08:10:00', NULL, NULL, 0),
(40, 'Khuất Văn Tùng',     'tung.khuat@uth.edu.vn',     '$2b$10$HyKbN4XEHEGc3f9sc8byeOyGXtSKbJsmI8MzqC6p71lmT5caldWF2', 'user', 'SV2023009', TRUE, NULL, '2025-09-13 08:00:00', NULL, NULL, 0);

-- Cập nhật sequence sau INSERT với ID tường minh
SELECT setval(pg_get_serial_sequence('"user"', 'id'), MAX(id)) FROM "user";

-- ===========================================================================
-- 2. CLUBS (12 clubs — đa dạng category)
-- ===========================================================================
-- Categories: Technology · Arts · Sports · Music · Social · Health · Education · Science · Environment · Media · Gaming · Volunteering
-- ownerId phải là club_owner (id 2–13)
-- ===========================================================================

INSERT INTO club
  (id, name, description, category, created_at, club_image, "ownerId")
VALUES

(1,
 'CLB Lập Trình UTH',
 'Sân chơi cho sinh viên đam mê công nghệ, lập trình web, mobile và AI. Tổ chức hackathon, workshop thực chiến và các chuyến thăm doanh nghiệp công nghệ.',
 'Technology',
 '2025-09-10 09:00:00',
 'https://placehold.co/600x400?text=CLB+Lap+Trinh',
 2),

(2,
 'CLB Âm Nhạc Giai Điệu',
 'Nơi gặp gỡ của những trái tim yêu âm nhạc — từ vocal, guitar, piano đến sáng tác. Biểu diễn văn nghệ mỗi học kỳ và tham gia các liên hoan âm nhạc sinh viên.',
 'Music',
 '2025-09-11 09:30:00',
 'https://placehold.co/600x400?text=CLB+Am+Nhac',
 3),

(3,
 'CLB Thể Thao Tổng Hợp',
 'Bóng đá, cầu lông, bóng bàn, bơi lội — đội ngũ huấn luyện viên chuyên nghiệp, sân tập đầy đủ trang thiết bị. Đại diện trường thi đấu giải sinh viên toàn quốc.',
 'Sports',
 '2025-09-12 10:00:00',
 'https://placehold.co/600x400?text=CLB+The+Thao',
 4),

(4,
 'CLB Nhiếp Ảnh & Design',
 'Học chụp ảnh chuyên nghiệp, xử lý hậu kỳ Lightroom/Photoshop, thiết kế đồ họa. Triển lãm ảnh hàng năm và câu lạc bộ xuất bản tạp chí nội bộ.',
 'Arts',
 '2025-09-13 09:00:00',
 'https://placehold.co/600x400?text=CLB+Nhiep+Anh',
 5),

(5,
 'CLB Tình Nguyện Xanh',
 'Hoạt động cộng đồng: dạy học miễn phí cho trẻ em vùng khó, chiến dịch bảo vệ môi trường, hiến máu nhân đạo. Kết nối yêu thương — lan toả giá trị.',
 'Volunteering',
 '2025-09-14 09:00:00',
 'https://placehold.co/600x400?text=CLB+Tinh+Nguyen',
 6),

(6,
 'CLB Điện Ảnh & Truyền Thông',
 'Sản xuất phim ngắn, podcast, bản tin sinh viên. Đào tạo kỹ năng quay phim, dựng phim, viết kịch bản. Tham dự liên hoan phim sinh viên quốc tế.',
 'Media',
 '2025-09-15 09:30:00',
 'https://placehold.co/600x400?text=CLB+Dien+Anh',
 7),

(7,
 'CLB Khoa Học & Nghiên Cứu',
 'Thực hiện đề tài NCKH, tham gia Olympic Khoa học, cuộc thi ý tưởng khởi nghiệp. Có phòng lab riêng, trao đổi với giảng viên và chuyên gia hàng tuần.',
 'Science',
 '2025-09-16 10:00:00',
 'https://placehold.co/600x400?text=CLB+Khoa+Hoc',
 8),

(8,
 'CLB Sức Khỏe & Yoga',
 'Lớp Yoga buổi sáng, thiền định, dinh dưỡng học. Tư vấn sức khỏe tâm lý, hỗ trợ sinh viên giảm stress trong mùa thi. Bài tập thể dục tập thể cuối tuần.',
 'Health',
 '2025-09-17 09:00:00',
 'https://placehold.co/600x400?text=CLB+Yoga',
 9),

(9,
 'CLB Văn Học & Sáng Tác',
 'Thi thơ, truyện ngắn, tranh biện văn học. Xuất bản tập san văn học sinh viên "Mực Tím" mỗi kỳ. Giao lưu với các nhà văn, nhà thơ và NXB trẻ.',
 'Education',
 '2025-09-18 09:30:00',
 'https://placehold.co/600x400?text=CLB+Van+Hoc',
 10),

(10,
 'CLB Game & E-Sports',
 'Thi đấu các tựa game phổ biến: Valorant, LMHT, FIFA, Chess.com. Đào tạo tư duy chiến thuật, tổ chức giải nội bộ hàng tháng và đại diện trường thi giải quốc gia.',
 'Gaming',
 '2025-09-19 10:00:00',
 'https://placehold.co/600x400?text=CLB+Esports',
 11),

(11,
 'CLB Khởi Nghiệp & Đổi Mới Sáng Tạo',
 'Ươm mầm ý tưởng khởi nghiệp, kết nối mentor, pitching với quỹ đầu tư. Chương trình Startup Weekend UTH, tham gia vườn ươm doanh nghiệp cấp Bộ.',
 'Technology',
 '2025-09-20 09:00:00',
 'https://placehold.co/600x400?text=CLB+Khoi+Nghiep',
 12),

(12,
 'CLB Môi Trường & Phát Triển Bền Vững',
 'Chiến dịch trồng cây, phân loại rác, nâng cao nhận thức biến đổi khí hậu. Kết hợp với các tổ chức NGO quốc tế và tham gia Hội nghị Môi trường Sinh viên.',
 'Environment',
 '2025-09-21 09:30:00',
 'https://placehold.co/600x400?text=CLB+Moi+Truong',
 13);

SELECT setval(pg_get_serial_sequence('club', 'id'), MAX(id)) FROM club;

-- ===========================================================================
-- 3. MEMBERSHIPS
-- ===========================================================================
-- Mỗi club_owner là thành viên approved của chính clb mình (đóng vai trò leader).
-- Một số sinh viên join nhiều club (tối đa 2 để thực tế).
-- Thêm một vài đơn pending và rejected để test workflow.
-- join_date NULL cho pending (đã fix bug nullable).
-- ===========================================================================

INSERT INTO membership
  (id, join_reason, skills, request_date, join_date, promise, status, "clubId", "userId", "club_role")
VALUES

-- ── Club owners tự tham gia clb của mình (approved) ──────────────────────
(1,  'Sáng lập và điều hành CLB',    'Lập trình, quản lý dự án',       '2025-09-10 09:00:00', '2025-09-10 09:00:00', 'Đưa CLB phát triển bền vững',   'approved',  1,  2, 'member'),
(2,  'Sáng lập và điều hành CLB',    'Sáng tác, biểu diễn âm nhạc',    '2025-09-11 09:00:00', '2025-09-11 09:00:00', 'Tổ chức các buổi concert chất lượng', 'approved', 2,  3, 'member'),
(3,  'Sáng lập và điều hành CLB',    'Bóng đá, huấn luyện',             '2025-09-12 09:00:00', '2025-09-12 09:00:00', 'Nâng tầm thể thao sinh viên',   'approved',  3,  4, 'member'),
(4,  'Sáng lập và điều hành CLB',    'Chụp ảnh, Photoshop',             '2025-09-13 09:00:00', '2025-09-13 09:00:00', 'Tổ chức triển lãm ảnh hàng năm', 'approved', 4,  5, 'member'),
(5,  'Sáng lập và điều hành CLB',    'Tổ chức sự kiện, kêu gọi tình nguyện', '2025-09-14 09:00:00', '2025-09-14 09:00:00', 'Lan toả yêu thương', 'approved', 5,  6, 'member'),
(6,  'Sáng lập và điều hành CLB',    'Quay phim, dựng phim, kịch bản',  '2025-09-15 09:00:00', '2025-09-15 09:00:00', 'Sản xuất phim ngắn chất lượng', 'approved',  6,  7, 'member'),
(7,  'Sáng lập và điều hành CLB',    'NCKH, phân tích dữ liệu',         '2025-09-16 09:00:00', '2025-09-16 09:00:00', 'Đẩy mạnh văn hóa nghiên cứu',   'approved',  7,  8, 'member'),
(8,  'Sáng lập và điều hành CLB',    'Yoga, thiền định, dinh dưỡng',    '2025-09-17 09:00:00', '2025-09-17 09:00:00', 'Nâng cao sức khỏe sinh viên',   'approved',  8,  9, 'member'),
(9,  'Sáng lập và điều hành CLB',    'Viết văn, thơ, biên tập',         '2025-09-18 09:00:00', '2025-09-18 09:00:00', 'Xuất bản tập san chất lượng',   'approved',  9, 10, 'member'),
(10, 'Sáng lập và điều hành CLB',    'Gaming, chiến thuật, tổ chức giải', '2025-09-19 09:00:00', '2025-09-19 09:00:00', 'Phát triển e-sports UTH',    'approved', 10, 11, 'member'),
(11, 'Sáng lập và điều hành CLB',    'Khởi nghiệp, pitching, marketing','2025-09-20 09:00:00', '2025-09-20 09:00:00', 'Ươm mầm startup UTH',          'approved', 11, 12, 'member'),
(12, 'Sáng lập và điều hành CLB',    'Môi trường, NGO, truyền thông',   '2025-09-21 09:00:00', '2025-09-21 09:00:00', 'Bảo vệ hành tinh xanh',         'approved', 12, 13, 'member'),

-- ── Sinh viên gia nhập — approved ─────────────────────────────────────────
-- CLB Lập Trình (club 1)
(13, 'Muốn nâng cao kỹ năng lập trình web',    'HTML, CSS, JS cơ bản',            '2025-09-20 10:00:00', '2025-09-22 10:00:00', 'Hoàn thành ít nhất 1 project mỗi học kỳ', 'approved', 1, 14, 'member'),
(14, 'Yêu thích AI và Machine Learning',        'Python, pandas, sklearn',         '2025-09-21 10:00:00', '2025-09-23 10:00:00', 'Chia sẻ kiến thức với các bạn mới',       'approved', 1, 15, 'member'),
(15, 'Cần kinh nghiệm thực chiến cho CV',       'Java, OOP',                       '2025-09-22 10:00:00', '2025-09-24 10:00:00', 'Tham gia ít nhất 80% buổi sinh hoạt',     'approved', 1, 16, 'member'),
(16, 'Muốn học React và NestJS',                'JavaScript, TypeScript cơ bản',   '2025-09-23 10:00:00', '2025-09-25 10:00:00', 'Đóng góp vào open-source của CLB',        'approved', 1, 17, 'member'),

-- CLB Âm Nhạc (club 2)
(17, 'Đam mê hát và guitar từ nhỏ',            'Guitar, giọng hát',               '2025-09-22 10:00:00', '2025-09-24 10:00:00', 'Tham gia đầy đủ các buổi tập',            'approved', 2, 18, 'member'),
(18, 'Muốn học sáng tác nhạc độc lập',          'Piano, lý thuyết âm nhạc',        '2025-09-23 10:00:00', '2025-09-25 10:00:00', 'Ra mắt ít nhất 1 bài tự sáng tác',        'approved', 2, 19, 'member'),
(19, 'Yêu nhạc cụ dân tộc, muốn giao lưu',     'Đàn tranh, trống',                '2025-09-24 10:00:00', '2025-09-26 10:00:00', 'Thể hiện âm nhạc dân tộc đến bạn bè',    'approved', 2, 20, 'member'),

-- CLB Thể Thao (club 3)
(20, 'Đội tuyển bóng đá trường THPT, muốn tiếp tục', 'Bóng đá, thể lực',         '2025-09-23 10:00:00', '2025-09-25 10:00:00', 'Thi đấu đại diện trường đại học',         'approved', 3, 21, 'member'),
(21, 'Cần rèn luyện sức khỏe sau giờ học',     'Cầu lông, bóng bàn',              '2025-09-24 10:00:00', '2025-09-26 10:00:00', 'Dự đủ 75% buổi tập mỗi tháng',            'approved', 3, 22, 'member'),
(22, 'Muốn học bơi lội bài bản',               'Bơi cơ bản',                      '2025-09-25 10:00:00', '2025-09-27 10:00:00', 'Đạt chuẩn kỹ thuật trong học kỳ',         'approved', 3, 23, 'member'),

-- CLB Nhiếp Ảnh (club 4)
(23, 'Có máy ảnh DSLR, muốn học kỹ thuật',     'Chụp ảnh tự học, Lightroom cơ bản', '2025-09-24 10:00:00', '2025-09-26 10:00:00', 'Đăng ít nhất 4 bộ ảnh lên fanpage CLB', 'approved', 4, 24, 'member'),
(24, 'Yêu thiết kế đồ họa, muốn mở rộng',      'Illustrator, Canva',              '2025-09-25 10:00:00', '2025-09-27 10:00:00', 'Thiết kế poster cho các sự kiện CLB',     'approved', 4, 25, 'member'),

-- CLB Tình Nguyện (club 5)
(25, 'Muốn đóng góp cho cộng đồng',            'Lãnh đạo nhóm, tổ chức',           '2025-09-25 10:00:00', '2025-09-27 10:00:00', 'Tham gia ít nhất 3 chiến dịch mỗi kỳ',   'approved', 5, 26, 'member'),
(26, 'Đã từng dạy học tình nguyện cấp 2',       'Dạy Toán, Văn',                   '2025-09-26 10:00:00', '2025-09-28 10:00:00', 'Dạy học miễn phí mỗi cuối tuần',          'approved', 5, 27, 'member'),
(27, 'Quan tâm đến y tế cộng đồng',             'Sơ cứu, y tế cơ bản',             '2025-09-27 10:00:00', '2025-09-29 10:00:00', 'Hỗ trợ chiến dịch hiến máu của trường',   'approved', 5, 28, 'member'),

-- CLB Điện Ảnh (club 6)
(28, 'Thích quay phim từ cấp 3',               'Quay phim bằng điện thoại, Capcut', '2025-09-26 10:00:00', '2025-09-28 10:00:00', 'Sản xuất ít nhất 1 phim ngắn mỗi kỳ',   'approved', 6, 29, 'member'),
(29, 'Muốn học viết kịch bản chuyên nghiệp',   'Viết sáng tạo, storytelling',      '2025-09-27 10:00:00', '2025-09-29 10:00:00', 'Hoàn chỉnh 2 kịch bản mỗi học kỳ',       'approved', 6, 30, 'member'),

-- CLB Khoa Học (club 7)
(30, 'Đang làm luận văn, cần hỗ trợ NCKH',     'SPSS, nghiên cứu định lượng',     '2025-09-27 10:00:00', '2025-09-29 10:00:00', 'Đăng ít nhất 1 bài báo khoa học',         'approved', 7, 31, 'member'),
(31, 'Yêu thích sinh học phân tử',              'PCR, thực hành lab cơ bản',        '2025-10-01 10:00:00', '2025-10-03 10:00:00', 'Tham gia Olympic Sinh học sinh viên',      'approved', 7, 32, 'member'),

-- CLB Yoga (club 8)
(32, 'Hay bị đau lưng do ngồi học nhiều',       'Yoga cơ bản đã tự học',           '2025-10-01 10:00:00', '2025-10-03 10:00:00', 'Tập đều đặn 3 buổi/tuần',                 'approved', 8, 33, 'member'),
(33, 'Muốn kiểm soát stress mùa thi',           'Thiền, hít thở chánh niệm',       '2025-10-02 10:00:00', '2025-10-04 10:00:00', 'Chia sẻ kỹ thuật thiền với các bạn',      'approved', 8, 34, 'member'),

-- CLB Văn Học (club 9)
(34, 'Thích đọc sách, viết review',             'Viết blog, biên tập bản thảo',    '2025-10-02 10:00:00', '2025-10-04 10:00:00', 'Viết ít nhất 1 truyện ngắn mỗi kỳ',       'approved', 9, 35, 'member'),
(35, 'Đam mê thơ Đường luật cổ điển',           'Thơ Đường, chữ Nôm cơ bản',       '2025-10-03 10:00:00', '2025-10-05 10:00:00', 'Đóng góp vào tập san Mực Tím',            'approved', 9, 36, 'member'),

-- CLB Gaming (club 10)
(36, 'Đã thi giải Valorant cấp tỉnh',           'Valorant rank Diamond, call IGL', '2025-10-03 10:00:00', '2025-10-05 10:00:00', 'Đưa đội UTH vào top 8 quốc gia',          'approved', 10, 37, 'member'),
(37, 'Fan chess.com, muốn tìm đối thủ',         'Chess.com 1500 ELO',              '2025-10-04 10:00:00', '2025-10-06 10:00:00', 'Tổ chức giải cờ nội bộ hàng tháng',       'approved', 10, 38, 'member'),

-- CLB Khởi Nghiệp (club 11)
(38, 'Đang ấp ủ idea ứng dụng đặt xe đạp',     'Business model, Excel',           '2025-10-04 10:00:00', '2025-10-06 10:00:00', 'Hoàn thiện MVP trong học kỳ này',          'approved', 11, 39, 'member'),
(39, 'Muốn học pitch trước nhà đầu tư',         'Communication, Presentation',     '2025-10-05 10:00:00', '2025-10-07 10:00:00', 'Pitching tại Startup Weekend UTH',         'approved', 11, 40, 'member'),

-- CLB Môi Trường (club 12)
(40, 'Đam mê bảo vệ rừng ngập mặn',            'Sinh thái học, GIS cơ bản',        '2025-10-05 10:00:00', '2025-10-07 10:00:00', 'Dẫn dắt chiến dịch trồng 500 cây',        'approved', 12, 14, 'member'),
(41, 'Muốn thực hành phân loại rác tái chế',    'Hóa môi trường, thực hành lab',   '2025-10-06 10:00:00', '2025-10-08 10:00:00', 'Xây dựng góc tái chế tại ký túc xá',      'approved', 12, 15, 'member'),

-- Sinh viên join 2 club (cross-club membership)
(42, 'IT + Nghiên cứu — kết hợp hoàn hảo',     'Lập trình, viết báo cáo khoa học', '2025-10-10 10:00:00', '2025-10-12 10:00:00', 'Phát triển phần mềm hỗ trợ NCKH',        'approved', 7, 17, 'member'),
(43, 'Âm nhạc giúp tôi giảm stress sau NCKH',  'Violin, đọc note nhạc cơ bản',    '2025-10-11 10:00:00', '2025-10-13 10:00:00', 'Góp mặt trong concert cuối kỳ',           'approved', 2, 31, 'member'),

-- ── Đơn đang chờ duyệt — pending ─────────────────────────────────────────
(44, 'Mới biết đến CLB, rất muốn thử',         'HTML cơ bản, học nhanh',           '2026-02-20 10:00:00', NULL, 'Nỗ lực hết mình để theo kịp',             'pending',  1, 32, 'member'),
(45, 'Nghe bạn bè giới thiệu, muốn thử Guitar', 'Chưa biết nhạc cụ nào',          '2026-02-21 10:00:00', NULL, 'Chăm chỉ tập luyện mỗi ngày',             'pending',  2, 33, 'member'),
(46, 'Cần rèn thể lực để cải thiện sức khỏe',  'Chạy bộ 5km/ngày',                '2026-02-22 10:00:00', NULL, 'Tập đúng giờ, không bỏ buổi',             'pending',  3, 34, 'member'),
(47, 'Muốn học chụp ảnh chân dung',            'Điện thoại chụp ảnh khá',          '2026-02-23 10:00:00', NULL, 'Mua máy ảnh mirrorless trong tháng tới',  'pending',  4, 35, 'member'),
(48, 'Muốn làm tình nguyện mùa hè này',        'Giao tiếp tốt, nhiệt tình',        '2026-02-24 10:00:00', NULL, 'Dành ít nhất 8h/tuần cho hoạt động',      'pending',  5, 36, 'member'),
(49, 'Thích xem phim tài liệu, muốn làm',      'Biên tập video cơ bản',            '2026-02-25 10:00:00', NULL, 'Hoàn thành 1 phim tài liệu ngắn',         'pending',  6, 37, 'member'),
(50, 'Đang nghiên cứu đề tài AI trong y tế',   'Python, TensorFlow cơ bản',        '2026-02-26 10:00:00', NULL, 'Hoàn thành nghiên cứu đúng deadline',     'pending',  7, 38, 'member'),
(51, 'Bác sĩ gia đình khuyên tập Yoga',        'Chưa biết Yoga, sẵn sàng học',     '2026-02-27 10:00:00', NULL, 'Tập đều 5 buổi/tuần',                     'pending',  8, 39, 'member'),

-- ── Đơn bị từ chối — rejected ─────────────────────────────────────────────
(52, 'Tham gia cho vui, không có kế hoạch cụ thể', 'Chưa rõ kỹ năng',            '2026-01-10 10:00:00', NULL, 'Sẽ cố gắng',                              'rejected', 1, 40, 'member'),
(53, 'Không có thời gian nhưng muốn tên trong danh sách', 'Bận việc gia đình',    '2026-01-11 10:00:00', NULL, 'Sắp xếp thời gian',                       'rejected', 2, 40, 'member'),
(54, 'Thử đăng ký xem thế nào',                'Chưa rõ',                          '2026-01-15 10:00:00', NULL, 'Xem xét lại',                             'rejected', 11, 33, 'member');

SELECT setval(pg_get_serial_sequence('membership', 'id'), MAX(id)) FROM membership;

-- ===========================================================================
-- 4. EVENTS
-- ===========================================================================
-- Mỗi club có 3–4 events với status đa dạng:
--   approved  : sắp diễn ra (tương lai)
--   approved  : đã kết thúc (quá khứ)
--   pending   : chờ admin duyệt
--   rejected  : đã bị từ chối
-- attending_users_number phản ánh số thực đã đăng ký (tương quan với event_registrations)
-- max_capacity: NULL (không giới hạn) hoặc INT
-- registration_deadline: NULL hoặc TIMESTAMP
-- visibility: 'public' hoặc 'members_only'
-- ===========================================================================

INSERT INTO event
  (id, name, description, status, event_image, "createdAt", date, attending_users_number, max_capacity, registration_deadline, visibility, activities, location, "clubId", points, "proposalUrl", "checkInCode")
VALUES

-- ── CLB Lập Trình (club 1) ─────────────────────────────────────────────────
(1,
 'Hackathon UTH 2025 — Code for Future',
 'Cuộc thi lập trình 24 giờ với chủ đề "Ứng dụng AI giải quyết vấn đề đô thị". Giải thưởng tổng trị giá 30 triệu đồng. Tất cả sinh viên đều có thể tham gia theo nhóm 3–4 người.',
 'completed',
 'https://placehold.co/600x400?text=Hackathon+2025',
 '2025-10-01 08:00:00',
 '2025-11-15 08:00:00',
 45, 100, '2025-11-10 23:59:59', 'public',
 'Team Building, Coding 24h, Demo Day, Trao giải',
 'Phòng Lab 201, Tòa A — UTH',
 1, 15, 'https://supabase.co/storage/v1/object/public/proposals/hackathon-2025.pdf', 'QR-HACK-2025'),

(2,
 'Workshop: Xây dựng REST API với NestJS & PostgreSQL',
 'Workshop thực hành từ A→Z: thiết kế database, viết API, deploy lên VPS. Dành cho sinh viên từ năm 2 trở lên đã biết JavaScript cơ bản.',
 'completed',
 'https://placehold.co/600x400?text=Workshop+NestJS',
 '2025-11-01 08:00:00',
 '2025-12-05 09:00:00',
 32, 50, '2025-12-01 23:59:59', 'public',
 'Lecture, Live Coding, Q&A',
 'Phòng 305, Tòa B — UTH',
 1, 5, 'https://supabase.co/storage/v1/object/public/proposals/nest-workshop.pdf', 'QR-NEST-WS'),

(3,
 'Buổi giao lưu Mentor Tech: Kinh nghiệm từ FPT Software',
 'Kỹ sư senior từ FPT Software chia sẻ lộ trình nghề nghiệp, kinh nghiệm phỏng vấn và lời khuyên cho sinh viên mới ra trường.',
 'approved',
 'https://placehold.co/600x400?text=Mentor+Tech',
 '2026-01-15 08:00:00',
 '2026-03-20 14:00:00',
 0, 50, '2026-03-18 23:59:59', 'members_only',
 'Panel Discussion, Q&A, Networking',
 'Hội trường C — UTH',
 1, 3, NULL, 'QR-MENTOR-TECH'),

(4,
 'Cuộc thi App Mobile: Smart Campus',
 'Thiết kế ứng dụng di động giải quyết vấn đề trong khuôn viên trường: giúp đặt lịch phòng học, tìm mất đồ, kết nối cộng đồng.',
 'pending',
 'https://placehold.co/600x400?text=App+Contest',
 '2026-02-10 08:00:00',
 '2026-04-10 08:00:00',
 0, 20, '2026-04-05 23:59:59', 'public',
 'Đăng ký nhóm, Vòng sơ loại, Vòng chung kết, Demo',
 'Ký túc xá UTH — Sảnh chính',
 1, 10, 'https://supabase.co/storage/v1/object/public/proposals/smart-campus.pdf', 'QR-SMART-CAMPUS'),

(45,
 'Workshop: Lập trình Game cơ bản với Unity (Đã Hủy)',
 'Workshop về Unity bị hủy do diễn giả có việc bận đột xuất. Sẽ tổ chức lại vào thời gian sau.',
 'canceled',
 'https://placehold.co/600x400?text=Unity+Canceled',
 '2026-02-15 08:00:00',
 '2026-03-30 09:00:00',
 0, 30, NULL, 'public',
 'Hủy bỏ',
 'Phòng 201, Tòa A',
 1, 0, NULL, NULL),

-- ── CLB Âm Nhạc (club 2) ──────────────────────────────────────────────────
(5,
 'Concert "Mùa Thu Vàng" — Biểu diễn cuối kỳ 1',
 'Đêm nhạc acoustic với 15 tiết mục của các thành viên CLB: vocal, guitar, piano, violin. Mở cửa tự do cho toàn trường.',
 'completed',
 'https://placehold.co/600x400?text=Concert+Mua+Thu',
 '2025-10-10 08:00:00',
 '2025-11-20 18:00:00',
 120, 200, '2025-11-18 23:59:59', 'public',
 'Acoustic Sets, Solo Performance, Band Collaboration',
 'Hội trường A — UTH',
 2, 5, 'https://supabase.co/storage/v1/object/public/proposals/concert-mua-thu.pdf', 'QR-CONCERT-MT'),

(6,
 'Workshop: Nhạc lý cơ bản & Ký xướng âm',
 'Khoá học cấp tốc 2 buổi dành cho thành viên mới: đọc nốt nhạc, nhịp điệu, hòa thanh cơ bản. Yêu cầu: chưa biết nhạc lý.',
 'completed',
 'https://placehold.co/600x400?text=Nhac+Ly+CB',
 '2025-11-10 08:00:00',
 '2025-12-01 09:00:00',
 28, 30, '2025-11-28 23:59:59', 'members_only',
 'Lecture, Practice, Ear Training',
 'Phòng nhạc 103 — Tòa C UTH',
 2, 3, NULL, 'QR-NHAC-LY'),

(7,
 'Thi sáng tác ca khúc: "Ký Ức Sinh Viên"',
 'Cuộc thi sáng tác âm nhạc với chủ đề ký ức đại học. Phần thưởng: thu âm chuyên nghiệp cho 3 tác phẩm xuất sắc nhất.',
 'approved',
 'https://placehold.co/600x400?text=Sang+Tac+Ca+Khuc',
 '2026-01-20 08:00:00',
 '2026-03-15 09:00:00',
 0, 15, '2026-03-10 00:00:00', 'public',
 'Nộp tác phẩm, Vòng bình chọn, Vòng biểu diễn trực tiếp',
 'Phòng nhạc 103 — Tòa C UTH',
 2, 10, 'https://supabase.co/storage/v1/object/public/proposals/contest-music.pdf', 'QR-MUSIC-2026'),

(8,
 'Buổi giao lưu: Nhạc cụ dân tộc Việt Nam',
 'Nghệ nhân dân gian trình diễn đàn tranh, đàn bầu, trống truyền thống. Q&A về lịch sử âm nhạc dân tộc.',
 'rejected',
 'https://placehold.co/600x400?text=Nhac+Cu+Dan+Toc',
 '2025-09-25 08:00:00',
 '2025-10-15 09:00:00',
 0, NULL, NULL, 'public',
 'Live Performance, Discussion',
 'Phòng nhạc 103 — Tòa C UTH',
 2, 0, NULL, NULL),

-- ── CLB Thể Thao (club 3) ──────────────────────────────────────────────────
(9,
 'Giải Bóng Đá Sinh Viên UTH Mở Rộng 2025',
 'Giải đấu bóng đá 11 người dành cho các đội trường đại học khu vực TP.HCM. UTH đăng cai tổ chức, 8 đội tham dự, thi đấu vòng tròn 2 lượt.',
 'completed',
 'https://placehold.co/600x400?text=Giai+Bong+Da+2025',
 '2025-09-28 08:00:00',
 '2025-11-10 07:00:00',
 80, 200, NULL, 'public',
 'Khai mạc, Vòng bảng, Tứ kết, Bán kết, Chung kết',
 'Sân vận động UTH',
 3, 20, 'https://supabase.co/storage/v1/object/public/proposals/football-2025.pdf', 'QR-FOOTBALL-2025'),

(10,
 'Giải Cầu Lông Nội Bộ Tháng 11',
 'Giải đấu cầu lông nội bộ CLB thể thao: đơn nam, đơn nữ, đôi nam nữ. Cúp + phần thưởng cho top 3 mỗi nội dung.',
 'completed',
 'https://placehold.co/600x400?text=Giai+Cau+Long',
 '2025-10-15 08:00:00',
 '2025-11-22 08:00:00',
 40, 64, '2025-11-15 00:00:00', 'members_only',
 'Đăng ký nội dung, Bốc thăm, Thi đấu loại trực tiếp',
 'Nhà thi đấu UTH',
 3, 5, NULL, 'QR-BADMINTON-11'),

(11,
 'Buổi Tập Thể Dục Cộng Đồng — Chào Năm Mới 2026',
 'Workout ngoài trời cùng toàn trường: khởi động, aerobic, yoga ngoài trời. Miễn phí, mở cửa tất cả sinh viên và giảng viên.',
 'completed',
 'https://placehold.co/600x400?text=Tap+The+Duc',
 '2025-12-01 08:00:00',
 '2026-01-05 06:00:00',
 200, NULL, NULL, 'public',
 'Warm Up, Cardio, Cool Down, Photo',
 'Sân cỏ trung tâm UTH',
 3, 2, NULL, 'QR-AEROBIC-2026'),

(12,
 'Khóa học Bơi Lội Cơ Bản',
 'Khóa học 8 buổi dành cho sinh viên chưa biết bơi hoặc muốn cải thiện kỹ thuật. HLV bơi lội có chứng chỉ quốc gia.',
 'pending',
 'https://placehold.co/600x400?text=Boi+Loi+CB',
 '2026-02-01 08:00:00',
 '2026-03-25 07:00:00',
 0, 30, '2026-03-20 00:00:00', 'public',
 'Kỹ thuật thở, Trượt nước, Sải, Bướm, Ếch',
 'Hồ bơi UTH',
 3, 8, 'https://supabase.co/storage/v1/object/public/proposals/swimming-course.pdf', 'QR-SWIM-CB'),

-- ── CLB Nhiếp Ảnh (club 4) ────────────────────────────────────────────────
(13,
 'Triển Lãm Ảnh: "UTH Góc Nhìn"',
 'Triển lãm ảnh nghệ thuật với 60 tác phẩm của 20 thành viên CLB. Chủ đề: cuộc sống sinh viên, kiến trúc campus, con người UTH.',
 'completed',
 'https://placehold.co/600x400?text=Trien+Lam+Anh',
 '2025-10-20 08:00:00',
 '2025-11-25 09:00:00',
 150, 500, NULL, 'public',
 'Khai mạc triển lãm, Artist Talk, Photo Walk',
 'Hành lang Tòa A — UTH',
 4, 10, 'https://supabase.co/storage/v1/object/public/proposals/photo-exhibition.pdf', 'QR-PHOTO-EX'),

(14,
 'Workshop: Lightroom & Photoshop cho Nhiếp Ảnh',
 'Hướng dẫn xử lý hậu kỳ ảnh chuyên nghiệp: chỉnh màu, retouching, tạo preset. Yêu cầu: laptop cá nhân, đã cài Lightroom/PS.',
 'completed',
 'https://placehold.co/600x400?text=Workshop+LR+PS',
 '2025-11-15 08:00:00',
 '2025-12-10 09:00:00',
 25, 30, '2025-12-05 00:00:00', 'members_only',
 'Lecture, Hands-on Practice, Portfolio Review',
 'Phòng máy tính 202 — Tòa B UTH',
 4, 5, NULL, 'QR-LR-PS'),

(15,
 'Photo Walk: Phố Cổ Hội An',
 'Chuyến dã ngoại chụp ảnh đường phố tại Hội An. Học kỹ thuật street photography, chụp ảnh kiến trúc cổ và đời sống người dân.',
 'approved',
 'https://placehold.co/600x400?text=Photo+Walk+Hoi+An',
 '2026-01-05 08:00:00',
 '2026-03-28 06:00:00',
 0, 15, '2026-03-20 00:00:00', 'members_only',
 'Di chuyển, Chụp ảnh tự do, Workshop thực địa, Review ảnh',
 'Hội An, Quảng Nam',
 4, 15, 'https://supabase.co/storage/v1/object/public/proposals/photo-walk-hoian.pdf', 'QR-PHOTO-WALK'),

(16,
 'Cuộc Thi Ảnh: "Tết Sum Vầy"',
 'Cuộc thi ảnh chủ đề Tết Nguyên Đán — khoảnh khắc gia đình, nét đẹp truyền thống. Giải nhất nhận máy ảnh mirrorless.',
 'pending',
 'https://placehold.co/600x400?text=Thi+Anh+Tet',
 '2026-02-15 08:00:00',
 '2026-04-05 08:00:00',
 0, NULL, '2026-03-30 23:59:59', 'public',
 'Nộp ảnh online, Vòng bình chọn, Lễ trao giải',
 'Online + Hội trường B UTH',
 4, 10, NULL, 'QR-PHOTO-TET'),

-- ── CLB Tình Nguyện (club 5) ───────────────────────────────────────────────
(17,
 'Chiến Dịch "Mùa Hè Xanh 2025" — Dạy Học Tình Nguyện',
 '2 tuần dạy học miễn phí tại huyện Củ Chi: Toán, Văn, Tiếng Anh cho học sinh lớp 6–9. Tình nguyện viên được hỗ trợ ăn ở và phương tiện.',
 'completed',
 'https://placehold.co/600x400?text=Mua+He+Xanh',
 '2025-06-01 08:00:00',
 '2025-07-15 06:00:00',
 35, 40, '2025-06-25 00:00:00', 'public',
 'Giảng dạy, Vui chơi, Tổng kết',
 'Trường THCS Tân Thạnh Đông, Củ Chi',
 5, 20, 'https://supabase.co/storage/v1/object/public/proposals/mua-he-xanh.pdf', 'QR-MHX-2025'),

(18,
 'Hiến Máu Nhân Đạo — "Giọt Máu Hồng"',
 'Phối hợp với Bệnh viện Chợ Rẫy tổ chức ngày hội hiến máu tình nguyện. Mục tiêu: 300 đơn vị máu. Có quà tặng và chứng nhận tình nguyện.',
 'completed',
 'https://placehold.co/600x400?text=Hien+Mau',
 '2025-09-01 08:00:00',
 '2025-10-20 08:00:00',
 280, 500, NULL, 'public',
 'Khám sức khỏe, Hiến máu, Nghỉ ngơi, Nhận quà',
 'Sảnh chính UTH',
 5, 5, NULL, 'QR-HIEN-MAU'),

(19,
 'Chiến Dịch Làm Sạch Bãi Biển Cần Giờ',
 'Kết hợp với WWF Việt Nam: thu gom rác nhựa, trồng cây ngập mặn, dọn dẹp bãi biển Cần Giờ. Phương tiện: xe đưa đón từ trường.',
 'approved',
 'https://placehold.co/600x400?text=Don+Bai+Bien',
 '2026-01-20 08:00:00',
 '2026-03-22 06:00:00',
 0, 100, '2026-03-15 23:59:59', 'public',
 'Xuất phát, Phân công khu vực, Dọn rác, Trồng cây, Tổng kết',
 'Bãi Biển Cần Giờ, TP.HCM',
 5, 10, 'https://supabase.co/storage/v1/object/public/proposals/beach-cleanup.pdf', 'QR-BEACH-CLEAN'),

(20,
 'Trao Học Bổng "Sinh Viên Vượt Khó"',
 'Chương trình trao 20 suất học bổng cho sinh viên hoàn cảnh khó khăn của UTH. Mỗi suất 5 triệu đồng từ nguồn quyên góp của alumni.',
 'pending',
 'https://placehold.co/600x400?text=Hoc+Bong',
 '2026-02-20 08:00:00',
 '2026-04-15 09:00:00',
 0, 50, '2026-04-01 00:00:00', 'public',
 'Tiếp nhận hồ sơ, Xét duyệt, Lễ trao học bổng',
 'Hội trường A — UTH',
 5, 5, NULL, 'QR-SCHOLARSHIP-2026'),

-- ── CLB Điện Ảnh (club 6) ──────────────────────────────────────────────────
(21,
 'Liên Hoan Phim Ngắn "UTH Short Film Festival 2025"',
 'Giới thiệu 12 phim ngắn do sinh viên UTH sản xuất. Hội đồng giám khảo gồm đạo diễn chuyên nghiệp và biên kịch tên tuổi.',
 'completed',
 'https://placehold.co/600x400?text=Short+Film+Fest',
 '2025-10-01 08:00:00',
 '2025-11-18 18:00:00',
 90, 200, NULL, 'public',
 'Chiếu phim, Q&A đạo diễn, Trao giải',
 'Rạp chiếu phim CGV Pandora City',
 6, 12, 'https://supabase.co/storage/v1/object/public/proposals/film-fest.pdf', 'QR-FILM-FEST'),

(22,
 'Workshop: Kỹ Thuật Dựng Phim Với Premiere Pro',
 'Hướng dẫn dựng phim chuyên nghiệp: cut, color grading, sound mixing, export. Mang laptop cài Premiere Pro.',
 'completed',
 'https://placehold.co/600x400?text=Workshop+Premiere',
 '2025-11-20 08:00:00',
 '2025-12-15 09:00:00',
 22, 30, '2025-12-10 00:00:00', 'members_only',
 'Lecture, Hands-on Editing, Final Project Critique',
 'Phòng máy tính 301 — Tòa A UTH',
 6, 6, NULL, 'QR-PREMIERE-WS'),

(23,
 'Buổi Chiếu Phim & Thảo Luận: Điện Ảnh Việt 2025',
 'Chiếu và phân tích các bộ phim Việt Nam đoạt giải quốc tế năm 2025. Diễn giả: nhà phê bình điện ảnh Trần Hữu Tuấn.',
 'approved',
 'https://placehold.co/600x400?text=Phim+Viet+2025',
 '2026-01-10 08:00:00',
 '2026-03-10 18:00:00',
 0, 100, '2026-03-08 23:59:59', 'public',
 'Chiếu phim, Phân tích tác phẩm, Thảo luận nhóm',
 'Hội trường B — UTH',
 6, 4, NULL, 'QR-VN-FILM'),

-- ── CLB Khoa Học (club 7) ──────────────────────────────────────────────────
(24,
 'Seminar: Trí Tuệ Nhân Tạo Trong Y Tế',
 'PGS.TS từ Đại học Y Dược TP.HCM trình bày về ứng dụng AI trong chẩn đoán hình ảnh, phân tích gen và phát triển thuốc. Q&A mở.',
 'completed',
 'https://placehold.co/600x400?text=AI+Y+Te',
 '2025-10-15 08:00:00',
 '2025-11-12 14:00:00',
 65, 100, NULL, 'public',
 'Keynote, Panel Discussion, Poster Session',
 'Hội trường C — UTH',
 7, 8, NULL, 'QR-AI-HEALTH'),

(25,
 'Olympic Khoa Học Sinh Viên UTH 2025',
 'Cuộc thi kiến thức khoa học liên ngành: Toán, Lý, Hóa, Sinh, Kỹ thuật. Vòng bán kết trắc nghiệm, vòng chung kết thi vấn đáp.',
 'completed',
 'https://placehold.co/600x400?text=Olympic+KH',
 '2025-11-01 08:00:00',
 '2025-12-15 08:00:00',
 50, 200, '2025-11-25 00:00:00', 'public',
 'Thi trắc nghiệm, Thi vấn đáp, Thực hành thí nghiệm',
 'Phòng thi + Lab khoa học UTH',
 7, 10, 'https://supabase.co/storage/v1/object/public/proposals/olympic-sci.pdf', 'QR-OLYMPIC-SCI'),

(26,
 'Ngày Hội Báo Cáo NCKH Sinh Viên 2026',
 'Sinh viên trình bày kết quả nghiên cứu khoa học. Hội đồng gồm GS, PGS chấm điểm và cho phản biện. Giải nhất được hỗ trợ kinh phí nghiên cứu tiếp.',
 'approved',
 'https://placehold.co/600x400?text=Bao+Cao+NCKH',
 '2026-01-15 08:00:00',
 '2026-03-18 08:00:00',
 0, 150, '2026-03-10 23:59:59', 'public',
 'Poster Presentation, Oral Presentation, Phản biện, Trao giải',
 'Toà nhà NCKH — UTH',
 7, 15, 'https://supabase.co/storage/v1/object/public/proposals/research-day.pdf', 'QR-NCKH-2026'),

-- ── CLB Yoga (club 8) ─────────────────────────────────────────────────────
(27,
 'Khoá Yoga Detox: Đón Năm Mới Khoẻ Mạnh',
 'Khoá tập yoga 5 ngày cuối năm: tập trung vào hơi thở, căng giãn và thiền định. Phù hợp người mới bắt đầu.',
 'completed',
 'https://placehold.co/600x400?text=Yoga+Detox',
 '2025-12-01 08:00:00',
 '2025-12-26 06:30:00',
 45, 50, '2025-12-20 00:00:00', 'public',
 'Pranayama, Asana, Meditation, Relaxation',
 'Phòng Yoga 101 — Tòa C UTH',
 8, 5, NULL, 'QR-YOGA-DETOX'),

(28,
 'Workshop: Thiền Chánh Niệm Cho Kỳ Thi',
 'Kỹ thuật thiền mindfulness giúp giảm lo âu trước kỳ thi: hít thở 4-7-8, body scan, visualisation. Dành riêng cho sinh viên mùa cuối kỳ.',
 'completed',
 'https://placehold.co/600x400?text=Thien+Chanh+Niem',
 '2025-12-15 08:00:00',
 '2026-01-10 09:00:00',
 38, 40, '2026-01-05 00:00:00', 'public',
 'Guided Meditation, Breathing Exercise, Q&A',
 'Phòng Yoga 101 — Tòa C UTH',
 8, 3, NULL, 'QR-MEDITATION'),

(29,
 'Yoga Ngoài Trời — Bình Minh Rạng Đông',
 'Buổi tập yoga ngoài trời vào lúc bình minh, đón ánh mặt trời đầu năm. Free for all, không cần đăng ký trước.',
 'approved',
 'https://placehold.co/600x400?text=Yoga+Ngoai+Troi',
 '2026-01-01 08:00:00',
 '2026-03-21 05:45:00',
 0, NULL, NULL, 'public',
 'Sunrise Yoga Flow, Pranayama, Phần thưởng bốc thăm',
 'Sân cỏ trung tâm UTH',
 8, 2, NULL, 'QR-SUNRISE-YOGA'),

-- ── CLB Văn Học (club 9) ──────────────────────────────────────────────────
(30,
 'Đêm Thơ "Tháng Chạp" — Tập San Mực Tím Số 5',
 'Ra mắt tập san Mực Tím số 5 và đêm đọc thơ do các thành viên CLB trình bày. Mở cửa tự do, có bán sách ký tặng.',
 'completed',
 'https://placehold.co/600x400?text=Dem+Tho',
 '2025-11-10 08:00:00',
 '2025-12-20 18:00:00',
 55, 100, NULL, 'public',
 'Đọc thơ, Ra mắt tập san, Ký sách, Giao lưu tác giả',
 'Thư viện UTH — Tầng 2',
 9, 5, NULL, 'QR-LIT-NIGHT'),

(31,
 'Workshop: Kỹ Thuật Viết Truyện Ngắn Hiện Đại',
 'Nhà văn trẻ Nguyễn Ngọc Tư (thế hệ 2K) chia sẻ kỹ thuật xây dựng nhân vật, plot twist, kết thúc mở. Có bài tập viết nhóm.',
 'completed',
 'https://placehold.co/600x400?text=Viet+Truyen+Ngan',
 '2025-11-20 08:00:00',
 '2025-12-28 09:00:00',
 30, 35, '2025-12-20 00:00:00', 'members_only',
 'Lecture, Group Writing Exercise, Story Critique',
 'Phòng hội thảo 401 — Tòa D UTH',
 9, 8, NULL, 'QR-WRITE-WS'),

(32,
 'Cuộc Thi Viết "Nhật Ký Sinh Viên 2026"',
 'Viết nhật ký sáng tạo về năm đầu đại học. Thể loại: truyện ngắn, thơ, tản văn, editorial. Xuất bản kết quả trên tạp chí địa phương.',
 'approved',
 'https://placehold.co/600x400?text=Nhat+Ky+SV',
 '2026-01-20 08:00:00',
 '2026-03-30 09:00:00',
 0, NULL, '2026-03-25 23:59:59', 'public',
 'Nộp bài, Bình xét, Trao giải, Xuất bản',
 'Online + Hội trường D UTH',
 9, 10, NULL, 'QR-DIARY-2026'),

-- ── CLB Gaming (club 10) ──────────────────────────────────────────────────
(33,
 'Giải Valorant UTH Open 2025 — Mùa Thu',
 'Giải Valorant 5v5 dành cho sinh viên UTH. 16 đội, giải thưởng tiền mặt + trang bị gaming. Stream trực tiếp trên Twitch UTH Esports.',
 'completed',
 'https://placehold.co/600x400?text=Valorant+2025',
 '2025-10-01 08:00:00',
 '2025-11-08 10:00:00',
 96, 128, '2025-11-01 00:00:00', 'public',
 'Đăng ký đội, Bốc thăm, Vòng bảng, Playoffs, Grand Final',
 'Phòng Gaming Lab 501 — Tòa E UTH',
 10, 15, 'https://supabase.co/storage/v1/object/public/proposals/valorant-open.pdf', 'QR-VAL-OPEN'),

(34,
 'Giải Cờ Vua & Cờ Vây Nội Bộ Tháng 12',
 'Giải đấu cờ vua và cờ vây nội bộ dành cho thành viên CLB. Elo rating cập nhật sau giải. Hạng nhất được đăng ký thi giải sinh viên toàn quốc.',
 'completed',
 'https://placehold.co/600x400?text=Co+Vua+Co+Vay',
 '2025-11-15 08:00:00',
 '2025-12-20 09:00:00',
 24, 32, '2025-12-15 00:00:00', 'members_only',
 'Bốc thăm, Swiss System, Vòng chung kết, Trao giải',
 'Phòng hội thảo 204 — Tòa B UTH',
 10, 5, NULL, 'QR-CHESS-DEC'),

(35,
 'LAN Party: "Tết Esports" — Đón Tết Bính Ngọ',
 'LAN Party 12 tiếng đêm giao thừa với các tựa game nổi tiếng, mini-game đặc biệt, bốc thăm trúng thưởng PC gaming.',
 'completed',
 'https://placehold.co/600x400?text=LAN+Party+Tet',
 '2026-01-10 08:00:00',
 '2026-01-28 18:00:00',
 60, 100, NULL, 'public',
 'LAN Games, Mini-games, Lucky Draw, Countdown',
 'Phòng Gaming Lab 501 + 502 — Tòa E UTH',
 10, 8, NULL, 'QR-LAN-TET'),

(36,
 'Giải LMHT UTH Championship 2026 — Mùa Xuân',
 'Giải LMHT 5v5 lớn nhất năm của UTH. 32 đội đăng ký, vòng bảng đấu online, vòng knockout đấu offline. Livestream toàn bộ.',
 'pending',
 'https://placehold.co/600x400?text=LMHT+2026',
 '2026-02-20 08:00:00',
 '2026-04-18 10:00:00',
 0, 160, '2026-04-10 00:00:00', 'public',
 'Online Group Stage, Offline Knockout, Grand Final Concert',
 'Phòng Gaming Lab 501–504 + Hội trường A',
 10, 20, 'https://supabase.co/storage/v1/object/public/proposals/lol-champ.pdf', 'QR-LOL-2026'),

-- ── CLB Khởi Nghiệp (club 11) ─────────────────────────────────────────────
(37,
 'Startup Weekend UTH 2025 — 54 Hours to Build',
 '54 giờ biến ý tưởng thành MVP: pitch idea, lập nhóm, build sản phẩm, demo trước mentor & nhà đầu tư. Giải nhất nhận 50 triệu đồng seed fund.',
 'completed',
 'https://placehold.co/600x400?text=Startup+Weekend',
 '2025-10-15 08:00:00',
 '2025-11-14 18:00:00',
 72, 100, '2025-11-10 00:00:00', 'public',
 'Idea Pitching, Team Formation, Building, Mentoring, Demo',
 'Toàn bộ Tòa B — UTH',
 11, 20, 'https://supabase.co/storage/v1/object/public/proposals/startup-weekend.pdf', 'QR-STARTUP-WK'),

(38,
 'Workshop: Xây Dựng Business Model Canvas',
 'Chuyên gia tư vấn startup hướng dẫn phân tích BMC, Value Proposition, Customer Segment. Làm việc nhóm trực tiếp.',
 'completed',
 'https://placehold.co/600x400?text=BMC+Workshop',
 '2025-11-20 08:00:00',
 '2025-12-22 09:00:00',
 40, 50, '2025-12-15 00:00:00', 'public',
 'Theory, Case Studies, Group Work, Presentation',
 'Phòng hội thảo 501 — Tòa E UTH',
 11, 5, NULL, 'QR-BMC-WS'),

(39,
 'Demo Day: "Trình Làng Startup UTH Q1/2026"',
 'Các startup từ chương trình incubator UTH trình bày sản phẩm và kêu gọi đầu tư trước 10 quỹ VC. Public event, mời toàn sinh viên tham dự.',
 'approved',
 'https://placehold.co/600x400?text=Demo+Day',
 '2026-01-20 08:00:00',
 '2026-03-12 14:00:00',
 0, 200, '2026-03-10 23:59:59', 'public',
 'Pitch 5 phút/startup, Q&A VCs, Networking',
 'Hội trường A — UTH',
 11, 10, 'https://supabase.co/storage/v1/object/public/proposals/demo-day.pdf', 'QR-DEMO-DAY'),

(40,
 'Cuộc Thi Ý Tưởng Khởi Nghiệp Xanh 2026',
 'Cuộc thi tìm kiếm mô hình kinh doanh bền vững, thân thiện môi trường. Kết hợp với Bộ KH&ĐT và UNDP Việt Nam.',
 'pending',
 'https://placehold.co/600x400?text=Green+Startup',
 '2026-02-25 08:00:00',
 '2026-04-20 09:00:00',
 0, NULL, '2026-04-10 00:00:00', 'public',
 'Nộp hồ sơ, Vòng thuyết trình, Vòng demo, Trao giải',
 'Hội trường C — UTH',
 11, 15, NULL, 'QR-GREEN-IDEAS'),

-- ── CLB Môi Trường (club 12) ───────────────────────────────────────────────
(41,
 'Chiến Dịch Trồng 1000 Cây — Kỷ Niệm 30 Năm UTH',
 'Kỷ niệm 30 năm thành lập UTH: cùng nhau trồng 1000 cây xanh trong khuôn viên trường và các trường học lân cận. Cây được gắn QR mã theo dõi.',
 'completed',
 'https://placehold.co/600x400?text=Trong+Cay+1000',
 '2025-09-15 08:00:00',
 '2025-10-30 07:00:00',
 120, 500, NULL, 'public',
 'Xuất phát, Đào hố, Trồng cây, Gắn QR, Ảnh kỷ niệm',
 'Khuôn viên UTH + Trường TH Quận 7',
 12, 10, 'https://supabase.co/storage/v1/object/public/proposals/tree-planting.pdf', 'QR-TREE-1000'),

(42,
 'Hội Thảo: Biến Đổi Khí Hậu & Giới Trẻ Hành Động',
 'GS. Nguyễn Hữu Ninh (IPCC Việt Nam) chia sẻ báo cáo khí hậu mới nhất. Workshop xây dựng kế hoạch hành động cá nhân cho sinh viên.',
 'completed',
 'https://placehold.co/600x400?text=BDKH+Hoi+Thao',
 '2025-11-10 08:00:00',
 '2025-12-03 14:00:00',
 75, 100, NULL, 'public',
 'Keynote, Group Workshop, Action Plan Presentation',
 'Hội trường B — UTH',
 12, 5, NULL, 'QR-CLIMATE-WS'),

(43,
 'Zero Waste Week UTH 2026',
 'Thách thức 7 ngày không rác: không túi nylon, mang bình nước riêng, phân loại rác đúng cách. Theo dõi qua app và bảng xếp hạng live.',
 'approved',
 'https://placehold.co/600x400?text=Zero+Waste',
 '2026-01-25 08:00:00',
 '2026-03-09 08:00:00',
 0, 500, '2026-03-05 00:00:00', 'public',
 'Kick-off, Daily Challenges, Check-in, Tổng kết',
 'Toàn khuôn viên UTH',
 12, 10, 'https://supabase.co/storage/v1/object/public/proposals/zero-waste.pdf', 'QR-ZERO-WASTE'),

(44,
 'Triển Lãm Ảnh: "Trái Đất Đang Kêu Cứu"',
 'Triển lãm ảnh về biến đổi khí hậu: băng tan, lũ lụt, ô nhiễm đại dương. Ảnh từ National Geographic và ảnh sinh viên UTH thực hiện.',
 'rejected',
 'https://placehold.co/600x400?text=Trien+Lam+Moi+Truong',
 '2025-09-20 08:00:00',
 '2025-10-10 09:00:00',
 0, NULL, NULL, 'public',
 'Khai mạc, Guided Tour, Discussion',
 'Hành lang Tòa B — UTH',
 12, 0, NULL, NULL);

SELECT setval(pg_get_serial_sequence('event', 'id'), MAX(id)) FROM event;

-- ===========================================================================
-- 5. EVENT_REGISTRATIONS
-- ===========================================================================
-- Chỉ đăng ký cho các event có status = 'approved' và đã/sắp xảy ra.
-- attending_users_number trên event đã được set chính xác ở trên.
-- Tối thiểu 3–6 sinh viên/event để thống kê có ý nghĩa.
-- UNIQUE constraint: (eventId, userId) — không trùng.
-- ===========================================================================

INSERT INTO event_registrations
  ("eventId", "userId", created_at, attended, "attendedAt")
VALUES

-- Event 1: Hackathon UTH 2025 (club 1) — attending 45
(1, 14, '2025-10-10 09:00:00', TRUE, '2025-11-15 10:00:00'), (1, 15, '2025-10-11 09:00:00', TRUE, '2025-11-15 10:00:00'),
(1, 16, '2025-10-12 09:00:00', TRUE, '2025-11-15 10:00:00'), (1, 17, '2025-10-13 09:00:00', TRUE, '2025-11-15 10:00:00'),
(1, 18, '2025-10-14 09:00:00', TRUE, '2025-11-15 10:00:00'), (1, 19, '2025-10-15 09:00:00', TRUE, '2025-11-15 10:00:00'),
(1, 20, '2025-10-16 09:00:00', TRUE, '2025-11-15 10:00:00'), (1, 21, '2025-10-17 09:00:00', TRUE, '2025-11-15 10:00:00'),

-- Event 2: Workshop NestJS (club 1) — attending 32
(2, 14, '2025-11-05 09:00:00', TRUE, '2025-12-05 11:00:00'), (2, 15, '2025-11-05 09:10:00', TRUE, '2025-12-05 11:00:00'),
(2, 16, '2025-11-06 09:00:00', TRUE, '2025-12-05 11:00:00'), (2, 17, '2025-11-06 09:10:00', TRUE, '2025-12-05 11:00:00'),
(2, 32, '2025-11-07 09:00:00', TRUE, '2025-12-05 11:00:00'), (2, 33, '2025-11-07 09:10:00', TRUE, '2025-12-05 11:00:00'),

-- Event 5: Concert Mùa Thu Vàng (club 2) — attending 120
(5, 14, '2025-10-20 09:00:00', TRUE, '2025-11-20 20:00:00'), (5, 15, '2025-10-20 09:10:00', TRUE, '2025-11-20 20:00:00'),
(5, 16, '2025-10-21 09:00:00', TRUE, '2025-11-20 20:00:00'), (5, 18, '2025-10-21 09:10:00', TRUE, '2025-11-20 20:00:00'),
(5, 19, '2025-10-22 09:00:00', TRUE, '2025-11-20 20:00:00'), (5, 20, '2025-10-22 09:10:00', TRUE, '2025-11-20 20:00:00'),
(5, 23, '2025-10-23 09:00:00', TRUE, '2025-11-20 20:00:00'), (5, 25, '2025-10-23 09:10:00', TRUE, '2025-11-20 20:00:00'),

-- Event 6: Workshop Nhạc Lý (club 2) — attending 28
(6, 18, '2025-11-12 09:00:00', FALSE, NULL), (6, 19, '2025-11-12 09:10:00', FALSE, NULL),
(6, 20, '2025-11-13 09:00:00', FALSE, NULL), (6, 33, '2025-11-13 09:10:00', FALSE, NULL),
(6, 35, '2025-11-14 09:00:00', FALSE, NULL),

-- Event 9: Giải Bóng Đá (club 3) — attending 80
(9, 21, '2025-10-01 09:00:00', TRUE, '2025-11-10 09:00:00'), (9, 22, '2025-10-01 09:10:00', TRUE, '2025-11-10 09:00:00'),
(9, 23, '2025-10-02 09:00:00', TRUE, '2025-11-10 09:00:00'), (9, 24, '2025-10-02 09:10:00', TRUE, '2025-11-10 09:00:00'),
(9, 25, '2025-10-03 09:00:00', TRUE, '2025-11-10 09:00:00'), (9, 26, '2025-10-03 09:10:00', TRUE, '2025-11-10 09:00:00'),
(9, 27, '2025-10-04 09:00:00', TRUE, '2025-11-10 09:00:00'),

-- Event 10: Giải Cầu Lông (club 3) — attending 40
(10, 21, '2025-10-20 09:00:00', FALSE, NULL), (10, 22, '2025-10-20 09:10:00', FALSE, NULL),
(10, 23, '2025-10-21 09:00:00', FALSE, NULL), (10, 34, '2025-10-21 09:10:00', FALSE, NULL),
(10, 36, '2025-10-22 09:00:00', FALSE, NULL),

-- Event 11: Buổi Tập Thể Dục (club 3) — attending 200
(11, 14, '2025-12-05 09:00:00', FALSE, NULL), (11, 15, '2025-12-05 09:10:00', FALSE, NULL),
(11, 16, '2025-12-06 09:00:00', FALSE, NULL), (11, 17, '2025-12-06 09:10:00', FALSE, NULL),
(11, 18, '2025-12-07 09:00:00', FALSE, NULL), (11, 19, '2025-12-07 09:10:00', FALSE, NULL),

-- Event 13: Triển Lãm Ảnh (club 4) — attending 150
(13, 24, '2025-10-25 09:00:00', TRUE, '2025-11-25 11:00:00'), (13, 25, '2025-10-25 09:10:00', TRUE, '2025-11-25 11:00:00'),
(13, 26, '2025-10-26 09:00:00', TRUE, '2025-11-25 11:00:00'), (13, 27, '2025-10-26 09:10:00', TRUE, '2025-11-25 11:00:00'),
(13, 28, '2025-10-27 09:00:00', TRUE, '2025-11-25 11:00:00'), (13, 29, '2025-10-27 09:10:00', TRUE, '2025-11-25 11:00:00'),

-- Event 14: Workshop LR/PS (club 4) — attending 25
(14, 24, '2025-11-18 09:00:00', FALSE, NULL), (14, 25, '2025-11-18 09:10:00', FALSE, NULL),
(14, 35, '2025-11-19 09:00:00', FALSE, NULL), (14, 36, '2025-11-19 09:10:00', FALSE, NULL),

-- Event 17: Mùa Hè Xanh (club 5) — attending 35
(17, 26, '2025-06-05 09:00:00', TRUE, '2025-07-15 10:00:00'), (17, 27, '2025-06-05 09:10:00', TRUE, '2025-07-15 10:00:00'),
(17, 28, '2025-06-06 09:00:00', TRUE, '2025-07-15 10:00:00'), (17, 29, '2025-06-06 09:10:00', TRUE, '2025-07-15 10:00:00'),
(17, 30, '2025-06-07 09:00:00', TRUE, '2025-07-15 10:00:00'),

-- Event 18: Hiến Máu (club 5) — attending 280
(18, 14, '2025-09-05 09:00:00', TRUE, '2025-10-20 10:00:00'), (18, 15, '2025-09-05 09:10:00', TRUE, '2025-10-20 10:00:00'),
(18, 16, '2025-09-06 09:00:00', TRUE, '2025-10-20 10:00:00'), (18, 17, '2025-09-06 09:10:00', TRUE, '2025-10-20 10:00:00'),
(18, 18, '2025-09-07 09:00:00', TRUE, '2025-10-20 10:00:00'), (18, 19, '2025-09-07 09:10:00', TRUE, '2025-10-20 10:00:00'),
(18, 26, '2025-09-08 09:00:00', TRUE, '2025-10-20 10:00:00'), (18, 27, '2025-09-08 09:10:00', TRUE, '2025-10-20 10:00:00'),

-- Event 21: Liên Hoan Phim (club 6) — attending 90
(21, 29, '2025-10-05 09:00:00', FALSE, NULL), (21, 30, '2025-10-05 09:10:00', FALSE, NULL),
(21, 31, '2025-10-06 09:00:00', FALSE, NULL), (21, 32, '2025-10-06 09:10:00', FALSE, NULL),
(21, 33, '2025-10-07 09:00:00', FALSE, NULL),

-- Event 22: Workshop Premiere (club 6) — attending 22
(22, 29, '2025-11-22 09:00:00', FALSE, NULL), (22, 30, '2025-11-22 09:10:00', FALSE, NULL),
(22, 37, '2025-11-23 09:00:00', FALSE, NULL), (22, 38, '2025-11-23 09:10:00', FALSE, NULL),

-- Event 24: Seminar AI Y Tế (club 7) — attending 65
(24, 31, '2025-10-20 09:00:00', FALSE, NULL), (24, 32, '2025-10-20 09:10:00', FALSE, NULL),
(24, 14, '2025-10-21 09:00:00', FALSE, NULL), (24, 15, '2025-10-21 09:10:00', FALSE, NULL),
(24, 17, '2025-10-22 09:00:00', FALSE, NULL), (24, 38, '2025-10-22 09:10:00', FALSE, NULL),

-- Event 25: Olympic Khoa Học (club 7) — attending 50
(25, 31, '2025-11-05 09:00:00', FALSE, NULL), (25, 32, '2025-11-05 09:10:00', FALSE, NULL),
(25, 33, '2025-11-06 09:00:00', FALSE, NULL), (25, 34, '2025-11-06 09:10:00', FALSE, NULL),

-- Event 27: Yoga Detox (club 8) — attending 45
(27, 33, '2025-12-05 09:00:00', FALSE, NULL), (27, 34, '2025-12-05 09:10:00', FALSE, NULL),
(27, 35, '2025-12-06 09:00:00', FALSE, NULL), (27, 36, '2025-12-06 09:10:00', FALSE, NULL),
(27, 18, '2025-12-07 09:00:00', FALSE, NULL),

-- Event 28: Thiền Chánh Niệm (club 8) — attending 38
(28, 33, '2025-12-18 09:00:00', FALSE, NULL), (28, 34, '2025-12-18 09:10:00', FALSE, NULL),
(28, 39, '2025-12-19 09:00:00', FALSE, NULL), (28, 40, '2025-12-19 09:10:00', FALSE, NULL),

-- Event 30: Đêm Thơ (club 9) — attending 55
(30, 35, '2025-11-15 09:00:00', FALSE, NULL), (30, 36, '2025-11-15 09:10:00', FALSE, NULL),
(30, 29, '2025-11-16 09:00:00', FALSE, NULL), (30, 30, '2025-11-16 09:10:00', FALSE, NULL),
(30, 20, '2025-11-17 09:00:00', FALSE, NULL),

-- Event 31: Workshop Truyện Ngắn (club 9) — attending 30
(31, 35, '2025-11-25 09:00:00', FALSE, NULL), (31, 36, '2025-11-25 09:10:00', FALSE, NULL),
(31, 37, '2025-11-26 09:00:00', FALSE, NULL), (31, 20, '2025-11-26 09:10:00', FALSE, NULL),

-- Event 33: Giải Valorant (club 10) — attending 96
(33, 37, '2025-10-05 09:00:00', FALSE, NULL), (33, 38, '2025-10-05 09:10:00', FALSE, NULL),
(33, 21, '2025-10-06 09:00:00', FALSE, NULL), (33, 22, '2025-10-06 09:10:00', FALSE, NULL),
(33, 23, '2025-10-07 09:00:00', FALSE, NULL), (33, 14, '2025-10-07 09:10:00', FALSE, NULL),

-- Event 34: Giải Cờ Vua (club 10) — attending 24
(34, 37, '2025-11-20 09:00:00', FALSE, NULL), (34, 38, '2025-11-20 09:10:00', FALSE, NULL),
(34, 24, '2025-11-21 09:00:00', FALSE, NULL), (34, 25, '2025-11-21 09:10:00', FALSE, NULL),

-- Event 35: LAN Party Tết (club 10) — attending 60
(35, 37, '2026-01-15 09:00:00', FALSE, NULL), (35, 38, '2026-01-15 09:10:00', FALSE, NULL),
(35, 21, '2026-01-16 09:00:00', FALSE, NULL), (35, 22, '2026-01-16 09:10:00', FALSE, NULL),
(35, 39, '2026-01-17 09:00:00', FALSE, NULL), (35, 40, '2026-01-17 09:10:00', FALSE, NULL),

-- Event 37: Startup Weekend (club 11) — attending 72
(37, 39, '2025-10-20 09:00:00', FALSE, NULL), (37, 40, '2025-10-20 09:10:00', FALSE, NULL),
(37, 14, '2025-10-21 09:00:00', FALSE, NULL), (37, 17, '2025-10-21 09:10:00', FALSE, NULL),
(37, 15, '2025-10-22 09:00:00', FALSE, NULL), (37, 32, '2025-10-22 09:10:00', FALSE, NULL),

-- Event 38: Workshop BMC (club 11) — attending 40
(38, 39, '2025-11-25 09:00:00', FALSE, NULL), (38, 40, '2025-11-25 09:10:00', FALSE, NULL),
(38, 14, '2025-11-26 09:00:00', FALSE, NULL), (38, 15, '2025-11-26 09:10:00', FALSE, NULL),
(38, 34, '2025-11-27 09:00:00', FALSE, NULL),

-- Event 41: Trồng 1000 Cây (club 12) — attending 120
(41, 14, '2025-09-20 09:00:00', FALSE, NULL), (41, 15, '2025-09-20 09:10:00', FALSE, NULL),
(41, 40, '2025-09-21 09:00:00', FALSE, NULL), (41, 26, '2025-09-21 09:10:00', FALSE, NULL),
(41, 27, '2025-09-22 09:00:00', FALSE, NULL), (41, 28, '2025-09-22 09:10:00', FALSE, NULL),

-- Event 42: Hội Thảo BĐKH (club 12) — attending 75
(42, 14, '2025-11-12 09:00:00', FALSE, NULL), (42, 40, '2025-11-12 09:10:00', FALSE, NULL),
(42, 15, '2025-11-13 09:00:00', FALSE, NULL), (42, 17, '2025-11-13 09:10:00', FALSE, NULL),
(42, 31, '2025-11-14 09:00:00', FALSE, NULL), (42, 32, '2025-11-14 09:10:00', FALSE, NULL);

COMMIT;

-- ===========================================================================
-- KIỂM TRA SAU SEED
-- ===========================================================================
-- SELECT 'user'         AS tbl, COUNT(*) FROM "user"              UNION ALL
-- SELECT 'club'         AS tbl, COUNT(*) FROM club                UNION ALL
-- SELECT 'membership'   AS tbl, COUNT(*) FROM membership          UNION ALL
-- SELECT 'event'        AS tbl, COUNT(*) FROM event               UNION ALL
-- SELECT 'event_reg'    AS tbl, COUNT(*) FROM event_registrations;
