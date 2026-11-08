# Matriz de Autorização — Sistema DSilk

## 1. Objetivo

Este documento apresenta a matriz de autorização do sistema DSilk, estabelecendo as permissões de acesso às telas da aplicação e às rotas da API conforme os perfis de usuário definidos no projeto.

A matriz tem como objetivo identificar quais funcionalidades podem ser acessadas por cada perfil, contribuindo para a implementação do controle de acesso e para a proteção das operações realizadas no sistema.

## 2. Perfis de Acesso

O sistema DSilk possui dois perfis de acesso: Administrador e Funcionário.

### 2.1 Administrador

O perfil Administrador corresponde ao usuário responsável pela gestão do sistema. Possui acesso às funcionalidades operacionais da aplicação e às funcionalidades relacionadas ao gerenciamento dos funcionários.

### 2.2 Funcionário

O perfil Funcionário corresponde ao usuário que utiliza o sistema para realizar as atividades operacionais da gráfica. Possui acesso às funcionalidades operacionais, não sendo permitido o gerenciamento de funcionários.

## 3. Legenda de Permissões

| Símbolo | Significado |
|---|---|
| ✓ | Acesso permitido |
| — | Acesso não permitido |

O acesso às funcionalidades protegidas depende da autenticação do usuário e da identificação do seu perfil. A tela e a rota de login são disponibilizadas para ambos os perfis.

## 4. Matriz de Autorização das Telas

A Tabela 1 apresenta as permissões de acesso às telas identificadas no protótipo da aplicação.

**Tabela 1 — Matriz de autorização das telas**

| Tela / Funcionalidade | Identificação no Figma | Requisito Funcional | Administrador | Funcionário |
|---|---|---|---|---|
| Login | 1 | RF-13 | ✓ | ✓ |
| Materiais | 2 | RF-02 | ✓ | ✓ |
| Novo material | 3 | RF-01 | ✓ | ✓ |
| Clientes | 4 | RF-03 | ✓ | ✓ |
| Detalhes do cliente | 5 | RF-03 | ✓ | ✓ |
| Detalhes do pedido | 5.1 | RF-09 | ✓ | ✓ |
| Novo cliente | 6 | RF-03 | ✓ | ✓ |
| Serviços | 7 | RF-04 | ✓ | ✓ |
| Novo serviço / Editar serviço | 7.1 | RF-04 e RF-05 | ✓ | ✓ |
| Orçamento | 8 | RF-06, RF-07 e RF-08 | ✓ | ✓ |
| Planejamento | 9 | RF-10 e RF-11 | ✓ | ✓ |

## 5. Matriz de Autorização das Rotas da API

A Tabela 2 apresenta as permissões de acesso às rotas da API definidas no documento de mapeamento de rotas, considerando os perfis Administrador e Funcionário.

**Tabela 2 — Matriz de autorização das rotas da API**

| Método | Rota | Requisito Funcional | Administrador | Funcionário |
|---|---|---|---|---|
| `GET` | `/funcionarios` | RF-13 | ✓ | — |
| `POST` | `/funcionarios` | RF-12 | ✓ | — |
| `POST` | `/login` | RF-13 | ✓ | ✓ |
| `GET` | `/materiais` | RF-02 | ✓ | ✓ |
| `GET` | `/materiais/:id` | RF-02 | ✓ | ✓ |
| `POST` | `/materiais` | RF-01 | ✓ | ✓ |
| `PUT` | `/materiais/:id` | RF-02 | ✓ | ✓ |
| `GET` | `/clientes` | RF-03 | ✓ | ✓ |
| `POST` | `/clientes` | RF-03 | ✓ | ✓ |
| `GET` | `/servicos` | RF-04 | ✓ | ✓ |
| `GET` | `/servicos/:id` | RF-04 e RF-05 | ✓ | ✓ |
| `POST` | `/servicos` | RF-04 | ✓ | ✓ |
| `PUT` | `/servicos/:id/composicao` | RF-05 | ✓ | ✓ |
| `POST` | `/orcamentos/calcular` | RF-06 e RF-07 | ✓ | ✓ |
| `GET` | `/orcamentos` | RF-09 | ✓ | ✓ |
| `GET` | `/orcamentos/:id` | RF-09 | ✓ | ✓ |
| `POST` | `/orcamentos` | RF-08 | ✓ | ✓ |
| `PUT` | `/orcamentos/:id` | RF-09 | ✓ | ✓ |
| `GET` | `/planejamento` | RF-10 | ✓ | ✓ |
| `POST` | `/atividades` | RF-11 | ✓ | ✓ |
| `PUT` | `/atividades/:id` | RF-11 | ✓ | ✓ |

## 6. Diretrizes de Controle de Acesso

Com base nos perfis e nas permissões definidos, estabelecem-se as seguintes diretrizes para o controle de acesso do sistema:

- O Administrador possui permissão para acessar as funcionalidades operacionais e realizar o gerenciamento dos funcionários.
- O Funcionário possui permissão para acessar as funcionalidades operacionais, não sendo permitido o cadastro ou gerenciamento de funcionários.
- A autenticação deve ser realizada por meio da rota `POST /login`, que fornece o token necessário para acessar as rotas protegidas.
- As rotas protegidas devem verificar a validade do token e as permissões associadas ao perfil do usuário autenticado.
- Quando um usuário tentar acessar uma funcionalidade para a qual não possui permissão, o sistema deve negar o acesso, retornando o código HTTP 403 (Forbidden).

## 7. Considerações Finais

A matriz de autorização estabelece a relação entre os perfis de acesso, as telas da aplicação e as rotas da API, servindo como referência para a implementação do controle de permissões no sistema DSilk.

As permissões definidas seguem a divisão de responsabilidades entre Administrador e Funcionário, restringindo ao primeiro as operações relacionadas ao gerenciamento de funcionários e mantendo as funcionalidades operacionais disponíveis para ambos os perfis.

A matriz deverá orientar o desenvolvimento e os testes de autorização, garantindo que cada perfil tenha acesso somente às funcionalidades correspondentes às suas responsabilidades.
