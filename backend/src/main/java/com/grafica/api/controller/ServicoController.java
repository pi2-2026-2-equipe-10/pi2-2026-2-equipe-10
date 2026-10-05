package com.grafica.api.controller;

import com.grafica.api.exception.ApiException;
import com.grafica.api.model.ItemComposicao;
import com.grafica.api.model.Material;
import com.grafica.api.model.Servico;
import com.grafica.api.util.Validacao;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
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
public class ServicoController {

    private final JdbcClient jdbc;

    public ServicoController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    private static Material mapearMaterial(ResultSet rs, int i) throws SQLException {
        return new Material(
                rs.getInt("m_id"),
                rs.getString("m_nome"),
                rs.getString("m_unidade"),
                rs.getBigDecimal("m_custo").doubleValue());
    }

    @GetMapping
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

        // Se for COMPOSICAO, carrega os itens
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
            // Verifica se o material existe
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

    @PutMapping("/{id}/composicao")
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

        // Atualiza tempos no serviço
        jdbc.sql("""
                UPDATE servico
                SET tempo_operacao_horas = :tempo, custo_hora_operacao = :custoHora
                WHERE id = :id
                """)
                .param("tempo", tempoDb)
                .param("custoHora", custoHoraDb)
                .param("id", servico.id())
                .update();

        // Remove itens antigos
        jdbc.sql("DELETE FROM item_composicao WHERE servico_id = :id")
                .param("id", servico.id())
                .update();

        // Insere novos itens
        for (Object itemObj : listaItens) {
            if (!(itemObj instanceof Map<?, ?> item)) continue;
            Double matNum = Validacao.numeroPositivo(item.get("materialId"));
            Double qtdNum = Validacao.numeroPositivo(item.get("quantidade"));

            if (matNum == null || qtdNum == null) {
                throw new ApiException(400, "Cada item deve possuir 'materialId' e 'quantidade' maiores que zero.");
            }

            boolean matExiste = jdbc.sql("SELECT COUNT(*) FROM material WHERE id = :id")
                    .param("id", matNum.intValue())
                    .query(Integer.class)
                    .single() > 0;
            if (!matExiste) {
                throw new ApiException(404, "Material com id " + matNum.intValue() + " não encontrado.");
            }

            jdbc.sql("""
                    INSERT INTO item_composicao (servico_id, material_id, quantidade)
                    VALUES (:servicoId, :materialId, :qtd)
                    """)
                    .param("servicoId", servico.id())
                    .param("materialId", matNum.intValue())
                    .param("qtd", BigDecimal.valueOf(qtdNum).setScale(4, RoundingMode.HALF_UP))
                    .update();
        }

        return buscar(id);
    }
}
