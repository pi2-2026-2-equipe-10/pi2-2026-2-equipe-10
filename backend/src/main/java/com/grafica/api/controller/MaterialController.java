package com.grafica.api.controller;

import com.grafica.api.exception.ApiException;
import com.grafica.api.model.Material;
import com.grafica.api.util.Validacao;
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
    public List<Material> listar() {
        return jdbc.sql("SELECT id, nome, unidade_medida, custo FROM material ORDER BY nome")
                .query(MaterialController::mapear)
                .list();
    }

    // GET /materiais/{id}
    @GetMapping("/{id}")
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