INSERT INTO "membership" 
("id", "join_reason", "skills", "request_date", "join_date", "promise", "status", "clubId", "userId")
VALUES
(1, 'Yêu thích văn học', 'Đọc, viết', NOW() - INTERVAL '10 day', NOW() - INTERVAL '7 day', 'Tham gia đầy đủ', 'approved', 1, 1),
(2, 'Muốn chơi bóng đá', 'Thể lực, chiến thuật', NOW() - INTERVAL '8 day', NOW() - INTERVAL '5 day', 'Tuân thủ luật', 'approved', 2, 2),
(3, 'Đam mê âm nhạc', 'Hát, đàn', NOW() - INTERVAL '15 day', NOW() - INTERVAL '12 day', 'Chăm chỉ tập luyện', 'approved', 3, 3),
(4, 'Học lập trình', 'NodeJS, TS', NOW() - INTERVAL '20 day', NOW() - INTERVAL '18 day', 'Hoàn thành project', 'approved', 4, 4),
(5, 'Thích chụp ảnh', 'Chụp ảnh, chỉnh sửa', NOW() - INTERVAL '25 day', NOW() - INTERVAL '22 day', 'Đăng ảnh hàng tuần', 'approved', 5, 5),
(6, 'Quan tâm môi trường', 'Tổ chức, dọn rác', NOW() - INTERVAL '5 day', NOW() - INTERVAL '2 day', 'Tham gia các hoạt động', 'approved', 6, 6),
(7, 'Thích xem phim', 'Review phim', NOW() - INTERVAL '12 day', NOW() - INTERVAL '10 day', 'Tham gia đủ buổi', 'approved', 7, 7),
(8, 'Rèn luyện Yoga', 'Yoga cơ bản', NOW() - INTERVAL '3 day', NOW() - INTERVAL '1 day', 'Tham gia đều đặn', 'approved', 8, 8),
(9, 'Yêu manga', 'Vẽ, cosplay', NOW() - INTERVAL '18 day', NOW() - INTERVAL '15 day', 'Sáng tạo nội dung', 'approved', 9, 9),
(10, 'Thích robot', 'Lập trình, cơ khí', NOW() - INTERVAL '7 day', NOW() - INTERVAL '5 day', 'Tham gia dự án', 'approved', 10, 10);
