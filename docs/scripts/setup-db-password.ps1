# ============================================
# Script: Setup Database Password
# Description: Hướng dẫn set password cho PostgreSQL
# Usage: .\setup-db-password.ps1
# ============================================

Write-Host "============================================"
Write-Host "SmartRent - Database Password Setup"
Write-Host "============================================"
Write-Host ""

# Option 1: Set Environment Variable
Write-Host "Option 1: Set Environment Variable (Recommended)" -ForegroundColor Cyan
Write-Host "Run this command in PowerShell:" -ForegroundColor Yellow
Write-Host '  $env:DB_PASSWORD = "your_postgres_password"' -ForegroundColor Green
Write-Host ""
Write-Host "Or set permanently:" -ForegroundColor Yellow
Write-Host '  setx DB_PASSWORD "your_postgres_password"' -ForegroundColor Green
Write-Host ""

# Option 2: Create application-local.properties
Write-Host "Option 2: Create application-local.properties file" -ForegroundColor Cyan
Write-Host "1. Copy application-local.properties.example to application-local.properties" -ForegroundColor Yellow
Write-Host "2. Edit the file and set your password" -ForegroundColor Yellow
Write-Host ""
Write-Host "Commands:" -ForegroundColor Yellow
Write-Host '  Copy-Item src\main\resources\application-local.properties.example src\main\resources\application-local.properties' -ForegroundColor Green
Write-Host "  # Then edit the file with your password" -ForegroundColor Gray
Write-Host ""

# Check if application-local.properties exists
$localPropsPath = "src\main\resources\application-local.properties"
if (Test-Path $localPropsPath) {
    Write-Host "✅ application-local.properties already exists" -ForegroundColor Green
} else {
    Write-Host "❌ application-local.properties does not exist" -ForegroundColor Red
    Write-Host "   Run: Copy-Item src\main\resources\application-local.properties.example src\main\resources\application-local.properties" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================"
Write-Host "After setting password, restart the application" -ForegroundColor Cyan
Write-Host "============================================"
