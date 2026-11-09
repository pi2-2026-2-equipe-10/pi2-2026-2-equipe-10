package com.grafica.api.model;

// Funcionário (usuário do sistema), sem a senha. O hash da senha só circula em
// FuncionarioRepository.Credenciais, usado exclusivamente na autenticação.
public record Funcionario(int id, String nome, String perfil, boolean ativo) {}
