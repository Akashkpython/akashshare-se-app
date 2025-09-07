# PowerShell script to generate a secure JWT secret
# Usage: .\generate-secure-jwt.ps1

Write-Host "🔐 Generating secure JWT secret..." -ForegroundColor Green

# Generate 64 random bytes and convert to hex
$bytes = New-Object byte[] 64
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$jwtSecret = [System.BitConverter]::ToString($bytes) -replace '-', ''
$jwtSecret = $jwtSecret.ToLower()

Write-Host "`n✅ Generated JWT Secret:" -ForegroundColor Yellow
Write-Host $jwtSecret -ForegroundColor White

Write-Host "`n📋 Add this to your .env file:" -ForegroundColor Cyan
Write-Host "JWT_SECRET=$jwtSecret" -ForegroundColor White

Write-Host "`n⚠️  Keep this secret secure and never commit it to version control!" -ForegroundColor Red

# Optionally save to a temporary file
$tempFile = "jwt-secret-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
"JWT_SECRET=$jwtSecret" | Out-File -FilePath $tempFile -Encoding UTF8
Write-Host "`n💾 Secret also saved to: $tempFile" -ForegroundColor Green
Write-Host "   Remember to delete this file after copying the secret!" -ForegroundColor Yellow
