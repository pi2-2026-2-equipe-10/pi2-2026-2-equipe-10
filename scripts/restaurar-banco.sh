#!/usr/bin/env bash
# =====================================================================
# Dsilk — Script de Restauração de Cópia de Segurança do Banco de Dados
# Requisito: Backend 3 — Rotina de restauração do banco
# =====================================================================
set -euo pipefail

CONTAINER_NAME="grafica_db"
DB_USER="grafica_user"
DB_NAME="grafica"
BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/backups"

# Se o arquivo não foi passado como argumento, utiliza o backup mais recente
if [ $# -ge 1 ]; then
    BACKUP_FILE="$1"
else
    BACKUP_FILE=$(find "$BACKUP_DIR" -name "backup_${DB_NAME}_*.sql" -type f | sort -r | head -n 1 || true)
fi

if [ -z "${BACKUP_FILE}" ] || [ ! -f "${BACKUP_FILE}" ]; then
    echo "ERRO: Nenhum arquivo de backup encontrado para restaurar."
    echo "Uso: $0 [caminho/para/arquivo.sql]"
    exit 1
fi

echo "=========================================================="
echo " [Dsilk] Iniciando restauração do banco de dados..."
echo " Container : ${CONTAINER_NAME}"
echo " Banco     : ${DB_NAME}"
echo " Origem    : ${BACKUP_FILE}"
echo " Data/Hora : $(date '+%d/%m/%Y %H:%M:%S')"
echo "=========================================================="

# Verifica se o container está em execução
if ! docker ps --format '{{.Names}}' | grep -Eq "^${CONTAINER_NAME}\$"; then
    echo "ERRO: O container '${CONTAINER_NAME}' não está em execução."
    echo "Execute 'docker compose up -d db' antes de realizar a restauração."
    exit 1
fi

# Executa a restauração através do cliente psql conectado ao container
docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -v ON_ERROR_STOP=1 < "${BACKUP_FILE}"

echo "=========================================================="
echo " [Dsilk] Validação pós-restauração (contagem de registros):"
echo "----------------------------------------------------------"
docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -A -c "
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

echo "=========================================================="
echo " [Dsilk] Restauração concluída e validada com SUCESSO!"
echo "=========================================================="

