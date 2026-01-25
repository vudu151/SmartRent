# ============================================
# Script: Test Login API (PowerShell)
# Description: Test đăng nhập và lấy JWT token
# Usage: .\test_login.ps1 [username] [password]
# ============================================

param(
    [string]$Username = "admin",
    [string]$Password = "admin123"
)

$ApiUrl = "http://localhost:8080/api/auth/login"

Write-Host "============================================"
Write-Host "Testing Login API"
Write-Host "============================================"
Write-Host "URL: $ApiUrl"
Write-Host "Username: $Username"
Write-Host "Password: $Password"
Write-Host ""

# Create request body
$Body = @{
    username = $Username
    password = $Password
} | ConvertTo-Json

try {
    # Make login request
    $Response = Invoke-RestMethod -Uri $ApiUrl -Method Post -Body $Body -ContentType "application/json"
    
    if ($Response.success -and $Response.data.accessToken) {
        Write-Host "✅ Login successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Response:"
        $Response | ConvertTo-Json -Depth 10
        
        $AccessToken = $Response.data.accessToken
        $RefreshToken = $Response.data.refreshToken
        
        Write-Host ""
        Write-Host "============================================"
        Write-Host "Access Token:"
        Write-Host $AccessToken
        Write-Host ""
        Write-Host "Refresh Token:"
        Write-Host $RefreshToken
        Write-Host "============================================"
        
        # Save token to file
        $AccessToken | Out-File -FilePath ".access_token.txt" -NoNewline
        $RefreshToken | Out-File -FilePath ".refresh_token.txt" -NoNewline
        Write-Host ""
        Write-Host "Tokens saved to .access_token.txt and .refresh_token.txt" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Login failed!" -ForegroundColor Red
        Write-Host "Response:"
        $Response | ConvertTo-Json -Depth 10
        exit 1
    }
} catch {
    Write-Host "❌ Error occurred!" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}
