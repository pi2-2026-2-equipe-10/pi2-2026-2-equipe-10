package com.grafica.api.controller;

import com.grafica.api.exception.ApiException;
import com.grafica.api.model.ItemComposicao;
import com.grafica.api.model.Material;
import com.grafica.api.model.Servico;
import com.grafica.api.util.Validacao;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/servicos")
@Tag(name = "Serviços e Composições", description = "Catálogo de serviços gráficos e fichas técnicas de composição (RF004 e RF005)")
public class ServicoController {

    private final JdbcClient jdbc;

    public ServicoController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    // Item de composição já validado (RN-02), pronto para gravar
    private record ItemValidado(int materialId, BigDecimal quantidade) {}

    private static Material mapearMaterial(ResultSet rs, int i) throws SQLException {
        return new Material(
                rs.getInt("m_id"),
                rs.getString("m_nome"),
                rs.getString("m_unidade"),
                rs.getBigDecimal("m_custo").doubleValue());
    }

    @GetMapping
    @Operation(summary = "Listar serviços (RF004)", description = "Retorna todos os serviços cadastrados na gráfica.")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    public List<Servico> listar() {
        return jdbc.sql("""
                SELECT s.id, s.nome, s.tipo_calculo, s.material_id, s.tempo_operacao_horas, s.custo_hora_operacao,
                       m.id as m_id, m.nome as m_nome, m.unidade_medida as m_unidade, m.custo as m_custo
                FROM servico s
                LEFT JOIN material m ON s.material_id = m.id
                ORDER BY s.nome
                """)
                .query((rs, i) -> {
                    Material mat = null;
                    if (rs.getObject("m_id") != null) {
                        mat = new Material(
                                rs.getInt("m_id"),
                                rs.getString("m_nome"),
                                rs.getString("m_unidade"),
                                rs.getBigDecimal("m_custo").doubleValue());
                    }
                    Double tempo = rs.getObject("tempo_operacao_horas") != null ? rs.getBigDecimal("tempo_operacao_horas").doubleValue() : null;
                    Double custoHora = rs.getObject("custo_hora_operacao") != null ? rs.getBigDecimal("custo_hora_operacao").doubleValue() : null;

                    return new Servico(
                            rs.getInt("id"),
                            rs.getString("nome"),
                            rs.getString("tipo_calculo"),
                            rs.getObject("material_id") != null ? rs.getInt("material_id") : null,
                            tempo,
                            custoHora,
                            mat,
                            List.of());
                })
                .list();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consultar serviço por ID (RF004/RF005)", description = "Retorna os detalhes de um serviço com materiais vinculados e itens da composição.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Serviço encontrado"),
            @ApiResponse(responseCode = "400", description = "ID inválido"),
            @ApiResponse(responseCode = "404", description = "Serviço não encontrado")
    })
    public Servico buscar(@PathVariable String id) {
        Double idNumerico = Validacao.numeroPositivo(id);
        if (idNumerico == null || idNumerico != Math.floor(idNumerico)) {
            throw new ApiException(400, "O id informado na URL é inválido.");
        }

        Servico s = jdbc.sql("""
                SELECT s.id, s.nome, s.tipo_calculo, s.material_id, s.tempo_operacao_horas, s.custo_hora_operacao,
                       m.id as m_id, m.nome as m_nome, m.unidade_medida as m_unidade, m.custo as m_custo
                FROM servico s
                LEFT JOIN material m ON s.material_id = m.id
                WHERE s.id = :id
                """)
                .param("id", idNumerico.intValue())
                .query((rs, i) -> {
                    Material mat = null;
                    if (rs.getObject("m_id") != null) {
                        mat = new Material(
                                rs.getInt("m_id"),
                                rs.getString("m_nome"),
                                rs.getString("m_unidade"),
                                rs.getBigDecimal("m_custo").doubleValue());
                    }
                    Double tempo = rs.getObject("tempo_operacao_horas") != null ? rs.getBigDecimal("tempo_operacao_horas").doubleValue() : null;
                    Double custoHora = rs.getObject("custo_hora_operacao") != null ? rs.getBigDecimal("custo_hora_operacao").doubleValue() : null;

                    return new Servico(
                            rs.getInt("id"),
                            rs.getString("nome"),
                            rs.getString("tipo_calculo"),
                            rs.getObject("material_id") != null ? rs.getInt("material_id") : null,
                            tempo,
                            custoHora,
                            mat,
                            new ArrayList<>());
                })
                .optional()
                .orElseThrow(() -> new ApiException(404, "Serviço não encontrado."));

        if ("COMPOSICAO".equalsIgnoreCase(s.tipoCalculo())) {
            List<ItemComposicao> itens = jdbc.sql("""
                    SELECT ic.id, ic.servico_id, ic.material_id, ic.quantidade,
                           m.id as m_id, m.nome as m_nome, m.unidade_medida as m_unidade, m.custo as m_custo
                    FROM item_composicao ic
                    INNER JOIN material m ON ic.material_id = m.id
                    WHERE ic.servico_id = :servicoId
                    ORDER BY m.nome
                    """)
                    .param("servicoId", s.id())
                    .query((rs, i) -> {
                        Material mat = new Material(
                                rs.getInt("m_id"),
                                rs.getString("m_nome"),
                                rs.getString("m_unidade"),
                                rs.getBigDecimal("m_custo").doubleValue());
                        return new ItemComposicao(
                                rs.getInt("id"),
                                rs.getInt("servico_id"),
                                rs.getInt("material_id"),
                                rs.getBigDecimal("quantidade").doubleValue(),
                                mat);
                    })
                    .list();

            return new Servico(
                    s.id(), s.nome(), s.tipoCalculo(), s.materialId(),
                    s.tempoOperacaoHoras(), s.custoHoraOperacao(), s.material(), itens);
        }

        return s;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cadastrar serviço personalizado (RF004)", description = "Cadastra um serviço definindo o tipo de cálculo ('METRAGEM' ou 'COMPOSICAO').")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Serviço criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados ausentes ou tipo de cálculo inválido"),
            @ApiResponse(responseCode = "404", description = "Material de metragem não encontrado")
    })
    public Servico cadastrar(@RequestBody(required = false) Map<String, Object> corpo) {
        Object nome = corpo == null ? null : corpo.get("nome");
        Object tipoCalculo = corpo == null ? null : corpo.get("tipoCalculo");
        Object materialId = corpo == null ? null : corpo.get("materialId");

        if (!Validacao.textoObrigatorio(nome)) {
            throw new ApiException(400, "O campo 'nome' é obrigatório.");
        }
        if (!Validacao.textoObrigatorio(tipoCalculo)) {
            throw new ApiException(400, "O campo 'tipoCalculo' é obrigatório ('METRAGEM' ou 'COMPOSICAO').");
        }

        String tipo = ((String) tipoCalculo).trim().toUpperCase();
        if (!"METRAGEM".equals(tipo) && !"COMPOSICAO".equals(tipo)) {
            throw new ApiException(400, "Tipo de cálculo inválido. Use 'METRAGEM' ou 'COMPOSICAO'.");
        }

        Integer matId = null;
        if ("METRAGEM".equals(tipo)) {
            Double matNum = Validacao.numeroPositivo(materialId);
            if (matNum == null) {
                throw new ApiException(400, "O campo 'materialId' é obrigatório para serviços do tipo METRAGEM.");
            }
            boolean matExiste = jdbc.sql("SELECT COUNT(*) FROM material WHERE id = :id")
                    .param("id", matNum.intValue())
                    .query(Integer.class)
                    .single() > 0;
            if (!matExiste) {
                throw new ApiException(404, "Material informado não encontrado.");
            }
            matId = matNum.intValue();
        }

        String nomeLimpo = ((String) nome).trim();

        int novoId = jdbc.sql("""
                INSERT INTO servico (nome, tipo_calculo, material_id)
                VALUES (:nome, :tipo::tipo_calculo_enum, :materialId) RETURNING id
                """)
                .param("nome", nomeLimpo)
                .param("tipo", tipo)
                .param("materialId", matId)
                .query(Integer.class)
                .single();

        return buscar(String.valueOf(novoId));
    }

    // PUT /servicos/{id}/composicao (RF005, RN-01, RN-02)
    @PutMapping("/{id}/composicao")
    @Transactional
    @Operation(summary = "Configurar composição do serviço (RF005)", description = "Define a ficha técnica de insumos, quantidades e tempo de operação de serviços por composição.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Composição gravada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Serviço não é do tipo COMPOSICAO ou itens inválidos"),
            @ApiResponse(responseCode = "404", description = "Serviço ou material não encontrado")
    })
    public Servico configurarComposicao(@PathVariable String id, @RequestBody(required = false) Map<String, Object> corpo) {
        Servico servico = buscar(id);

        if (!"COMPOSICAO".equalsIgnoreCase(servico.tipoCalculo())) {
            throw new ApiException(400, "Apenas serviços com tipo de cálculo 'COMPOSICAO' podem ter composição configurada.");
        }

        Object itensObj = corpo == null ? null : corpo.get("itens");
        if (!(itensObj instanceof List<?> listaItens) || listaItens.isEmpty()) {
            throw new ApiException(400, "Informe ao menos um material na composição.");
        }

        Object tempoObj = corpo.get("tempoOperacaoHoras");
        Object custoHoraObj = corpo.get("custoHoraOperacao");

        BigDecimal tempoDb = null;
        BigDecimal custoHoraDb = null;

        if (tempoObj != null) {
            Double tempoNum = Validacao.numeroPositivo(tempoObj);
            if (tempoNum != null) {
                tempoDb = BigDecimal.valueOf(tempoNum).setScale(2, RoundingMode.HALF_UP);
                Double custoHoraNum = Validacao.numeroPositivo(custoHoraObj);
                if (custoHoraNum == null) {
                    throw new ApiException(400, "Informe o 'custoHoraOperacao' quando 'tempoOperacaoHoras' for preenchido.");
                }
                custoHoraDb = BigDecimal.valueOf(custoHoraNum).setScale(2, RoundingMode.HALF_UP);
            }
        }

        List<ItemValidado> validados = new ArrayList<>();
        for (Object itemObj : listaItens) {
            if (!(itemObj instanceof Map<?, ?> item)) {
                throw new ApiException(400, "Cada item da composição deve informar 'materialId' e 'quantidade'.");
            }
            Double matNum = Validacao.numeroPositivo(item.get("materialId"));
            Double qtdNum = Validacao.numeroPositivo(item.get("quantidade"));

            if (matNum == null || matNum != Math.floor(matNum) || qtdNum == null) {
                throw new ApiException(400, "Cada item deve possuir 'materialId' e 'quantidade' maiores que zero.");
            }

            BigDecimal quantidade = BigDecimal.valueOf(qtdNum).setScale(3, RoundingMode.HALF_UP);
            if (quantidade.signum() <= 0) {
                throw new ApiException(400, "A quantidade mínima por material é 0,001.");
            }

            boolean matExiste = jdbc.sql("SELECT COUNT(*) FROM material WHERE id = :id")
                    .param("id", matNum.intValue())
                    .query(Integer.class)
                    .single() > 0;
            if (!matExiste) {
                throw new ApiException(404, "Material com id " + matNum.intValue() + " não encontrado.");
            }

            validados.add(new ItemValidado(matNum.intValue(), quantidade));
        }

        jdbc.sql("""
                UPDATE servico
                SET tempo_operacao_horas = :tempo, custo_hora_operacao = :custoHora
                WHERE id = :id
                """)
                .param("tempo", tempoDb)
                .param("custoHora", custoHoraDb)
                .param("id", servico.id())
                .update();

        jdbc.sql("DELETE FROM item_composicao WHERE servico_id = :id")
                .param("id", servico.id())
                .update();

        for (ItemValidado item : validados) {
            jdbc.sql("""
                    INSERT INTO item_composicao (servico_id, material_id, quantidade)
                    VALUES (:servicoId, :materialId, :qtd)
                    """)
                    .param("servicoId", servico.id())
                    .param("materialId", item.materialId())
                    .param("qtd", item.quantidade())
                    .update();
        }

        return buscar(id);
    }
}
