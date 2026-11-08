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
| **Documentação** | [Documento de Requisitos Funcionais](https://github.com/pi2-2026-2-equipe-10/pi2-2026-2-equipe-10/blob/66b36cbe831fdb3f9a10ba4d71083a4a4722c2d1/docs/requisitos-funcionais.md) |

## RN-02 — Quantidade obrigatória dos materiais da composição

| Item | Descrição |
| :--- | :--- |
| **Nome** | Quantidade obrigatória dos materiais |
| **Identificador** | RN-02 |
| **Descrição** | Todo material associado à composição de um serviço deve possuir uma quantidade informada para que a composição possa ser registrada. |
| **Evento/Gatilho** | O usuário configura ou registra a composição de um serviço. |
| **Exemplo** | Ao configurar uma placa personalizada utilizando PVC e adesivo, o usuário deve informar a quantidade correspondente de cada material utilizado na composição. |
| **Requisitos relacionados** | RF-05 |
| **Documentação** | [Documento de Requisitos Funcionais](https://github.com/pi2-2026-2-equipe-10/pi2-2026-2-equipe-10/blob/66b36cbe831fdb3f9a10ba4d71083a4a4722c2d1/docs/requisitos-funcionais.md) |

## RN-03 — Cálculo por metragem

| Item | Descrição |
| :--- | :--- |
| **Nome** | Cálculo do custo por metragem |
| **Identificador** | RN-03 |
| **Descrição** | Para serviços configurados para cálculo por metragem, o custo deve ser calculado a partir das dimensões informadas e do custo correspondente à unidade de medida do material utilizado. |
| **Evento/Gatilho** | O usuário informa as dimensões de um serviço configurado para cálculo por metragem e solicita o cálculo do custo. |
| **Exemplo** | Para um serviço que utiliza um material com custo de R$ 40,00 por m² e possui dimensões de 2 m × 1,5 m, o sistema utiliza a metragem de 3 m² para realizar o cálculo do custo. |
| **Requisitos relacionados** | RF-04, RF-06 |
| **Documentação** | [Documento de Requisitos Funcionais](https://github.com/pi2-2026-2-equipe-10/pi2-2026-2-equipe-10/blob/66b36cbe831fdb3f9a10ba4d71083a4a4722c2d1/docs/requisitos-funcionais.md) |

## RN-04 — Associação opcional de cliente ao orçamento

| Item | Descrição |
| :--- | :--- |
| **Nome** | Associação opcional de cliente |
| **Identificador** | RN-04 |
| **Descrição** | O registro de um orçamento não deve depender da associação de um cliente previamente cadastrado. |
| **Evento/Gatilho** | O usuário cria e registra um orçamento. |
| **Exemplo** | O usuário pode registrar um orçamento para um serviço sem associá-lo a um cliente cadastrado, quando essa informação não estiver disponível ou não for necessária. |
| **Requisitos relacionados** | RF-03, RF-08 |
| **Documentação** | [Documento de Requisitos Funcionais](https://github.com/pi2-2026-2-equipe-10/pi2-2026-2-equipe-10/blob/66b36cbe831fdb3f9a10ba4d71083a4a4722c2d1/docs/requisitos-funcionais.md) |

## RN-05 — Autenticação de funcionário

| Item | Descrição |
| :--- | :--- |
| **Nome** | Autenticação de funcionário |
| **Identificador** | RN-05 |
| **Descrição** | O acesso ao sistema deve ser concedido somente após o funcionário informar corretamente seu e-mail e senha cadastrados. Caso as credenciais estejam incorretas, o sistema deve impedir o acesso e apresentar uma mensagem informando que os dados estão incorretos. |
| **Evento/Gatilho** | O funcionário informa seu e-mail e senha na tela de login e seleciona a opção "Entrar". |
| **Exemplo** | Um funcionário informa seu e-mail e senha cadastrados. Caso os dados estejam corretos, o sistema permite o acesso. Caso contrário, apresenta a mensagem "E-mail ou senha incorretos. Confira seus dados e tente novamente." |
| **Requisitos relacionados** | RF-12, RF-13 |
| **Documentação** | [Documento de Requisitos Funcionais](https://github.com/pi2-2026-2-equipe-10/pi2-2026-2-equipe-10/blob/66b36cbe831fdb3f9a10ba4d71083a4a4722c2d1/docs/requisitos-funcionais.md) |


## RN-06 — Solicitação de recuperação de senha

| Item | Descrição |
| :--- | :--- |
| **Nome** | Solicitação de recuperação de senha |
| **Identificador** | RN-06 |
| **Descrição** | O funcionário deve informar o e-mail cadastrado para solicitar a recuperação de senha. O sistema deve encaminhar um código de verificação de cinco dígitos para o endereço de e-mail informado. |
| **Evento/Gatilho** | O funcionário seleciona a opção "Esqueceu sua senha?", informa seu e-mail e solicita o link de recuperação. |
| **Exemplo** | Um funcionário que não consegue acessar sua conta informa o e-mail cadastrado e solicita a recuperação. O sistema envia um código de verificação de cinco dígitos para o endereço informado. |
| **Requisitos relacionados** | RF-13 (associação a validar) |
| **Documentação** | [Documento de Requisitos Funcionais](https://github.com/pi2-2026-2-equipe-10/pi2-2026-2-equipe-10/blob/66b36cbe831fdb3f9a10ba4d71083a4a4722c2d1/docs/requisitos-funcionais.md) |


## RN-07 — Validação do código de recuperação

| Item | Descrição |
| :--- | :--- |
| **Nome** | Validação do código de recuperação |
| **Identificador** | RN-07 |
| **Descrição** | A redefinição da senha deve ser permitida somente após a validação do código de verificação enviado ao e-mail do funcionário. |
| **Evento/Gatilho** | O funcionário informa o código de cinco dígitos recebido por e-mail e seleciona a opção "Validar código". |
| **Exemplo** | Após receber o código de verificação, o funcionário informa os cinco dígitos. Caso o código seja válido, o sistema permite prosseguir para a criação de uma nova senha. |
| **Requisitos relacionados** | RF-13 (associação a validar) |
| **Documentação** | [Documento de Requisitos Funcionais](https://github.com/pi2-2026-2-equipe-10/pi2-2026-2-equipe-10/blob/66b36cbe831fdb3f9a10ba4d71083a4a4722c2d1/docs/requisitos-funcionais.md) |


## RN-08 — Redefinição de senha

| Item | Descrição |
| :--- | :--- |
| **Nome** | Redefinição de senha |
| **Identificador** | RN-08 |
| **Descrição** | A nova senha cadastrada pelo funcionário deve possuir no mínimo oito caracteres e ser diferente da senha anteriormente utilizada. Após a redefinição bem-sucedida, o sistema deve apresentar uma mensagem de confirmação e disponibilizar a opção de retornar à tela de login. |
| **Evento/Gatilho** | Após validar o código de recuperação, o funcionário informa uma nova senha e seleciona a opção "Salvar nova senha". |
| **Exemplo** | Um funcionário informa uma nova senha com pelo menos oito caracteres, diferente da anterior. Após salvar, o sistema confirma a atualização e permite retornar à tela de login para realizar uma nova autenticação. |
| **Requisitos relacionados** | RF-13 (associação a validar) |
| **Documentação** | [Documento de Requisitos Funcionais](https://github.com/pi2-2026-2-equipe-10/pi2-2026-2-equipe-10/blob/66b36cbe831fdb3f9a10ba4d71083a4a4722c2d1/docs/requisitos-funcionais.md) |
