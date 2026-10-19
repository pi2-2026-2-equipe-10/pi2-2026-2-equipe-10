# Casos de Teste

## Projeto
Equipe 10 — PI2 2026.2

## Responsável
Aurea Taissa Sa Lima — QA

---

# 📋 Suíte de Testes

| Código | Suíte | Descrição |
|---|---|---|
| ST-01 | Gestão de materiais | Cadastro e validação dos materiais utilizados na execução dos serviços |
| ST-02 | Gestão de serviços | Cadastro de serviços personalizados |
| ST-03 | Composição de serviços | Configuração dos materiais e quantidades utilizados nos serviços |
| ST-04 | Gestão de orçamentos | Cálculo e registro de orçamentos |
| ST-05 | Autenticação | Validação das credenciais e controle de acesso dos funcionários |
| ST-06 | Regras de negócio | Validação das regras aplicadas aos serviços, composições, orçamentos e autenticação |

---

# CT-001 — Cadastrar novo material

| Campo | Informação |
|---|---|
| **Identificador** | CT-001 |
| **Versão** | 1 |
| **Suíte de teste** | ST-01 — Gestão de materiais |
| **Autor** | Aurea Taissa Sa Lima |
| **Requisito coberto** | RF001 — Materiais Cadastrais |
| **Importância** | Alta |

### Resumo

Verifica se o sistema permite que um funcionário autenticado cadastre
corretamente um novo material informando nome, unidade de medida e custo.

### Pré-condições

- Funcionário cadastrado e autenticado no sistema.
- Usuário possui acesso à opção **Materiais**.
- O material utilizado no teste ainda não está cadastrado.

### Passos

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Acessar o sistema após realizar a autenticação. | O sistema exibe o menu lateral esquerdo. |
| 2 | Selecionar **Materiais**. | O sistema exibe a lista de materiais e a opção **Novo Material**. |
| 3 | Selecionar **Novo Material**. | O sistema apresenta a tela de cadastro. |
| 4 | Informar o nome **Tecido Branco**. | O nome é apresentado corretamente. |
| 5 | Informar a unidade **Metro**. | A unidade é apresentada corretamente. |
| 6 | Informar o custo **25,00**. | O custo é apresentado corretamente. |
| 7 | Confirmar o cadastro. | O sistema registra o material. |
| 8 | Consultar a listagem. | O material aparece cadastrado com os dados informados. |

### Execução

| Testador | Data | Status | Defeito | Observações |
|---|---|---|---|---|
| Aurea Taissa | [DD/MM/AAAA] | Não executado | — | — |

---

# CT-002 — Impedir cadastro sem dados obrigatórios

| Campo | Informação |
|---|---|
| **Identificador** | CT-002 |
| **Versão** | 1 |
| **Suíte de teste** | ST-01 — Gestão de materiais |
| **Autor** | Aurea Taissa Sa Lima |
| **Requisito coberto** | RF001 — Materiais Cadastrais |
| **Importância** | Alta |

### Resumo

Verifica se o sistema impede o cadastro de um material quando um ou mais
dados obrigatórios não são informados.

### Pré-condições

- Funcionário cadastrado e autenticado.
- Usuário possui acesso à opção **Materiais**.
- A tela de cadastro está disponível.

### Passos

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Acessar **Materiais**. | A lista de materiais e a opção **Novo Material** são exibidas. |
| 2 | Selecionar **Novo Material**. | A tela de cadastro é apresentada. |
| 3 | Informar **Tecido Azul** no campo nome. | O nome é preenchido corretamente. |
| 4 | Informar **Metro** como unidade. | A unidade é preenchida corretamente. |
| 5 | Deixar o campo custo vazio. | O campo permanece sem preenchimento. |
| 6 | Confirmar o cadastro. | O sistema identifica o campo obrigatório não preenchido e solicita seu preenchimento. |
| 7 | Informar o custo **30,00**. | O custo é preenchido corretamente. |
| 8 | Confirmar novamente. | O sistema registra o material. |
| 9 | Consultar a listagem. | O material aparece cadastrado com os dados informados. |

### Execução

| Testador | Data | Status | Defeito | Observações |
|---|---|---|---|---|
| Aurea Taissa | [DD/MM/AAAA] | Não executado | — | — |

---

# CT-003 — Cadastrar serviço personalizado

| Campo | Informação |
|---|---|
| **Identificador** | CT-003 |
| **Versão** | 1 |
| **Suíte de teste** | ST-02 — Gestão de serviços |
| **Autor** | Aurea Taissa Sa Lima |
| **Requisito coberto** | RF-04 — Cadastrar Serviço Personalizado |
| **Importância** | Alta |

### Resumo

Verifica se o sistema permite que um funcionário autenticado cadastre corretamente um serviço personalizado, informando seu nome e selecionando o tipo de cálculo por composição.

### Pré-condições

- Funcionário cadastrado e autenticado no sistema.
- Usuário possui acesso à opção **Serviços**.
- O serviço utilizado no teste ainda não está cadastrado.

### Passos

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Acessar o sistema após realizar a autenticação. | O sistema exibe o menu lateral esquerdo. |
| 2 | Selecionar **Serviços**. | O sistema apresenta a lista de serviços e a opção **Novo Serviço**. |
| 3 | Selecionar **Novo Serviço**. | O sistema apresenta o formulário de cadastro. |
| 4 | Informar o nome **Placa Personalizada PVC**. | O nome é apresentado corretamente. |
| 5 | Selecionar o tipo de cálculo **Por Composição**. | O tipo de cálculo é selecionado corretamente. |
| 6 | Selecionar **Salvar**. | O sistema registra o novo serviço. |
| 7 | Consultar a listagem de serviços. | O serviço aparece cadastrado com o nome e o tipo de cálculo informados. |

### Execução

| Testador | Data | Status | Defeito | Observações |
|---|---|---|---|---|
| Aurea Taissa | [DD/MM/AAAA] | Não executado | — | — |

---

# CT-004 — Configurar composição de serviço

| Campo | Informação |
|---|---|
| **Identificador** | CT-004 |
| **Versão** | 1 |
| **Suíte de teste** | ST-03 — Composição de serviços |
| **Autor** | Aurea Taissa Sa Lima |
| **Requisito coberto** | RF-05 — Configurar Composição do Serviço |
| **Importância** | Alta |

### Resumo

Verifica se o sistema permite configurar a composição de um serviço previamente cadastrado, associando os materiais utilizados e suas respectivas quantidades.

### Pré-condições

- Funcionário cadastrado e autenticado no sistema.
- Serviço **Placa Personalizada PVC** cadastrado com cálculo por composição.
- Material **PVC**, com custo de R$ 40,00 por m², previamente cadastrado.
- Material **Adesivo**, com custo de R$ 20,00 por m², previamente cadastrado.

### Passos

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Acessar **Serviços** no menu lateral. | O sistema apresenta os serviços cadastrados. |
| 2 | Selecionar **Placa Personalizada PVC**. | O sistema apresenta as informações do serviço. |
| 3 | Acessar a configuração de composição. | O sistema disponibiliza a seleção de materiais e o preenchimento das quantidades. |
| 4 | Selecionar o material **PVC**. | O material é associado à composição. |
| 5 | Informar a quantidade **2 m²** de PVC. | A quantidade é preenchida corretamente. |
| 6 | Selecionar o material **Adesivo**. | O material é associado à composição. |
| 7 | Informar a quantidade **2 m²** de Adesivo. | A quantidade é preenchida corretamente. |
| 8 | Confirmar a configuração. | O sistema registra a composição do serviço. |
| 9 | Consultar novamente o serviço. | A composição apresenta os dois materiais e suas respectivas quantidades. |

### Execução

| Testador | Data | Status | Defeito | Observações |
|---|---|---|---|---|
| Aurea Taissa | [DD/MM/AAAA] | Não executado | — | — |

---

# CT-005 — Calcular custo de serviço por metragem

| Campo | Informação |
|---|---|
| **Identificador** | CT-005 |
| **Versão** | 1 |
| **Suíte de teste** | ST-04 — Gestão de orçamentos |
| **Autor** | Aurea Taissa Sa Lima |
| **Requisito coberto** | RF-06 — Calcular Custo por Metragem |
| **Importância** | Alta |

### Resumo

Verifica se o sistema calcula corretamente o custo de um serviço por metragem, considerando as dimensões informadas e o custo correspondente à unidade de medida do material.

### Pré-condições

- Funcionário cadastrado e autenticado no sistema.
- Serviço **Impressão de Banner** cadastrado para cálculo por extensão.
- Material utilizado no serviço com custo de R$ 40,00 por m².
- Serviço e material devidamente associados para permitir o cálculo.

### Passos

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Acessar **Orçamentos**. | O sistema apresenta a funcionalidade de criação de orçamento. |
| 2 | Iniciar um novo orçamento. | O sistema disponibiliza a seleção do serviço. |
| 3 | Selecionar **Impressão de Banner**. | O sistema identifica o cálculo por extensão. |
| 4 | Informar a largura **2 m**. | A largura é preenchida corretamente. |
| 5 | Informar a altura **1,5 m**. | A altura é preenchida corretamente. |
| 6 | Solicitar o cálculo do custo. | O sistema calcula a área de 3 m². |
| 7 | Verificar o custo apresentado. | O sistema apresenta o custo de **R$ 120,00**, considerando o valor de R$ 40,00 por m². |

### Execução

| Testador | Data | Status | Defeito | Observações |
|---|---|---|---|---|
| Aurea Taissa | [DD/MM/AAAA] | Não executado | — | — |

---

# CT-006 — Calcular custo de serviço por composição

| Campo | Informação |
|---|---|
| **Identificador** | CT-006 |
| **Versão** | 1 |
| **Suíte de teste** | ST-04 — Gestão de orçamentos |
| **Autor** | Aurea Taissa Sa Lima |
| **Requisito coberto** | RF-07 — Calcular Custo por Composição |
| **Importância** | Alta |

### Resumo

Verifica se o sistema realiza corretamente o cálculo do custo de um serviço por composição, considerando os materiais cadastrados e suas respectivas quantidades.

### Pré-condições

- Funcionário cadastrado e autenticado no sistema.
- Serviço **Placa Personalizada PVC** cadastrado com cálculo por composição.
- Composição do serviço previamente configurada.
- Material **PVC** cadastrado com custo de R$ 40,00 por m² e quantidade de 2 m².
- Material **Adesivo** cadastrado com custo de R$ 20,00 por m² e quantidade de 2 m².
- Tempo de operação não aplicável ao serviço utilizado no teste.

### Passos

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Acessar **Orçamentos**. | O sistema apresenta a funcionalidade de criação de orçamento. |
| 2 | Iniciar um novo orçamento. | O sistema disponibiliza os serviços cadastrados. |
| 3 | Selecionar **Placa Personalizada PVC**. | O sistema identifica o cálculo por composição. |
| 4 | Consultar os elementos da composição. | O sistema apresenta PVC e Adesivo, ambos com quantidade de 2 m². |
| 5 | Solicitar o cálculo do custo. | O sistema considera os custos e as quantidades dos materiais. |
| 6 | Verificar o custo apresentado. | O sistema apresenta o custo total de **R$ 120,00**, correspondente à soma de R$ 80,00 de PVC e R$ 40,00 de Adesivo. |

### Execução

| Testador | Data | Status | Defeito | Observações |
|---|---|---|---|---|
| Aurea Taissa | [DD/MM/AAAA] | Não executado | — | — |

---

# CT-007 — Criar e registrar orçamento

| Campo | Informação |
|---|---|
| **Identificador** | CT-007 |
| **Versão** | 1 |
| **Suíte de teste** | ST-04 — Gestão de orçamentos |
| **Autor** | Aurea Taissa Sa Lima |
| **Requisito coberto** | RF-08 — Criar e Registrar Orçamento |
| **Importância** | Alta |

### Resumo

Verifica se o sistema permite criar e registrar corretamente um orçamento, associando um cliente cadastrado, selecionando o serviço e armazenando o resultado do cálculo.

### Pré-condições

- Funcionário cadastrado e autenticado no sistema.
- Cliente **Maria Silva** previamente cadastrado.
- Serviço **Impressão de Banner** cadastrado para cálculo por extensão.
- Material com custo de R$ 40,00 por m² associado ao serviço.

### Passos

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Acessar **Orçamentos** no menu lateral. | O sistema apresenta a funcionalidade de orçamentos. |
| 2 | Iniciar a criação de um novo orçamento. | O sistema apresenta os campos necessários. |
| 3 | Selecionar a cliente **Maria Silva**. | O sistema associa a cliente ao orçamento. |
| 4 | Selecionar **Impressão de Banner**. | O sistema identifica o serviço selecionado. |
| 5 | Informar largura **2 m** e altura **1,5 m**. | O sistema registra as dimensões informadas. |
| 6 | Solicitar o cálculo do orçamento. | O sistema apresenta o custo de R$ 120,00. |
| 7 | Selecionar **Registrar Orçamento**. | O sistema registra o orçamento. |
| 8 | Consultar a listagem de orçamentos. | O orçamento registrado aparece na listagem. |
| 9 | Selecionar o orçamento registrado. | O sistema apresenta a cliente, o serviço, as dimensões e o custo calculado. |

### Execução

| Testador | Data | Status | Defeito | Observações |
|---|---|---|---|---|
| Aurea Taissa | [DD/MM/AAAA] | Não executado | — | — |

---

# CT-008 — Impedir cálculo de serviço sem composição cadastrada

| Campo | Informação |
|---|---|
| **Identificador** | CT-008 |
| **Versão** | 1 |
| **Suíte de teste** | ST-06 — Regras de negócio |
| **Autor** | Aurea Taissa Sa Lima |
| **Regra coberta** | RN-01 — Composição obrigatória para cálculo por composição |
| **Requisitos relacionados** | RF-05, RF-07 |
| **Importância** | Alta |

### Resumo

Verifica se o sistema impede o cálculo do custo de um serviço configurado por composição quando não existe uma composição previamente cadastrada.

### Pré-condições

- Funcionário cadastrado e autenticado no sistema.
- Serviço **Placa Acrílica Personalizada** cadastrado com cálculo por composição.
- O serviço não possui composição cadastrada.
- Usuário possui acesso à funcionalidade **Orçamentos**.

### Passos

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Acessar **Orçamentos**. | O sistema apresenta a funcionalidade de criação de orçamento. |
| 2 | Iniciar um novo orçamento. | O sistema disponibiliza a seleção dos serviços cadastrados. |
| 3 | Selecionar **Placa Acrílica Personalizada**. | O sistema identifica o serviço configurado por composição. |
| 4 | Solicitar o cálculo do custo. | O sistema verifica se existe uma composição cadastrada. |
| 5 | Verificar o comportamento do sistema. | O sistema informa que não é possível calcular o custo sem a composição definida. |
| 6 | Verificar o resultado do cálculo. | O sistema não apresenta um custo calculado para o serviço sem composição. |

### Execução

| Testador | Data | Status | Defeito | Observações |
|---|---|---|---|---|
| Aurea Taissa | [DD/MM/AAAA] | Não executado | — | — |

---

# CT-009 — Impedir registro de composição sem quantidade de material

| Campo | Informação |
|---|---|
| **Identificador** | CT-009 |
| **Versão** | 1 |
| **Suíte de teste** | ST-06 — Regras de negócio |
| **Autor** | Aurea Taissa Sa Lima |
| **Regra coberta** | RN-02 — Quantidade obrigatória dos materiais da composição |
| **Requisito relacionado** | RF-05 |
| **Importância** | Alta |

### Resumo

Verifica se o sistema impede o registro de uma composição quando um material associado não possui sua quantidade informada, solicitando o preenchimento antes de concluir a configuração.

### Pré-condições

- Funcionário cadastrado e autenticado no sistema.
- Serviço **Placa Personalizada PVC** cadastrado com cálculo por composição.
- Materiais **PVC** e **Adesivo** previamente cadastrados.
- Usuário possui acesso à configuração da composição.

### Passos

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Acessar **Serviços**. | O sistema apresenta os serviços cadastrados. |
| 2 | Selecionar **Placa Personalizada PVC**. | O sistema apresenta as informações do serviço. |
| 3 | Acessar a configuração da composição. | O sistema disponibiliza a associação de materiais e suas quantidades. |
| 4 | Selecionar o material **PVC**. | O material é associado à composição. |
| 5 | Informar a quantidade **2 m²** de PVC. | A quantidade é preenchida corretamente. |
| 6 | Selecionar o material **Adesivo**. | O material é associado à composição. |
| 7 | Deixar a quantidade de Adesivo vazia. | O campo permanece sem preenchimento. |
| 8 | Confirmar a configuração. | O sistema identifica a ausência da quantidade e solicita seu preenchimento. |
| 9 | Verificar o registro da composição. | O sistema não conclui o registro da composição incompleta. |
| 10 | Informar a quantidade **2 m²** de Adesivo. | O campo é preenchido corretamente. |
| 11 | Confirmar novamente a configuração. | O sistema registra a composição com os dois materiais e suas respectivas quantidades. |

### Execução

| Testador | Data | Status | Defeito | Observações |
|---|---|---|---|---|
| Aurea Taissa | [DD/MM/AAAA] | Não executado | — | — |

---

# CT-010 — Validar cálculo do custo por metragem

| Campo | Informação |
|---|---|
| **Identificador** | CT-010 |
| **Versão** | 1 |
| **Suíte de teste** | ST-06 — Regras de negócio |
| **Autor** | Aurea Taissa Sa Lima |
| **Regra coberta** | RN-03 — Cálculo por distância |
| **Requisitos relacionados** | RF-04, RF-06 |
| **Importância** | Alta |

### Resumo

Verifica se o sistema calcula corretamente o custo de um serviço por metragem, utilizando as dimensões informadas e o custo correspondente à unidade de medida do material, impedindo o cálculo enquanto as dimensões necessárias não forem preenchidas.

### Pré-condições

- Funcionário cadastrado e autenticado no sistema.
- Serviço **Impressão de Banner** cadastrado com cálculo por extensão.
- Material associado ao serviço com custo de R$ 40,00 por m².
- Usuário possui acesso à funcionalidade **Orçamentos**.

### Passos

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Acessar **Orçamentos**. | O sistema apresenta a funcionalidade de criação de orçamento. |
| 2 | Iniciar um novo orçamento. | O sistema disponibiliza os serviços cadastrados. |
| 3 | Selecionar **Impressão de Banner**. | O sistema identifica o cálculo por extensão. |
| 4 | Informar a largura **2 m**. | A largura é preenchida corretamente. |
| 5 | Deixar o campo altura vazio. | O campo permanece sem preenchimento. |
| 6 | Solicitar o cálculo do custo. | O sistema solicita o preenchimento da dimensão ausente e não conclui o cálculo. |
| 7 | Informar a altura **1,5 m**. | A altura é preenchida corretamente. |
| 8 | Solicitar novamente o cálculo. | O sistema considera as dimensões informadas e calcula a área de 3 m². |
| 9 | Verificar o custo apresentado. | O sistema apresenta o custo total de **R$ 120,00**, considerando o valor de R$ 40,00 por m². |

### Execução

| Testador | Data | Status | Defeito | Observações |
|---|---|---|---|---|
| Aurea Taissa | [DD/MM/AAAA] | Não executado | — | — |

---

# CT-011 — Registrar orçamento sem cliente associado

| Campo | Informação |
|---|---|
| **Identificador** | CT-011 |
| **Versão** | 1 |
| **Suíte de teste** | ST-06 — Regras de negócio |
| **Autor** | Aurea Taissa Sa Lima |
| **Regra coberta** | RN-04 — Associação opcional de cliente ao orçamento |
| **Requisitos relacionados** | RF-03, RF-08 |
| **Importância** | Alta |

### Resumo

Verifica se o sistema permite criar e registrar um orçamento sem associar um cliente previamente cadastrado, garantindo que a ausência dessa informação não impeça o registro.

### Pré-condições

- Funcionário cadastrado e autenticado no sistema.
- Serviço **Impressão de Banner** previamente cadastrado.
- Serviço configurado para cálculo por extensão.
- Material associado com custo de R$ 40,00 por m².
- Usuário possui acesso à funcionalidade **Orçamentos**.

### Passos

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Acessar **Orçamentos**. | O sistema apresenta a funcionalidade de criação de orçamento. |
| 2 | Iniciar um novo orçamento. | O sistema apresenta os campos necessários. |
| 3 | Deixar o campo de associação de cliente vazio. | O sistema permite continuar sem selecionar um cliente. |
| 4 | Selecionar **Impressão de Banner**. | O sistema identifica o serviço selecionado. |
| 5 | Informar largura **2 m** e altura **1,5 m**. | O sistema registra as dimensões informadas. |
| 6 | Solicitar o cálculo do orçamento. | O sistema apresenta o custo de R$ 120,00. |
| 7 | Selecionar **Registrar Orçamento**. | O sistema registra o orçamento sem exigir um cliente associado. |
| 8 | Consultar a listagem de orçamentos. | O orçamento registrado aparece na listagem. |
| 9 | Selecionar o orçamento registrado. | O sistema apresenta os dados do orçamento e mantém a ausência de associação com cliente. |

### Execução

| Testador | Data | Status | Defeito | Observações |
|---|---|---|---|---|
| Aurea Taissa | [DD/MM/AAAA] | Não executado | — | — |

---

# CT-012 — Impedir autenticação com senha incorreta

| Campo | Informação |
|---|---|
| **Identificador** | CT-012 |
| **Versão** | 1 |
| **Suíte de teste** | ST-05 — Autenticação |
| **Autor** | Aurea Taissa Sa Lima |
| **Regra coberta** | RN-05 — Autenticação de funcionário |
| **Requisitos relacionados** | RF-12, RF-13 |
| **Importância** | Crítica |

### Resumo

Verifica se o sistema impede o acesso de um funcionário quando a senha informada não corresponde às credenciais cadastradas, permitindo a autenticação somente após a utilização de credenciais válidas.

### Pré-condições

- Sistema disponível para acesso.
- Funcionário **Funcionário Teste QA** previamente cadastrado e ativo.
- Senha válida do funcionário conhecida pelo testador.
- Usuário não autenticado no sistema.

### Passos

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Acessar a tela inicial do sistema. | O sistema apresenta a identificação dos funcionários disponíveis para autenticação. |
| 2 | Selecionar **Funcionário Teste QA**. | O sistema solicita a senha de acesso. |
| 3 | Informar uma senha incorreta, diferente da senha cadastrada. | O campo recebe a senha informada. |
| 4 | Selecionar **Entrar**. | O sistema não autentica o funcionário. |
| 5 | Verificar o acesso às funcionalidades. | O sistema não permite acesso às funcionalidades protegidas. |
| 6 | Informar a senha correta do funcionário. | O campo recebe a senha válida. |
| 7 | Selecionar novamente **Entrar**. | O sistema autentica o funcionário. |
| 8 | Verificar a tela apresentada. | O sistema permite o acesso às funcionalidades disponíveis ao funcionário autenticado. |

### Execução

| Testador | Data | Status | Defeito | Observações |
|---|---|---|---|---|
| Aurea Taissa | [DD/MM/AAAA] | Não executado | — | — |

---

# Evidências

As evidências de execução devem ser armazenadas na pasta:

`docs/testes/evidencias/`

### CT-001

- `CT-001-E1.png` — Cadastro do material realizado com sucesso.

### CT-002

- `CT-002-E1.png` — Sistema solicitando o preenchimento do campo obrigatório.

### CT-003

- `CT-003-E1.png` — Serviço personalizado cadastrado com sucesso.

### CT-004

- `CT-004-E1.png` — Composição registrada com materiais e quantidades.

### CT-005

- `CT-005-E1.png` — Cálculo por metragem apresentando R$ 120,00.

### CT-006

- `CT-006-E1.png` — Cálculo por composição apresentando R$ 120,00.

### CT-007

- `CT-007-E1.png` — Orçamento registrado com cliente associado.

### CT-008

- `CT-008-E1.png` — Sistema impedindo cálculo sem composição cadastrada.

### CT-009

- `CT-009-E1.png` — Sistema solicitando preenchimento da quantidade obrigatória.

### CT-010

- `CT-010-E1.png` — Sistema solicitando preenchimento da dimensão obrigatória.
- `CT-010-E2.png` — Cálculo realizado corretamente após preenchimento.

### CT-011

- `CT-011-E1.png` — Orçamento registrado sem cliente associado.

### CT-012

- `CT-012-E1.png` — Sistema impedindo autenticação com senha incorreta.
- `CT-012-E2.png` — Autenticação realizada com credenciais válidas.

---

# 📊 Legenda

| Status | Significado |
|---|---|
| 🟢 Aprovado | Todos os passos apresentaram o resultado esperado. |
| 🔴 Reprovado | Pelo menos um passo apresentou resultado diferente do esperado. |
| 🟡 Bloqueado | Não foi possível iniciar ou executar o teste devido a uma dependência. |
| ⚪ Não executado | Teste ainda não foi executado. |
