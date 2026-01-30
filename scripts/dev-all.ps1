# Concurrent Development Script for Windows
# 
# Starts both frontend and backend development servers concurrently
# 
# Usage: .\dev-all.ps1
#

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  Starting Development Servers" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

# Start backend server in new window
Write-Host "Starting backend server on http://localhost:8000" -ForegroundColor Blue
$backendJob = Start-Job -ScriptBlock {
    Set-Location backend
    npm run serve
}

# Wait a moment for backend to start
Start-Sleep -Seconds 2

# Start frontend server in new window
Write-Host "Starting frontend server on http://localhost:3000" -ForegroundColor Blue
$frontendJob = Start-Job -ScriptBlock {
    Set-Location frontend
    npm run dev
}

Write-Host ""
Write-Host "✓ Both servers started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press CTRL+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Function to cleanup on exit
function Cleanup {
    Write-Host ""
    Write-Host "Shutting down servers..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob, $frontendJob
    Remove-Job -Job $backendJob, $frontendJob
    exit 0
}

# Register cleanup on CTRL+C
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Cleanup }

try {
    # Wait for both jobs
    Wait-Job -Job $backendJob, $frontendJob
}
finally {
    Cleanup
}
