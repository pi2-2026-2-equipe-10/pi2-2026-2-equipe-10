# 1. Mapeamento das Rotas do Contrato aos Requisitos

O mapeamento das rotas tem como objetivo estabelecer a relação entre os endpoints definidos no contrato da API e os requisitos funcionais do sistema. Essa relação permite identificar quais requisitos são atendidos por cada rota e garantir a rastreabilidade entre os requisitos especificados e os recursos disponibilizados pelo backend.

## 1.1 Rotas relacionadas aos requisitos

| Método | Rota | Requisito(s) relacionado(s) | Finalidade |
| :--- | :--- | :--- | :--- |
| `GET` | `/funcionarios` | RF-13 | Listar os funcionários ativos disponíveis para acesso ao sistema. |
| `POST` | `/funcionarios` | RF-12 | Cadastrar um novo funcionário. |
| `POST` | `/login` | RF-13 | Autenticar o funcionário e fornecer o token de acesso. |
| `GET` | `/materiais` | RF-02 | Consultar os materiais cadastrados. |
| `GET` | `/materiais/:id` | RF-02 | Consultar os dados de um material específico. |
| `POST` | `/materiais` | RF-01 | Cadastrar um novo material. |
| `PUT` | `/materiais/:id` | RF-02 | Editar os dados de um material cadastrado. |
| `GET` | `/clientes` | RF-03 | Consultar os clientes cadastrados. |
| `POST` | `/clientes` | RF-03 | Cadastrar um novo cliente. |
| `GET` | `/servicos` | RF-04 | Consultar os serviços personalizados cadastrados. |
| `GET` | `/servicos/:id` | RF-04, RF-05 | Consultar um serviço e seus dados de composição. |
| `POST` | `/servicos` | RF-04 | Cadastrar um serviço personalizado. |
| `PUT` | `/servicos/:id/composicao` | RF-05 | Configurar a composição de um serviço. |
| `POST` | `/orcamentos/calcular` | RF-06, RF-07 | Calcular o custo de um serviço por metragem ou por composição. |
| `GET` | `/orcamentos` | RF-09 | Consultar os orçamentos cadastrados. |
| `GET` | `/orcamentos/:id` | RF-09 | Consultar os dados de um orçamento específico. |
| `POST` | `/orcamentos` | RF-08 | Criar e registrar um orçamento ou salvá-lo como rascunho. |
| `PUT` | `/orcamentos/:id` | RF-09 | Editar um orçamento existente. |
| `GET` | `/planejamento` | RF-10 | Consultar o planejamento semanal das atividades. |
| `POST` | `/atividades` | RF-11 | Registrar uma atividade no planejamento. |
| `PUT` | `/atividades/:id` | RF-11 | Editar uma atividade existente no planejamento. |

## 1.2 Relação entre requisitos e rotas

A relação também pode ser apresentada a partir dos requisitos funcionais, permitindo verificar quais rotas estão associadas a cada requisito.

| Requisito | Descrição | Rotas relacionadas |
| :--- | :--- | :--- |
| RF-01 | Cadastrar Materiais | `POST /materiais` |
| RF-02 | Consultar e Editar Material | `GET /materiais`, `GET /materiais/:id`, `PUT /materiais/:id` |
| RF-03 | Cadastrar Clientes | `GET /clientes`, `POST /clientes` |
| RF-04 | Cadastrar Serviço Personalizado | `GET /servicos`, `GET /servicos/:id`, `POST /servicos` |
| RF-05 | Configurar Composição do Serviço | `GET /servicos/:id`, `PUT /servicos/:id/composicao` |
| RF-06 | Calcular Custo por Metragem | `POST /orcamentos/calcular` |
| RF-07 | Calcular Custo por Composição | `POST /orcamentos/calcular` |
| RF-08 | Criar e Registrar Orçamento | `POST /orcamentos` |
| RF-09 | Consultar e Editar Orçamentos | `GET /orcamentos`, `GET /orcamentos/:id`, `PUT /orcamentos/:id` |
| RF-10 | Visualizar Planejamento Semanal | `GET /planejamento` |
| RF-11 | Registrar e Editar Atividade no Planejamento | `POST /atividades`, `PUT /atividades/:id` |
| RF-12 | Cadastrar Funcionário | `POST /funcionarios` |
| RF-13 | Autenticar Funcionário | `GET /funcionarios`, `POST /login` |

## 1.3 Observações sobre o mapeamento

O mapeamento demonstra que os requisitos funcionais estão relacionados às rotas disponibilizadas pelo backend. Alguns requisitos são atendidos por mais de uma rota, como o RF-02, que envolve consulta e edição de materiais, enquanto algumas rotas atendem simultaneamente a mais de um requisito, como `GET /servicos/:id`, relacionado aos RF-04 e RF-05, e `POST /orcamentos/calcular`, relacionado aos RF-06 e RF-07.

As rotas protegidas exigem autenticação por meio de token, obtido pela rota `POST /login`, conforme definido no contrato da API.
