package com.grafica.api.model;

// Perfil de acesso (tabela perfil). O código (ADMINISTRADOR, FUNCIONARIO) é o valor gravado
// em funcionario.perfil e no token JWT; o nome é o texto exibido ao usuário.
public record Perfil(String codigo, String nome) {}
