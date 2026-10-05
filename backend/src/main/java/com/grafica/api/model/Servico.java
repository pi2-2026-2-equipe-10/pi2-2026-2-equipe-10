package com.grafica.api.model;

import java.util.List;

public record Servico(
    int id,
    String nome,
    String tipoCalculo,
    Integer materialId,
    Double tempoOperacaoHoras,
    Double custoHoraOperacao,
    Material material,
    List<ItemComposicao> itens
) {}
