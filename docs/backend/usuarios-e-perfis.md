# Usuários, perfis e senha em hash

Requisitos relacionados: RF-12 (Cadastrar Funcionário), RF-13 (Autenticar Funcionário) e os perfis de acesso (Administrador e Funcionário).

## 1. Modelo de dados

O **funcionário** é o usuário do sistema. Cada funcionário tem exatamente um perfil, guardado em `funcionario.perfil` (o mesmo valor que vai no token JWT e é usado pela API na autorização).

| Tabela | Coluna | Regra |
| :--- | :--- | :--- |
| `perfil` | `codigo` | Chave primária (`ADMINISTRADOR`, `FUNCIONARIO`) |
| `perfil` | `nome` | Único. Texto exibido ao usuário (`Administrador`, `Funcionário`) |
| `funcionario` | `perfil` | Obrigatório. FK para `perfil(codigo)` (`funcionario_perfil_fkey`); um perfil em uso não pode ser apagado e um perfil inexistente é recusado |
| `funcionario` | `senha_hash` | Obrigatória. Só aceita hash BCrypt (`funcionario_senha_hash_bcrypt_chk`) |

Um perfil novo é só uma linha nova na tabela `perfil`, sem alterar o schema.

## 2. Migrações

Os scripts de `init/` rodam em ordem alfabética. Os que tratam de perfis e usuários são:

| Arquivo | O que faz |
| :--- | :--- |
| `05-migracao-perfil.sql` | Adiciona a coluna `funcionario.perfil` (`ADMINISTRADOR` ou `FUNCIONARIO`) e promove o funcionário de id 1 a administrador |
| `06-migracao-perfis-usuarios.sql` | Cria a tabela `perfil`; troca as listas fixas de perfis (`CHECK`) pela chave estrangeira; converte em hash BCrypt qualquer senha em texto puro; cria a constraint que impede senha fora do formato de hash |
| `07-seed-usuarios-perfis.sql` | Garante um usuário de cada perfil, com senha de demonstração já em hash |

O `06` é **idempotente** (pode rodar mais de uma vez sem erro) e funciona de dois jeitos:

| Situação | O que fazer |
| :--- | :--- |
| Banco novo (volume vazio) | Nada. O Docker executa todos os scripts de `init/` na criação |
| Banco que já existe, com dados | Aplicar a migração sem perder dados (comandos abaixo) |

Aplicar a um banco existente (PowerShell, na raiz do repositório, com o container `db` no ar):

```powershell
docker compose cp init\06-migracao-perfis-usuarios.sql db:/tmp/06.sql
docker compose exec -T db psql -U grafica_user -d grafica -v ON_ERROR_STOP=1 -f /tmp/06.sql
```

Um banco antigo, sem a coluna `perfil`, também é tratado: o `06` cria a coluna com o perfil padrão `FUNCIONARIO`.

## 3. Senha armazenada somente em hash

- A API grava e compara senhas com **BCrypt** (`BCryptPasswordEncoder`); nenhuma rota devolve o hash.
- O banco **impede** senha em texto puro: um `INSERT` ou `UPDATE` com valor que não seja um hash BCrypt completo é recusado pela constraint `funcionario_senha_hash_bcrypt_chk` (testes T19 e T20 em `backend/testes/testes-rejeicao.sql`).
- Se o banco já tinha senha em texto puro, a migração a converte em hash e a senha continua valendo.
- Os scripts de `init/` não contêm senha em texto: o seed grava apenas o hash.

Para comprovar:

```powershell
docker compose exec -T db psql -U grafica_user -d grafica -c 'SELECT count(*) AS senhas_fora_do_formato_hash FROM funcionario WHERE senha_hash NOT LIKE ''$2%'';'
docker compose exec -T db psql -U grafica_user -d grafica -c "SELECT id, nome, left(senha_hash, 7) AS inicio_do_hash, length(senha_hash) AS tamanho FROM funcionario ORDER BY id;"
```

O primeiro deve devolver `0`. No segundo, todo `inicio_do_hash` começa com `$2` e o tamanho é `60`.

## 4. Seed: usuários para teste

| id | Nome | Perfil | Situação | Senha de demonstração |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Ana Beatriz Souza | **ADMINISTRADOR** | ativo | `123456` |
| 2 | Carlos Eduardo Lima | **FUNCIONARIO** | ativo | `123456` |
| 3 a 10 | demais funcionários de `02-seed.sql` | FUNCIONARIO | ativos, exceto os ids 7 e 9 (inativos) | definida em `init/03-senhas-demo.sql` |

A senha `123456` é só para demonstração; no banco ela existe apenas como hash.

```powershell
docker compose exec -T db psql -U grafica_user -d grafica -c "SELECT f.id, f.nome, p.nome AS perfil, f.ativo FROM funcionario f JOIN perfil p ON p.codigo = f.perfil ORDER BY f.id;"
```

## 5. Verificação automática

O script `scripts/validar-banco.ps1` confere, a cada execução: 8 tabelas, 2 perfis, 1 administrador e 9 funcionários no seed, nenhuma senha fora do formato de hash e a presença da constraint que bloqueia texto puro.

## 6. Pendência de requisitos

O RF-12 prevê que a opção "Adicionar funcionário" fica na tela inicial, antes da autenticação, enquanto a matriz de permissões reserva "Gerenciar funcionários" ao Administrador. A API segue a matriz: `POST /funcionarios` exige token de Administrador. A equipe de requisitos precisa ajustar o texto do RF-12.

## 7. Camada de acesso a dados

O acesso ao banco das entidades **funcionário** e **perfil** fica no pacote `com.grafica.api.repository`. Os controllers delegam a esses repositórios todo o SQL dessas entidades.

| Repositório | Operações |
| :--- | :--- |
| `PerfilRepository` | `listar`, `buscarPorCodigo`, `existe` |
| `FuncionarioRepository` | `listarAtivos`, `listarTodos`, `buscarPorId`, `buscarCredenciais`, `cadastrar`, `atualizar`, `atualizarSenha` |

- O hash da senha só sai do banco por `FuncionarioRepository.buscarCredenciais`, usado na autenticação. Os demais métodos devolvem `Funcionario`, que não tem senha.
- `cadastrar` e `atualizarSenha` recebem a senha já em hash BCrypt, e o banco recusa qualquer outro formato.
- O perfil informado em `POST /funcionarios` é validado na tabela `perfil` (`PerfilRepository.existe`): um perfil novo é só uma linha nova na tabela, sem mexer no código.
- Material, serviço, cliente, orçamento e planejamento continuam com SQL nos próprios controllers.
