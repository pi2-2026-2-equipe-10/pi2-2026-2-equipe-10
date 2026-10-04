# Regras de Negócio (RN) 

## RN-01 — Composição obrigatória para cálculo por composição

| Item | Descrição |
| :--- | :--- |
| **Nome** | Composição obrigatória para cálculo por composição |
| **Identificador** | RN-01 |
| **Descrição** | Serviços configurados para cálculo por composição devem possuir uma composição cadastrada antes que seu custo possa ser calculado. |
| **Evento/Gatilho** | O usuário solicita o cálculo do custo de um serviço configurado por composição. |
| **Exemplo** | Ao solicitar o custo de uma placa personalizada configurada por composição, o sistema deve verificar se existem materiais e demais informações necessárias configuradas. Caso a composição não esteja configurada, o cálculo não deve ser realizado. |
| **Requisitos relacionados** | RF-05, RF-07 |
| **Documentação** | [Documento de Requisitos Funcionais](docs/requisitos-funcionais.md) |

## RN-02 — Quantidade obrigatória dos materiais da composição

| Item | Descrição |
| :--- | :--- |
| **Nome** | Quantidade obrigatória dos materiais |
| **Identificador** | RN-02 |
| **Descrição** | Todo material associado à composição de um serviço deve possuir uma quantidade informada para que a composição possa ser registrada. |
| **Evento/Gatilho** | O usuário configura ou registra a composição de um serviço. |
| **Exemplo** | Ao configurar uma placa personalizada utilizando PVC e adesivo, o usuário deve informar a quantidade correspondente de cada material utilizado na composição. |
| **Requisitos relacionados** | RF-05 |
| **Documentação** | [Documento de Requisitos Funcionais](docs/requisitos-funcionais.md) |

## RN-03 — Cálculo por metragem

| Item | Descrição |
| :--- | :--- |
| **Nome** | Cálculo do custo por metragem |
| **Identificador** | RN-03 |
| **Descrição** | Para serviços configurados para cálculo por metragem, o custo deve ser calculado a partir das dimensões informadas e do custo correspondente à unidade de medida do material utilizado. |
| **Evento/Gatilho** | O usuário informa as dimensões de um serviço configurado para cálculo por metragem e solicita o cálculo do custo. |
| **Exemplo** | Para um serviço que utiliza um material com custo de R$ 40,00 por m² e possui dimensões de 2 m × 1,5 m, o sistema utiliza a metragem de 3 m² para realizar o cálculo do custo. |
| **Requisitos relacionados** | RF-04, RF-06 |
| **Documentação** | [Documento de Requisitos Funcionais](docs/requisitos-funcionais.md) |

## RN-04 — Associação opcional de cliente ao orçamento

| Item | Descrição |
| :--- | :--- |
| **Nome** | Associação opcional de cliente |
| **Identificador** | RN-04 |
| **Descrição** | O registro de um orçamento não deve depender da associação de um cliente previamente cadastrado. |
| **Evento/Gatilho** | O usuário cria e registra um orçamento. |
| **Exemplo** | O usuário pode registrar um orçamento para um serviço sem associá-lo a um cliente cadastrado, quando essa informação não estiver disponível ou não for necessária. |
| **Requisitos relacionados** | RF-03, RF-08 |
| **Documentação** | [Documento de Requisitos Funcionais](docs/requisitos-funcionais.md) |

## RN-05 — Autenticação de funcionário

| Item | Descrição |
| :--- | :--- |
| **Nome** | Autenticação de funcionário |
| **Identificador** | RN-05 |
| **Descrição** | O acesso ao sistema deve ser concedido somente após o funcionário informar corretamente suas credenciais de acesso. |
| **Evento/Gatilho** | O funcionário seleciona seu nome e informa sua senha na tela inicial de acesso. |
| **Exemplo** | Um funcionário seleciona seu nome na tela inicial e informa a senha cadastrada. Caso os dados estejam corretos, o sistema permite o acesso; caso contrário, o acesso não é concedido. |
| **Requisitos relacionados** | RF-12, RF-13 |
| **Documentação** | [Documento de Requisitos Funcionais](docs/requisitos-funcionais.md) |
