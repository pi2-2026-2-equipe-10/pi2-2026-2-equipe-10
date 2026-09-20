## Convenções gerais

- **URL base:** `http://localhost:3000`
- **Formato:** requisições e respostas em JSON (`Content-Type: application/json`).
- **Autenticação:** as rotas marcadas como 🔒 exigem o cabeçalho `Authorization: Bearer <token>`, obtido em `POST /login`. O token expira em 12 horas.
- **Formato de erro:** todas as falhas retornam `{ "erro": "mensagem" }`.

| Status | Significado |
|--------|-------------|
| 200 | Sucesso |
| 201 | Registro criado |
| 400 | Dado obrigatório ausente ou inválido |
| 401 | Não autenticado, token inválido/expirado, senha incorreta ou funcionário inativo |
| 404 | Registro não encontrado |
| 500 | Erro interno |

- **Campos numéricos** aceitam número ou texto numérico (`"12.5"`), mas precisam ser **maiores que zero**.
- **Campos de texto** obrigatórios não podem ser vazios nem só espaços.
- **Datas** usam o formato `AAAA-MM-DD`.

## Rotas

| Verbo | Caminho | Auth | Requisito | Descrição |
|-------|---------|:----:|-----------|-----------|
| GET | `/funcionarios` | — | RF013 | Lista funcionários ativos para a tela inicial |
| POST | `/funcionarios` | — | RF012 | Cadastra funcionário |
| POST | `/login` | — | RF013 | Autentica o funcionário e devolve o token |
| GET | `/materiais` | 🔒 | RF002 | Lista materiais |
| GET | `/materiais/:id` | 🔒 | RF002 | Consulta um material |
| POST | `/materiais` | 🔒 | RF001 | Cadastra material |
| PUT | `/materiais/:id` | 🔒 | RF002 | Edita material |
| GET | `/clientes` | 🔒 | RF003 | Lista clientes |
| POST | `/clientes` | 🔒 | RF003 | Cadastra cliente |
| GET | `/servicos` | 🔒 | RF004 | Lista serviços |
| GET | `/servicos/:id` | 🔒 | RF004/RF005 | Consulta serviço com material e composição |
| POST | `/servicos` | 🔒 | RF004 | Cadastra serviço |
| PUT | `/servicos/:id/composicao` | 🔒 | RF005 | Configura a composição do serviço |
| POST | `/orcamentos/calcular` | 🔒 | RF006/RF007 | Calcula o custo sem gravar |
| GET | `/orcamentos` | 🔒 | RF009 | Lista orçamentos |
| GET | `/orcamentos/:id` | 🔒 | RF009 | Consulta um orçamento |
| POST | `/orcamentos` | 🔒 | RF008 | Registra orçamento ou salva rascunho |
| PUT | `/orcamentos/:id` | 🔒 | RF009 | Edita orçamento |
| GET | `/planejamento` | 🔒 | RF010 | Agenda semanal agrupada por dia |
| POST | `/atividades` | 🔒 | RF011 | Registra atividade em um dia |
| PUT | `/atividades/:id` | 🔒 | RF011 | Edita atividade |

---

## 1. Funcionários e autenticação

### GET `/funcionarios`

**O que faz:** alimenta a tela inicial com os funcionários que podem entrar no sistema. Retorna apenas os **ativos**, em ordem alfabética. Nunca expõe a senha.

**Recebe:** nada.

**Retorna (200):**
```json
[
  { "id": 1, "nome": "Ana" },
  { "id": 2, "nome": "Carlos" }
]
```

---

### POST `/funcionarios`

**O que faz:** cadastra um novo funcionário a partir da opção "Adicionar funcionário" da tela inicial. A senha é guardada com hash (bcrypt).

> Rota pública, porque o RF012 coloca o cadastro na tela inicial, antes do login. Em produção, vale protegê-la.

**Recebe (corpo):**

| Campo | Tipo | Obrigatório | Observação |
|-------|------|:-----------:|------------|
| `nome` | string | sim | |
| `senha` | string | sim | |
| `ativo` | boolean | não | padrão `true` |

```json
{ "nome": "Ana", "senha": "123456" }
```

**Retorna (201):**
```json
{ "id": 1, "nome": "Ana", "ativo": true }
```

**Erros:** `400` se `nome` ou `senha` faltarem.

---

### POST `/login`

**O que faz:** autentica o funcionário escolhido na tela inicial e devolve um token JWT (válido por 12h) para usar nas rotas protegidas. Funcionário inativo não consegue entrar.

**Recebe (corpo):**

| Campo | Tipo | Obrigatório | Observação |
|-------|------|:-----------:|------------|
| `funcionarioId` | number | sim | `id` obtido em `GET /funcionarios` |
| `senha` | string | sim | |

```json
{ "funcionarioId": 1, "senha": "123456" }
```

**Retorna (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "funcionario": { "id": 1, "nome": "Ana" }
}
```

**Erros:** `400` (campos ausentes); `401` (funcionário não encontrado ou inativo, ou senha incorreta).

---

## 2. Materiais 🔒

### GET `/materiais`

**O que faz:** lista os materiais cadastrados, em ordem alfabética. Retorna lista vazia quando não há nenhum, e o front-end pode então oferecer "Novo Material".

**Recebe:** nada.

**Retorna (200):**
```json
[
  { "id": 1, "nome": "Lona 440g", "unidadeMedida": "m²", "custo": 18.5 }
]
```

---

### GET `/materiais/:id`

**O que faz:** consulta os dados de um material.

**Recebe:** `id` na URL.

**Retorna (200):** `{ "id", "nome", "unidadeMedida", "custo" }`

**Erros:** `404` se não existir.

---

### POST `/materiais`

**O que faz:** cadastra um material usado na execução dos serviços. Fica disponível para serviços por metragem e composições.

**Recebe (corpo):**

| Campo | Tipo | Obrigatório | Observação |
|-------|------|:-----------:|------------|
| `nome` | string | sim | |
| `unidadeMedida` | string | sim | ex.: `"m²"`, `"unidade"` |
| `custo` | number | sim | custo por unidade de medida, maior que 0 |

```json
{ "nome": "Lona 440g", "unidadeMedida": "m²", "custo": 18.5 }
```

**Retorna (201):** `{ "id", "nome", "unidadeMedida", "custo" }`

**Erros:** `400` para campo ausente ou custo inválido.

---

### PUT `/materiais/:id`

**O que faz:** edita um material existente. É uma substituição completa, então todos os campos precisam ser enviados.

**Recebe:** `id` na URL e o mesmo corpo do `POST /materiais` (`nome`, `unidadeMedida`, `custo`, todos obrigatórios).

**Retorna (200):** `{ "id", "nome", "unidadeMedida", "custo" }` com os valores atualizados.

**Erros:** `400` (dados inválidos); `404` (material não existe).

---

## 3. Clientes 🔒

### GET `/clientes`

**O que faz:** lista os clientes cadastrados, em ordem alfabética.

**Recebe:** nada.

**Retorna (200):**
```json
[
  {
    "id": 1,
    "nome": "Maria Souza",
    "telefone": "88999990000",
    "email": null,
    "observacoes": "Paga à vista"
  }
]
```
Campos opcionais não informados voltam como `null`.

---

### POST `/clientes`

**O que faz:** cadastra um cliente para associá-lo a orçamentos.

**Recebe (corpo):**

| Campo | Tipo | Obrigatório |
|-------|------|:-----------:|
| `nome` | string | sim |
| `telefone` | string | não |
| `email` | string | não |
| `observacoes` | string | não |

```json
{ "nome": "Maria Souza", "telefone": "88999990000" }
```

**Retorna (201):** `{ "id", "nome", "telefone", "email", "observacoes" }`

**Erros:** `400` se `nome` faltar.

---

## 4. Serviços 🔒

Cada serviço tem um **tipo de cálculo**:

- `METRAGEM`: o custo é `largura × altura × custo do material` (dimensões em metros e custo por m²). O serviço aponta para **um material**.
- `COMPOSICAO`: o custo é a soma de `quantidade × custo` dos materiais da composição, mais `tempoOperacaoHoras × custoHoraOperacao`, quando informados.

### GET `/servicos`

**O que faz:** lista os serviços cadastrados, em ordem alfabética.

**Recebe:** nada.

**Retorna (200):**
```json
[
  {
    "id": 1,
    "nome": "Banner",
    "tipoCalculo": "METRAGEM",
    "materialId": 1,
    "tempoOperacaoHoras": null,
    "custoHoraOperacao": null
  }
]
```

---

### GET `/servicos/:id`

**O que faz:** consulta um serviço com o material associado (metragem) e os itens da composição.

**Recebe:** `id` na URL.

**Retorna (200):**
```json
{
  "id": 2,
  "nome": "Cartão de visita",
  "tipoCalculo": "COMPOSICAO",
  "materialId": null,
  "tempoOperacaoHoras": 0.5,
  "custoHoraOperacao": 40,
  "material": null,
  "itens": [
    {
      "id": 1,
      "servicoId": 2,
      "materialId": 3,
      "quantidade": 2,
      "material": { "id": 3, "nome": "Papel couché", "unidadeMedida": "folha", "custo": 0.8 }
    }
  ]
}
```
Para serviços `METRAGEM`, `material` traz o objeto do material e `itens` vem vazio.

**Erros:** `404` se não existir.

---

### POST `/servicos`

**O que faz:** cadastra um serviço personalizado da gráfica.

**Recebe (corpo):**

| Campo | Tipo | Obrigatório | Observação |
|-------|------|:-----------:|------------|
| `nome` | string | sim | |
| `tipoCalculo` | string | sim | `"METRAGEM"` ou `"COMPOSICAO"` |
| `materialId` | number | só se `METRAGEM` | material cujo custo será usado no cálculo; ignorado em `COMPOSICAO` |

```json
{ "nome": "Banner", "tipoCalculo": "METRAGEM", "materialId": 1 }
```

**Retorna (201):** `{ "id", "nome", "tipoCalculo", "materialId", "tempoOperacaoHoras", "custoHoraOperacao" }`

**Erros:** `400` (nome ausente, tipo inválido ou `materialId` ausente em `METRAGEM`); `404` (material não existe).

---

### PUT `/servicos/:id/composicao`

**O que faz:** define a composição de um serviço do tipo `COMPOSICAO`: materiais, quantidades e, se aplicável, tempo de operação. **Substitui** a composição anterior por completo, inclusive tempo e custo da hora.

**Recebe:** `id` na URL e o corpo:

| Campo | Tipo | Obrigatório | Observação |
|-------|------|:-----------:|------------|
| `itens` | array | sim | ao menos 1 item |
| `itens[].materialId` | number | sim | |
| `itens[].quantidade` | number | sim | maior que 0 |
| `tempoOperacaoHoras` | number | não | tempo de operação em horas |
| `custoHoraOperacao` | number | se houver `tempoOperacaoHoras` | custo de cada hora de operação |

```json
{
  "itens": [
    { "materialId": 3, "quantidade": 2 },
    { "materialId": 4, "quantidade": 1 }
  ],
  "tempoOperacaoHoras": 0.5,
  "custoHoraOperacao": 40
}
```

**Retorna (200):** o serviço completo, no mesmo formato de `GET /servicos/:id`.

**Erros:** `400` (serviço não é `COMPOSICAO`, lista vazia, quantidade ausente, tempo sem custo da hora); `404` (serviço ou material não existe).

---

## 5. Orçamentos 🔒

### POST `/orcamentos/calcular`

**O que faz:** calcula o custo de um serviço sem gravar nada, para mostrar o resultado ao funcionário antes de registrar.

**Recebe (corpo):**

| Campo | Tipo | Obrigatório | Observação |
|-------|------|:-----------:|------------|
| `servicoId` | number | sim | |
| `largura` | number | só se `METRAGEM` | em metros |
| `altura` | number | só se `METRAGEM` | em metros |

Em serviços `COMPOSICAO`, `largura` e `altura` não são necessárias e são ignoradas.

```json
{ "servicoId": 1, "largura": 2, "altura": 1.5 }
```

**Retorna (200):**
```json
{ "custo": 55.5 }
```

**Erros:** `400` (dimensões ausentes ou inválidas; serviço `COMPOSICAO` sem composição configurada; serviço `METRAGEM` sem material); `404` (serviço não existe).

---

### GET `/orcamentos`

**O que faz:** lista os orçamentos, do mais recente para o mais antigo, já com cliente e serviço.

**Recebe:** nada.

**Retorna (200):**
```json
[
  {
    "id": 1,
    "clienteId": 1,
    "servicoId": 1,
    "largura": 2,
    "altura": 1.5,
    "custoTotal": 55.5,
    "rascunho": false,
    "criadoEm": "2026-09-20T22:00:00.000Z",
    "cliente": { "id": 1, "nome": "Maria Souza", "telefone": "88999990000", "email": null, "observacoes": null },
    "servico": { "id": 1, "nome": "Banner", "tipoCalculo": "METRAGEM", "materialId": 1, "tempoOperacaoHoras": null, "custoHoraOperacao": null }
  }
]
```
`cliente` e `servico` vêm `null` quando não associados, o que é comum em rascunhos.

---

### GET `/orcamentos/:id`

**O que faz:** consulta um orçamento.

**Recebe:** `id` na URL.

**Retorna (200):** mesmo formato de um item de `GET /orcamentos`.

**Erros:** `404` se não existir.

---

### POST `/orcamentos`

**O que faz:** cria um orçamento. Existem dois modos:

- **Registrar** (padrão): valida os dados, calcula o custo e grava com `custoTotal` preenchido.
- **Salvar rascunho** (`"rascunho": true`): grava o que foi informado, sem validar nem calcular. `custoTotal` fica `null`.

**Recebe (corpo):**

| Campo | Tipo | Obrigatório | Observação |
|-------|------|:-----------:|------------|
| `rascunho` | boolean | não | só `true` ativa o modo rascunho |
| `clienteId` | number | não | cliente já cadastrado; orçamento pode ficar sem cliente |
| `servicoId` | number | sim, exceto rascunho | |
| `largura` | number | só se `METRAGEM` e não rascunho | em metros |
| `altura` | number | só se `METRAGEM` e não rascunho | em metros |

```json
{ "clienteId": 1, "servicoId": 1, "largura": 2, "altura": 1.5 }
```

**Retorna (201):**
```json
{
  "id": 1,
  "clienteId": 1,
  "servicoId": 1,
  "largura": 2,
  "altura": 1.5,
  "custoTotal": 55.5,
  "rascunho": false,
  "criadoEm": "2026-09-20T22:00:00.000Z"
}
```
Este retorno traz só os campos do orçamento, sem `cliente` e `servico`; para os objetos completos, use o `GET`.

**Erros:** `400` (dados obrigatórios ausentes ou inválidos, composição não configurada); `404` (cliente ou serviço não existe).

---

### PUT `/orcamentos/:id`

**O que faz:** edita um orçamento e recalcula o custo. Também serve para **finalizar um rascunho**: envie os dados completos sem `rascunho` (ou com `false`).

> Substitui todos os campos. O que não for enviado é gravado como `null`, então mande o orçamento completo.

**Recebe:** `id` na URL e o mesmo corpo do `POST /orcamentos`.

**Retorna (200):** o orçamento atualizado, no mesmo formato do retorno do `POST /orcamentos`.

**Erros:** `400`; `404` (orçamento, cliente ou serviço não existe).

---

## 6. Planejamento semanal 🔒

### GET `/planejamento`

**O que faz:** devolve a agenda de uma semana (segunda a domingo), com as atividades agrupadas por dia. Dias sem atividade voltam com lista vazia.

**Recebe (query string):**

| Parâmetro | Tipo | Obrigatório | Observação |
|-----------|------|:-----------:|------------|
| `inicio` | string | não | qualquer data `AAAA-MM-DD`; a semana que contém essa data é retornada. Sem o parâmetro, usa a semana atual |

Exemplo: `GET /planejamento?inicio=2026-09-21`

**Retorna (200):** sempre 7 objetos, um por dia.
```json
[
  {
    "dia": "2026-09-21",
    "atividades": [
      {
        "id": 1,
        "titulo": "Entregar banner da Maria",
        "descricao": "Retirada às 14h",
        "data": "2026-09-21T00:00:00.000Z"
      }
    ]
  },
  { "dia": "2026-09-22", "atividades": [] }
]
```

**Erros:** `400` se `inicio` estiver em formato inválido.

---

### POST `/atividades`

**O que faz:** registra um serviço ou atividade em um dia específico do planejamento semanal.

**Recebe (corpo):**

| Campo | Tipo | Obrigatório | Observação |
|-------|------|:-----------:|------------|
| `titulo` | string | sim | |
| `descricao` | string | não | |
| `data` | string | sim | `AAAA-MM-DD` |

```json
{ "titulo": "Entregar banner da Maria", "descricao": "Retirada às 14h", "data": "2026-09-21" }
```

**Retorna (201):**
```json
{
  "id": 1,
  "titulo": "Entregar banner da Maria",
  "descricao": "Retirada às 14h",
  "data": "2026-09-21T00:00:00.000Z"
}
```

**Erros:** `400` (título ausente, data ausente ou inválida).

---

### PUT `/atividades/:id`

**O que faz:** altera uma atividade já registrada, inclusive movendo-a para outro dia. É uma substituição completa, então `titulo` e `data` são obrigatórios e `descricao` some se não for enviada.

**Recebe:** `id` na URL e o mesmo corpo do `POST /atividades`.

**Retorna (200):** `{ "id", "titulo", "descricao", "data" }` atualizado.

**Erros:** `400` (dados inválidos); `404` (atividade não existe).

---

## Fluxo típico de uso

1. `POST /funcionarios` para cadastrar o primeiro funcionário.
2. `GET /funcionarios` e `POST /login` para entrar e obter o token.
3. `POST /materiais` para cadastrar os materiais.
4. `POST /servicos` para cadastrar o serviço. Se for `COMPOSICAO`, configure com `PUT /servicos/:id/composicao`.
5. `POST /clientes` (opcional).
6. `POST /orcamentos/calcular` para mostrar o custo, e `POST /orcamentos` para registrá-lo.
7. `POST /atividades` e `GET /planejamento` para organizar a semana.
