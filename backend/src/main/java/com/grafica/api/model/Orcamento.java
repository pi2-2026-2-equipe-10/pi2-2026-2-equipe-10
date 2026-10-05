package com.grafica.api.model;

public record Orcamento(
    int id,
    Integer clienteId,
    Integer servicoId,
    Double largura,
    Double altura,
    Double custoTotal,
    boolean rascunho,
    String criadoEm,
    Cliente cliente,
    Servico servico
) {}
