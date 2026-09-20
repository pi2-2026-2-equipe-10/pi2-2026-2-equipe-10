### RNF-01 — Usabilidade
* **Descrição:** Pelo menos 80% dos usuários participantes do teste devem conseguir concluir a elaboração de um orçamento simples sem auxílio externo, após uma breve apresentação do sistema.
* **Métrica:** ≥ 80% de conclusão sem auxílio.

### RNF-02 — Adequação dos Campos
* **Descrição:** O sistema não deve exigir o preenchimento de campos que não sejam aplicáveis ao tipo de serviço selecionado.
* **Métrica:** Nenhum campo não aplicável deve ser obrigatório.

### RNF-03 — Tempo de Elaboração
* **Descrição:** O sistema deve permitir que um orçamento simples, baseado em metragem, seja concluído em até 2 minutos.
* **Métrica:** ≤ 2 minutos.

### RNF-04 — Desempenho
* **Descrição:** O sistema deve calcular e apresentar o resultado do orçamento em até 3 segundos após o envio dos dados necessários.
* **Métrica:** ≤ 3 segundos.

### RNF-05 — Conteinerização
* **Descrição:** A aplicação deve ser executável em ambiente conteinerizado utilizando Docker, com todos os componentes necessários para seu funcionamento configurados no ambiente.
* **Métrica:** A aplicação deve executar corretamente no ambiente Docker configurado.
