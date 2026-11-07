#!/usr/bin/env bash
# =====================================================================
# Dsilk — Script de Cópia de Segurança (Backup) do Banco de Dados
# Requisito: Backend 3 — Rotina de cópia de segurança
# =====================================================================
set -euo pipefail

CONTAINER_NAME="grafica_db"
DB_USER="grafica_user"
DB_NAME="grafica"
BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/backups"

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_${DB_NAME}_${TIMESTAMP}.sql"

echo "=========================================================="
echo " [Dsilk] Iniciando cópia de segurança do banco de dados..."
echo " Container : ${CONTAINER_NAME}"
echo " Banco     : ${DB_NAME}"
echo " Destino   : ${BACKUP_FILE}"
echo " Data/Hora : $(date '+%d/%m/%Y %H:%M:%S')"
echo "=========================================================="

# Verifica se o container está em execução
if ! docker ps --format '{{.Names}}' | grep -Eq "^${CONTAINER_NAME}\$"; then
    echo "ERRO: O container '${CONTAINER_NAME}' não está em execução."
    echo "Execute 'docker compose up -d db' antes de realizar o backup."
    exit 1
fi

# Executa o dump lógico em formato SQL limpo (--clean --if-exists)
docker exec "${CONTAINER_NAME}" pg_dump \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    > "${BACKUP_FILE}"

FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)

echo "=========================================================="
echo " [Dsilk] Cópia de segurança concluída com SUCESSO!"
echo " Arquivo gerado : ${BACKUP_FILE}"
echo " Tamanho        : ${FILE_SIZE}"
echo "=========================================================="

