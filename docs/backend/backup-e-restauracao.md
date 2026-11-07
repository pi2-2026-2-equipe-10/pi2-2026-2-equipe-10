# Rotina de Cópia de Segurança e Restauração do Banco de Dados — Dsilk

Este documento atende ao requisito de **Backend 3**, estabelecendo os procedimentos operacionais padronizados, scripts automatizados e o registro da evidência de teste prático de **backup** e **restauração** do banco de dados relacional PostgreSQL da aplicação Dsilk.

---

## 1. Estratégia de Cópia de Segurança (Backup)

O banco de dados relacional do sistema opera em container Docker (`grafica_db`, PostgreSQL 16). A estratégia de cópia de segurança adotada é o **dump lógico consistente** gerado pelo utilitário oficial `pg_dump`:

- **Formato:** Dump SQL estruturado e portável.
- **Flags de Integridade:**
  - `--clean --if-exists`: Gera instruções `DROP TABLE IF EXISTS` e `DROP TYPE IF EXISTS` antes da recriação de cada objeto, permitindo que a restauração ocorra de forma idempotente e segura mesmo sobre bases existentes.
  - `--no-owner --no-privileges`: Garante portabilidade entre diferentes ambientes sem conflito de permissões de sistema operacional.
- **Armazenamento:** Os arquivos são salvos no diretório `backups/` na raiz do projeto com carimbo de data e hora no padrão `backup_grafica_AAAAMMDD_HHMMSS.sql`.

---

## 2. Scripts Disponibilizados

Para assegurar a reprodutibilidade em qualquer ambiente de desenvolvimento ou produção, foram criados scripts multiplataforma:

| Sistema Operacional | Script de Backup | Script de Restauração |
| :--- | :--- | :--- |
| **Linux / macOS (Bash)** | [`scripts/backup-banco.sh`](../../scripts/backup-banco.sh) | [`scripts/restaurar-banco.sh`](../../scripts/restaurar-banco.sh) |
| **Windows (PowerShell)** | [`scripts/backup-banco.ps1`](../../scripts/backup-banco.ps1) | [`scripts/restaurar-banco.ps1`](../../scripts/restaurar-banco.ps1) |

---

## 3. Procedimento Operacional: Passo a Passo

### 3.1 Executando a Cópia de Segurança (Backup)

Certifique-se de que o container do banco está em execução (`docker compose up -d db`).

**No Linux / macOS:**
```bash
./scripts/backup-banco.sh
```

**No Windows (PowerShell):**
```powershell
.\scripts\backup-banco.ps1
```

O script criará o diretório `backups/` (caso não exista) e exibirá o arquivo gerado e seu tamanho.

---

### 3.2 Executando a Restauração (Restore)

Para restaurar o backup mais recente gerado automaticamente:

**No Linux / macOS:**
```bash
./scripts/restaurar-banco.sh
```
*(Ou especificando um arquivo específico: `./scripts/restaurar-banco.sh backups/backup_grafica_20261107_174504.sql`)*

**No Windows (PowerShell):**
```powershell
.\scripts\restaurar-banco.ps1
```
*(Ou especificando um arquivo: `.\scripts\restaurar-banco.ps1 -BackupFile backups\backup_grafica_20261107_174504.sql`)*

O script restaura todos os schemas, tabelas, sequências, chaves estrangeiras, constraints e registros, executando em seguida uma consulta de contagem automática de registros para validação imediata da integridade.

---

## 4. Evidência do Teste de Homologação Prático

O procedimento de backup e restauração foi homologado e testado através do seguinte roteiro:

### Passo 1 — Execução da cópia de segurança
Executou-se o script de backup gerando a imagem estável do banco de dados:
```bash
./scripts/backup-banco.sh
```
**Saída registrada:**
```text
==========================================================
 [Dsilk] Iniciando cópia de segurança do banco de dados...
 Container : grafica_db
 Banco     : grafica
 Destino   : /home/josue/Documentos/codigos/pi2-2026-2-equipe-10/backups/backup_grafica_20261107_174504.sql
 Data/Hora : 07/11/2026 17:45:04
==========================================================
==========================================================
 [Dsilk] Cópia de segurança concluída com SUCESSO!
 Arquivo gerado : /home/josue/Documentos/codigos/pi2-2026-2-equipe-10/backups/backup_grafica_20261107_174504.sql
 Tamanho        : 20K
==========================================================
```

### Passo 2 — Inserção de dado de teste transitório
Para comprovar que a restauração reverte e restaura o estado fidedigno do ponto no tempo, inseriu-se um registro arbitrário na tabela `material`:
```bash
docker exec grafica_db psql -U grafica_user -d grafica -c "INSERT INTO material (nome, unidade_medida, custo) VALUES ('MATERIAL_TEMPORARIO_TESTE_BACKUP', 'un', 999.00);"
```
**Confirmação da presença do dado:**
```text
 id |               nome               
----+----------------------------------
 12 | MATERIAL_TEMPORARIO_TESTE_BACKUP
(1 row)
```

### Passo 3 — Execução da restauração a partir do arquivo gerado
Executou-se o script de restauração:
```bash
./scripts/restaurar-banco.sh
```
**Saída registrada com contagem e validação:**
```text
==========================================================
 [Dsilk] Iniciando restauração do banco de dados...
 Container : grafica_db
 Banco     : grafica
 Origem    : /home/josue/Documentos/codigos/pi2-2026-2-equipe-10/backups/backup_grafica_20261107_174504.sql
 Data/Hora : 07/11/2026 17:45:26
==========================================================
... (Comandos DDL e COPY dos dados) ...
==========================================================
 [Dsilk] Validação pós-restauração (contagem de registros):
----------------------------------------------------------
funcionarios : 10
materiais    : 11
clientes     : 10
servicos     : 11
orcamentos   : 11
atividades   : 11
==========================================================
 [Dsilk] Restauração concluída e validada com SUCESSO!
==========================================================
```

### Passo 4 — Comprovação de eliminação do dado transitório
Efetuou-se uma consulta de verificação no PostgreSQL confirmando que o dado inserido após o backup foi devidamente revertido, atestando a restauração do estado idêntico ao snapshot:
```bash
docker exec grafica_db psql -U grafica_user -d grafica -c "SELECT id, nome FROM material WHERE nome = 'MATERIAL_TEMPORARIO_TESTE_BACKUP';"
```
**Resultado:**
```text
 id | nome 
----+------
(0 rows)
```

**Status do Teste:** 🟢 **Aprovado com 100% de integridade**.

