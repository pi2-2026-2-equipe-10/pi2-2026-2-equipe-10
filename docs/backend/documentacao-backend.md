# Documentação do Backend — Sistema da Gráfica

Backend em Java 21 com Spring Boot, banco PostgreSQL em container Docker e API REST em JSON na porta 3000.

## 1. Módulo de acesso ao banco de dados

O acesso ao PostgreSQL é feito pelo `JdbcClient` do Spring (`spring-boot-starter-jdbc`), com pool de conexões HikariCP. O `DataSource` é configurado em `backend/src/main/resources/application.properties` por variáveis de ambiente, com valores padrão para desenvolvimento local:

| Variável | Padrão | No Docker Compose |
| :--- | :--- | :--- |
| `DB_URL` | `jdbc:postgresql://localhost:5432/grafica` | `jdbc:postgresql://db:5432/grafica` |
| `DB_USER` | `grafica_user` | `grafica_user` |
| `DB_PASSWORD` | `grafica_pass` | `grafica_pass` |

Cada rota acessa o banco por meio de um controller que recebe o `JdbcClient` por injeção de dependência:

| Controller | Rotas | Tabelas |
| :--- | :--- | :--- |
| `FuncionarioController` | `GET /funcionarios`, `POST /login` | `funcionario` |
| `MaterialController` | `/materiais` | `material` |
| `ClienteController` | `/clientes` | `cliente` |
| `ServicoController` | `/servicos` | `servico`, `item_composicao`, `material` |
| `OrcamentoController` | `/orcamentos` | `orcamento`, `cliente`, `servico` |
| `PlanejamentoController` | `/planejamento`, `/atividades` | `atividade` |

As consultas usam parâmetros nomeados (`:id`), nunca concatenação de texto. A única operação com mais de uma gravação, `PUT /servicos/:id/composicao`, roda em transação (`@Transactional`).

O schema e os dados de demonstração são criados na primeira subida do container pelos scripts de `init/` (`01-schema.sql`, `02-seed.sql`, `03-senhas-demo.sql`, `04-recalcula-custos.sql`).

## 2. Testes de rejeição de FK e unicidade

O script `backend/testes/testes-rejeicao.sql` tenta inserir dados inválidos e confirma que o banco os rejeita. Ele roda dentro de uma transação com `ROLLBACK`, então não deixa dados no banco. Para executar (PowerShell, na raiz do repositório, com o container no ar):

```powershell
docker cp backend\testes\testes-rejeicao.sql grafica_db:/tmp/testes-rejeicao.sql
docker exec grafica_db psql -U grafica_user -d grafica -v ON_ERROR_STOP=1 -f /tmp/testes-rejeicao.sql
```

| Teste | Dado inválido | Rejeitado por |
| :--- | :--- | :--- |
| T01 | material com nome repetido | `material_nome_key` (UNIQUE) |
| T02 | cliente com e-mail repetido | `cliente_email_key` (UNIQUE) |
| T03 | serviço com `material_id` inexistente | `servico_material_id_fkey` (FK) |
| T04 | item de composição com `servico_id` inexistente | `item_composicao_servico_id_fkey` (FK) |
| T05 | item de composição com `material_id` inexistente | `item_composicao_material_id_fkey` (FK) |
| T06 | orçamento com `cliente_id` inexistente | `orcamento_cliente_id_fkey` (FK) |
| T07 | orçamento com `servico_id` inexistente | `orcamento_servico_id_fkey` (FK) |
| T08 | apagar material em uso por um serviço | `servico_material_id_fkey` (FK) |
| T09 | custo de material negativo | `material_custo_check` (CHECK) |
| T10 | quantidade zero na composição | `item_composicao_quantidade_check` (CHECK) |
| T11 | orçamento registrado sem serviço | `chk_orcamento_servico_obrigatorio_se_nao_rascunho` (CHECK) |
| T12 | largura negativa | `chk_orcamento_largura_nao_negativa` (CHECK) |
| T13 | `tipo_calculo` fora do ENUM | `tipo_calculo_enum` |
| T14 | material sem nome | NOT NULL em `material.nome` |
| P01 e P02 | controles: orçamento sem cliente e rascunho sem serviço | devem ser **aceitos** |

## 3. Índices

O mapeamento dos índices por filtro e a forma de comprová-los com `EXPLAIN` estão em [`indices.md`](indices.md).

## 4. As 8 rotas implementadas

Rotas protegidas exigem `Authorization: Bearer <token>` (token JWT obtido em `POST /login`, válido por 12 horas). Os exemplos de cada rota, com sucesso e erro, estão em `backend/requests.http`.

| # | Método | Rota | Requisito | Auth | Sucesso | Erros |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/funcionarios` | RF-13 | não | 200 | — |
| 2 | `POST` | `/login` | RF-13 | não | 200 | 400, 401 |
| 3 | `GET` | `/materiais` | RF-02 | sim | 200 | 401 |
| 4 | `POST` | `/materiais` | RF-01 | sim | 201 | 400, 401, 409 |
| 5 | `POST` | `/servicos` | RF-04 | sim | 201 | 400, 401, 404 |
| 6 | `PUT` | `/servicos/:id/composicao` | RF-05 | sim | 200 | 400, 401, 404 |
| 7 | `POST` | `/orcamentos/calcular` | RF-06, RF-07 | sim | 200 | 400, 401, 404 |
| 8 | `POST` | `/orcamentos` | RF-08 | sim | 201 | 400, 401, 404 |

## 5. Regras de negócio: onde estão no código

| RN | Regra | Onde é aplicada | Resposta quando violada | Teste |
| :--- | :--- | :--- | :--- | :--- |
| RN-01 | Serviço por composição só tem o custo calculado se tiver composição cadastrada | `OrcamentoController.calcular` (ramo `COMPOSICAO`); `ServicoController.configurarComposicao` só aceita serviços do tipo `COMPOSICAO` | 400 — "O serviço configurado para cálculo por composição não possui composição cadastrada." | `requests.http` 18 e 23 |
| RN-02 | Todo material da composição precisa de quantidade | `ServicoController.configurarComposicao` valida todos os itens **antes** de gravar; no banco, `CHECK (quantidade > 0)` | 400 — "Cada item deve possuir 'materialId' e 'quantidade' maiores que zero." | `requests.http` 19, 20 e 21; T10 |
| RN-03 | Custo por metragem = largura × altura × custo do material | `OrcamentoController.calcular` (ramo `METRAGEM`) | 400 se faltar largura ou altura maior que zero | `requests.http` 24 e 25 |
| RN-04 | Orçamento não depende de cliente cadastrado | `OrcamentoController.lerDados`: `clienteId` é opcional; se informado, precisa existir. No banco, `cliente_id` aceita NULL | 404 se o cliente informado não existir; 400 se o valor for inválido | `requests.http` 28, 29 e 30; P01 |
| RN-05 | Acesso só com credenciais corretas | `FuncionarioController.login` (senha com BCrypt; só funcionários ativos) e `AuthInterceptor` (token JWT nas rotas protegidas) | 401 — senha incorreta, funcionário inexistente ou inativo, token ausente, inválido ou expirado | `requests.http` 02 a 07 |

Regras de validação adicionais do código:

- Orçamento registrado (não rascunho) exige `servicoId`; rascunho pode ficar sem serviço (`CHECK` no banco e validação na API).
- `PUT /servicos/:id/composicao`: se um item for inválido, a composição anterior do serviço é preservada (validação antes da gravação e transação).
- Ids na URL e `servicoId`/`clienteId` no corpo devem ser inteiros positivos.

## 6. Códigos de erro

Todo erro devolve JSON no formato `{ "erro": "mensagem" }`.

| Código | Quando acontece | Exemplos |
| :--- | :--- | :--- |
| 400 | Dados ausentes ou inválidos; violação de regra de negócio; restrição do banco (FK, CHECK, limite de coluna) | Custo menor ou igual a zero; composição vazia no cálculo; JSON malformado; id inválido na URL |
| 401 | Falha de autenticação | Senha incorreta; funcionário inexistente ou inativo; token ausente, inválido ou expirado |
| 404 | Recurso não encontrado | Material, serviço, cliente ou orçamento inexistente; rota inexistente |
| 405 | Método HTTP não permitido para a rota | `DELETE /materiais` |
| 409 | Valor duplicado (UNIQUE) | Material com nome já cadastrado; cliente com e-mail já cadastrado |
| 415 | Faltou `Content-Type: application/json` | — |
| 500 | Erro interno inesperado | — |

> O código 409 (conflito) é usado quando o valor informado já existe em um campo único: nome de material e e-mail de cliente. Os demais códigos (400, 401 e 404) já eram usados pela API desde o início.
