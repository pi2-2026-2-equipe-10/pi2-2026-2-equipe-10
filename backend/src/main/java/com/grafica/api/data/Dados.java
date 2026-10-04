package com.grafica.api.data;

import com.grafica.api.model.Funcionario;
import com.grafica.api.model.Material;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public final class Dados {

    private Dados() {}

    public static final List<Funcionario> FUNCIONARIOS = new CopyOnWriteArrayList<>(List.of(
            new Funcionario(1, "Ana", "123456", true),
            new Funcionario(2, "Carlos", "123456", true),
            new Funcionario(3, "Bruno", "123456", false)
    ));

    public static final List<Material> MATERIAIS = new CopyOnWriteArrayList<>(List.of(
            new Material(1, "Lona 440g", "m²", 18.5),
            new Material(2, "Papel couché", "folha", 0.8),
            new Material(3, "Vinil adesivo", "m²", 25)
    ));
}