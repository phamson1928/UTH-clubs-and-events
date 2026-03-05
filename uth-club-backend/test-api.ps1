# ==============================================================================
# UTH Clubs & Events - API Test Script (PowerShell)
# Seed accounts:
#   admin@uth.edu.vn     / Admin@123
#   an.nguyen@uth.edu.vn / Owner@123  (club_owner, club 1)
#   quynh.ly@uth.edu.vn  / Student@123 (user, id=14)
# ==============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$BASE = "http://localhost:3000"
$TOKEN_ADMIN   = $null
$TOKEN_OWNER   = $null
$TOKEN_STUDENT = $null

function Print-Header($title) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "  $title" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
}
function Print-Test($label) { Write-Host "  > $label" -ForegroundColor Yellow }
function Print-OK($msg)   { Write-Host "    [OK]  $msg" -ForegroundColor Green }
function Print-FAIL($msg) { Write-Host "    [ERR] $msg" -ForegroundColor Red }
function Print-Info($msg) { Write-Host "    [INF] $msg" -ForegroundColor Gray }

function Call-Api {
    param(
        [string]$Method = "GET",
        [string]$Url,
        [hashtable]$Body = $null,
        [string]$Token = $null
    )
    $headers = @{}
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }

    $bodyJson = if ($Body) { $Body | ConvertTo-Json -Depth 5 -Compress } else { $null }

    try {
        $params = @{
            Method      = $Method
            Uri         = $Url
            Headers     = $headers
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        if ($bodyJson) { $params["Body"] = $bodyJson }
        $resp = Invoke-RestMethod @params
        return @{ ok = $true; data = $resp; code = 200 }
    } catch {
        $code = 0
        if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
        $msg = ""
        try { $msg = ($_.ErrorDetails.Message | ConvertFrom-Json).message } catch { $msg = $_.Exception.Message }
        return @{ ok = $false; data = $null; code = $code; message = $msg }
    }
}

function Expect-OK($r, $label) {
    if ($r.ok) { Print-OK "[$($r.code)] $label" }
    else { Print-FAIL "[$($r.code)] $label - $($r.message)" }
}

function Expect-Error($r, $expectedCode, $label) {
    if (-not $r.ok -and $r.code -eq $expectedCode) {
        Print-OK "[$($r.code)] $label - dung ky vong: $($r.message)"
    } elseif ($r.ok) {
        Print-FAIL "[2xx] $label - mong doi loi $expectedCode"
    } else {
        Print-FAIL "[$($r.code)] $label - mong doi $expectedCode, nhan: $($r.message)"
    }
}

# ==============================================================================
# 1. AUTH - Login
# ==============================================================================
Print-Header "1. AUTHENTICATION"

Print-Test "POST /auth/login - Admin"
$r = Call-Api -Method POST -Url "$BASE/auth/login" -Body @{ email = "admin@uth.edu.vn"; password = "Admin@123" }
if ($r.ok -and $r.data.access_token) {
    $TOKEN_ADMIN = $r.data.access_token
    Print-OK "Admin login OK. Token: $($TOKEN_ADMIN.Substring(0,30))..."
} else { Print-FAIL "Admin login that bai: $($r.message)"; exit 1 }

Print-Test "POST /auth/login - Club Owner (an.nguyen)"
$r = Call-Api -Method POST -Url "$BASE/auth/login" -Body @{ email = "an.nguyen@uth.edu.vn"; password = "Owner@123" }
if ($r.ok -and $r.data.access_token) {
    $TOKEN_OWNER = $r.data.access_token
    Print-OK "Owner login OK"
} else { Print-FAIL "Owner login that bai: $($r.message)" }

Print-Test "POST /auth/login - Student (quynh.ly, id=14)"
$r = Call-Api -Method POST -Url "$BASE/auth/login" -Body @{ email = "quynh.ly@uth.edu.vn"; password = "Student@123" }
if ($r.ok -and $r.data.access_token) {
    $TOKEN_STUDENT = $r.data.access_token
    Print-OK "Student login OK"
} else { Print-FAIL "Student login that bai: $($r.message)" }

Print-Test "POST /auth/login - Sai mat khau (expect 401)"
$r = Call-Api -Method POST -Url "$BASE/auth/login" -Body @{ email = "admin@uth.edu.vn"; password = "SaiPassword999" }
Expect-Error $r 401 "Login sai mat khau"

# ==============================================================================
# 2. USERS
# ==============================================================================
Print-Header "2. USERS"

Print-Test "GET /users/me - Student profile"
$r = Call-Api -Url "$BASE/users/me" -Token $TOKEN_STUDENT
if ($r.ok) { Print-OK "id=$($r.data.id), name=$($r.data.name), email=$($r.data.email), role=$($r.data.role)" }
else { Print-FAIL $r.message }

Print-Test "PATCH /users/me - Doi ten"
$r = Call-Api -Method PATCH -Url "$BASE/users/me" -Token $TOKEN_STUDENT -Body @{ name = "Ly Thi Quynh Updated" }
if ($r.ok) { Print-OK "Updated name=$($r.data.name)" }
else { Print-FAIL $r.message }

Print-Test "PATCH /users/me - Revert ten"
$r = Call-Api -Method PATCH -Url "$BASE/users/me" -Token $TOKEN_STUDENT -Body @{ name = "Ly Thi Quynh" }
if ($r.ok) { Print-OK "Revert OK: name=$($r.data.name)" } else { Print-FAIL $r.message }

Print-Test "PATCH /users/me/password - Doi mat khau"
$r = Call-Api -Method PATCH -Url "$BASE/users/me/password" -Token $TOKEN_STUDENT `
     -Body @{ currentPassword = "Student@123"; newPassword = "Student@456" }
if ($r.ok) {
    Print-OK "Doi mat khau OK"
    # Relogin voi mat khau moi
    $r2 = Call-Api -Method POST -Url "$BASE/auth/login" -Body @{ email = "quynh.ly@uth.edu.vn"; password = "Student@456" }
    if ($r2.ok) {
        $TOKEN_STUDENT = $r2.data.access_token
        Print-OK "Login lai voi mat khau moi OK"
        # Revert
        $r3 = Call-Api -Method PATCH -Url "$BASE/users/me/password" -Token $TOKEN_STUDENT `
              -Body @{ currentPassword = "Student@456"; newPassword = "Student@123" }
        if ($r3.ok) { Print-OK "Revert mat khau OK" } else { Print-FAIL "Revert mat khau: $($r3.message)" }
        # Relogin final
        $r4 = Call-Api -Method POST -Url "$BASE/auth/login" -Body @{ email = "quynh.ly@uth.edu.vn"; password = "Student@123" }
        if ($r4.ok) { $TOKEN_STUDENT = $r4.data.access_token }
    }
} else { Print-FAIL $r.message }

Print-Test "GET /users?page=1&limit=5 - Admin"
$r = Call-Api -Url "$BASE/users?page=1&limit=5" -Token $TOKEN_ADMIN
if ($r.ok) { Print-OK "total=$($r.data.total), page=$($r.data.page), data.count=$($r.data.data.Count)" }
else { Print-FAIL $r.message }

Print-Test "GET /users - Student (expect 403)"
$r = Call-Api -Url "$BASE/users" -Token $TOKEN_STUDENT
Expect-Error $r 403 "Student truy cap GET /users"

Print-Test "DELETE /users/1 - Admin xoa chinh minh (expect 403)"
$r = Call-Api -Method DELETE -Url "$BASE/users/1" -Token $TOKEN_ADMIN
Expect-Error $r 403 "Admin khong the xoa chinh minh"

# ==============================================================================
# 3. CLUBS
# ==============================================================================
Print-Header "3. CLUBS"

Print-Test "GET /clubs?page=1&limit=5 - Public list"
$r = Call-Api -Url "$BASE/clubs?page=1&limit=5"
if ($r.ok) {
    Print-OK "total=$($r.data.total), page=$($r.data.page), data.count=$($r.data.data.Count)"
    $r.data.data | Select-Object -First 3 | ForEach-Object {
        Print-Info "  club[$($_.id)] $($_.name) - $($_.category)"
    }
} else { Print-FAIL $r.message }

Print-Test "GET /clubs/1 - CLB Lap Trinh UTH"
$r = Call-Api -Url "$BASE/clubs/1"
if ($r.ok) { Print-OK "name=$($r.data.name), category=$($r.data.category), ownerId=$($r.data.ownerId)" }
else { Print-FAIL $r.message }

Print-Test "POST /clubs - Admin tao club test"
$r = Call-Api -Method POST -Url "$BASE/clubs" -Token $TOKEN_ADMIN `
     -Body @{ name = "Club Test Delete Me"; description = "Temp test club"; category = "Technology"; ownerId = 2 }
if ($r.ok) {
    $TEST_CLUB_ID = $r.data.id
    Print-OK "Tao club OK: id=$TEST_CLUB_ID"
    Print-Test "DELETE /clubs/$TEST_CLUB_ID - Admin xoa club test"
    $r2 = Call-Api -Method DELETE -Url "$BASE/clubs/$TEST_CLUB_ID" -Token $TOKEN_ADMIN
    if ($r2.ok) { Print-OK "Xoa club OK" } else { Print-FAIL $r2.message }
} else { Print-FAIL $r.message }

# ==============================================================================
# 4. EVENTS (Phase 1: capacity, visibility, deadline)
# ==============================================================================
Print-Header "4. EVENTS"

Print-Test "GET /events?status=approved&page=1&limit=5 - Public"
$r = Call-Api -Url "$BASE/events?status=approved&page=1&limit=5"
if ($r.ok) {
    Print-OK "total=$($r.data.total), data.count=$($r.data.data.Count)"
    $r.data.data | Select-Object -First 3 | ForEach-Object {
        Print-Info "  event[$($_.id)] $($_.name) | visibility=$($_.visibility) | cap=$($_.max_capacity) | deadline=$($_.registration_deadline)"
    }
} else { Print-FAIL $r.message }

Print-Test "GET /events?status=approved - Student (kiem tra isRegistered)"
$r = Call-Api -Url "$BASE/events?status=approved&page=1&limit=3" -Token $TOKEN_STUDENT
if ($r.ok) {
    $hasField = $r.data.data | Select-Object -First 1 | ForEach-Object { $_.PSObject.Properties.Name -contains "isRegistered" }
    if ($hasField) { Print-OK "isRegistered field co mat" }
    else { Print-FAIL "isRegistered field KHONG co trong response" }
} else { Print-FAIL $r.message }

Print-Test "GET /events/3 - Event members_only (Mentor Tech)"
$r = Call-Api -Url "$BASE/events/3"
if ($r.ok) { Print-OK "name=$($r.data.name), visibility=$($r.data.visibility), deadline=$($r.data.registration_deadline)" }
else { Print-FAIL $r.message }

# ==============================================================================
# 5. EVENT REGISTRATIONS
# ==============================================================================
Print-Header "5. EVENT REGISTRATIONS"

# Event 7: Thi sang tac ca khuc, club 2, public, cap=15, date=2026-03-15 (tuong lai)
Print-Test "POST /event-registrations/7 - Student dk event 7"
$r = Call-Api -Method POST -Url "$BASE/event-registrations/7" -Token $TOKEN_STUDENT
if ($r.ok) { Print-OK "Dang ky event 7 thanh cong" }
elseif ($r.code -eq 409) { Print-OK "[409] Da dang ky tu truoc (expected)" }
else { Print-FAIL "[$($r.code)] $($r.message)" }

Print-Test "POST /event-registrations/7 - Dang ky lan 2 (expect 409)"
$r = Call-Api -Method POST -Url "$BASE/event-registrations/7" -Token $TOKEN_STUDENT
Expect-Error $r 409 "Dang ky trung event 7"

# Event 1: Hackathon 2025, date=2025-11-15 (DA QUA)
Print-Test "POST /event-registrations/1 - Event da qua (expect 400)"
$r = Call-Api -Method POST -Url "$BASE/event-registrations/1" -Token $TOKEN_STUDENT
Expect-Error $r 400 "Dang ky event da dien ra"

# Event 3: members_only, club 1, date=2026-03-20 (tuong lai)
# Student id=14 la member approved cua club 1 (membership id=13)
Print-Test "POST /event-registrations/3 - Student (member club 1) dk event members_only club 1"
$r = Call-Api -Method POST -Url "$BASE/event-registrations/3" -Token $TOKEN_STUDENT
if ($r.ok) {
    Print-OK "Dang ky members_only thanh cong (la member club 1)"
    $r2 = Call-Api -Method DELETE -Url "$BASE/event-registrations/3" -Token $TOKEN_STUDENT
    if ($r2.ok) { Print-OK "Huy dang ky event 3 OK" } else { Print-FAIL "Huy: $($r2.message)" }
} elseif ($r.code -eq 409) { Print-OK "[409] Da dang ky tu truoc" }
else { Print-FAIL "[$($r.code)] $($r.message)" }

# Student son.truong@uth.edu.vn (id=15) KHONG phai member club 1
Print-Test "POST /auth/login - Student son.truong (id=15)"
$r15 = Call-Api -Method POST -Url "$BASE/auth/login" -Body @{ email = "son.truong@uth.edu.vn"; password = "Student@123" }
if ($r15.ok -and $r15.data.access_token) {
    $TOKEN_S15 = $r15.data.access_token
    Print-OK "Login OK"
    Print-Test "POST /event-registrations/3 - Non-member club 1 dk event members_only (expect 403)"
    $r = Call-Api -Method POST -Url "$BASE/event-registrations/3" -Token $TOKEN_S15
    Expect-Error $r 403 "Non-member bi tu choi dang ky event members_only"
} else { Print-FAIL "Login son.truong that bai" }

Print-Test "GET /event-registrations/my-events - Student"
$r = Call-Api -Url "$BASE/event-registrations/my-events" -Token $TOKEN_STUDENT
if ($r.ok) {
    Print-OK "So event da dk: $($r.data.Count)"
    $r.data | Select-Object -First 3 | ForEach-Object {
        Print-Info "  event: $($_.eventName) | club: $($_.clubName) | status: $($_.status)"
    }
} else { Print-FAIL $r.message }

# ==============================================================================
# 6. MEMBERSHIPS
# ==============================================================================
Print-Header "6. MEMBERSHIPS"

Print-Test "GET /memberships/my-clubs - Student"
$r = Call-Api -Url "$BASE/memberships/my-clubs" -Token $TOKEN_STUDENT
if ($r.ok) {
    Print-OK "So club da join: $($r.data.Count)"
    $r.data | ForEach-Object {
        Print-Info "  $($_.clubName) | status=$($_.membershipStatus)"
    }
} else { Print-FAIL $r.message }

Print-Test "GET /memberships/request?clubId=1 - Owner (pending list)"
$r = Call-Api -Url "$BASE/memberships/request?clubId=1" -Token $TOKEN_OWNER
if ($r.ok) { Print-OK "total=$($r.data.total), count=$($r.data.data.Count)" }
else { Print-FAIL $r.message }

# DELETE /memberships/leave/:clubId - Student roi club
# Student (id=14) thuoc club 12, thu roi
Print-Test "POST /memberships/clubs/8 - Student xin vao club 8 (Yoga)"
$r = Call-Api -Method POST -Url "$BASE/memberships/clubs/8" -Token $TOKEN_STUDENT `
     -Body @{ join_reason = "Muon hoc Yoga"; skills = "Yoga co ban"; promise = "Se co gang" }
if ($r.ok) {
    $TEST_MS_ID = $r.data.id
    Print-OK "Tao don thanh cong: id=$TEST_MS_ID"

    # Owner club 8: lan.bui@uth.edu.vn / Owner@123
    $r8 = Call-Api -Method POST -Url "$BASE/auth/login" -Body @{ email = "lan.bui@uth.edu.vn"; password = "Owner@123" }
    if ($r8.ok -and $r8.data.access_token) {
        $TOKEN_OWNER8 = $r8.data.access_token
        Print-Test "PATCH /memberships/$TEST_MS_ID/approve - Owner club 8 approve"
        $ra = Call-Api -Method PATCH -Url "$BASE/memberships/$TEST_MS_ID/approve" `
              -Token $TOKEN_OWNER8 -Body @{ status = "approved" }
        if ($ra.ok) {
            Print-OK "Approve OK"
            Print-Test "DELETE /memberships/leave/8 - Student tu roi club 8"
            $rl = Call-Api -Method DELETE -Url "$BASE/memberships/leave/8" -Token $TOKEN_STUDENT
            if ($rl.ok) { Print-OK "Roi club OK: $($rl.data.message)" }
            else { Print-FAIL $rl.message }
        } else { Print-FAIL "Approve: $($ra.message)" }
    }
} elseif ($r.code -eq 409) { Print-OK "[409] Da co membership club 8 tu truoc" }
elseif ($r.code -eq 400) { Print-OK "[400] Dat gioi han 3 club: $($r.message)" }
else { Print-FAIL "[$($r.code)] $($r.message)" }

# Test gioi han 3 club
Print-Test "Test gioi han 3 club (approved + pending <= 3)"
# Student id=14 hien co: club 1 (approved), club 12 (approved)
# Thu join them 3 clubs -> phai bi chan
$clubs_to_try = @(6, 5, 4, 3)
$blocked = $false
foreach ($cid in $clubs_to_try) {
    if ($blocked) { break }
    $r = Call-Api -Method POST -Url "$BASE/memberships/clubs/$cid" -Token $TOKEN_STUDENT `
         -Body @{ join_reason = "Test limit"; skills = "Test"; promise = "Test" }
    if ($r.code -eq 400 -and $r.message -like "*toi da*") {
        Print-OK "[400] Da phat hien gioi han 3 club: $($r.message)"
        $blocked = $true
    } elseif ($r.code -eq 409) {
        Print-Info "[409] Club $cid da co - thu tiep"
    } elseif ($r.ok) {
        Print-Info "[201] Da join club $cid thanh cong (count +1)"
    }
}
if (-not $blocked) { Print-FAIL "Khong tim thay gioi han 3 club (co the can seed lai)" }

# ==============================================================================
# 7. STATISTICS
# ==============================================================================
Print-Header "7. STATISTICS"

Print-Test "GET /statistics/member_statistics - Public"
$r = Call-Api -Url "$BASE/statistics/member_statistics"
if ($r.ok) { Print-OK "OK: $($r.data | ConvertTo-Json -Compress)" }
else { Print-FAIL $r.message }

Print-Test "GET /statistics/admin_statistics - Admin"
$r = Call-Api -Url "$BASE/statistics/admin_statistics" -Token $TOKEN_ADMIN
if ($r.ok) { Print-OK "totalUsers=$($r.data.totalUsers), totalClubs=$($r.data.totalClubs), totalEvents=$($r.data.totalEvents)" }
else { Print-FAIL $r.message }

Print-Test "GET /statistics/own-club_statistics - Club Owner"
$r = Call-Api -Url "$BASE/statistics/own-club_statistics" -Token $TOKEN_OWNER
if ($r.ok) { Print-OK "OK: $($r.data | ConvertTo-Json -Compress)" }
else { Print-FAIL $r.message }

Print-Test "GET /statistics/admin/events-growth?year=2025 - Admin"
$r = Call-Api -Url "$BASE/statistics/admin/events-growth?year=2025" -Token $TOKEN_ADMIN
if ($r.ok) { Print-OK "Events growth 2025 OK" } else { Print-FAIL $r.message }

Print-Test "GET /statistics/admin/club-categories - Admin"
$r = Call-Api -Url "$BASE/statistics/admin/club-categories" -Token $TOKEN_ADMIN
if ($r.ok) { Print-OK "Club categories OK: $($r.data | ConvertTo-Json -Compress)" }
else { Print-FAIL $r.message }

Print-Test "GET /statistics/admin/events-status - Admin"
$r = Call-Api -Url "$BASE/statistics/admin/events-status" -Token $TOKEN_ADMIN
if ($r.ok) { Print-OK "Events status dist OK" } else { Print-FAIL $r.message }

Print-Test "GET /statistics/club-owner/events-growth - Club Owner"
$r = Call-Api -Url "$BASE/statistics/club-owner/events-growth?year=2025" -Token $TOKEN_OWNER
if ($r.ok) { Print-OK "Club events growth OK" } else { Print-FAIL $r.message }

# ==============================================================================
# 8. UPLOAD SECURITY
# ==============================================================================
Print-Header "8. UPLOAD SECURITY"

Print-Test "POST /upload/image - Khong co token (expect 401)"
$r = Call-Api -Method POST -Url "$BASE/upload/image"
Expect-Error $r 401 "Upload khong co auth"

# ==============================================================================
# 9. PARTICIPANTS (Club Owner vs Student)
# ==============================================================================
Print-Header "9. EVENT PARTICIPANTS"

Print-Test "GET /event-registrations/participants/1 - Owner club 1"
$r = Call-Api -Url "$BASE/event-registrations/participants/1" -Token $TOKEN_OWNER
if ($r.ok) { Print-OK "event=$($r.data.event.name), participants=$($r.data.participants.Count)" }
else { Print-FAIL $r.message }

Print-Test "GET /event-registrations/participants/1 - Student (expect 403)"
$r = Call-Api -Url "$BASE/event-registrations/participants/1" -Token $TOKEN_STUDENT
Expect-Error $r 403 "Student khong xem duoc participants"

# ==============================================================================
# DONE
# ==============================================================================
Print-Header "TEST HOAN TAT"
Write-Host ""
Write-Host "  Swagger docs: http://localhost:3000/api/docs" -ForegroundColor Magenta
Write-Host ""
