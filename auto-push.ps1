# Auto-push script for Git repository
# This script watches for file changes and automatically commits and pushes to GitHub

Write-Host "Auto-push script started for Seel Data Bundle" -ForegroundColor Green
Write-Host "Watching directory: $PWD" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

$lastCommitTime = Get-Date

function Push-Changes {
    param (
        [string]$message = "Auto-commit: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    )
    
    Write-Host "Checking for changes..." -ForegroundColor Yellow
    
    # Check if there are any changes
    $status = git status --porcelain
    
    if ($status) {
        Write-Host "Changes detected!" -ForegroundColor Green
        
        # Add all changes
        Write-Host "   Adding files..." -ForegroundColor Cyan
        git add .
        
        # Commit changes
        Write-Host "   Committing changes..." -ForegroundColor Cyan
        git commit -m $message
        
        # Push to remote
        Write-Host "   Pushing to GitHub..." -ForegroundColor Cyan
        git push origin main
        
        Write-Host "Successfully pushed changes at $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "No changes to push" -ForegroundColor Gray
    }
}

# Initial push of any existing changes
Push-Changes

# Watch for changes every 30 seconds
while ($true) {
    Start-Sleep -Seconds 30
    
    $currentTime = Get-Date
    $timeSinceLastCommit = ($currentTime - $lastCommitTime).TotalSeconds
    
    # Only check if at least 30 seconds have passed
    if ($timeSinceLastCommit -ge 30) {
        Push-Changes
        $lastCommitTime = Get-Date
    }
}
