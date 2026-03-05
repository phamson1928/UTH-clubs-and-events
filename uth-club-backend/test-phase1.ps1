[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$BASE = "http://localhost:3000"

function Call-Api {
    param([string]$Method = "GET", [string]$Url, $Body = $null, [string]$Token = $null)
    $headers = @{}
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    $bodyJson = if ($Body) { $Body | ConvertTo-Json -Depth 5 -Compress } else { $null }
    try {
        $params = @{ Method = $Method; Uri = $Url; Headers = $headers; ContentType = "application/json"; ErrorAction = "Stop" }
        if ($bodyJson) { $params["Body"] = $bodyJson }
        return @{ ok = $true; data = Invoke-RestMethod @params }
    }
    catch {
        $code = 0
        if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
        $msg = ""
        try { $msg = ($_.ErrorDetails.Message | ConvertFrom-Json).message } catch { $msg = $_.Exception.Message }
        return @{ ok = $false; data = $null; code = $code; message = $msg }
    }
}

Write-Host "`n====== PHASE 1 FEATURE TESTS ======" -ForegroundColor Cyan

# Login
Write-Host "`n[1] Login" -ForegroundColor Yellow
$r = Call-Api -Method POST -Url "$BASE/auth/login" -Body @{ email = "an.nguyen@uth.edu.vn"; password = "Owner@123" }
if ($r.ok) { $TOKEN_OWNER = $r.data.access_token; Write-Host "  [OK] Owner login" -ForegroundColor Green }
else { Write-Host "  [ERR] Owner login: $($r.message)" -ForegroundColor Red; exit 1 }

$r = Call-Api -Method POST -Url "$BASE/auth/login" -Body @{ email = "quynh.ly@uth.edu.vn"; password = "Student@123" }
if ($r.ok) { $TOKEN_STUDENT = $r.data.access_token; Write-Host "  [OK] Student login" -ForegroundColor Green }
else { Write-Host "  [ERR] Student login: $($r.message)" -ForegroundColor Red }

# QR Generate
Write-Host "`n[2] QR Check-in - Generate" -ForegroundColor Yellow
$r = Call-Api -Method POST -Url "$BASE/event-registrations/2/qr" -Token $TOKEN_OWNER
if ($r.ok) {
    $QR_CODE = $r.data.code
    Write-Host "  [OK] QR generated: code=$QR_CODE" -ForegroundColor Green
    Write-Host "  [OK] QR image length=$($r.data.qrImage.Length) chars" -ForegroundColor Green
}
else { Write-Host "  [ERR] $($r.code): $($r.message)" -ForegroundColor Red }

# Student tries to generate QR (should fail 403)
Write-Host "`n[3] QR - Student cannot generate (expect 403)" -ForegroundColor Yellow
$r = Call-Api -Method POST -Url "$BASE/event-registrations/2/qr" -Token $TOKEN_STUDENT
if (-not $r.ok -and $r.code -eq 403) { Write-Host "  [OK] 403 Forbidden as expected" -ForegroundColor Green }
else { Write-Host "  [ERR] Expected 403, got $($r.code)" -ForegroundColor Red }

# Student check-in (event 2 - Workshop NestJS, already in the past so we use event 3 which is future)
Write-Host "`n[4] QR - Student registers event 7 then checks in" -ForegroundColor Yellow
# Register for event 7 if not already
$rReg = Call-Api -Method POST -Url "$BASE/event-registrations/7" -Token $TOKEN_STUDENT
if ($rReg.ok) { Write-Host "  [OK] Registered event 7" -ForegroundColor Green }
elseif ($rReg.code -eq 409) { Write-Host "  [OK] Already registered (409)" -ForegroundColor Green }
else { Write-Host "  [WARN] Register event 7: $($rReg.code): $($rReg.message)" -ForegroundColor Yellow }

# Generate QR for event 7 (club 2, lan.bui is owner)
Write-Host "`n[5] Generate QR for event 7 (Music Workshop)" -ForegroundColor Yellow
$r7 = Call-Api -Method POST -Url "$BASE/auth/login" -Body @{ email = "lan.bui@uth.edu.vn"; password = "Owner@123" }
if ($r7.ok) {
    $TOKEN_OWNER2 = $r7.data.access_token
    $rQR7 = Call-Api -Method POST -Url "$BASE/event-registrations/7/qr" -Token $TOKEN_OWNER2
    if ($rQR7.ok) {
        $CODE7 = $rQR7.data.code
        Write-Host "  [OK] QR for event 7: $CODE7" -ForegroundColor Green
        # Student checks in
        Write-Host "`n[6] Student checks in with code" -ForegroundColor Yellow
        $rCI = Call-Api -Method POST -Url "$BASE/event-registrations/7/checkin" -Body @{ code = $CODE7 } -Token $TOKEN_STUDENT
        if ($rCI.ok) {
            Write-Host "  [OK] Check-in: $($rCI.data.message)" -ForegroundColor Green
            Write-Host "  [OK] Points earned: $($rCI.data.pointsEarned)" -ForegroundColor Green
        }
        else { Write-Host "  [ERR] Check-in: $($rCI.code): $($rCI.message)" -ForegroundColor Red }
    }
    else { Write-Host "  [ERR] QR event 7: $($rQR7.message)" -ForegroundColor Red }
}

# Wrong code check-in (expect 400)
Write-Host "`n[7] Wrong check-in code (expect 400)" -ForegroundColor Yellow
$rBad = Call-Api -Method POST -Url "$BASE/event-registrations/3/checkin" -Body @{ code = "WRONG-CODE" } -Token $TOKEN_STUDENT
if (-not $rBad.ok -and $rBad.code -eq 400) { Write-Host "  [OK] 400 Bad Request as expected" -ForegroundColor Green }
else { Write-Host "  [ERR] Expected 400, got $($rBad.code): $($rBad.message)" -ForegroundColor Red }

# User profile has total_points
Write-Host "`n[8] User profile shows total_points" -ForegroundColor Yellow
$rMe = Call-Api -Url "$BASE/users/me" -Token $TOKEN_STUDENT
if ($rMe.ok) {
    $hasPoints = $rMe.data.PSObject.Properties.Name -contains "total_points"
    if ($hasPoints) { Write-Host "  [OK] total_points=$($rMe.data.total_points)" -ForegroundColor Green }
    else { Write-Host "  [ERR] total_points not in response" -ForegroundColor Red }
}
else { Write-Host "  [ERR] $($rMe.message)" -ForegroundColor Red }

# Events list has points field
Write-Host "`n[9] Events list shows points field" -ForegroundColor Yellow
$rEv = Call-Api -Url "$BASE/events?status=approved&limit=3"
if ($rEv.ok) {
    $ev = $rEv.data.data | Select-Object -First 1
    $hasPts = $ev.PSObject.Properties.Name -contains "points"
    if ($hasPts) { Write-Host "  [OK] Event has points=$($ev.points)" -ForegroundColor Green }
    else { Write-Host "  [ERR] points field missing from events list" -ForegroundColor Red }
}

# Excel export attendance
Write-Host "`n[10] Excel Export - Attendance (event 2)" -ForegroundColor Yellow
try {
    $outFile = "$env:TEMP\test_attendance.xlsx"
    Invoke-RestMethod -Method GET -Uri "$BASE/event-registrations/export/attendance/2" `
        -Headers @{ Authorization = "Bearer $TOKEN_OWNER" } `
        -OutFile $outFile
    $size = (Get-Item $outFile).Length
    Write-Host "  [OK] Downloaded attendance Excel: $size bytes" -ForegroundColor Green
    Remove-Item $outFile -ErrorAction SilentlyContinue
}
catch { Write-Host "  [ERR] Excel export: $_" -ForegroundColor Red }

# Excel export members
Write-Host "`n[11] Excel Export - Club Members (club 1)" -ForegroundColor Yellow
try {
    $outFile = "$env:TEMP\test_members.xlsx"
    Invoke-RestMethod -Method GET -Uri "$BASE/event-registrations/export/members?clubId=1" `
        -Headers @{ Authorization = "Bearer $TOKEN_OWNER" } `
        -OutFile $outFile
    $size = (Get-Item $outFile).Length
    Write-Host "  [OK] Downloaded members Excel: $size bytes" -ForegroundColor Green
    Remove-Item $outFile -ErrorAction SilentlyContinue
}
catch { Write-Host "  [ERR] Members export: $_" -ForegroundColor Red }

Write-Host "`n====== PHASE 1 TESTS COMPLETE ======" -ForegroundColor Cyan
