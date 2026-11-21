<#
.SYNOPSIS
    Ghanem Furniture - Script to generate optimized WebP frame sequences for Hero Scroll Motion.
.DESCRIPTION
    Converts an MP4 source video into:
    1. Desktop frames (120 frames, 1280px width, WebP quality 75, ~5.6MB total).
    2. Mobile frames (60 frames, 720px width, WebP quality 70, ~1.3MB total).
    3. Hero poster fallback image (frame 1, 1280px width, 85 quality).
    All audio tracks are automatically stripped.
.PARAMETER InputVideo
    Path to source MP4 video. Default: scripts/source/kitchen.mp4
.PARAMETER OutputDir
    Directory for generated frames. Default: images/hero-frames
#>

param (
    [string]$InputVideo = "scripts/source/kitchen.mp4",
    [string]$OutputDir = "images/hero-frames"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Ghanem Furniture - Hero Frames Generator" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Resolve ffmpeg binary
$ffmpegCmd = $null
if (Get-Command ffmpeg -ErrorAction SilentlyContinue) {
    $ffmpegCmd = "ffmpeg"
} elseif (Test-Path "node_modules/ffmpeg-static/ffmpeg.exe") {
    $ffmpegCmd = (Resolve-Path "node_modules/ffmpeg-static/ffmpeg.exe").Path
}

if (-not $ffmpegCmd) {
    Write-Error "Error: ffmpeg could not be found. Please ensure ffmpeg is in your PATH or install npm package ffmpeg-static."
    exit 1
}

if (-not (Test-Path $InputVideo)) {
    Write-Error "Error: Input video not found at '$InputVideo'."
    exit 1
}

# 2. Prepare directories
$desktopDir = Join-Path $OutputDir "desktop"
$mobileDir = Join-Path $OutputDir "mobile"
New-Item -ItemType Directory -Force -Path $desktopDir, $mobileDir | Out-Null

Write-Host "`n[1/3] Generating Desktop Frames (120 frames, 1280px WebP)..." -ForegroundColor Yellow
& $ffmpegCmd -y -i $InputVideo -an -vf "fps=12,scale=1280:-1" -c:v libwebp -quality 75 -vframes 120 "$desktopDir/frame-%03d.webp"

Write-Host "`n[2/3] Generating Mobile Frames (60 frames, 720px WebP)..." -ForegroundColor Yellow
& $ffmpegCmd -y -i $InputVideo -an -vf "fps=6,scale=720:-1" -c:v libwebp -quality 70 -vframes 60 "$mobileDir/frame-%03d.webp"

Write-Host "`n[3/3] Generating Hero Poster Fallback Image..." -ForegroundColor Yellow
& $ffmpegCmd -y -i $InputVideo -an -vframes 1 -c:v libwebp -quality 85 "images/hero-poster.webp"

# 3. Calculate statistics
$dFiles = Get-ChildItem "$desktopDir/*.webp"
$mFiles = Get-ChildItem "$mobileDir/*.webp"
$dSize = ($dFiles | Measure-Object -Property Length -Sum).Sum / 1MB
$mSize = ($mFiles | Measure-Object -Property Length -Sum).Sum / 1MB
$posterSize = (Get-Item "images/hero-poster.webp").Length / 1KB

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " Frames Generation Completed Successfully!" -ForegroundColor Green
Write-Host " Desktop: $($dFiles.Count) frames | Total Size: $([math]::Round($dSize, 2)) MB" -ForegroundColor Green
Write-Host " Mobile:  $($mFiles.Count) frames | Total Size: $([math]::Round($mSize, 2)) MB" -ForegroundColor Green
Write-Host " Poster:  $([math]::Round($posterSize, 2)) KB" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
