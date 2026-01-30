# Restart Frontend with Correct Environment Variables
Write-Host "🔄 Restarting Frontend with Correct Configuration..." -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (Test-Path "frontend/.env.local") {
    Write-Host "✅ Found frontend/.env.local" -ForegroundColor Green
    Get-Content "frontend/.env.local" | Write-Host -ForegroundColor Gray
} else {
    Write-Host "❌ frontend/.env.local not found!" -ForegroundColor Red
    Write-Host "Creating it now..." -ForegroundColor Yellow
    
    $envContent = @"
# Frontend Environment Variables

# PHP API Base URL
# Points to the backend API endpoints
NEXT_PUBLIC_PHP_API_URL=http://localhost/ijsagroallied/backend/api/api
"@
    
    Set-Content -Path "frontend/.env.local" -Value $envContent
    Write-Host "✅ Created frontend/.env.local" -ForegroundColor Green
}

Write-Host ""
Write-Host "📍 Current directory: $PWD" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Starting frontend dev server..." -ForegroundColor Cyan
Write-Host "   Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Change to frontend directory and start dev server
Set-Location frontend
npm run dev
