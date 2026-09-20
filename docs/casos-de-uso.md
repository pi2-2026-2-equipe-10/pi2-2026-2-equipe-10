### UC-01 — Cadastrar Material
* **Ator principal:** Funcionário
* **Descrição:** Permite ao funcionário cadastrar os materiais utilizados na execução dos serviços, informando seus dados e custos.
* **Pré-condições:**
  * O funcionário deve estar utilizando o sistema.
  * O funcionário deve ter acesso à funcionalidade de cadastro de materiais.
* **Fluxo Principal:**
  * O funcionário acessa a funcionalidade de cadastro de materiais.
  * O sistema apresenta a opção de cadastrar um novo material.
  * O funcionário informa os dados do material.
  * O funcionário confirma o cadastro.
  * O sistema registra o material.
* **Pós-condições:**
  * O material é cadastrado no sistema e fica disponível para utilização nas demais funcionalidades.
* **Requisitos associados:**
  * RF-01 — Cadastrar Materiais

---

### UC-02 — Cadastrar Serviço Personalizado
* **Ator principal:** Funcionário
* **Descrição:** Permite ao funcionário cadastrar os serviços personalizados oferecidos pela gráfica, informando os dados necessários para sua utilização nos orçamentos.
* **Pré-condições:**
  * O funcionário deve estar utilizando o sistema.
  * O funcionário deve ter acesso à funcionalidade de cadastro de serviços.
* **Fluxo Principal:**
  * O funcionário acessa a funcionalidade de cadastro de serviços.
  * O sistema apresenta a opção de cadastrar um novo serviço.
  * O funcionário informa os dados do serviço.
  * O funcionário confirma o cadastro.
  * O sistema registra o serviço.
* **Pós-condições:**
  * O serviço é cadastrado no sistema e fica disponível para utilização nas demais funcionalidades.
* **Requisitos associados:**
  * RF-04 — Cadastrar Serviço Personalizado

---

### UC-03 — Configurar Composição do Serviço
* **Ator principal:** Funcionário
* **Descrição:** Permite ao funcionário configurar a composição de um serviço, associando os materiais utilizados, suas respectivas quantidades e, quando aplicável, o tempo de operação.
* **Pré-condições:**
  * O funcionário deve estar utilizando o sistema.
  * O serviço que terá sua composição configurada deve estar previamente cadastrado.
  * Os materiais que serão utilizados devem estar previamente cadastrados.
* **Fluxo Principal:**
  * O funcionário acessa a funcionalidade de configuração da composição do serviço.
  * O funcionário seleciona o serviço que deseja configurar.
  * O sistema apresenta a opção de configurar sua composição.
  * O funcionário associa os materiais utilizados no serviço.
  * O funcionário informa as respectivas quantidades dos materiais.
  * Quando aplicável, o funcionário informa o tempo de operação.
  * O funcionário confirma a configuração.
  * O sistema registra a composição do serviço.
* **Pós-condições:**
  * A composição do serviço é registrada e fica disponível para utilização no cálculo do custo do serviço.
* **Requisitos associados:**
  * RF-05 — Configurar Composição do Serviço

---

### UC-04 — Criar e Registrar Orçamento
* **Ator principal:** Funcionário
* **Descrição:** Permite ao funcionário criar e registrar um orçamento, selecionando o serviço, informando os dados necessários para o cálculo e associando um cliente quando aplicável.
* **Pré-condições:**
  * O funcionário deve estar utilizando o sistema.
  * Deve existir pelo menos um serviço previamente cadastrado.
* **Fluxo Principal:**
  * O funcionário acessa a funcionalidade de orçamentos.
  * O sistema apresenta a opção de criar um novo orçamento.
  * O funcionário informa os dados necessários do orçamento.
  * O funcionário seleciona o serviço que será utilizado no orçamento.
  * O funcionário informa as dimensões ou demais dados necessários para o cálculo, quando aplicável.
  * O funcionário associa um cliente ao orçamento, quando aplicável.
  * O sistema realiza o cálculo do orçamento.
  * O funcionário confirma o registro do orçamento.
  * O sistema registra o orçamento.
* **Pós-condições:**
  * O orçamento é registrado no sistema com os dados informados e o resultado do cálculo.
* **Requisitos associados:**
  * RF-06 — Calcular Custo por Metragem
  * RF-07 — Calcular Custo por Composição
  * RF-08 — Criar e Registrar Orçamento

---

### UC-05 — Visualizar Planejamento Semanal
* **Ator principal:** Funcionário
* **Descrição:** Permite ao funcionário visualizar os serviços e atividades planejados, organizados por dia, em uma agenda semanal.
* **Pré-condições:**
  * O funcionário deve estar utilizando o sistema.
* **Fluxo Principal:**
  * O funcionário acessa a funcionalidade de planejamento semanal.
  * O sistema apresenta o planejamento organizado por dia.
  * O funcionário visualiza os serviços e atividades registrados no planejamento.
* **Pós-condições:**
  * O planejamento semanal permanece disponível para consulta.
* **Requisitos associados:**
  * RF-10 — Visualizar Planejamento Semanal
