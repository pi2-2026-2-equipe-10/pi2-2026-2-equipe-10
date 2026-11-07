package com.grafica.api.controller;

import com.grafica.api.exception.ApiException;
import com.grafica.api.security.JwtUtil;
import com.grafica.api.util.Validacao;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@Tag(name = "Funcionários e Autenticação", description = "Endpoints de autenticação, listagem e cadastro de colaboradores com RBAC")
public class FuncionarioController {

    public record FuncionarioResumo(int id, String nome, String perfil) {}

    public record FuncionarioCriado(int id, String nome, String perfil, boolean ativo) {}

    public record LoginResposta(String token, FuncionarioResumo funcionario) {}

    private record LinhaLogin(int id, String nome, String senhaHash, boolean ativo, String perfil) {}

    private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder();

    private final JdbcClient jdbc;

    public FuncionarioController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    // GET /funcionarios — só ativos, em ordem alfabética, sem expor senha
    @GetMapping("/funcionarios")
    @Operation(summary = "Listar funcionários ativos (RF013)", description = "Retorna a lista de colaboradores ativos para seleção na tela de login.")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    public List<FuncionarioResumo> listar() {
        return jdbc.sql("SELECT id, nome, perfil FROM funcionario WHERE ativo = TRUE ORDER BY nome")
                .query((rs, i) -> new FuncionarioResumo(
                        rs.getInt("id"),
                        rs.getString("nome"),
                        rs.getString("perfil") != null ? rs.getString("perfil") : "FUNCIONARIO"))
                .list();
    }

    // POST /login
    @PostMapping("/login")
    @Operation(summary = "Autenticar funcionário (RF013)", description = "Valida o funcionário e senha, retornando token JWT assinado válido por 12h contendo o perfil de acesso.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Autenticação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Campos obrigatórios ausentes"),
            @ApiResponse(responseCode = "401", description = "Credenciais inválidas ou funcionário inativo")
    })
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

        LinhaLogin f = jdbc.sql("SELECT id, nome, senha_hash, ativo, perfil FROM funcionario WHERE id = :id")
                .param("id", id.intValue())
                .query((rs, i) -> new LinhaLogin(
                        rs.getInt("id"),
                        rs.getString("nome"),
                        rs.getString("senha_hash"),
                        rs.getBoolean("ativo"),
                        rs.getString("perfil") != null ? rs.getString("perfil") : "FUNCIONARIO"))
                .optional()
                .orElse(null);

        if (f == null || !f.ativo()) {
            throw new ApiException(401, "Funcionário não encontrado ou inativo.");
        }
        if (!ENCODER.matches(senha, f.senhaHash())) {
            throw new ApiException(401, "Senha incorreta.");
        }

        String token = JwtUtil.gerar(f.id(), f.nome(), f.perfil());
        return new LoginResposta(token, new FuncionarioResumo(f.id(), f.nome(), f.perfil()));
    }

    // POST /funcionarios (RF012 - Cadastrar Funcionário)
    // Conforme matriz de requisitos (docs/perfis-de-acesso.md), apenas ADMINISTRADOR pode gerenciar funcionários.
    @PostMapping("/funcionarios")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cadastrar funcionário (RF012)", description = "Cadastra um novo colaborador no sistema. Exige autenticação com perfil ADMINISTRADOR (retorna 403 Forbidden para perfil FUNCIONARIO).")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Funcionário cadastrado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Campos obrigatórios ausentes ou perfil inválido"),
            @ApiResponse(responseCode = "401", description = "Não autenticado ou token inválido"),
            @ApiResponse(responseCode = "403", description = "Acesso negado: perfil não possui permissão")
    })
    public FuncionarioCriado cadastrar(@RequestBody(required = false) Map<String, Object> corpo) {
        Object nomeObj = corpo == null ? null : corpo.get("nome");
        Object senhaObj = corpo == null ? null : corpo.get("senha");
        Object perfilObj = corpo == null ? null : corpo.get("perfil");
        Object ativoObj = corpo == null ? null : corpo.get("ativo");

        if (!Validacao.textoObrigatorio(nomeObj)) {
            throw new ApiException(400, "O campo 'nome' é obrigatório.");
        }
        if (!Validacao.textoObrigatorio(senhaObj)) {
            throw new ApiException(400, "O campo 'senha' é obrigatório.");
        }

        String nome = ((String) nomeObj).trim();
        String senha = (String) senhaObj;

        String perfil = "FUNCIONARIO";
        if (perfilObj != null && !((String) perfilObj).toString().isBlank()) {
            String p = ((String) perfilObj).toString().trim().toUpperCase();
            if (!"ADMINISTRADOR".equals(p) && !"FUNCIONARIO".equals(p)) {
                throw new ApiException(400, "Perfil inválido. Utilize 'ADMINISTRADOR' ou 'FUNCIONARIO'.");
            }
            perfil = p;
        }

        boolean ativo = ativoObj == null || Boolean.TRUE.equals(ativoObj);
        String hash = ENCODER.encode(senha);

        int novoId = jdbc.sql("""
                INSERT INTO funcionario (nome, senha_hash, ativo, perfil)
                VALUES (:nome, :hash, :ativo, :perfil) RETURNING id
                """)
                .param("nome", nome)
                .param("hash", hash)
                .param("ativo", ativo)
                .param("perfil", perfil)
                .query(Integer.class)
                .single();

        return new FuncionarioCriado(novoId, nome, perfil, ativo);
    }
}
