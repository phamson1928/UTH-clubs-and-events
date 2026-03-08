param (
    [string]$ServerIp = "152.42.163.30",
    [string]$Username = "root",
    [string]$TargetDir = "~/uth-club-backend"
)

Write-Host "Bắt đầu quá trình deploy lên $ServerIp..." -ForegroundColor Cyan

# 1. Tạo thư mục trên VPS
Write-Host "1. Tạo thư mục $TargetDir trên VPS..." -ForegroundColor Yellow
ssh $Username@$ServerIp "mkdir -p $TargetDir"

# 2. Upload cấu hình và source code
Write-Host "2. Đang copy files lên VPS (sẽ mất vài phút)..." -ForegroundColor Yellow
# Chỉ copy những file cần thiết để buil trên server
scp Dockerfile docker-compose.yml package.json package-lock.json .dockerignore tsconfig.json tsconfig.build.json nest-cli.json .env "$Username@$ServerIp`:$TargetDir/"
scp -r src common "$Username@$ServerIp`:$TargetDir/"

# 3. Chạy docker-compose
Write-Host "3. Build và khởi động Docker container trên VPS..." -ForegroundColor Yellow
ssh $Username@$ServerIp "cd $TargetDir && docker-compose up --build -d"

Write-Host "Deploy hoàn tất! Backend đang chạy tại http://$ServerIp:3000" -ForegroundColor Green
