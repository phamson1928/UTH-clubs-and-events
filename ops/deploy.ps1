param (
    [string]$ServerIp = "152.42.163.30",
    [string]$Username = "root",
    [string]$TargetDir = "~/UTH-clubs-and-events/uth-club-backend"
)

Write-Host "================= DEPLOY BACKEND =================" -ForegroundColor Cyan

# Xac dinh duong dan local
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Get-Location }
$ProjectRoot = Resolve-Path "$ScriptDir\.."
$BackendDir = "$ProjectRoot\uth-club-backend"
$DatabaseDir = "$ProjectRoot\database"

Write-Host "Project root: $ProjectRoot" -ForegroundColor Gray

# === Buoc 1: Tao thu muc tren VPS ===
Write-Host "[1/6] Tao thu muc tren VPS..." -ForegroundColor Yellow
ssh $Username@$ServerIp "mkdir -p $TargetDir"
ssh $Username@$ServerIp "mkdir -p ~/UTH-clubs-and-events/database"
ssh $Username@$ServerIp "mkdir -p ~/UTH-clubs-and-events/ops"

# === Buoc 2: Copy backend files ===
Write-Host "[2/6] Copy backend files..." -ForegroundColor Yellow
scp "$BackendDir\Dockerfile" "$Username@$ServerIp`:$TargetDir/"
scp "$BackendDir\docker-compose.yml" "$Username@$ServerIp`:$TargetDir/"
scp "$BackendDir\package.json" "$Username@$ServerIp`:$TargetDir/"
scp "$BackendDir\package-lock.json" "$Username@$ServerIp`:$TargetDir/"
scp "$BackendDir\.dockerignore" "$Username@$ServerIp`:$TargetDir/"
scp "$BackendDir\tsconfig.json" "$Username@$ServerIp`:$TargetDir/"
scp "$BackendDir\tsconfig.build.json" "$Username@$ServerIp`:$TargetDir/"
scp "$BackendDir\nest-cli.json" "$Username@$ServerIp`:$TargetDir/"
scp "$BackendDir\.env" "$Username@$ServerIp`:$TargetDir/"
scp -r "$BackendDir\src" "$Username@$ServerIp`:$TargetDir/"
scp -r "$BackendDir\common" "$Username@$ServerIp`:$TargetDir/"
scp -r "$BackendDir\scripts" "$Username@$ServerIp`:$TargetDir/"

# === Buoc 3: Copy database SQL files ===
Write-Host "[3/6] Copy database SQL files..." -ForegroundColor Yellow
Get-ChildItem "$DatabaseDir\*.sql" | ForEach-Object {
    scp $_.FullName "$Username@$ServerIp`:~/UTH-clubs-and-events/database/"
}

# === Buoc 4: Copy ops scripts ===
Write-Host "[4/6] Copy ops scripts..." -ForegroundColor Yellow
scp "$ScriptDir\refresh-vps.sh" "$Username@$ServerIp`:~/UTH-clubs-and-events/ops/"

# === Buoc 5: Build va chay Docker ===
Write-Host "[5/6] Build va chay Docker container..." -ForegroundColor Yellow
ssh $Username@$ServerIp "cd $TargetDir && docker-compose up --build -d"

# === Buoc 6: Refresh dates ===
Write-Host "[6/6] Refresh dates tren database..." -ForegroundColor Yellow
ssh $Username@$ServerIp "bash ~/UTH-clubs-and-events/ops/refresh-vps.sh"

Write-Host ""
Write-Host "========== DEPLOY HOAN TAT ==========" -ForegroundColor Green
Write-Host " Backend : http://$ServerIp`:3001" -ForegroundColor Green
Write-Host " Swagger : http://$ServerIp`/uth/api/docs" -ForegroundColor Green