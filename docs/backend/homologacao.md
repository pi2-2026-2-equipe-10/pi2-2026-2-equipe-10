# Homologação na rede local e validação do banco

## 1. Rotas ligadas ao front conteinerizado

| Rota | Tela do front | Serviço do front |
| :--- | :--- | :--- |
| `GET /funcionarios` | Login: lista de funcionários ativos para escolher o nome | `authService.getFuncionarios` |
| `POST /login` | Login: nome + senha, devolve o token JWT usado nas demais telas | `authService.login` |

O front roda em container (nginx) e conversa com o backend, também em container, pela rede interna do Docker.

## 2. Arquitetura da homologação

```
Outra máquina (navegador)
   │  http://<IP-da-máquina>:8080
   ▼
Container frontend (nginx, porta 80 → publicada em 8080)
   │  /            → arquivos estáticos da aplicação React
   │  /api/...     → proxy para o backend, sem o prefixo /api
   ▼
Container backend (Spring Boot, porta 3000)
   │  JDBC
   ▼
Container db (PostgreSQL 16) ── volume grafica_db_prod_data
```

O navegador só precisa conhecer o endereço do front. Como a API é chamada em `/api` (mesma origem), **não há CORS nem IP gravado no build**: o mesmo build funciona em `localhost` e em qualquer endereço da rede. Isso é feito por duas peças em `dsilk-frontend/`: o `Dockerfile` (build com `VITE_API_URL=/api`) e o `nginx.conf` (bloco `location /api/`).

## 3. Subir a stack de homologação

A stack de homologação é a do `docker-compose.prod.yml` (front em nginx, porta 8080). Ela usa as mesmas portas 3000 e 5433 da stack de desenvolvimento, então **derrube a de desenvolvimento antes**:

```powershell
docker compose down
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```

Os três serviços (`db`, `backend`, `frontend`) devem aparecer como `Up`.

## 4. Descobrir o endereço da máquina

```powershell
ipconfig | Select-String "IPv4"
```

Use o IPv4 da placa de rede local (Wi-Fi ou Ethernet), por exemplo `192.168.0.2`. Ignore os adaptadores virtuais (WSL e Hyper-V, normalmente `172.x.x.x`). Se o roteador mudar o IP da máquina, repita este passo.

## 5. Liberar o firewall do Windows

Em um PowerShell aberto **como administrador**:

```powershell
New-NetFirewallRule -DisplayName "Dsilk homologacao" -Direction Inbound -Protocol TCP -LocalPort 8080,3000 -Action Allow -Profile Private
```

A regra só vale para redes classificadas como **Privada**. Para conferir e, se preciso, ajustar:

```powershell
Get-NetConnectionProfile
Set-NetConnectionProfile -InterfaceAlias "Wi-Fi" -NetworkCategory Private
```

Ao terminar a homologação, remova a regra:

```powershell
Remove-NetFirewallRule -DisplayName "Dsilk homologacao"
```

## 6. Testar

**Na própria máquina**

```powershell
curl.exe http://localhost:8080/api/funcionarios
curl.exe http://192.168.0.2:8080/api/funcionarios
```

Os dois devem devolver a lista JSON de funcionários ativos. Depois abra `http://192.168.0.2:8080` no navegador e entre com um funcionário.

**De outra máquina ou celular na mesma rede**

1. Abra `http://<IP-da-máquina>:8080`.
2. A lista de funcionários deve aparecer na tela de login (rota `GET /funcionarios`).
3. Escolha um funcionário, informe a senha e entre (rota `POST /login`).
4. Abra a lista de materiais para confirmar que o token funciona nas rotas protegidas.

| Resultado | Significa |
| :--- | :--- |
| A página nem abre | Firewall ou IP errado (seções 4 e 5) |
| A página abre, mas a lista de funcionários não carrega | Proxy `/api` ou backend fora do ar (`docker compose -f docker-compose.prod.yml logs backend frontend`) |
| Login funciona e materiais carregam | Homologação OK |

## 7. Validação do setup do banco (migração e volumes)

O banco é criado pelos scripts de `init/` (`01-schema.sql`, `02-seed.sql`, `03-senhas-demo.sql`, `04-recalcula-custos.sql`), executados pelo PostgreSQL na **primeira** subida de um volume vazio. Os dados ficam no volume nomeado `grafica_db_data` (desenvolvimento) ou `grafica_db_prod_data` (homologação).

O script `scripts/validar-banco.ps1` comprova esse comportamento em quatro etapas. Na raiz do repositório:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\validar-banco.ps1
```

> O script usa `down -v`: apaga os dados do volume (o seed os recria). Para validar a stack de homologação, acrescente `-ComposeFile docker-compose.prod.yml`.

| Etapa | O que o script faz | O que comprova |
| :--- | :--- | :--- |
| 1 | `down -v` + `up` | O schema (7 tabelas), o seed (10 registros por tabela), as restrições UNIQUE e o recálculo dos custos são aplicados do zero pelos scripts de `init/` |
| 2 | Grava um dado e reinicia o container | O dado sobrevive ao `restart` |
| 3 | `down` (sem `-v`) + `up` | O volume persiste e os scripts de `init/` **não** rodam de novo (sem duplicar o seed) |
| 4 | `down -v` + `up` | Apagar o volume descarta o dado gravado e recria o banco a partir dos scripts |

Consequência para o time: uma mudança nos scripts de `init/` **só é aplicada em um banco novo**. Quem já tem o volume precisa rodar `docker compose down -v` e subir de novo.

## 8. Pontos de atenção para os próximos ciclos

- O segredo do JWT (`JwtUtil.java`) e as senhas do banco estão fixos no repositório, aceitável apenas em desenvolvimento e homologação interna. Para uso real, devem vir de variáveis de ambiente.
- O IP da máquina pode mudar a cada conexão. Para demonstrações, vale reservar o IP no roteador.
