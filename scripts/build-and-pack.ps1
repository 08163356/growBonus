# GrowBonus 构建打包脚本
# 用法: powershell -File scripts/build-and-pack.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$OutputDir = Join-Path $ProjectRoot "release"
$ZipFile = Join-Path $ProjectRoot "growbonus-deploy.zip"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  GrowBonus 构建打包" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 清理
Write-Host "`n[1/5] 清理旧构建..." -ForegroundColor Yellow
if (Test-Path $OutputDir) { Remove-Item -Recurse -Force $OutputDir }
if (Test-Path $ZipFile) { Remove-Item -Force $ZipFile }

# 构建前端
Write-Host "[2/5] 构建前端..." -ForegroundColor Yellow
Set-Location $ProjectRoot
npm run build:frontend
if ($LASTEXITCODE -ne 0) { throw "前端构建失败" }

# 构建后端
Write-Host "[3/5] 构建后端..." -ForegroundColor Yellow
npm run build:backend
if ($LASTEXITCODE -ne 0) { throw "后端构建失败" }

# 组装发布目录
Write-Host "[4/5] 组装发布包..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

# 前端产物
$frontendDist = Join-Path $ProjectRoot "frontend\dist"
$targetFrontend = Join-Path $OutputDir "frontend\dist"
New-Item -ItemType Directory -Path $targetFrontend -Force | Out-Null
Copy-Item -Path "$frontendDist\*" -Destination $targetFrontend -Recurse -Force

# 后端产物
$backendDist = Join-Path $ProjectRoot "backend\dist"
$targetBackend = Join-Path $OutputDir "backend"
$targetBackendDist = Join-Path $targetBackend "dist"
New-Item -ItemType Directory -Path $targetBackendDist -Force | Out-Null
Copy-Item -Path "$backendDist\*" -Destination $targetBackendDist -Recurse -Force

# 后端 package.json
Copy-Item -Path (Join-Path $ProjectRoot "backend\package.json") -Destination $targetBackend -Force

# .env.example
$envExample = Join-Path $ProjectRoot "backend\.env.example"
if (Test-Path $envExample) {
    Copy-Item -Path $envExample -Destination $targetBackend -Force
}

# 部署脚本
$deployDir = Join-Path $ProjectRoot "deploy"
$targetDeploy = Join-Path $OutputDir "deploy"
if (Test-Path $deployDir) {
    Copy-Item -Path $deployDir -Destination $targetDeploy -Recurse -Force
}

# 创建 uploads 和 data 目录占位
New-Item -ItemType Directory -Path (Join-Path $targetBackend "uploads") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $targetBackend "data") -Force | Out-Null

# 打包
Write-Host "[5/5] 打包 ZIP..." -ForegroundColor Yellow
Compress-Archive -Path "$OutputDir\*" -DestinationPath $ZipFile -Force

# 清理临时目录
Remove-Item -Recurse -Force $OutputDir

$size = [math]::Round((Get-Item $ZipFile).Length / 1MB, 2)
Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "  构建完成！" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "输出文件: $ZipFile ($size MB)" -ForegroundColor White
Write-Host ""
Write-Host "部署步骤:" -ForegroundColor White
Write-Host "  1. 上传 growbonus-deploy.zip 到服务器" -ForegroundColor Gray
Write-Host "  2. 执行 bash deploy/install.sh" -ForegroundColor Gray

Set-Location $ProjectRoot
