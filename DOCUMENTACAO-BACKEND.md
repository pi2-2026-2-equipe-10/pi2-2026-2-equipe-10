# Documentação do Backend — Sistema da Gráfica

## 1. Módulo de Acesso ao Banco de Dados
O acesso ao banco de dados PostgreSQL pelas rotas da API é realizado através do módulo `spring-boot-starter-jdbc` utilizando `JdbcClient` injetado nos Controllers (`FuncionarioController`, `ClienteController`, `MaterialController`, `ServicoController`, `OrcamentoController`, `AtividadeController`), configurado em `application.properties`.

## 2. Testes de Rejeição de Chave Estrangeira (FK) e Unicidade (UNIQUE)
Os testes de integridade referencial e unicidade estão disponíveis no script `testes-rejeicao.sql`. Todas as inserções inválidas foram devidamente rejeitadas pelo SGBD com os erros:
- `material_nome_key` (Violação de UNIQUE em `material.nome`)
- `cliente_email_key` (Violação de UNIQUE em `cliente.email`)
- `servico_material_id_fkey` (Violação de FK em `servico.material_id`)
- `item_composicao_servico_id_fkey` (Violação de FK em `item_composicao.servico_id`)
- `orcamento_cliente_id_fkey` (Violação de FK em `orcamento.cliente_id`)

## 3. Mapeamento de Índices nas Colunas Usadas em Filtros
Os índices abaixo foram definidos em `init/01-schema.sql` para otimizar as consultas (`WHERE` e `JOIN`) realizadas pelas rotas da API:

| Nome do Índice | Tabela | Coluna Indexada | Onde é usado (Filtro / Rota) | Objetivo |
| :--- | :--- | :--- | :--- | :--- |
| `idx_funcionario_ativo` | `funcionario` | `ativo` | `GET /funcionarios` (`WHERE ativo = TRUE`) | Filtrar rapidamente apenas funcionários ativos na tela de login. |
| `idx_servico_material_id` | `servico` | `material_id` | `GET /servicos` e `GET /servicos/{id}` (`LEFT JOIN material`) | Acelerar a busca do material associado a serviços de metragem. |
| `idx_item_composicao_servico_id` | `item_composicao` | `servico_id` | `GET /servicos/{id}` (`WHERE servico_id = :id`) | Carregar rapidamente a lista de materiais que compõem um serviço e otimizar `ON DELETE CASCADE`. |
| `idx_item_composicao_material_id` | `item_composicao` | `material_id` | `GET /servicos/{id}` (`JOIN material`) | Otimizar a junção com a tabela de materiais para obter o custo unitário na composição. |
| `idx_orcamento_cliente_id` | `orcamento` | `cliente_id` | `GET /orcamentos` (`LEFT JOIN cliente`) | Acelerar a junção dos dados do cliente na listagem de orçamentos. |
| `idx_orcamento_servico_id` | `orcamento` | `servico_id` | `GET /orcamentos` (`LEFT JOIN servico`) | Acelerar a junção dos dados do serviço na listagem de orçamentos. |
| `idx_atividade_data` | `atividade` | `data` | `GET /planejamento` / `GET /atividades` (`WHERE data = ...`) | Filtrar rapidamente as atividades do planejamento semanal por data. |

---

## 4. Mapeamento das 8 Rotas do Contrato (Backend 2)

| # | Método | Rota | Descrição | Autenticação |
|---|--------|------|-----------|--------------|
| 1 | `GET` | `/funcionarios` | Lista todos os funcionários ativos | Pública |
| 2 | `POST` | `/login` | Realiza autenticação e retorna o Token JWT | Pública |
| 3 | `GET` | `/materiais` | Lista todos os materiais cadastrados | Protegida (Bearer Token) |
| 4 | `GET` | `/materiais/{id}` | Busca os detalhes de um material específico | Protegida (Bearer Token) |
| 5 | `POST` | `/materiais` | Cadastra um novo material no sistema | Protegida (Bearer Token) |
| 6 | `GET` | `/clientes` | Lista todos os clientes cadastrados | Protegida (Bearer Token) |
| 7 | `POST` | `/clientes` | Cadastra um novo cliente no sistema | Protegida (Bearer Token) |
| 8 | `GET` | `/orcamentos` | Lista todos os orçamentos com dados cruzados (Join) | Protegida (Bearer Token) |

---

## 5. Regras de Negócio e Códigos de Erro (Validações)

As regras de negócio e validações definidas pela equipe de requisitos foram implementadas e retornam os seguintes códigos HTTP:

* **Autenticação JWT (`POST /login`)**:
  * **Regra**: Valida o `funcionarioId` e a `senha`. Se a credencial estiver incorreta, bloqueia o acesso.
  * **Código de Erro**: `401 Unauthorized`.

* **Consulta por ID (`GET /materiais/{id}`)**:
  * **Regra**: Verifica se o ID informado existe na base de dados relacional.
  * **Código de Erro**: `404 Not Found` (Caso o material não seja encontrado).

* **Cadastros (`POST /materiais` e `POST /clientes`)**:
  * **Regra**: Os campos obrigatórios devem ser preenchidos de acordo com as restrições de unicidade e tipo de dados.
  * **Código de Erro**: `400 Bad Request` (Violação de formato ou parâmetros incorretos).

* **Rotas Protegidas (`/materiais`, `/clientes`, `/orcamentos`)**:
  * **Regra**: Exigem o cabeçalho `Authorization: Bearer <token>` obtido na rota de login.
  * **Código de Erro**: `401 Unauthorized` caso o token seja inválido ou ausente.