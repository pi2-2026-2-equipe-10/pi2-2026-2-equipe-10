# Documentação das Entregas de Frontend — Sistema Dsilk (Equipe 10)

Este documento consolida as evidências, arquitetura, rastreabilidade e comprovação de atendimento aos critérios de avaliação das entregas de **Frontend 1**, **Frontend 2** e **Frontend 3**

---

## 1. Frontend 1

### 1.1 Merge entre as telas dos integrantes
O sistema frontend foi desenvolvido colaborativamente por meio de branches temáticas individuais e unificado progressivamente na branch principal (`main`):

1. **Branches Individuais Originais**:
   - `feature/tela-1-login` (Tela de Login e seleção de funcionários)
   - `feature/tela-2-cadastro` (Tela de Cadastro)
   - `feature/tela-3-esqueci-senha`, `feature/tela-4-enviar-codigo`, `feature/tela-5-redefinir-senha` (Fluxo de recuperação)
   - `feature/telas-materiais` (Telas de listagem e cadastro de materiais)
2. **Pull Requests de Consolidação e Merge**:
   - **PR #53 (`feature/consolidacao-telas`)**: Unificação das telas isoladas dos integrantes sob um roteador comum (`react-router-dom`), layout base padronizado (`AuthLayout`, `DashboardLayout`) e design system centralizado (`dashboard.css`).
   - **PR #57 (`feature/conteinerizacao-frontend`)**: Conteinerização do frontend com Docker e Docker Compose multi-stage.
   - **PR #61 (`feature/integracao-login-materiais`)**: Integração das telas de autenticação e insumos à API Spring Boot e PostgreSQL via cliente Axios com interceptor JWT.
   - **PR #62 (`feature/telas-servicos-orcamentos-planejamento`)**: Merge das telas dos fluxos de serviços, orçamentos e planejamento semanal na `main`.

---

### 1.2 As 3 Telas do Fluxo Principal (Sem Mock)

Todas as telas operam consumindo dados reais do banco PostgreSQL através da API Spring Boot:

#### 1. Tela de Login / Autenticação (`/login`)
- **Arquivo**: `dsilk-frontend/src/pages/Login.tsx`
- **Rotas Consumidas**:
  - `GET /funcionarios` — Obtém a lista dinâmica de funcionários ativos no banco para seleção.
  - `POST /login` — Autentica o funcionário via hash BCrypt, retornando o token JWT e gravando no `localStorage`.
- **Tabela Relacional**: `funcionario`
- **Requisito Atendido**: `RF-13` (Autenticar Funcionário)
- **Sem Mock**: Se a senha estiver incorreta ou o funcionário estiver inativo, a API retorna erro 401 real; ao autenticar, gera token assinado.

#### 2. Tela de Listagem e Consulta de Materiais (`/materials`)
- **Arquivo**: `dsilk-frontend/src/pages/MaterialsList.tsx`
- **Rotas Consumidas**:
  - `GET /materiais` — Consulta todos os insumos cadastrados no banco em ordem alfabética.
- **Tabela Relacional**: `material`
- **Requisito Atendido**: `RF-02` (Consultar Materiais)
- **Sem Mock**: Traz dados de custo unitário (`DECIMAL`), nome e unidade de medida cadastrados no banco relacional.

#### 3. Tela de Cadastro e Edição de Material (`/materials/new` e `/materials/edit/:id`)
- **Arquivo**: `dsilk-frontend/src/pages/MaterialsRegistration.tsx`
- **Rotas Consumidas**:
  - `POST /materiais` — Insere novo material com validação de unicidade (`UNIQUE`) e custo positivo.
  - `GET /materiais/:id` — Recupera os dados do material selecionado para edição.
  - `PUT /materiais/:id` — Atualiza os dados persistidos no banco.
- **Tabela Relacional**: `material`
- **Requisitos Atendidos**: `RF-01` (Cadastrar Material) e `RF-02` (Editar Material)
- **Sem Mock**: Inserções e atualizações são gravadas diretamente no PostgreSQL com tratamento de violação de constraints.

---

### 1.3 Redirecionamento e Proteção de Rotas (`ProtectedRoute`)

O sistema conta com um guardião de rotas centralizado implementado em `dsilk-frontend/src/components/ProtectedRoute.tsx`:
- Todas as rotas autenticadas da aplicação (`/overview`, `/materials`, `/services`, `/budgets`, `/planning`, `/clients`) são envolvidas por `<ProtectedRoute>`.
- Caso um usuário não autenticado tente acessar diretamente qualquer URL protegida, a aplicação intercepta imediatamente antes da renderização e executa o redirecionamento automático para a tela de login (`/login`), preservando o histórico de navegação.

---

## 2. Frontend 2

### 2.1 As 3 Telas do Fluxo Principal (Sem Mock)

#### 4. Tela de Cadastro de Serviço Personalizado (`/services/new`)
- **Arquivo**: `dsilk-frontend/src/pages/ServicesRegistration.tsx`
- **Rotas Consumidas**:
  - `POST /servicos` — Cadastra o serviço com tipo de cálculo (`METRAGEM` ou `COMPOSICAO`).
  - `GET /materiais` — Popula a seleção do material principal associado para serviços por metragem.
- **Tabelas Relacionais**: `servico`, `material`
- **Requisito Atendido**: `RF-04` (Cadastrar Serviço Personalizado)
- **Sem Mock**: O registro é criado na tabela `servico` com chave estrangeira para a tabela `material` (quando aplicável).

#### 5. Tela de Catálogo de Serviços e Configuração de Composição (`/services`)
- **Arquivo**: `dsilk-frontend/src/pages/ServicesList.tsx`
- **Rotas Consumidas**:
  - `GET /servicos` — Lista todos os serviços e suas composições técnicas ativas.
  - `GET /materiais` — Carrega os insumos disponíveis para montagem da composição.
  - `PUT /servicos/:id/composicao` — Persiste a ficha técnica (insumos, quantidades, tempo de produção em horas e custo/hora).
- **Tabelas Relacionais**: `servico`, `item_composicao`, `material`
- **Requisitos Atendidos**: `RF-04` (Consultar Serviços) e `RF-05` (Configurar Composição)
- **Sem Mock**: A composição apaga os itens anteriores e reinsere em transação relacional (`ON DELETE CASCADE`), persistindo no banco.

#### 6. Tela de Calculadora de Orçamento e Criação de Proposta (`/budgets/new`)
- **Arquivo**: `dsilk-frontend/src/pages/BudgetCalculator.tsx`
- **Rotas Consumidas**:
  - `POST /orcamentos/calcular` — Executa o cálculo matemático no backend (metragem: `largura * altura * custo_material`; composição: `soma(qtd * custo) + tempo * custo_hora`).
  - `POST /orcamentos` — Registra a proposta no banco (como rascunho ou aprovado).
  - `GET /clientes` e `POST /clientes` — Seleção e cadastro rápido de clientes reais.
  - `GET /servicos` — Lista serviços disponíveis para o cálculo.
- **Tabelas Relacionais**: `orcamento`, `servico`, `cliente`
- **Requisitos Atendidos**: `RF-06` (Cálculo Metragem), `RF-07` (Cálculo Composição), `RF-08` (Criar Orçamento)
- **Sem Mock**: O backend realiza a precisão decimal com `BigDecimal` e grava o registro na tabela `orcamento`.

---

### 2.2 Estados de Tela Implementados

Todas as telas da aplicação cobrem explicitamente os **4 estados fundamentais de interface**:

| Estado de Interface | Como foi implementado | Exemplo Prático |
| :--- | :--- | :--- |
| **1. Carregamento (Loading)** | Spinners animados (`RefreshCw` girando), mensagens de progresso textuais e bloqueio (`disabled`) de botões para evitar duplo clique durante chamadas assíncronas. | Ao abrir a lista de orçamentos, exibe *"Carregando orçamentos..."* e desabilita o botão Atualizar. |
| **2. Vazio (Empty State)** | Cards ilustrados com ícones descritivos (`Package`, `Users`, `Calculator`, `Layers`) quando a consulta à API retorna lista vazia (`length === 0`), acompanhados de mensagem explicativa e botão Call-to-Action. | Se a tabela de materiais estiver vazia, exibe *"Nenhum material cadastrado"* com botão *"+ Cadastrar primeiro material"*. |
| **3. Erro (Error State)** | Banners visuais vermelhos com ícone `AlertCircle`, mensagens de erro amigáveis extraídas do backend via função utilitária `getApiErrorMessage(error)` e botão **"Tentar novamente"** (retry). | Se o backend estiver fora do ar ou retornar 500, a tela exibe o motivo e permite retentar com 1 clique sem recarregar a página. |
| **4. Sucesso (Success Feedback)** | Banners informativos verdes (`CheckCircle`) com auto-dismiss ou confirmação pós-gravação, além de redirecionamento fluido na navegação. | Ao salvar uma composição de serviço ou cadastrar um cliente, exibe banner verde confirmando a persistência no banco. |

---

### 2.3 Interface Adaptada ao Perfil e Ocultação de Ações Não Permitidas

Conforme a Matriz de Requisitos (`docs/perfis-de-acesso.md`), o sistema possui dois perfis: **Administrador** e **Funcionário**. Apenas o perfil Administrador tem permissão para gerenciar a equipe de funcionários.

A interface gráfica em `DashboardLayout.tsx` adapta-se dinamicamente ao perfil do usuário logado:
- **Exibição do Cargo Real:** O cabeçalho lê a claim `perfil` gravada no momento do login e exibe dinamicamente o cargo real (`"Administrador"` ou `"Funcionário"`).
- **Ocultação de Ações Não Permitidas:**
  - O botão de ação e modal **`+ Colaborador`** (para cadastro de novos colaboradores via `POST /funcionarios`) é renderizado **exclusivamente para o perfil Administrador**.
  - Quando um usuário autenticado com perfil `FUNCIONARIO` utiliza o sistema, o botão de gerenciar funcionários é **completamente ocultado da tela**, garantindo que o usuário visualize apenas as ações que possui permissão para executar.

---

## 3. Frontend 3 (Equipes com 9 Pessoas)

### 3.1 As 2 Telas do Fluxo Principal (Sem Mock)

#### 7. Tela de Listagem e Gestão de Orçamentos & Propostas (`/budgets`)
- **Arquivo**: `dsilk-frontend/src/pages/BudgetsList.tsx`
- **Rotas Consumidas**:
  - `GET /orcamentos` — Recupera todos os orçamentos com junção (`LEFT JOIN`) trazendo dados do cliente e do serviço.
- **Tabelas Relacionais**: `orcamento`, `cliente`, `servico`
- **Requisito Atendido**: `RF-09` (Consultar e Editar Orçamentos)
- **Sem Mock**: Exibe ID, nome do cliente, serviço, dimensões, custo total formatado em R$ e badge de status (`Rascunho` vs `Finalizado`).

#### 8. Tela de Planejamento Semanal de Produção (`/planning`)
- **Arquivo**: `dsilk-frontend/src/pages/PlanningWeekly.tsx`
- **Rotas Consumidas**:
  - `GET /planejamento?inicio=AAAA-MM-DD` — Obtém a grade semanal ancorada na segunda-feira.
  - `POST /atividades` — Insere nova atividade na fila de produção para a data especificada.
  - `PUT /atividades/:id` — Atualiza título, descrição ou data de uma atividade existente.
- **Tabela Relacional**: `atividade`
- **Requisitos Atendidos**: `RF-10` (Visualizar Planejamento Semanal) e `RF-11` (Registrar Atividade)
- **Sem Mock**: Persistência direta na tabela `atividade` com sincronização imediata do calendário.

---

### 3.2 Tratamento de Sessão Expirada (401) e Respostas 403 Forbidden com Mensagens do Design

O cliente HTTP Axios (`dsilk-frontend/src/services/api.ts`) e a camada de componentes tratam as respostas de autorização e autenticação através de mensagens amigáveis elaboradas pela equipe de Design:

1. **Tratamento de Sessão Expirada (401 Unauthorized):**
   - Ao receber `401` do backend (token expirado após 12h ou inválido), a sessão é limpa no `localStorage`, grava-se o aviso amigável na sessão e o usuário é redirecionado para `/login?expired=1`.
   - Na tela de login, um banner azul com ícone `Info` exibe a mensagem de design:
     > *"Sua sessão expirou por inatividade ou segurança. Faça login novamente para continuar."*
2. **Tratamento de Acesso Negado por Perfil (403 Forbidden):**
   - Ao receber `403` do backend (tentativa de operação não autorizada para o perfil), o interceptor emite um evento global `dsilk:forbidden`.
   - O `DashboardLayout.tsx` captura o evento e renderiza um alerta vermelho fixado no topo da área de conteúdo com ícone `ShieldAlert`:
     > *"Acesso negado: seu perfil de usuário não tem permissão para realizar esta operação."*

---

### 3.3 Verificação em Dispositivo Real das Telas em Rede Local

A aplicação foi executada e homologada em **dispositivo real (smartphone)** conectado à mesma rede local Wi-Fi, conforme documentado em detalhes em [`docs/testes/evidencias/verificacao-dispositivo-real.md`](docs/testes/evidencias/verificacao-dispositivo-real.md):
- **Exposição de Rede:** O servidor Vite foi configurado com `server.host: '0.0.0.0'` na porta `5173`, permitindo acesso via `http://<IP-LOCAL>:5173`.
- **Telas Verificadas no Smartphone:** Login, Visão Geral, Catálogo de Materiais, Cadastro de Materiais, Catálogo de Serviços, Calculadora de Orçamento e Planejamento Semanal.
- **Usabilidade Tátil e Responsividade:** Formulários ajustados ao teclado virtual, botões com área de toque mínima de 44px, grades de cartões reorganizadas verticalmente e menus de fácil alcance para o operador gráfico em ambiente de chão de fábrica.

---

## 4. Módulo Integrado de Clientes (Tela Bônus)

Para garantir que a navegação do sistema esteja 100% funcional sem telas em construção:

#### 9. Tela de Listagem e Cadastro de Clientes (`/clients`)
- **Arquivo**: `dsilk-frontend/src/pages/ClientsList.tsx`
- **Rotas Consumidas**:
  - `GET /clientes` — Consulta todos os clientes cadastrados em ordem alfabética.
  - `POST /clientes` — Modal de cadastro com validação de nome, e-mail único e telefone.
- **Tabela Relacional**: `cliente`
- **Requisito Atendido**: `RF-03` (Cadastrar e Consultar Clientes)
- **Sem Mock**: Os clientes cadastrados refletem imediatamente na seleção da Calculadora de Orçamentos.

---

## 5. Matriz de Rastreabilidade Ponta a Ponta

| # | Tela (Frontend) | Rota Backend | Método | Tabela (PostgreSQL) | Requisito | Status |
|:---:|:---|:---|:---:|:---|:---:|:---:|
| 1 | `Login` | `/funcionarios`<br>`/login` | `GET`<br>`POST` | `funcionario` | RF-13 | ✅ Sem Mock |
| 2 | `MaterialsList` | `/materiais` | `GET` | `material` | RF-02 | ✅ Sem Mock |
| 3 | `MaterialsRegistration` | `/materiais`<br>`/materiais/:id` | `POST`<br>`GET`<br>`PUT` | `material` | RF-01, RF-02 | ✅ Sem Mock |
| 4 | `ServicesRegistration` | `/servicos`<br>`/materiais` | `POST`<br>`GET` | `servico`, `material` | RF-04 | ✅ Sem Mock |
| 5 | `ServicesList` | `/servicos`<br>`/servicos/:id/composicao` | `GET`<br>`PUT` | `servico`, `item_composicao` | RF-04, RF-05 | ✅ Sem Mock |
| 6 | `BudgetCalculator` | `/orcamentos/calcular`<br>`/orcamentos` | `POST`<br>`POST` | `orcamento`, `cliente`, `servico` | RF-06, RF-07, RF-08 | ✅ Sem Mock |
| 7 | `BudgetsList` | `/orcamentos` | `GET` | `orcamento`, `cliente`, `servico` | RF-09 | ✅ Sem Mock |
| 8 | `PlanningWeekly` | `/planejamento`<br>`/atividades`<br>`/atividades/:id` | `GET`<br>`POST`<br>`PUT` | `atividade` | RF-10, RF-11 | ✅ Sem Mock |
| 9 | `ClientsList` | `/clientes` | `GET`<br>`POST` | `cliente` | RF-03 | ✅ Sem Mock |

---

## 6. Como Executar e Validar

Suba todos os serviços conteinerizados via Docker Compose na raiz do repositório:

```bash
docker compose up --build
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5433 (banco `grafica`, usuário `grafica_user`)

### Roteiro de Demonstração Rápida:
1. Acesse http://localhost:5173 e faça login selecionando um funcionário existente.
2. Navegue até **Materiais** e cadastre um insumo (ex: *Lona Frontlight 440g* por R$ 25,00/m²).
3. Navegue até **Clientes** e cadastre um cliente (ex: *Gráfica Central*).
4. Navegue até **Serviços** e crie um serviço por metragem vinculado ao material cadastrado.
5. Acesse **Orçamentos**, selecione o cliente e o serviço, insira largura (2m) e altura (3m) e clique em **Calcular Custo**.
6. Salve a proposta e visualize-a na lista de **Orçamentos**.
7. Acesse **Planejamento** e agende a atividade de impressão na agenda semanal.
