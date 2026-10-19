# Dsilk — Sistema de Gestão para Gráfica (PI2 - Equipe 10)

Sistema integrado de gestão para gráficas e comunicação visual, cobrindo o fluxo completo desde autenticação de operadores, controle de insumos e fichas técnicas de serviços personalizados, até cálculo automatizado de orçamentos e planejamento semanal da produção.

---

## 🚀 Arquitetura do Projeto

- **Frontend**: Single Page Application em React 18, TypeScript, Vite e Axios com interceptors de JWT.
- **Backend**: API REST em Java 21 com Spring Boot e `spring-boot-starter-jdbc` (`JdbcClient`).
- **Banco de Dados**: PostgreSQL 16 com relacionamentos, chaves estrangeiras (`ON DELETE CASCADE`), restrições de unicidade (`UNIQUE`) e índices de busca.
- **Conteinerização**: Docker e Docker Compose multi-serviço (`db`, `backend`, `frontend`).

---

## 📚 Documentação das Entregas

- [Documentação das Entregas de Frontend (Frontend 1, 2 e 3)](file:///home/josue/Documentos/codigos/pi2-2026-2-equipe-10/DOCUMENTACAO-FRONTEND.md)
- [Documentação Geral de Requisitos e Modelagem](file:///home/josue/Documentos/codigos/pi2-2026-2-equipe-10/docs/README.md)
- [Mapeamento de Rotas e Contratos de API](file:///home/josue/Documentos/codigos/pi2-2026-2-equipe-10/docs/mapeamento-de-rotas.md)
- [Matriz de Rastreabilidade](file:///home/josue/Documentos/codigos/pi2-2026-2-equipe-10/docs/matriz-rastreabilidade-dsilk.md)

---

## 🛠️ Como Executar o Sistema

Para subir todos os serviços simultaneamente através do Docker:

```bash
docker compose up --build
```

### Serviços Disponíveis:
- **Frontend SPA**: [http://localhost:5173](http://localhost:5173)
- **API Backend**: [http://localhost:3000](http://localhost:3000)
- **PostgreSQL**: `localhost:5433` (Database: `grafica`, User: `grafica_user`)

---

## 🖥️ Módulos e Telas do Sistema (Sem Mock)

1. **Autenticação**: Seleção de operadores ativos e login com hash BCrypt e emissão de JWT.
2. **Materiais**: Catálogo e cadastro/edição de insumos com unidade de medida e custos unitários.
3. **Clientes**: Gestão e cadastro de clientes para vinculação de orçamentos e serviços.
4. **Serviços**: Catálogo de serviços por metragem ou composição e configuração interativa de ficha técnica.
5. **Orçamentos**: Calculadora de custos baseada em regras de negócio e geração de propostas/rascunhos.
6. **Planejamento Semanal**: Calendário interativo de produção gráfica por dias da semana.
