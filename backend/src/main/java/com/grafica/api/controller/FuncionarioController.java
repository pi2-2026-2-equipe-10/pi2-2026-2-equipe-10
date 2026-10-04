package com.grafica.api.controller;

import com.grafica.api.data.Dados;
import com.grafica.api.exception.ApiException;
import com.grafica.api.model.Funcionario;
import com.grafica.api.security.JwtUtil;
import com.grafica.api.util.Validacao;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@RestController
public class FuncionarioController {

    public record FuncionarioResumo(int id, String nome) {}

    public record LoginResposta(String token, FuncionarioResumo funcionario) {}

    // GET /funcionarios — só ativos, em ordem alfabética, sem senha
    @GetMapping("/funcionarios")
    public List<FuncionarioResumo> listar() {
        return Dados.FUNCIONARIOS.stream()
                .filter(Funcionario::ativo)
                .sorted(Comparator.comparing(Funcionario::nome, String.CASE_INSENSITIVE_ORDER))
                .map(f -> new FuncionarioResumo(f.id(), f.nome()))
                .toList();
    }

    // POST /login
    @PostMapping("/login")
    public LoginResposta login(@RequestBody(required = false) Map<String, Object> corpo) {
        Object idBruto = corpo == null ? null : corpo.get("funcionarioId");
        Object senha = corpo == null ? null : corpo.get("senha");

        if (idBruto == null || !Validacao.textoObrigatorio(senha)) {
            throw new ApiException(400, "Informe funcionarioId e senha.");
        }

        Double id = Validacao.numero(idBruto);
        Funcionario funcionario = id == null ? null : Dados.FUNCIONARIOS.stream()
                .filter(f -> f.id() == id)
                .findFirst()
                .orElse(null);

        if (funcionario == null || !funcionario.ativo()) {
            throw new ApiException(401, "Funcionário não encontrado ou inativo.");
        }
        if (!funcionario.senha().equals(senha)) {
            throw new ApiException(401, "Senha incorreta.");
        }

        String token = JwtUtil.gerar(funcionario.id(), funcionario.nome());
        return new LoginResposta(token, new FuncionarioResumo(funcionario.id(), funcionario.nome()));
    }
}