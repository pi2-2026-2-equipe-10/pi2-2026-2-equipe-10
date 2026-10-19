# Índices do banco de dados

Mapeamento dos índices definidos em `init/01-schema.sql` e das consultas das rotas que os utilizam.

## 1. Índices nas colunas usadas em filtros (`WHERE`)

| Índice | Tabela (coluna) | Rota / consulta que usa | Por que existe |
| :--- | :--- | :--- | :--- |
| `idx_funcionario_ativo_nome` (parcial, `WHERE ativo = TRUE`) | `funcionario (nome)` | `GET /funcionarios` — `WHERE ativo = TRUE ORDER BY nome` | Guarda só os funcionários ativos já ordenados por nome, exatamente o que a tela de login lista. |
| `idx_atividade_data` | `atividade (data)` | `GET /planejamento` — `WHERE data >= :inicio AND data <= :fim` | Busca por faixa de datas da semana sem varrer toda a tabela. |
| `idx_item_composicao_servico_id` | `item_composicao (servico_id)` | `GET /servicos/:id` — `WHERE servico_id = :id`; `PUT /servicos/:id/composicao` — `DELETE ... WHERE servico_id = :id` | Carrega e substitui a composição de um serviço. |
| `material_nome_key` (UNIQUE) | `material (nome)` | `POST /materiais` — verificação de duplicidade | O próprio UNIQUE cria o índice. |
| `cliente_email_key` (UNIQUE) | `cliente (email)` | `POST /clientes` — verificação de duplicidade | O próprio UNIQUE cria o índice. |
| índice da chave primária | `id` de todas as tabelas | `WHERE id = :id` em `GET /materiais/:id`, `/servicos/:id`, `/orcamentos/:id`, `PUT` e os `JOIN ... ON x.id` | Criado automaticamente pelo `PRIMARY KEY`. |

## 2. Índices de apoio às chaves estrangeiras

O PostgreSQL **não** cria índice automático na coluna que referencia (o lado "filho" da FK). Esses índices não aparecem em `WHERE` das rotas, mas evitam varredura completa da tabela filha quando o registro pai é apagado ou alterado (verificação de FK, `ON DELETE CASCADE` e `ON DELETE SET NULL`).

| Índice | Tabela (coluna) | Quando é usado |
| :--- | :--- | :--- |
| `idx_servico_material_id` | `servico (material_id)` | Ao apagar um material, o banco confere se algum serviço o usa. |
| `idx_item_composicao_material_id` | `item_composicao (material_id)` | Ao apagar um material, o banco confere se alguma composição o usa. |
| `idx_orcamento_cliente_id` | `orcamento (cliente_id)` | Ao apagar um cliente, aplica `ON DELETE SET NULL` nos orçamentos dele. |
| `idx_orcamento_servico_id` | `orcamento (servico_id)` | Ao apagar um serviço, aplica `ON DELETE SET NULL` nos orçamentos dele. |

> Os `LEFT JOIN cliente/servico/material` das listagens ligam pela **chave primária** da tabela de destino, que já é indexada. Por isso esses índices de FK servem à integridade referencial, e não à velocidade da listagem.

## 3. Colunas deliberadamente sem índice

| Coluna | Motivo |
| :--- | :--- |
| `orcamento.criado_em` (`ORDER BY` em `GET /orcamentos`) | É ordenação, não filtro, e a listagem retorna a tabela inteira. Indexar só vale se a rota ganhar paginação. |
| `material.nome`, `cliente.nome`, `servico.nome` (`ORDER BY nome`) | Ordenação das listagens completas, sem filtro. |

## 4. Como verificar que os índices são utilizáveis

As tabelas do seed têm cerca de 10 linhas, e nesse tamanho o PostgreSQL prefere varredura sequencial. Para comprovar que o índice atende a consulta, desative a varredura sequencial **na mesma sessão** e leia o plano (PowerShell, na raiz do repositório):

```powershell
docker exec grafica_db psql -U grafica_user -d grafica -c "SET enable_seqscan = off; EXPLAIN SELECT id, nome FROM funcionario WHERE ativo = TRUE ORDER BY nome;"
docker exec grafica_db psql -U grafica_user -d grafica -c "SET enable_seqscan = off; EXPLAIN SELECT id, titulo FROM atividade WHERE data >= '2026-09-21' AND data <= '2026-09-27';"
docker exec grafica_db psql -U grafica_user -d grafica -c "SET enable_seqscan = off; EXPLAIN SELECT id FROM item_composicao WHERE servico_id = 6;"
```

O plano deve citar `Index Scan` ou `Bitmap Index Scan` com o nome do índice da tabela acima. Para listar todos os índices existentes:

```powershell
docker exec grafica_db psql -U grafica_user -d grafica -c "SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;"
```
