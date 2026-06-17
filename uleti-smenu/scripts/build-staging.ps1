<#
.SYNOPSIS
  Build React app for staging (api-staging.uletismenu.com).

.EXAMPLE
  .\scripts\build-staging.ps1
#>
$ErrorActionPreference = "Stop"

$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

$envFile = Join-Path $Root ".env.staging"
$example = Join-Path $Root ".env.staging.example"

if (-not (Test-Path $envFile)) {
    if (Test-Path $example) {
        Copy-Item $example $envFile
        Write-Host "Created .env.staging from example." -ForegroundColor Yellow
    } else {
        throw "Missing .env.staging - set VITE_API_BASE_URL=https://api-staging.uletismenu.com"
    }
}

# Vite reads .env.production by default on build; copy staging vars for this build
Copy-Item $envFile (Join-Path $Root ".env.production.local") -Force

Write-Host "Building frontend for staging ..." -ForegroundColor Cyan
npm ci
npm run build

Write-Host "Output: $Root\dist" -ForegroundColor Green
Write-Host "Deploy dist/ to Azure Static Web App (SWA CLI or GitHub Actions)." -ForegroundColor Yellow
