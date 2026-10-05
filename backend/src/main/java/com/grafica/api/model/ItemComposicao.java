package com.grafica.api.model;

public record ItemComposicao(
    int id,
    int servicoId,
    int materialId,
    double quantidade,
    Material material
) {}
