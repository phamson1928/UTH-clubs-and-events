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
Write-Host ""

# === Buoc 1: Tao thu muc + copy backend files ===
Write-Host "[1/4] Copy backend files..." -ForegroundColor Yellow
$backendItems = @(
    "Dockerfile", "docker-compose.yml", "package.json", "package-lock.json",
    ".dockerignore", "tsconfig.json", "tsconfig.build.json", "nest-cli.json", ".env",
    "src", "common", "scripts"
) -join ' '
tar -cf - -C "$BackendDir" $backendItems | ssh $Username@$ServerIp "mkdir -p $TargetDir && tar -xf - -C $TargetDir"

# === Buoc 2: Copy database SQL files ===
Write-Host "[2/4] Copy database SQL files..." -ForegroundColor Yellow
$sqlFiles = (Get-ChildItem "$DatabaseDir\*.sql" | ForEach-Object { $_.Name }) -join ' '
tar -cf - -C "$DatabaseDir" $sqlFiles | ssh $Username@$ServerIp "mkdir -p ~/UTH-clubs-and-events/database && tar -xf - -C ~/UTH-clubs-and-events/database"

# === Buoc 3: Copy ops scripts ===
Write-Host "[3/4] Copy ops scripts..." -ForegroundColor Yellow
tar -cf - -C "$ScriptDir" "refresh-vps.sh" | ssh $Username@$ServerIp "mkdir -p ~/UTH-clubs-and-events/ops && tar -xf - -C ~/UTH-clubs-and-events/ops"

# === Buoc 4: Build Docker + Refresh dates ===
Write-Host "[4/4] Build Docker + refresh dates..." -ForegroundColor Yellow
ssh $Username@$ServerIp "cd $TargetDir && docker-compose up --build -d && bash ~/UTH-clubs-and-events/ops/refresh-vps.sh"

Write-Host ""
Write-Host "========== DEPLOY HOAN TAT ==========" -ForegroundColor Green
Write-Host " Backend : http://$ServerIp`:3001" -ForegroundColor Green
Write-Host " Swagger : http://$ServerIp`/uth/api/docs" -ForegroundColor Green