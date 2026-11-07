package com.grafica.api.controller;

import com.grafica.api.exception.ApiException;
import com.grafica.api.model.Material;
import com.grafica.api.util.Validacao;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/materiais")
@Tag(name = "Materiais", description = "Gestão de insumos e matérias-primas utilizadas na produção (RF001 e RF002)")
public class MaterialController {

    private static final BigDecimal CUSTO_MAXIMO = new BigDecimal("9999999999.99");

    private final JdbcClient jdbc;

    public MaterialController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    private static Material mapear(ResultSet rs, int i) throws SQLException {
        return new Material(
                rs.getInt("id"),
                rs.getString("nome"),
                rs.getString("unidade_medida"),
                rs.getBigDecimal("custo").doubleValue());
    }

    // GET /materiais
    @GetMapping
    @Operation(summary = "Listar materiais (RF002)", description = "Retorna todos os materiais cadastrados em ordem alfabética.")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    public List<Material> listar() {
        return jdbc.sql("SELECT id, nome, unidade_medida, custo FROM material ORDER BY nome")
                .query(MaterialController::mapear)
                .list();
    }

    // GET /materiais/{id}
    @GetMapping("/{id}")
    @Operation(summary = "Consultar material por ID (RF002)", description = "Retorna os detalhes de um material específico.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Material encontrado"),
            @ApiResponse(responseCode = "400", description = "ID inválido"),
            @ApiResponse(responseCode = "404", description = "Material não encontrado")
    })
    public Material buscar(@PathVariable String id) {
        Double idNumerico = Validacao.numeroPositivo(id);
        if (idNumerico == null || idNumerico != Math.floor(idNumerico)) {
            throw new ApiException(400, "O id informado na URL é inválido.");
        }

        return jdbc.sql("SELECT id, nome, unidade_medida, custo FROM material WHERE id = :id")
                .param("id", idNumerico.intValue())
                .query(MaterialController::mapear)
                .optional()
                .orElseThrow(() -> new ApiException(404, "Material não encontrado."));
    }

    // POST /materiais
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cadastrar material (RF001)", description = "Cadastra um novo material com nome único, unidade de medida e custo positivo.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Material criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados ausentes ou inválidos"),
            @ApiResponse(responseCode = "409", description = "Material com o mesmo nome já cadastrado")
    })
    public Material cadastrar(@RequestBody(required = false) Map<String, Object> corpo) {
        Object nome = corpo == null ? null : corpo.get("nome");
        Object unidade = corpo == null ? null : corpo.get("unidadeMedida");
        Object custo = corpo == null ? null : corpo.get("custo");

        if (!Validacao.textoObrigatorio(nome)) {
            throw new ApiException(400, "O campo 'nome' é obrigatório.");
        }
        if (!Validacao.textoObrigatorio(unidade)) {
            throw new ApiException(400, "O campo 'unidadeMedida' é obrigatório.");
        }
        Double custoNumerico = Validacao.numeroPositivo(custo);
        if (custoNumerico == null) {
            throw new ApiException(400, "O campo 'custo' é obrigatório e deve ser maior que zero.");
        }

        BigDecimal custoDb = BigDecimal.valueOf(custoNumerico).setScale(2, RoundingMode.HALF_UP);
        if (custoDb.compareTo(CUSTO_MAXIMO) > 0) {
            throw new ApiException(400, "O campo 'custo' excede o valor máximo permitido.");
        }

        String nomeLimpo = ((String) nome).trim();
        String unidadeLimpa = ((String) unidade).trim();

        int novoId = jdbc.sql("""
                INSERT INTO material (nome, unidade_medida, custo)
                VALUES (:nome, :unidade, :custo) RETURNING id
                """)
                .param("nome", nomeLimpo)
                .param("unidade", unidadeLimpa)
                .param("custo", custoDb)
                .query(Integer.class)
                .single();

        return new Material(novoId, nomeLimpo, unidadeLimpa, custoDb.doubleValue());
    }

    // PUT /materiais/{id}
    @PutMapping("/{id}")
    @Operation(summary = "Editar material (RF002)", description = "Atualiza os dados de um material existente.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Material atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados ausentes ou inválidos"),
            @ApiResponse(responseCode = "404", description = "Material não encontrado"),
            @ApiResponse(responseCode = "409", description = "Nome já utilizado por outro material")
    })
    public Material atualizar(@PathVariable String id, @RequestBody(required = false) Map<String, Object> corpo) {
        Double idNumerico = Validacao.numeroPositivo(id);
        if (idNumerico == null || idNumerico != Math.floor(idNumerico)) {
            throw new ApiException(400, "O id informado na URL é inválido.");
        }

        buscar(id);

        Object nome = corpo == null ? null : corpo.get("nome");
        Object unidade = corpo == null ? null : corpo.get("unidadeMedida");
        Object custo = corpo == null ? null : corpo.get("custo");

        if (!Validacao.textoObrigatorio(nome)) {
            throw new ApiException(400, "O campo 'nome' é obrigatório.");
        }
        if (!Validacao.textoObrigatorio(unidade)) {
            throw new ApiException(400, "O campo 'unidadeMedida' é obrigatório.");
        }
        Double custoNumerico = Validacao.numeroPositivo(custo);
        if (custoNumerico == null) {
            throw new ApiException(400, "O campo 'custo' é obrigatório e deve ser maior que zero.");
        }

        BigDecimal custoDb = BigDecimal.valueOf(custoNumerico).setScale(2, RoundingMode.HALF_UP);
        if (custoDb.compareTo(CUSTO_MAXIMO) > 0) {
            throw new ApiException(400, "O campo 'custo' excede o valor máximo permitido.");
        }

        String nomeLimpo = ((String) nome).trim();
        String unidadeLimpa = ((String) unidade).trim();

        jdbc.sql("""
                UPDATE material
                SET nome = :nome, unidade_medida = :unidade, custo = :custo
                WHERE id = :id
                """)
                .param("nome", nomeLimpo)
                .param("unidade", unidadeLimpa)
                .param("custo", custoDb)
                .param("id", idNumerico.intValue())
                .update();

        return new Material(idNumerico.intValue(), nomeLimpo, unidadeLimpa, custoDb.doubleValue());
    }
}
