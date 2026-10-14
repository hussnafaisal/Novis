$ErrorActionPreference = "Stop"
Write-Host "NOVIS frontend-only setup starting..." -ForegroundColor Cyan
npm install
Write-Host "Setup complete. Start the app with: npm run dev" -ForegroundColor Green
Write-Host "Storefront: http://localhost:5173/" -ForegroundColor Yellow
Write-Host "Admin:      http://localhost:5173/admin" -ForegroundColor Yellow
