# Matriz de Rastreabilidade — Sistema Dsilk


## 1. Objetivo


Este documento estabelece a rastreabilidade entre os requisitos funcionais (RF), os casos de uso (UC), as telas documentadas no protótipo, as rotas do contrato da API, as regras de negócio (RN) e as issues registradas no GitHub para o sistema Dsilk.


A matriz permite identificar quais artefatos estão relacionados a cada requisito e apontar itens que ainda não possuem correspondência documentada. As associações abaixo foram elaboradas a partir dos documentos de requisitos, casos de uso, regras de negócio, contrato de API, perfis de acesso e documentação do protótipo disponibilizados pela equipe.


## 2. Convenções


- **RF:** requisito funcional.
- **UC:** caso de uso.
- **TEL:** tela identificada na documentação do protótipo.
- **RN:** regra de negócio.
- **Issue:** tarefa registrada no GitHub.
- **Não identificado:** não há, nos artefatos consultados, um caso de uso ou uma tela específica documentada para o requisito.


## 3. Identificação das telas do protótipo


Os códigos TEL-01 a TEL-10 são identificadores propostos para facilitar a referência às telas; os nomes correspondem à documentação do protótipo.


| ID | Tela | Requisitos relacionados conforme a documentação do protótipo |
|---|---|---|
| TEL-01 | Área Administrativa / Login | RF-13 |
| TEL-02 | Listagem de Materiais | RF-01, RF-02 |
| TEL-03 | Novo Material | RF-01 |
| TEL-04 | Listagem de Serviços | RF-04 |
| TEL-05 | Novo Serviço | RF-04 |
| TEL-06 | Composição do Serviço | RF-05 |
| TEL-07 | Listagem de Clientes | RF-03 |
| TEL-08 | Novo Cliente | RF-03 |
| TEL-09 | Perfil do Cliente | RF-03, RF-08 |
| TEL-10 | Novo Orçamento | RF-06, RF-07, RF-08 |


## 4. Matriz de rastreabilidade


| Requisito funcional | Caso(s) de uso | Tela(s) do protótipo |Rota(s) previstas no contrato da API| Regra(s) de negócio | Issue(s) relacionada(s) |
|---|---|---|---|---|---|
| **RF-01 — Cadastrar Materiais** | UC-01 — Cadastrar Material | TEL-02 — Listagem de Materiais; TEL-03 — Novo Material | `POST /materiais` | — | #28 — RF-01; #46 — UC / Casos de Uso |
| **RF-02 — Consultar e Editar Material** | Não identificado um UC específico nos casos de uso documentados | TEL-02 — Listagem de Materiais | `GET /materiais`; `GET /materiais/:id`; `PUT /materiais/:id` | — | #29 — RF-02 |
| **RF-03 — Cadastrar Clientes** | Não identificado um UC específico nos casos de uso documentados | TEL-07 — Listagem de Clientes; TEL-08 — Novo Cliente; TEL-09 — Perfil do Cliente | `GET /clientes`; `POST /clientes` | RN-04 — Associação opcional de cliente ao orçamento (relacionamento compartilhado com RF-08) | #30 — RF-03 |
| **RF-04 — Cadastrar Serviço Personalizado** | UC-02 — Cadastrar Serviço Personalizado | TEL-04 — Listagem de Serviços; TEL-05 — Novo Serviço | `GET /servicos`; `GET /servicos/:id`; `POST /servicos` | RN-03 — Cálculo por metragem | #31 — RF-04; #49 — Regras de negócio |
| **RF-05 — Configurar Composição do Serviço** | UC-03 — Configurar Composição do Serviço | TEL-06 — Composição do Serviço | `GET /servicos/:id`; `PUT /servicos/:id/composicao` | RN-01 — Composição obrigatória para cálculo por composição; RN-02 — Quantidade obrigatória dos materiais | #32 — RF-05; #49 — Regras de negócio |
| **RF-06 — Calcular Custo por Metragem** | UC-04 — Criar e Registrar Orçamento | TEL-10 — Novo Orçamento | `POST /orcamentos/calcular` | RN-03 — Cálculo por metragem | #33 — RF-06; #46 — UC / Casos de Uso; #49 — Regras de negócio |
| **RF-07 — Calcular Custo por Composição** | UC-04 — Criar e Registrar Orçamento | TEL-10 — Novo Orçamento | `POST /orcamentos/calcular` | RN-01 — Composição obrigatória para cálculo por composição | #34 — RF-07; #46 — UC / Casos de Uso; #49 — Regras de negócio |
| **RF-08 — Criar e Registrar Orçamento** | UC-04 — Criar e Registrar Orçamento | TEL-09 — Perfil do Cliente; TEL-10 — Novo Orçamento | `POST /orcamentos` | RN-04 — Associação opcional de cliente ao orçamento | #35 — RF-08; #46 — UC / Casos de Uso; #49 — Regras de negócio |
| **RF-09 — Consultar e Editar Orçamentos** | Não identificado um UC específico nos casos de uso documentados | Fora do escopo desta entrega do protótipo | `GET /orcamentos`; `GET /orcamentos/:id`; `PUT /orcamentos/:id` | — | #36 — RF-09 |
| **RF-10 — Visualizar Planejamento Semanal** | UC-05 — Visualizar Planejamento Semanal | Fora do escopo desta entrega do protótipo | `GET /planejamento` | — | #37 — RF-10; #46 — UC / Casos de Uso |
| **RF-11 — Registrar e Editar Atividade no Planejamento** | Não identificado um UC específico nos casos de uso documentados | Fora do escopo desta entrega do protótipo | `POST /atividades`; `PUT /atividades/:id` | — | #38 — RF-11 |
| **RF-12 — Cadastrar Funcionário** | Não identificado um UC específico nos casos de uso documentados | Fora do escopo desta entrega do protótipo | `POST /funcionarios` | RN-05 — Autenticação de funcionário (relacionamento compartilhado com RF-13) | #39 — RF-12; #49 — Regras de negócio; #50 — Perfis de acesso |
| **RF-13 — Autenticar Funcionário** | Não identificado um UC específico nos casos de uso documentados | TEL-01 — Área Administrativa / Login | `GET /funcionarios`; `POST /login` | RN-05 — Autenticação de funcionário | #40 — RF-13; #49 — Regras de negócio; #50 — Perfis de acesso |


## 5. Issues transversais relacionadas à documentação


Além das issues específicas de cada requisito, os seguintes registros abrangem grupos de artefatos ou atividades transversais:


| Issue | Descrição | Relação com a matriz |
|---|---|---|
| #41 | RNF-01 — Usabilidade | Requisito não funcional; não corresponde a uma única linha de RF. |
| #42 | RNF-02 — Adequação dos Campos | Requisito não funcional; relaciona-se à adequação dos formulários aos tipos de serviço. |
| #43 | RNF-03 — Tempo de Elaboração | Requisito não funcional; relacionado à elaboração de orçamento simples por metragem. |
| #44 | RNF-04 — Desempenho | Requisito não funcional; relacionado ao tempo de cálculo e apresentação do orçamento. |
| #45 | RNF-05 — Conteinerização | Requisito não funcional relacionado à execução da aplicação em Docker. |
| #46 | UC — Casos de Uso | Documentação dos casos de uso UC-01 a UC-05. |
| #48 | Adicionar critérios Gherkin aos requisitos | Atividade transversal de especificação dos critérios de aceitação. |
| #49 | Adicionar 5 regras de negócio vinculadas aos requisitos | Documentação das regras RN-01 a RN-05. |
| #50 | Elicitar os perfis de acesso no documento de requisitos | Documentação dos perfis Administrador e Funcionário; as permissões ainda devem ser validadas com o cliente. |
| #51 | Mapear as rotas do contrato aos requisitos escritos | Mapeamento das rotas da API para os requisitos funcionais. |



## 6. Conclusão


A matriz reúne as relações documentadas entre os requisitos funcionais, os casos de uso existentes, as telas previstas no protótipo, as rotas do contrato da API, as regras de negócio e as issues do GitHub. Também evidencia lacunas de rastreabilidade e diferenças entre artefatos que precisam ser validadas pela equipe, sem presumir que funcionalidades ausentes do protótipo tenham sido removidas dos requisitos.


A matriz deve ser atualizada conforme os requisitos forem revisados, novas telas forem prototipadas ou implementadas, rotas forem alteradas e novas issues forem criadas.
