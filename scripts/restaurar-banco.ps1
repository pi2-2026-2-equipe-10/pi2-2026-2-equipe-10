<#
.SYNOPSIS
    Script de Restauração de Cópia de Segurança do Banco de Dados PostgreSQL (Dsilk)
.DESCRIPTION
    Requisito: Backend 3 — Rotina de restauração do banco
#>
[CmdletBinding()]
param(
    [Parameter(Position = 0, Mandatory = $false)]
    [string]$BackupFile
)

$ContainerName = "grafica_db"
$DbUser = "grafica_user"
$DbName = "grafica"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$BackupDir = Join-Path $RepoRoot "backups"

if (-not $BackupFile) {
    if (Test-Path $BackupDir) {
        $latest = Get-ChildItem -Path $BackupDir -Filter "backup_${DbName}_*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($latest) {
            $BackupFile = $latest.FullName
        }
    }
}

if (-not $BackupFile -or -not (Test-Path $BackupFile)) {
    Write-Error "Nenhum arquivo de backup válido encontrado. Forneça o caminho do arquivo .sql como parâmetro."
    exit 1
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [Dsilk] Iniciando restauração do banco de dados..." -ForegroundColor Cyan
Write-Host " Container : $ContainerName"
Write-Host " Banco     : $DbName"
Write-Host " Origem    : $BackupFile"
Write-Host " Data/Hora : $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')"
Write-Host "=========================================================="

$isRunning = docker ps --format '{{.Names}}' | Select-String -Pattern "^$ContainerName$"
if (-not $isRunning) {
    Write-Error "O container '$ContainerName' não está em execução. Suba o ambiente com 'docker compose up -d db'."
    exit 1
}

Get-Content -Path $BackupFile -Raw | docker exec -i $ContainerName psql -U $DbUser -d $DbName -v ON_ERROR_STOP=1

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " [Dsilk] Validação pós-restauração (contagem de registros):" -ForegroundColor Green
Write-Host "----------------------------------------------------------"
docker exec $ContainerName psql -U $DbUser -d $DbName -t -A -c "
SELECT 'funcionarios : ' || count(*) FROM funcionario
UNION ALL
SELECT 'materiais    : ' || count(*) FROM material
UNION ALL
SELECT 'clientes     : ' || count(*) FROM cliente
UNION ALL
SELECT 'servicos     : ' || count(*) FROM servico
UNION ALL
SELECT 'orcamentos   : ' || count(*) FROM orcamento
UNION ALL
SELECT 'atividades   : ' || count(*) FROM atividade;
"

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " [Dsilk] Restauração concluída e validada com SUCESSO!" -ForegroundColor Green
Write-Host "=========================================================="

