<#
.SYNOPSIS
    Script de Cópia de Segurança (Backup) do Banco de Dados PostgreSQL (Dsilk)
.DESCRIPTION
    Requisito: Backend 3 — Rotina de cópia de segurança
#>
[CmdletBinding()]
param()

$ContainerName = "grafica_db"
$DbUser = "grafica_user"
$DbName = "grafica"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$BackupDir = Join-Path $RepoRoot "backups"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$Timestamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$BackupFile = Join-Path $BackupDir "backup_${DbName}_${Timestamp}.sql"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [Dsilk] Iniciando cópia de segurança do banco de dados..." -ForegroundColor Cyan
Write-Host " Container : $ContainerName"
Write-Host " Banco     : $DbName"
Write-Host " Destino   : $BackupFile"
Write-Host " Data/Hora : $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')"
Write-Host "=========================================================="

$isRunning = docker ps --format '{{.Names}}' | Select-String -Pattern "^$ContainerName$"
if (-not $isRunning) {
    Write-Error "O container '$ContainerName' não está em execução. Suba o ambiente com 'docker compose up -d db'."
    exit 1
}

docker exec $ContainerName pg_dump -U $DbUser -d $DbName --clean --if-exists --no-owner --no-privileges | Out-File -FilePath $BackupFile -Encoding utf8

if (Test-Path $BackupFile) {
    $size = (Get-Item $BackupFile).Length / 1KB
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " [Dsilk] Cópia de segurança concluída com SUCESSO!" -ForegroundColor Green
    Write-Host " Arquivo : $BackupFile"
    Write-Host (" Tamanho : {0:N2} KB" -f $size)
    Write-Host "=========================================================="
} else {
    Write-Error "Falha ao gerar o arquivo de backup."
}

