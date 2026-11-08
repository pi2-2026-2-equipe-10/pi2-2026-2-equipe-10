# Verificação em Dispositivo Real das Telas em Rede Local — Dsilk

Este documento atende ao critério de avaliação de **Frontend 3**, registrando a metodologia, a configuração de rede, o roteiro de execução e as evidências de validação do sistema **Dsilk** em um **dispositivo real (smartphone/tablet)** conectado à rede local.

---

## 1. Configuração do Ambiente e Acesso em Rede

Para permitir que dispositivos conectados à mesma rede Wi-Fi/Ethernet acessem a aplicação simultaneamente:

1. **Frontend (Vite):** configurado em `dsilk-frontend/vite.config.ts` com `server.host: '0.0.0.0'` e porta `5173`.
2. **Backend (Spring Boot):** executando em container Docker com portas mapeadas (`0.0.0.0:3000`).
3. **CORS:** configurado no `WebConfig.java` para aceitar origens da rede local e localhost.

### Como identificar o IP e conectar o dispositivo:
No terminal da máquina host:
```bash
# Linux
ip route get 1.1.1.1 | awk '{print $7}'
# Windows
ipconfig (IPv4 Address)
```
No navegador do dispositivo móvel (Chrome/Safari), acessa-se:
`http://<IP-LOCAL>:5173` (Exemplo: `http://192.168.1.15:5173`).

---

## 2. Roteiro e Checklist de Telas Verificadas em Dispositivo Real

| # | Tela / Fluxo | Rota | Comportamento no Dispositivo Móvel | Status |
|---|---|---|---|:---:|
| 1 | **Login & Autenticação** | `/login` | Ajuste responsivo ao teclado virtual, dropdown touch nativo para seleção de funcionários e banner de aviso quando a sessão expira. | 🟢 Aprovado |
| 2 | **Visão Geral** | `/overview` | Grid de 4 cards reorganizado em coluna única sem quebra de texto, gráfico de barras com suporte a toque e tabela de pedidos recentes adaptada. | 🟢 Aprovado |
| 3 | **Catálogo de Materiais** | `/materials` | Tabela com rolagem horizontal suave (*overflow-x: auto*), botões de ação com alvos de toque superiores a 44px (requisito de acessibilidade móvel). | 🟢 Aprovado |
| 4 | **Cadastro de Materiais** | `/materials/new` | Formulário vertical, inputs numéricos acionando o teclado numérico virtual nativo para agilizar a digitação de custos. | 🟢 Aprovado |
| 5 | **Catálogo de Serviços** | `/services` | Alternância suave entre serviços por metragem e composição técnica, botões de ação e modal de composição touch-friendly. | 🟢 Aprovado |
| 6 | **Calculadora de Orçamento** | `/budgets/new` | Layout dividido em 2 colunas no desktop é empilhado verticalmente no celular (Passo 1 $\rightarrow$ Passo 2 $\rightarrow$ Resumo da Proposta fixado na base). | 🟢 Aprovado |
| 7 | **Lista de Orçamentos** | `/budgets` | Visualização clara de badges de status (*Rascunho* vs *Registrado*), formatação monetária e botão de ação rápida. | 🟢 Aprovado |
| 8 | **Planejamento Semanal** | `/planning` | Os 7 dias da semana (segunda a domingo) são apresentados em cards sanfonados/empilhados, facilitando a visualização no smartphone pelo operador de produção. | 🟢 Aprovado |

---

## 3. Verificação de Tratamento de Sessão Expirada (401) e Permissão Negada (403)

- **Sessão Expirada (401):** Quando o token expira, a requisição é interceptada pelo Axios, a sessão local é limpa e o usuário é redirecionado para a tela de login com o banner informativo do Design:
  > *"Sua sessão expirou por inatividade ou segurança. Faça login novamente para continuar."*
- **Acesso Negado (403):** Se um usuário com perfil `FUNCIONARIO` tentar acessar ou executar ações restritas, o sistema apresenta um alerta visual no topo da interface:
  > *"Acesso negado: seu perfil de usuário não tem permissão para realizar esta operação."*

---

## 4. Adaptação da Interface ao Perfil do Usuário

No dispositivo real, comprovou-se que:
- Quando logado como **Administrador (Ana Beatriz Souza)**: o badge do usuário exibe `"Administrador"` e o botão `+ Colaborador` fica disponível para cadastro de novos membros da equipe.
- Quando logado como **Funcionário (Carlos Eduardo Lima)**: o badge do usuário exibe `"Funcionário"` e **o botão de cadastrar colaboradores não aparece na tela**, garantindo que o usuário só visualize o que tem permissão para operar.

---

## 5. Conclusão

Todas as telas da sprint foram verificadas em dispositivo móvel real conectado na mesma rede local, apresentando renderização fluida, aderência visual ao protótipo do Figma, usabilidade tátil adequada e tratamento consistente de erros e perfis de acesso.
