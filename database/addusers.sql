INSERT INTO "user"
(id, name, email, password, role, mssv, "isVerified", "verificationToken", "createdAt", "resetToken", "resetTokenExpires")
VALUES
(13, 'Doan Thi K', 'k.doan@example.com', 'hashedpassword13', 'club_owner', 'SV007', false, NULL, '2025-11-21 15:25:01.079357', NULL, NULL),
(14, 'Pham Van L', 'l.pham@example.com', 'hashedpassword14', 'club_owner', NULL, false, NULL, '2025-11-21 15:25:01.079357', NULL, NULL),
(15, 'Tran Thi M', 'm.tran@example.com', 'hashedpassword15', 'club_owner', 'SV008', false, 'token789', '2025-11-21 15:25:01.079357', NULL, NULL),
(16, 'Nguyen Van N', 'n.nguyen@example.com', 'hashedpassword16', 'club_owner', 'SV009', false, NULL, '2025-11-21 15:25:01.079357', 'resettoken2', '2025-11-23 15:25:01.079357'),
(17, 'Hoang Thi O', 'o.hoang@example.com', 'hashedpassword17', 'club_owner', NULL, false, NULL, '2025-11-21 15:25:01.079357', NULL, NULL);
