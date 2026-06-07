-- =============================================================================
-- refresh-dates.sql — Cập nhật thời gian cho dữ liệu test
-- Chạy SAU KHI seed, dùng để làm mới ngày tháng về thời điểm hiện tại
-- =============================================================================
-- Cách chạy:
--   PGPASSWORD="..." psql -h aws-0-ap-southeast-1.pooler.supabase.com \
--     -U postgres.sxicravdmtiseybwmdaa -d postgres -f refresh-dates.sql
-- =============================================================================

BEGIN;

-- ===========================================================================
-- 1. EVENTS — Cập nhật ngày cho sự kiện
-- ===========================================================================
-- Quy tắc:
--   completed → cách đây 1-2 tháng
--   approved  → 2-4 tuần tới
--   pending   → 1-3 tháng tới
--   canceled/rejected → giữ nguyên không cần
-- ===========================================================================

-- ── Events "completed": đẩy về quá khứ gần ─────────────────────────────────
-- date: cách đây ~45-75 ngày, endDate: +2-4h sau date
UPDATE "event"
SET
  date        = (CURRENT_DATE - INTERVAL '60 days' + (id % 5) * INTERVAL '3 days')::timestamp + TIME '08:00:00',
  "endDate"   = (CURRENT_DATE - INTERVAL '60 days' + (id % 5) * INTERVAL '3 days')::timestamp + TIME '10:00:00',
  "createdAt" = (CURRENT_DATE - INTERVAL '90 days' + (id % 5) * INTERVAL '2 days')::timestamp + TIME '08:00:00',
  registration_deadline = (CURRENT_DATE - INTERVAL '65 days' + (id % 5) * INTERVAL '3 days')::timestamp + TIME '23:59:59'
WHERE status = 'completed';

-- ── Events "approved": đẩy lên tương lai gần ──────────────────────────────
UPDATE "event"
SET
  date        = (CURRENT_DATE + INTERVAL '14 days' + (id % 5) * INTERVAL '5 days')::timestamp + TIME '08:00:00',
  "endDate"   = (CURRENT_DATE + INTERVAL '14 days' + (id % 5) * INTERVAL '5 days')::timestamp + TIME '11:00:00',
  "createdAt" = (CURRENT_DATE - INTERVAL '5 days' + (id % 3) * INTERVAL '1 day')::timestamp + TIME '08:00:00',
  registration_deadline = (CURRENT_DATE + INTERVAL '10 days' + (id % 5) * INTERVAL '5 days')::timestamp + TIME '23:59:59'
WHERE status = 'approved';

-- ── Events "pending": đẩy xa hơn ─────────────────────────────────────────
UPDATE "event"
SET
  date        = (CURRENT_DATE + INTERVAL '40 days' + (id % 4) * INTERVAL '7 days')::timestamp + TIME '08:00:00',
  "endDate"   = (CURRENT_DATE + INTERVAL '40 days' + (id % 4) * INTERVAL '7 days')::timestamp + TIME '10:00:00',
  "createdAt" = (CURRENT_DATE - INTERVAL '7 days' + (id % 2) * INTERVAL '1 day')::timestamp + TIME '08:00:00',
  registration_deadline = (CURRENT_DATE + INTERVAL '35 days' + (id % 4) * INTERVAL '7 days')::timestamp + TIME '23:59:59'
WHERE status = 'pending';

-- ── Event canceled: không cần chính xác, cho cách đây 1 tháng ─────────────
UPDATE "event"
SET
  date        = (CURRENT_DATE - INTERVAL '30 days')::timestamp + TIME '09:00:00',
  "endDate"   = (CURRENT_DATE - INTERVAL '30 days')::timestamp + TIME '11:00:00',
  "createdAt" = (CURRENT_DATE - INTERVAL '45 days')::timestamp + TIME '08:00:00'
WHERE status IN ('canceled', 'rejected');

-- ===========================================================================
-- 2. EVENT REGISTRATIONS — Cập nhật ngày đăng ký & điểm danh
-- ===========================================================================
-- Dùng correlation với event mới để giữ consistency
UPDATE event_registrations er
SET
  created_at  = (e.date - INTERVAL '5 days' + (er.id % 10) * INTERVAL '1 hour')::timestamp,
  "attendedAt" = CASE WHEN er.attended = TRUE THEN e.date + INTERVAL '1 hour' + (er.id % 5) * INTERVAL '5 minutes' ELSE NULL END
FROM "event" e
WHERE er."eventId" = e.id
  AND e.status IN ('completed', 'approved', 'pending', 'canceled', 'rejected');

-- ===========================================================================
-- 3. MEMBERSHIPS — Cập nhật ngày yêu cầu / gia nhập
-- ===========================================================================
UPDATE membership
SET
  request_date = (CURRENT_DATE - INTERVAL '60 days' + (id % 10) * INTERVAL '2 days')::timestamp + TIME '10:00:00',
  join_date    = CASE WHEN status = 'approved'
                      THEN (CURRENT_DATE - INTERVAL '50 days' + (id % 10) * INTERVAL '2 days')::timestamp + TIME '10:00:00'
                      ELSE NULL END
WHERE 1=1;

-- ===========================================================================
-- 4. USERS — Cập nhật createdAt (không quan trọng, nhưng cho đồng bộ)
-- ===========================================================================
UPDATE "user"
SET "createdAt" = (CURRENT_DATE - INTERVAL '120 days' + (id % 20) * INTERVAL '3 days')::timestamp + TIME '08:00:00'
WHERE role = 'club_owner';

UPDATE "user"
SET "createdAt" = (CURRENT_DATE - INTERVAL '60 days' + (id % 30) * INTERVAL '1 day')::timestamp + TIME '08:00:00'
WHERE role = 'user';

-- ===========================================================================
-- 5. Reset attending_users_number về 0 cho các event chưa diễn ra
-- ===========================================================================
UPDATE "event"
SET attending_users_number = 0
WHERE status IN ('approved', 'pending');

COMMIT;

-- ===========================================================================
-- Kiểm tra kết quả
-- ===========================================================================
SELECT id, name, status, date::date AS ngay, "endDate"::date AS ket_thuc
FROM "event"
ORDER BY date;
