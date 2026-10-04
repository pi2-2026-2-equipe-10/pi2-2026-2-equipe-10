package com.grafica.api.controller;

import com.grafica.api.exception.ApiException;
import com.grafica.api.security.JwtUtil;
import com.grafica.api.util.Validacao;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class FuncionarioController {

    public record FuncionarioResumo(int id, String nome) {}

    public record LoginResposta(String token, FuncionarioResumo funcionario) {}

    private record LinhaLogin(int id, String nome, String senhaHash, boolean ativo) {}

    private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder();

    private final JdbcClient jdbc;

    public FuncionarioController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    // GET /funcionarios — só ativos, em ordem alfabética, sem senha
    @GetMapping("/funcionarios")
    public List<FuncionarioResumo> listar() {
        return jdbc.sql("SELECT id, nome FROM funcionario WHERE ativo = TRUE ORDER BY nome")
                .query((rs, i) -> new FuncionarioResumo(rs.getInt("id"), rs.getString("nome")))
                .list();
    }

    // POST /login
    @PostMapping("/login")
    public LoginResposta login(@RequestBody(required = false) Map<String, Object> corpo) {
        Object idBruto = corpo == null ? null : corpo.get("funcionarioId");
        Object senhaBruta = corpo == null ? null : corpo.get("senha");

        if (idBruto == null || !Validacao.textoObrigatorio(senhaBruta)) {
            throw new ApiException(400, "Informe funcionarioId e senha.");
        }
        String senha = (String) senhaBruta;

        Double id = Validacao.numero(idBruto);
        if (id == null || id != Math.floor(id)) {
            throw new ApiException(401, "Funcionário não encontrado ou inativo.");
        }

        LinhaLogin f = jdbc.sql("SELECT id, nome, senha_hash, ativo FROM funcionario WHERE id = :id")
                .param("id", id.intValue())
                .query((rs, i) -> new LinhaLogin(
                        rs.getInt("id"), rs.getString("nome"),
                        rs.getString("senha_hash"), rs.getBoolean("ativo")))
                .optional()
                .orElse(null);

        if (f == null || !f.ativo()) {
            throw new ApiException(401, "Funcionário não encontrado ou inativo.");
        }
        if (!ENCODER.matches(senha, f.senhaHash())) {
            throw new ApiException(401, "Senha incorreta.");
        }

        String token = JwtUtil.gerar(f.id(), f.nome());
        return new LoginResposta(token, new FuncionarioResumo(f.id(), f.nome()));
    }
}