### 1.1 RF001 – Cadastrar Materiais
**Atores:** Funcionário

**Prioridade:** Essencial.

**Descrição**
O sistema deve permitir que o funcionário cadastre materiais utilizados na execução dos serviços. Após realizar a autenticação, o funcionário deve acessar a opção “Materiais”, localizada no menu lateral esquerdo do sistema. Ao selecionar essa opção, o sistema deve apresentar a listagem dos materiais cadastrados e a opção “Novo Material”. Ao selecionar essa opção, o sistema deve apresentar a tela de cadastro, permitindo informar o nome do material, sua unidade de medida e seu custo.

**Pré-condições**
- O funcionário deve estar autenticado no sistema.

**Fluxo Principal**
- O funcionário acessa o sistema após realizar a autenticação;
- O sistema exibe o menu lateral esquerdo;
- O funcionário seleciona a opção “Materiais”;
- O sistema exibe a lista de materiais cadastrados;
- O sistema apresenta a opção “Novo Material”;
- O funcionário seleciona a opção “Novo Material”;
- O sistema exibe a tela de cadastro de material;
- O funcionário informa o nome do material;
- O funcionário informa a unidade de medida;
- O funcionário informa o custo do material;
- O funcionário confirma o cadastro;
- O sistema registra o material informado.

**Fluxos Alternativos**

*FA01 – Dados obrigatórios não informados*
- O funcionário tenta confirmar o cadastro sem informar um ou mais dados necessários;
- O sistema identifica os campos não preenchidos;
- O sistema solicita o preenchimento das informações necessárias;
- O funcionário preenche os dados solicitados;
- O funcionário confirma novamente o cadastro;
- O sistema registra o material.

*FA02 – Dados informados inválidos*
- O funcionário informa um ou mais dados em formato inválido;
- O sistema identifica a inconsistência nos dados;
- O sistema solicita a correção das informações;
- O funcionário corrige os dados;
- O funcionário confirma o cadastro;
- O sistema registra o material.

**Critérios de Aceitação**

*Cenário: Acessar materiais*
- Dado que o funcionário está autenticado no sistema
- Quando selecionar a opção “Materiais” no menu lateral
- Então o sistema deve exibir a lista de materiais cadastrados
- E disponibilizar a opção “Novo Material”.

*Cenário: Cadastrar novo material*
- Dado que o funcionário está na tela de cadastro de material
- Quando informar o nome, a unidade de medida e o custo do material
- E confirmar o cadastro
- Então o sistema deve registrar o material.

*Cenário: Dados obrigatórios não informados*
- Dado que o funcionário está na tela de cadastro de material
- Quando tentar confirmar o cadastro sem informar um ou mais dados necessários
- Então o sistema deve solicitar o preenchimento das informações necessárias
- E não deve concluir o cadastro enquanto os dados não forem preenchidos.

---

### 1.2 RF002 – Consultar e Editar Material
**Atores:** Funcionário

**Prioridade:** Essencial.

**Descrição**
O sistema deve permitir que o funcionário consulte os materiais cadastrados através da opção “Materiais”, localizada no menu lateral esquerdo do sistema. Ao selecionar essa opção, o sistema deve apresentar uma lista contendo os materiais cadastrados, suas respectivas unidades de medida e custos. A partir da listagem, o funcionário deve poder selecionar um material para visualizar suas informações e realizar alterações quando necessário.

**Pré-condições**
- O funcionário deve estar autenticado no sistema;
- Deve existir pelo menos um material cadastrado para consulta.

**Fluxo Principal**
- O funcionário acessa o sistema após realizar a autenticação;
- O sistema exibe o menu lateral esquerdo;
- O funcionário seleciona a opção “Materiais”;
- O sistema exibe a lista de materiais cadastrados;
- O sistema apresenta, para cada material, seu nome, unidade de medida e custo;
- O funcionário seleciona o material que deseja consultar ou editar;
- O sistema apresenta as informações do material selecionado;
- O funcionário solicita a edição do material;
- O sistema disponibiliza os dados para alteração;
- O funcionário altera as informações desejadas;
- O funcionário confirma a alteração;
- O sistema registra as informações atualizadas.

**Fluxos Alternativos**

*FA01 – Nenhum material cadastrado*
- O funcionário seleciona a opção “Materiais”;
- O sistema verifica que não existem materiais cadastrados;
- O sistema exibe a opção “Novo Material” para permitir o cadastro de um material.

*FA02 – Dados alterados inválidos*
- O funcionário altera uma ou mais informações do material;
- O funcionário confirma a alteração;
- O sistema identifica dados inválidos;
- O sistema solicita a correção das informações;
- O funcionário corrige os dados;
- O funcionário confirma novamente a alteração;
- O sistema registra as informações atualizadas.

**Critérios de Aceitação**

*Cenário: Listar materiais cadastrados*
- Dado que o funcionário está autenticado no sistema
- Quando selecionar a opção “Materiais”
- Então o sistema deve exibir os materiais cadastrados
- E apresentar o nome, a unidade de medida e o custo de cada material.

*Cenário: Consultar material*
- Dado que existem materiais cadastrados
- Quando o funcionário selecionar um material
- Então o sistema deve apresentar suas informações.

*Cenário: Editar material*
- Dado que o funcionário selecionou um material cadastrado
- Quando alterar suas informações e confirmar a alteração
- Então o sistema deve registrar os dados atualizados.

*Cenário: Nenhum material cadastrado*
- Dado que não existem materiais cadastrados
- Quando o funcionário acessar a opção “Materiais”
- Então o sistema deve indicar que não existem materiais cadastrados
- E disponibilizar a opção “Novo Material”.

---

### 1.3 RF003 – Cadastrar Clientes
**Atores:** Funcionário

**Prioridade:** Importante.

**Descrição**
O sistema deve permitir que o funcionário acesse a opção “Clientes” no menu lateral para visualizar os clientes cadastrados e selecionar “Adicionar Cliente”, permitindo informar nome, telefone, e-mail e observações.

**Pré-condições**
- O funcionário deve estar autenticado no sistema.

**Fluxo Principal**
- O funcionário acessa o sistema;
- O funcionário seleciona a opção “Clientes” no menu lateral;
- O sistema exibe a lista de clientes cadastrados;
- O sistema apresenta a opção “Adicionar Cliente”;
- O funcionário seleciona “Adicionar Cliente”;
- O sistema exibe o quadro de cadastro na tela;
- O funcionário informa o nome do cliente;
- O funcionário informa o telefone;
- O funcionário informa o e-mail;
- O funcionário informa as observações, quando necessário;
- O funcionário seleciona a opção “Salvar”;
- O sistema registra o cliente.

**Fluxos Alternativos**

*FA01 – Cancelar cadastro*
- O funcionário seleciona “Adicionar Cliente”;
- O sistema exibe o quadro de cadastro;
- O funcionário informa os dados desejados;
- O funcionário seleciona a opção “Cancelar”;
- O sistema cancela o cadastro.

*FA02 – Dados obrigatórios não informados*
- O funcionário tenta salvar o cadastro sem informar um ou mais dados necessários;
- O sistema identifica os dados não preenchidos;
- O sistema solicita o preenchimento das informações necessárias;
- O funcionário preenche os dados;
- O funcionário seleciona “Salvar”;
- O sistema registra o cliente.

**Critérios de Aceitação**

*Cenário: Acessar clientes*
- Dado que o funcionário está autenticado
- Quando selecionar a opção “Clientes”
- Então o sistema deve exibir a lista de clientes cadastrados
- E disponibilizar a opção “Adicionar Cliente”.

*Cenário: Cadastrar cliente*
- Dado que o quadro de cadastro está aberto
- Quando o funcionário informar os dados necessários e selecionar “Salvar”
- Então o sistema deve registrar o cliente.

*Cenário: Cancelar cadastro*
- Dado que o quadro de cadastro está aberto
- Quando o funcionário selecionar “Cancelar”
- Então o sistema deve cancelar o cadastro.

---

### 1.4 RF004 – Cadastrar Serviço Personalizado
**Atores:** Funcionário

**Prioridade:** Essencial.

**Descrição**
O sistema deve permitir que o funcionário acesse a opção “Serviços” no menu lateral para visualizar os serviços cadastrados e selecionar “Novo Serviço”, permitindo informar o nome do serviço e o tipo de cálculo, por metragem ou por composição.

**Pré-condições**
- O funcionário deve estar autenticado no sistema.

**Fluxo Principal**
- O funcionário acessa o sistema;
- O funcionário seleciona a opção “Serviços” no menu lateral;
- O sistema exibe a lista de serviços cadastrados;
- O sistema apresenta a opção “Novo Serviço”;
- O funcionário seleciona “Novo Serviço”;
- O sistema exibe o quadro de cadastro na tela;
- O funcionário informa o nome do serviço;
- O funcionário seleciona o tipo de cálculo: por metragem ou por composição;
- O funcionário seleciona “Salvar”;
- O sistema registra o serviço.

**Fluxos Alternativos**

*FA01 – Cancelar cadastro*
- O funcionário seleciona “Novo Serviço”;
- O sistema exibe o quadro de cadastro;
- O funcionário seleciona “Cancelar”;
- O sistema cancela o cadastro.

*FA02 – Dados necessários não informados*
- O funcionário tenta salvar o serviço sem informar os dados necessários;
- O sistema identifica os dados não preenchidos;
- O sistema solicita o preenchimento das informações necessárias;
- O funcionário informa os dados;
- O funcionário seleciona “Salvar”;
- O sistema registra o serviço.

**Critérios de Aceitação**

*Cenário: Acessar serviços*
- Dado que o funcionário está autenticado
- Quando selecionar a opção “Serviços”
- Então o sistema deve exibir os serviços cadastrados
- E disponibilizar a opção “Novo Serviço”.

*Cenário: Cadastrar serviço por metragem*
- Dado que o quadro de cadastro está aberto
- Quando o funcionário informar o nome do serviço e selecionar o cálculo por metragem
- E selecionar “Salvar”
- Então o sistema deve registrar o serviço.

*Cenário: Cadastrar serviço por composição*
- Dado que o quadro de cadastro está aberto
- Quando o funcionário informar o nome do serviço e selecionar o cálculo por composição
- E selecionar “Salvar”
- Então o sistema deve registrar o serviço.

*Cenário: Cancelar cadastro*
- Dado que o quadro de cadastro está aberto
- Quando o funcionário selecionar “Cancelar”
- Então o sistema deve cancelar o cadastro.

---

### 1.5 RF005 – Configurar Composição do Serviço
**Atores:** Funcionário

**Prioridade:** Essencial.

**Descrição**
O sistema deve permitir que o funcionário configure a composição de um serviço, associando os materiais utilizados, suas respectivas quantidades e, quando aplicável, o tempo de operação.

**Pré-condições**
- O funcionário deve estar autenticado no sistema;
- O serviço deve estar previamente cadastrado;
- O serviço deve utilizar o tipo de cálculo por composição.

**Fluxo Principal**
- O funcionário acessa a opção “Serviços” no menu lateral;
- O sistema exibe os serviços cadastrados;
- O funcionário seleciona um serviço configurado por composição;
- O sistema apresenta as opções de configuração da composição;
- O funcionário seleciona os materiais utilizados no serviço;
- O funcionário informa a quantidade de cada material;
- O funcionário informa o tempo de operação, quando aplicável;
- O funcionário confirma a configuração;
- O sistema registra a composição do serviço.

**Fluxos Alternativos**

*FA01 – Material não informado*
- O funcionário tenta confirmar a composição sem informar um material necessário;
- O sistema identifica a ausência da informação;
- O sistema solicita a seleção do material;
- O funcionário informa o material;
- O sistema prossegue com a configuração.

*FA02 – Quantidade não informada*
- O funcionário seleciona um material;
- O funcionário não informa sua quantidade;
- O sistema solicita o preenchimento da quantidade;
- O funcionário informa a quantidade;
- O sistema prossegue com a configuração.

*FA03 – Tempo de operação aplicável não informado*
- O funcionário configura um serviço que exige tempo de operação;
- O funcionário não informa o tempo necessário;
- O sistema solicita o preenchimento do tempo de operação;
- O funcionário informa o tempo;
- O sistema prossegue com a configuração.

**Critérios de Aceitação**

*Cenário: Configurar composição do serviço*
- Dado que existe um serviço cadastrado com cálculo por composição
- Quando o funcionário selecionar os materiais e informar suas quantidades
- E informar o tempo de operação quando aplicável
- Então o sistema deve registrar a composição do serviço.

*Cenário: Material sem quantidade*
- Dado que um material foi selecionado para a composição
- Quando o funcionário não informar sua quantidade
- Então o sistema deve solicitar o preenchimento da quantidade
- E não deve concluir a configuração enquanto a informação não for preenchida.

---

### 1.6 RF006 – Calcular Custo por Metragem
**Atores:** Funcionário

**Prioridade:** Essencial.

**Descrição**
O sistema deve permitir que o funcionário calcule o custo de um serviço por metragem, informando as dimensões necessárias para o cálculo e utilizando o custo correspondente à unidade de medida do material.

**Pré-condições**
- O funcionário deve estar autenticado no sistema;
- Deve existir um serviço configurado para cálculo por metragem;
- O material utilizado deve estar cadastrado com seu respectivo custo.

**Fluxo Principal**
- O funcionário acessa a funcionalidade de orçamento;
- O funcionário seleciona um serviço configurado por metragem;
- O sistema solicita as dimensões necessárias para o cálculo;
- O funcionário informa as dimensões;
- O sistema identifica o material e seu custo por unidade de medida;
- O sistema realiza o cálculo da metragem;
- O sistema calcula o custo do serviço;
- O sistema apresenta o custo calculado ao funcionário.

**Fluxos Alternativos**

*FA01 – Dimensões não informadas*
- O funcionário tenta realizar o cálculo sem informar uma ou mais dimensões necessárias;
- O sistema identifica os dados não preenchidos;
- O sistema solicita o preenchimento das dimensões;
- O funcionário informa os dados necessários;
- O sistema realiza o cálculo.

*FA02 – Dimensões inválidas*
- O funcionário informa uma ou mais dimensões inválidas;
- O sistema identifica a inconsistência;
- O sistema solicita a correção das dimensões;
- O funcionário corrige os dados;
- O sistema realiza o cálculo.

**Critérios de Aceitação**

*Cenário: Calcular custo por metragem*
- Dado que existe um serviço configurado para cálculo por metragem
- Quando o funcionário informar as dimensões necessárias
- Então o sistema deve calcular a metragem
- E apresentar o custo calculado utilizando o custo correspondente à unidade de medida do material.

*Cenário: Dimensões não informadas*
- Dado que o funcionário está realizando um cálculo por metragem
- Quando não informar uma ou mais dimensões necessárias
- Então o sistema deve solicitar o preenchimento das dimensões
- E não deve realizar o cálculo enquanto os dados necessários não forem informados.

---

### 1.7 RF007 – Calcular Custo por Composição
**Atores:** Funcionário

**Prioridade:** Essencial.

**Descrição**
O sistema deve permitir que o funcionário calcule o custo de um serviço por composição, considerando os materiais, suas quantidades e o tempo de operação quando aplicável.

**Pré-condições**
- O funcionário deve estar autenticado no sistema;
- Deve existir um serviço configurado para cálculo por composição;
- A composição do serviço deve estar configurada.

**Fluxo Principal**
- O funcionário acessa a funcionalidade de orçamento;
- O funcionário seleciona um serviço configurado por composição;
- O sistema apresenta os elementos da composição cadastrada;
- O sistema identifica os materiais e suas respectivas quantidades;
- O sistema identifica o tempo de operação, quando aplicável;
- O sistema realiza o cálculo com base nos elementos da composição;
- O sistema apresenta o custo calculado ao funcionário.

**Fluxos Alternativos**

*FA01 – Composição não configurada*
- O funcionário seleciona um serviço configurado para cálculo por composição;
- O sistema verifica que a composição não está configurada;
- O sistema informa que não é possível realizar o cálculo sem a composição do serviço.

*FA02 – Dados da composição incompletos*
- O sistema identifica que existem informações necessárias ausentes na composição;
- O sistema informa que a composição está incompleta;
- O sistema não realiza o cálculo até que os dados necessários sejam configurados.

**Critérios de Aceitação**

*Cenário: Calcular custo por composição*
- Dado que existe um serviço com composição configurada
- Quando o funcionário selecionar o serviço
- Então o sistema deve considerar os materiais e suas quantidades
- E considerar o tempo de operação quando aplicável
- E apresentar o custo calculado.

*Cenário: Composição não configurada*
- Dado que o serviço utiliza cálculo por composição
- Quando não existir uma composição configurada
- Então o sistema deve informar que não é possível realizar o cálculo sem a composição.

---

### 1.8 RF008 – Criar e Registrar Orçamento
**Atores:** Funcionário

**Prioridade:** Essencial.

**Descrição**
O sistema deve permitir que o funcionário acesse a opção “Orçamentos” no menu lateral para criar um orçamento, informando os dados necessários, associando um cliente quando aplicável e selecionando o serviço para realizar o cálculo do orçamento.

**Pré-condições**
- O funcionário deve estar autenticado no sistema;
- Deve existir pelo menos um serviço cadastrado.

**Fluxo Principal**
- O funcionário acessa o sistema;
- O funcionário seleciona a opção “Orçamentos” no menu lateral;
- O sistema exibe a tela de criação de orçamento;
- O funcionário informa o cliente, quando aplicável;
- O funcionário pode associar um cliente já cadastrado;
- O funcionário seleciona o serviço;
- O funcionário informa as dimensões necessárias, quando aplicável, como altura e largura;
- O sistema realiza o cálculo correspondente ao tipo de serviço;
- O funcionário seleciona a opção “Registrar Orçamento”;
- O sistema registra o orçamento.

**Fluxos Alternativos**

*FA01 – Salvar orçamento como rascunho*
- O funcionário inicia o preenchimento de um orçamento;
- O funcionário informa os dados disponíveis;
- O funcionário seleciona a opção “Salvar Rascunho”;
- O sistema salva o orçamento como rascunho.

*FA02 – Cliente não associado*
- O funcionário inicia a criação do orçamento;
- O funcionário opta por não associar um cliente cadastrado;
- O sistema permite o preenchimento do orçamento sem a associação de um cliente.

*FA03 – Dados necessários não informados*
- O funcionário tenta registrar o orçamento sem informar um ou mais dados necessários;
- O sistema identifica os dados não preenchidos;
- O sistema solicita o preenchimento das informações necessárias;
- O funcionário informa os dados;
- O funcionário seleciona “Registrar Orçamento”;
- O sistema registra o orçamento.

**Critérios de Aceitação**

*Cenário: Criar e registrar orçamento*
- Dado que o funcionário está na tela de criação de orçamento
- Quando informar os dados necessários, selecionar o serviço e registrar o orçamento
- Então o sistema deve realizar o cálculo correspondente
- E registrar o orçamento.

*Cenário: Associar cliente cadastrado*
- Dado que existem clientes cadastrados
- Quando o funcionário selecionar um cliente para o orçamento
- Então o sistema deve associar o cliente ao orçamento.

*Cenário: Salvar orçamento como rascunho*
- Dado que o funcionário iniciou o preenchimento de um orçamento
- Quando selecionar “Salvar Rascunho”
- Então o sistema deve salvar o orçamento como rascunho.

*Cenário: Orçamento sem cliente associado*
- Dado que o funcionário está criando um orçamento
- Quando não associar um cliente cadastrado
- Então o sistema deve permitir a continuidade do orçamento.

---

### 1.9 RF009 – Consultar e Editar Orçamentos
**Atores:** Funcionário

**Prioridade:** Essencial.

**Descrição**
O sistema deve permitir que o funcionário acesse a opção “Orçamentos” no menu lateral para visualizar a listagem dos orçamentos cadastrados, consultar seus dados e editar suas informações quando necessário.

**Pré-condições**
- O funcionário deve estar autenticado no sistema.

**Fluxo Principal**
- O funcionário acessa o sistema;
- O funcionário seleciona a opção “Orçamentos” no menu lateral;
- O sistema exibe a listagem dos orçamentos cadastrados;
- O funcionário seleciona um orçamento;
- O sistema apresenta os dados do orçamento selecionado;
- O funcionário solicita a edição do orçamento;
- O sistema disponibiliza os dados para alteração;
- O funcionário altera as informações necessárias;
- O funcionário confirma a alteração;
- O sistema registra as informações atualizadas.

**Fluxos Alternativos**

*FA01 – Nenhum orçamento cadastrado*
- O funcionário acessa a opção “Orçamentos”;
- O sistema verifica que não existem orçamentos cadastrados;
- O sistema informa que não existem orçamentos disponíveis para consulta.

*FA02 – Dados alterados inválidos*
- O funcionário altera uma ou mais informações do orçamento;
- O funcionário confirma a alteração;
- O sistema identifica dados inválidos;
- O sistema solicita a correção das informações;
- O funcionário corrige os dados;
- O funcionário confirma novamente a alteração;
- O sistema registra as informações atualizadas.

**Critérios de Aceitação**

*Cenário: Consultar orçamentos*
- Dado que existem orçamentos cadastrados
- Quando o funcionário acessar a opção “Orçamentos”
- Então o sistema deve exibir a listagem dos orçamentos cadastrados.

*Cenário: Visualizar orçamento*
- Dado que existem orçamentos cadastrados
- Quando o funcionário selecionar um orçamento
- Então o sistema deve apresentar seus dados.

*Cenário: Editar orçamento*
- Dado que o funcionário selecionou um orçamento
- Quando alterar suas informações e confirmar a alteração
- Então o sistema deve registrar os dados atualizados.

*Cenário: Nenhum orçamento cadastrado*
- Dado que não existem orçamentos cadastrados
- Quando o funcionário acessar a opção “Orçamentos”
- Então o sistema deve informar que não existem orçamentos disponíveis para consulta.

---

### 1.10 RF010 — Visualizar Planejamento Semanal
**Atores:** Funcionário

**Prioridade:** Importante.

**Descrição:**
O sistema deve permitir ao funcionário visualizar os serviços e atividades planejados, organizados por dia, em uma agenda semanal.

**Pré-condição:**
- Funcionário autenticado.

**Fluxo Principal:**
- O funcionário acessa o planejamento semanal.
- O sistema apresenta os serviços e atividades planejados, organizados por dia.

**Fluxos Alternativos:**

*FA01 — Não há atividades planejadas:*
- O sistema apresenta o planejamento sem atividades registradas.

**Critérios de Aceitação:**

*Cenário: Visualizar planejamento semanal*
- Dado que o funcionário está autenticado no sistema
- Quando acessar o planejamento semanal
- Então o sistema deve apresentar os serviços e atividades planejados
- E organizá-los por dia.

*Cenário: Planejamento sem atividades*
- Dado que o funcionário está autenticado no sistema
- E não existem atividades planejadas
- Quando acessar o planejamento semanal
- Então o sistema deve apresentar o planejamento sem atividades registradas.

---

### 1.11 RF011 — Registrar e Editar Atividade no Planejamento
**Atores:** Funcionário

**Prioridade:** Importante.

**Descrição:**
O sistema deve permitir ao funcionário registrar serviços ou atividades em dias específicos do planejamento semanal e alterar suas informações quando necessário.

**Pré-condição:**
- Funcionário autenticado.

**Fluxo Principal:**
- O funcionário acessa o planejamento semanal.
- O funcionário registra um serviço ou atividade em um dia específico.
- O sistema registra a atividade no planejamento.
- Quando necessário, o funcionário altera as informações de uma atividade já registrada.
- O sistema atualiza a atividade.

**Fluxos Alternativos:**

*FA01 — Informações não informadas:*
- Caso sejam necessárias informações para o registro, o sistema solicita que sejam preenchidas antes de concluir.

**Critérios de Aceitação:**

*Cenário: Registrar atividade no planejamento*
- Dado que o funcionário está autenticado no sistema
- Quando acessar o planejamento semanal
- E registrar um serviço ou atividade em um dia específico
- Então o sistema deve registrar a atividade no planejamento.

*Cenário: Editar atividade no planejamento*
- Dado que existe uma atividade registrada no planejamento
- Quando o funcionário alterar suas informações
- Então o sistema deve atualizar a atividade no planejamento.

*Cenário: Informações necessárias não informadas*
- Dado que o funcionário está registrando uma atividade no planejamento
- Quando não informar uma ou mais informações necessárias
- Então o sistema deve solicitar o preenchimento das informações
- E não deve concluir o registro enquanto os dados necessários não forem informados.

---

### 1.12 RF012 — Cadastrar Funcionário
**Atores:** Funcionário

**Prioridade:** Essencial.

**Descrição:**
O sistema deve permitir o cadastro de funcionários a partir da opção “Adicionar funcionário”, disponibilizada na tela inicial de acesso, permitindo informar os dados necessários do funcionário e seu status.

**Pré-condição:**
- O sistema deve estar disponível para acesso.

**Fluxo Principal:**
- O funcionário acessa a tela inicial do sistema.
- O sistema apresenta a opção “Adicionar funcionário”.
- O funcionário seleciona a opção “Adicionar funcionário”.
- O sistema apresenta o formulário de cadastro.
- O funcionário informa os dados solicitados.
- O funcionário confirma o cadastro.
- O sistema registra o funcionário.

**Fluxos Alternativos:**

*FA01 — Dados não informados:*
- Caso informações necessárias não sejam preenchidas, o sistema solicita seu preenchimento antes de concluir o cadastro.

**Critérios de Aceitação:**

*Cenário: Acessar cadastro de funcionário*
- Dado que o sistema está disponível para acesso
- Quando o funcionário acessar a tela inicial do sistema
- Então o sistema deve apresentar a opção “Adicionar funcionário”.

*Cenário: Cadastrar funcionário*
- Dado que o funcionário está no formulário de cadastro
- Quando informar os dados necessários
- E confirmar o cadastro
- Então o sistema deve registrar o funcionário.

*Cenário: Dados necessários não informados*
- Dado que o funcionário está no formulário de cadastro
- Quando tentar confirmar o cadastro sem informar uma ou mais informações necessárias
- Então o sistema deve solicitar o preenchimento das informações
- E não deve concluir o cadastro enquanto os dados necessários não forem informados.

---

### 1.13 RF013 — Autenticar Funcionário
**Atores:** Funcionário

**Prioridade:** Essencial.

**Descrição:**
O sistema deve permitir que o funcionário selecione seu nome entre os funcionários cadastrados na tela inicial, informe sua senha de acesso e entre no sistema após a autenticação.

**Pré-condição:**
- O funcionário deve estar cadastrado e ativo no sistema.

**Fluxo Principal:**
- O funcionário acessa a tela inicial do sistema.
- O sistema apresenta a identificação dos funcionários cadastrados.
- O funcionário seleciona seu nome.
- O sistema solicita a senha de acesso.
- O funcionário informa sua senha.
- O funcionário seleciona a opção “Entrar”.
- O sistema realiza a autenticação.
- O sistema permite o acesso ao sistema.

**Fluxos Alternativos:**

*FA01 — Senha incorreta:*
- Caso a senha informada não corresponda às credenciais do funcionário, o sistema não realiza a autenticação.

**Critérios de Aceitação:**

*Cenário: Selecionar funcionário para autenticação*
- Dado que existem funcionários cadastrados no sistema
- Quando o funcionário acessar a tela inicial
- Então o sistema deve apresentar os funcionários cadastrados
- E permitir a seleção de um funcionário.

*Cenário: Autenticar funcionário com credenciais válidas*
- Dado que o funcionário está cadastrado e ativo no sistema
- Quando selecionar seu nome
- E informar a senha correta
- E selecionar a opção “Entrar”
- Então o sistema deve realizar a autenticação
- E permitir o acesso ao sistema.

*Cenário: Senha incorreta*
- Dado que o funcionário está cadastrado e ativo no sistema
- Quando selecionar seu nome
- E informar uma senha incorreta
- Então o sistema não deve realizar a autenticação
- E não deve permitir o acesso ao sistema.
