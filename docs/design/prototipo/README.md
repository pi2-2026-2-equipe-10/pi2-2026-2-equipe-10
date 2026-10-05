# 🎨 Protótipo de Interface — Dsilk (Gestão para Gráfica e Serigrafia)

> *Gestão simples para ideias que ganham forma.*[cite: 1]

Este repositório contém a documentação e a estrutura do protótipo de alta fidelidade desenvolvido para o sistema **Dsilk**[cite: 1], abrangendo os fluxos de autenticação, gestão de materiais, catálogo de serviços e cadastro de clientes[cite: 1, 2, 3, 4, 6, 7].

---

## 🔗 Link do Protótipo

- **Figma (Fluxo Navegável):** [Acessar Protótipo no Figma](https://www.figma.com/design/FF1HrAXFPJsD9gXraq0Kdi/Dsilk?node-id=0-1&t=2PtfwdmFMUihSxoW-1)
---

## 📐 Escopo do Fluxo Principal (10 Telas)

 O fluxo contempla a jornada principal de navegação do sistema:

1. **Área Administrativa (Login)**[cite: 1]
2. **Listagem de Materiais**[cite: 2]
3. **Novo Material**[cite: 3]
4. **Listagem de Serviços**[cite: 7]
5. **Novo Serviço**[cite: 8]
6. **Composição do Serviço** *(Configuração de itens/tempo)*[cite: 8]
7. **Listagem de Clientes**[cite: 4]
8. **Novo Cliente**[cite: 6]
9. **Perfil do Cliente**[cite: 5]
10. **Novo Orçamento** *(Cálculo por metragem/composição)*[cite: 5, 8]

---

## 🗺️ Mapeamento de Telas × Requisitos Funcionais

| # | Tela | Requisitos Atendidos | Elementos e Ações Principais |
|---|---|---|---|
| **1** | **Área Administrativa / Login** | RF013 | Autenticação com e-mail, senha e opção "Manter conectado"[cite: 1]. |
| **2** | **Listagem de Materiais** | RF001, RF002 | Exibição de categoria, estoque atualizado (unidades) e valor unitário (R$)[cite: 2]. |
| **3** | **Novo Material** | RF001 | Formulário com nome, categoria, estoque inicial, unidade, valor unitário e observações[cite: 3]. |
| **4** | **Listagem de Serviços** | RF004 | Tabela com tipos de serviços e indicação da forma de cálculo (Metragem ou Composição)[cite: 7]. |
| **5** | **Novo Serviço** | RF004 | Definição de nome e alternância dinâmica do botão de salvar conforme a forma de cálculo selecionada[cite: 8]. |
| **6** | **Composição do Serviço** | RF005 | Associação de materiais, insumos e tempo estimado para execução do serviço[cite: 8]. |
| **7** | **Listagem de Clientes** | RF003 | Centralização de contatos, total de pedidos e data do último pedido[cite: 4]. |
| **8** | **Novo Cliente** | RF003 | Cadastro de nome/empresa, telefone, CPF/CNPJ, e-mail e cidade[cite: 6]. |
| **9** | **Perfil do Cliente** | RF003, RF008 | Visão detalhada do cliente, resumo financeiro (total em pedidos) e histórico de produção[cite: 5]. |
| **10** | **Novo Orçamento** | RF006, RF007, RF008 | Geração de orçamento com cálculo automatizado por metragem e/ou composição de itens[cite: 5, 8]. |

---

## 🚦 Estados de Tela Representados

- **Login:** Estado padrão, carregando e mensagem de erro ("Senha incorreta")[cite: 1].
- **Listagem (Materiais, Serviços e Clientes):** Estado com dados preenchidos, estado carregando (*loading*) e estado sem registros (*empty state*)[cite: 2, 4, 7].
- **Formulários (Novo Material, Novo Cliente e Novo Serviço):** Validação de campos obrigatórios, estado de salvamento e notificação de sucesso[cite: 3, 6, 8].
- **Orçamentos:** Estados de cálculo em andamento, rascunho salvo e orçamento registrado com sucesso[cite: 5].

---

## Requisitos Fora do Escopo desta Entrega

Os seguintes requisitos estão previstos para etapas futuras da aplicação e não foram incluídos nesta entrega de prototipação:

* **RF009:** Consulta avançada e edição de orçamentos existentes.
* **RF010:** Módulo de planejamento semanal de produção.
* **RF011:** Gestão e atribuição de atividades/tarefas.
* **RF012:** Módulo de cadastro e gestão de funcionários.

---

## 📁 Estrutura de Arquivos no Repositório

```text
docs/
└── design/
    └── prototipo/
        ├── README.md               <-- Este arquivo de documentação
        ├── Dsilk_Prototipo.pdf     <-- Exportação completa em PDF
       
