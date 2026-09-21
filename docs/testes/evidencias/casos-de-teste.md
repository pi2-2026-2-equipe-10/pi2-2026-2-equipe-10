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

# Evidências

As evidências de execução devem ser armazenadas na pasta:

`docs/testes/evidencias/`

### CT-001

- `CT-001-E1.png` — Cadastro do material realizado com sucesso.

### CT-002

- `CT-002-E1.png` — Sistema solicitando o preenchimento do campo obrigatório.

---

# 📊 Legenda

| Status | Significado |
|---|---|
| 🟢 Aprovado | Todos os passos apresentaram o resultado esperado. |
| 🔴 Reprovado | Pelo menos um passo apresentou resultado diferente do esperado. |
| 🟡 Bloqueado | Não foi possível iniciar ou executar o teste devido a uma dependência. |
| ⚪ Não executado | Teste ainda não foi executado. |
