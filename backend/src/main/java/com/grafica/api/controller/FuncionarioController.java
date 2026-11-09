package com.grafica.api.controller;

import com.grafica.api.exception.ApiException;
import com.grafica.api.model.Funcionario;
import com.grafica.api.model.Perfil;
import com.grafica.api.repository.FuncionarioRepository;
import com.grafica.api.repository.PerfilRepository;
import com.grafica.api.security.JwtUtil;
import com.grafica.api.util.Validacao;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@Tag(name = "Funcionários e Autenticação", description = "Endpoints de autenticação, listagem e cadastro de colaboradores com RBAC")
public class FuncionarioController {

    public record FuncionarioResumo(int id, String nome, String perfil) {}

    public record FuncionarioCriado(int id, String nome, String perfil, boolean ativo) {}

    public record LoginResposta(String token, FuncionarioResumo funcionario) {}

    private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder();

    private final FuncionarioRepository funcionarios;
    private final PerfilRepository perfis;

    public FuncionarioController(FuncionarioRepository funcionarios, PerfilRepository perfis) {
        this.funcionarios = funcionarios;
        this.perfis = perfis;
    }

    // GET /funcionarios — só ativos, em ordem alfabética, sem expor senha
    @GetMapping("/funcionarios")
    @Operation(summary = "Listar funcionários ativos (RF013)", description = "Retorna a lista de colaboradores ativos para seleção na tela de login.")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    public List<FuncionarioResumo> listar() {
        return funcionarios.listarAtivos().stream()
                .map(f -> new FuncionarioResumo(f.id(), f.nome(), f.perfil()))
                .toList();
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

        FuncionarioRepository.Credenciais f = funcionarios.buscarCredenciais(id.intValue()).orElse(null);

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

        // O perfil precisa existir na tabela perfil; sem perfil informado, vale FUNCIONARIO
        String perfil = "FUNCIONARIO";
        if (perfilObj != null) {
            if (!(perfilObj instanceof String texto)) {
                throw new ApiException(400, "O campo 'perfil' deve ser um texto.");
            }
            if (!texto.isBlank()) {
                String codigo = texto.trim().toUpperCase();
                if (!perfis.existe(codigo)) {
                    String validos = perfis.listar().stream().map(Perfil::codigo).collect(Collectors.joining(", "));
                    throw new ApiException(400, "Perfil inválido. Utilize um dos perfis: " + validos + ".");
                }
                perfil = codigo;
            }
        }

        boolean ativo = ativoObj == null || Boolean.TRUE.equals(ativoObj);
        String hash = ENCODER.encode(senha);

        int novoId = funcionarios.cadastrar(nome, hash, ativo, perfil);

        Funcionario criado = funcionarios.buscarPorId(novoId)
                .orElseThrow(() -> new ApiException(500, "Funcionário cadastrado, mas não encontrado em seguida."));
        return new FuncionarioCriado(criado.id(), criado.nome(), criado.perfil(), criado.ativo());
    }
}
