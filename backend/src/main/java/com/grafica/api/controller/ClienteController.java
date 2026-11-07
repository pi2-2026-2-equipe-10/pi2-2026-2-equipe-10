package com.grafica.api.controller;

import com.grafica.api.exception.ApiException;
import com.grafica.api.model.Cliente;
import com.grafica.api.util.Validacao;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.*;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/clientes")
@Tag(name = "Clientes", description = "Gestão de cadastro e consulta de clientes (RF003)")
public class ClienteController {

    private final JdbcClient jdbc;

    public ClienteController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    private static Cliente mapear(ResultSet rs, int i) throws SQLException {
        return new Cliente(
                rs.getInt("id"),
                rs.getString("nome"),
                rs.getString("telefone"),
                rs.getString("email"),
                rs.getString("observacoes"));
    }

    @GetMapping
    @Operation(summary = "Listar clientes (RF003)", description = "Retorna todos os clientes cadastrados em ordem alfabética.")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    public List<Cliente> listar() {
        return jdbc.sql("SELECT id, nome, telefone, email, observacoes FROM cliente ORDER BY nome")
                .query(ClienteController::mapear)
                .list();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consultar cliente por ID (RF003)", description = "Retorna os detalhes de um cliente específico.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cliente encontrado"),
            @ApiResponse(responseCode = "400", description = "ID inválido"),
            @ApiResponse(responseCode = "404", description = "Cliente não encontrado")
    })
    public Cliente buscar(@PathVariable String id) {
        Double idNumerico = Validacao.numeroPositivo(id);
        if (idNumerico == null || idNumerico != Math.floor(idNumerico)) {
            throw new ApiException(400, "O id informado na URL é inválido.");
        }

        return jdbc.sql("SELECT id, nome, telefone, email, observacoes FROM cliente WHERE id = :id")
                .param("id", idNumerico.intValue())
                .query(ClienteController::mapear)
                .optional()
                .orElseThrow(() -> new ApiException(404, "Cliente não encontrado."));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cadastrar cliente (RF003)", description = "Cadastra um novo cliente com nome obrigatório e e-mail único.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Cliente cadastrado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Nome obrigatório ausente"),
            @ApiResponse(responseCode = "409", description = "E-mail já utilizado por outro cliente")
    })
    public Cliente cadastrar(@RequestBody(required = false) Map<String, Object> corpo) {
        Object nome = corpo == null ? null : corpo.get("nome");
        Object telefone = corpo == null ? null : corpo.get("telefone");
        Object email = corpo == null ? null : corpo.get("email");
        Object observacoes = corpo == null ? null : corpo.get("observacoes");

        if (!Validacao.textoObrigatorio(nome)) {
            throw new ApiException(400, "O campo 'nome' é obrigatório.");
        }

        String nomeLimpo = ((String) nome).trim();
        String telLimpo = telefone != null ? ((String) telefone).trim() : null;
        String emailLimpo = email != null ? ((String) email).trim() : null;
        String obsLimpa = observacoes != null ? ((String) observacoes).trim() : null;

        int novoId = jdbc.sql("""
                INSERT INTO cliente (nome, telefone, email, observacoes)
                VALUES (:nome, :telefone, :email, :obs) RETURNING id
                """)
                .param("nome", nomeLimpo)
                .param("telefone", telLimpo)
                .param("email", emailLimpo)
                .param("obs", obsLimpa)
                .query(Integer.class)
                .single();

        return new Cliente(novoId, nomeLimpo, telLimpo, emailLimpo, obsLimpa);
    }
}
