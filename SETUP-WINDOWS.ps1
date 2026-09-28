$ErrorActionPreference = "Stop"
Write-Host "NOVIS setup starting..." -ForegroundColor Cyan
npm install
npm run setup
Write-Host "NOVIS setup complete." -ForegroundColor Green
Write-Host "Start the app with: npm run dev" -ForegroundColor Yellow
Write-Host "Storefront: http://localhost:5173/" -ForegroundColor Yellow
Write-Host "Admin:      http://localhost:5173/admin" -ForegroundColor Yellow
Write-Host "Admin email: admin@novis.local" -ForegroundColor Yellow
Write-Host "Admin password: muttahir123@" -ForegroundColor Yellow
