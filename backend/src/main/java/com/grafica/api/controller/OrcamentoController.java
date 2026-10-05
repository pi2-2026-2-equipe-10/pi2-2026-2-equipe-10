package com.grafica.api.controller;

import com.grafica.api.exception.ApiException;
import com.grafica.api.model.*;
import com.grafica.api.util.Validacao;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orcamentos")
public class OrcamentoController {

    private final JdbcClient jdbc;
    private final ServicoController servicoController;

    public OrcamentoController(JdbcClient jdbc, ServicoController servicoController) {
        this.jdbc = jdbc;
        this.servicoController = servicoController;
    }

    public record CustoCalculado(double custo) {}

    // POST /orcamentos/calcular
    @PostMapping("/calcular")
    public CustoCalculado calcular(@RequestBody(required = false) Map<String, Object> corpo) {
        Object servicoIdObj = corpo == null ? null : corpo.get("servicoId");
        Double servicoIdNum = Validacao.numeroPositivo(servicoIdObj);
        if (servicoIdNum == null || servicoIdNum != Math.floor(servicoIdNum)) {
            throw new ApiException(400, "O campo 'servicoId' é obrigatório.");
        }

        Servico servico = servicoController.buscar(String.valueOf(servicoIdNum.intValue()));

        if ("METRAGEM".equalsIgnoreCase(servico.tipoCalculo())) {
            Double larg = Validacao.numeroPositivo(corpo.get("largura"));
            Double alt = Validacao.numeroPositivo(corpo.get("altura"));

            if (larg == null || alt == null) {
                throw new ApiException(400, "Para cálculo por metragem, informe 'largura' e 'altura' maiores que zero.");
            }
            if (servico.material() == null) {
                throw new ApiException(400, "O serviço de metragem não possui material associado.");
            }

            double custo = larg * alt * servico.material().custo();
            BigDecimal custoFinal = BigDecimal.valueOf(custo).setScale(2, RoundingMode.HALF_UP);
            return new CustoCalculado(custoFinal.doubleValue());
        } else {
            // COMPOSICAO
            List<ItemComposicao> itens = servico.itens();
            if (itens == null || itens.isEmpty()) {
                throw new ApiException(400, "O serviço configurado para cálculo por composição não possui composição cadastrada.");
            }

            double custoTotal = 0;
            for (ItemComposicao item : itens) {
                custoTotal += item.quantidade() * item.material().custo();
            }

            if (servico.tempoOperacaoHoras() != null && servico.custoHoraOperacao() != null) {
                custoTotal += servico.tempoOperacaoHoras() * servico.custoHoraOperacao();
            }

            BigDecimal custoFinal = BigDecimal.valueOf(custoTotal).setScale(2, RoundingMode.HALF_UP);
            return new CustoCalculado(custoFinal.doubleValue());
        }
    }

    private static Orcamento mapearOrcamento(ResultSet rs, int i) throws SQLException {
        Integer clienteId = rs.getObject("cliente_id") != null ? rs.getInt("cliente_id") : null;
        Integer servicoId = rs.getObject("servico_id") != null ? rs.getInt("servico_id") : null;
        Double largura = rs.getObject("largura") != null ? rs.getBigDecimal("largura").doubleValue() : null;
        Double altura = rs.getObject("altura") != null ? rs.getBigDecimal("altura").doubleValue() : null;
        Double custoTotal = rs.getObject("custo_total") != null ? rs.getBigDecimal("custo_total").doubleValue() : null;
        boolean rascunho = rs.getBoolean("rascunho");
        String criadoEm = rs.getTimestamp("criado_em") != null ? rs.getTimestamp("criado_em").toInstant().toString() : null;

        Cliente c = null;
        if (rs.getObject("c_id") != null) {
            c = new Cliente(
                    rs.getInt("c_id"),
                    rs.getString("c_nome"),
                    rs.getString("c_telefone"),
                    rs.getString("c_email"),
                    rs.getString("c_obs"));
        }

        Servico s = null;
        if (rs.getObject("s_id") != null) {
            Double tempo = rs.getObject("s_tempo") != null ? rs.getBigDecimal("s_tempo").doubleValue() : null;
            Double custoH = rs.getObject("s_custo_h") != null ? rs.getBigDecimal("s_custo_h").doubleValue() : null;
            s = new Servico(
                    rs.getInt("s_id"),
                    rs.getString("s_nome"),
                    rs.getString("s_tipo"),
                    rs.getObject("s_mat_id") != null ? rs.getInt("s_mat_id") : null,
                    tempo,
                    custoH,
                    null,
                    List.of());
        }

        return new Orcamento(
                rs.getInt("id"),
                clienteId,
                servicoId,
                largura,
                altura,
                custoTotal,
                rascunho,
                criadoEm,
                c,
                s);
    }

    // GET /orcamentos
    @GetMapping
    public List<Orcamento> listar() {
        return jdbc.sql("""
                SELECT o.id, o.cliente_id, o.servico_id, o.largura, o.altura, o.custo_total, o.rascunho, o.criado_em,
                       c.id as c_id, c.nome as c_nome, c.telefone as c_telefone, c.email as c_email, c.observacoes as c_obs,
                       s.id as s_id, s.nome as s_nome, s.tipo_calculo as s_tipo, s.material_id as s_mat_id,
                       s.tempo_operacao_horas as s_tempo, s.custo_hora_operacao as s_custo_h
                FROM orcamento o
                LEFT JOIN cliente c ON o.cliente_id = c.id
                LEFT JOIN servico s ON o.servico_id = s.id
                ORDER BY o.criado_em DESC, o.id DESC
                """)
                .query(OrcamentoController::mapearOrcamento)
                .list();
    }

    // GET /orcamentos/{id}
    @GetMapping("/{id}")
    public Orcamento buscar(@PathVariable String id) {
        Double idNum = Validacao.numeroPositivo(id);
        if (idNum == null || idNum != Math.floor(idNum)) {
            throw new ApiException(400, "O id informado na URL é inválido.");
        }

        return jdbc.sql("""
                SELECT o.id, o.cliente_id, o.servico_id, o.largura, o.altura, o.custo_total, o.rascunho, o.criado_em,
                       c.id as c_id, c.nome as c_nome, c.telefone as c_telefone, c.email as c_email, c.observacoes as c_obs,
                       s.id as s_id, s.nome as s_nome, s.tipo_calculo as s_tipo, s.material_id as s_mat_id,
                       s.tempo_operacao_horas as s_tempo, s.custo_hora_operacao as s_custo_h
                FROM orcamento o
                LEFT JOIN cliente c ON o.cliente_id = c.id
                LEFT JOIN servico s ON o.servico_id = s.id
                WHERE o.id = :id
                """)
                .param("id", idNum.intValue())
                .query(OrcamentoController::mapearOrcamento)
                .optional()
                .orElseThrow(() -> new ApiException(404, "Orçamento não encontrado."));
    }

    // POST /orcamentos
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Orcamento criar(@RequestBody(required = false) Map<String, Object> corpo) {
        boolean rascunho = corpo != null && Boolean.TRUE.equals(corpo.get("rascunho"));

        Object clienteIdObj = corpo == null ? null : corpo.get("clienteId");
        Object servicoIdObj = corpo == null ? null : corpo.get("servicoId");
        Object largObj = corpo == null ? null : corpo.get("largura");
        Object altObj = corpo == null ? null : corpo.get("altura");

        Integer clienteId = null;
        if (clienteIdObj != null) {
            Double cNum = Validacao.numeroPositivo(clienteIdObj);
            if (cNum != null) {
                clienteId = cNum.intValue();
            }
        }

        Integer servicoId = null;
        if (servicoIdObj != null) {
            Double sNum = Validacao.numeroPositivo(servicoIdObj);
            if (sNum != null) {
                servicoId = sNum.intValue();
            }
        }

        BigDecimal largDb = null;
        BigDecimal altDb = null;
        BigDecimal custoTotalDb = null;

        if (!rascunho) {
            if (servicoId == null) {
                throw new ApiException(400, "O campo 'servicoId' é obrigatório para registrar orçamento.");
            }
            CustoCalculado calc = calcular(corpo);
            custoTotalDb = BigDecimal.valueOf(calc.custo()).setScale(2, RoundingMode.HALF_UP);

            if (largObj != null) {
                Double l = Validacao.numeroPositivo(largObj);
                if (l != null) largDb = BigDecimal.valueOf(l).setScale(2, RoundingMode.HALF_UP);
            }
            if (altObj != null) {
                Double a = Validacao.numeroPositivo(altObj);
                if (a != null) altDb = BigDecimal.valueOf(a).setScale(2, RoundingMode.HALF_UP);
            }
        } else {
            if (largObj != null) {
                Double l = Validacao.numeroPositivo(largObj);
                if (l != null) largDb = BigDecimal.valueOf(l).setScale(2, RoundingMode.HALF_UP);
            }
            if (altObj != null) {
                Double a = Validacao.numeroPositivo(altObj);
                if (a != null) altDb = BigDecimal.valueOf(a).setScale(2, RoundingMode.HALF_UP);
            }
        }

        int novoId = jdbc.sql("""
                INSERT INTO orcamento (cliente_id, servico_id, largura, altura, custo_total, rascunho, criado_em)
                VALUES (:clienteId, :servicoId, :largura, :altura, :custoTotal, :rascunho, NOW())
                RETURNING id
                """)
                .param("clienteId", clienteId)
                .param("servicoId", servicoId)
                .param("largura", largDb)
                .param("altura", altDb)
                .param("custoTotal", custoTotalDb)
                .param("rascunho", rascunho)
                .query(Integer.class)
                .single();

        return buscar(String.valueOf(novoId));
    }

    // PUT /orcamentos/{id}
    @PutMapping("/{id}")
    public Orcamento atualizar(@PathVariable String id, @RequestBody(required = false) Map<String, Object> corpo) {
        Orcamento orcExistente = buscar(id);

        boolean rascunho = corpo != null && Boolean.TRUE.equals(corpo.get("rascunho"));

        Object clienteIdObj = corpo == null ? null : corpo.get("clienteId");
        Object servicoIdObj = corpo == null ? null : corpo.get("servicoId");
        Object largObj = corpo == null ? null : corpo.get("largura");
        Object altObj = corpo == null ? null : corpo.get("altura");

        Integer clienteId = null;
        if (clienteIdObj != null) {
            Double cNum = Validacao.numeroPositivo(clienteIdObj);
            if (cNum != null) clienteId = cNum.intValue();
        }

        Integer servicoId = null;
        if (servicoIdObj != null) {
            Double sNum = Validacao.numeroPositivo(servicoIdObj);
            if (sNum != null) servicoId = sNum.intValue();
        }

        BigDecimal largDb = null;
        BigDecimal altDb = null;
        BigDecimal custoTotalDb = null;

        if (!rascunho) {
            if (servicoId == null) {
                throw new ApiException(400, "O campo 'servicoId' é obrigatório.");
            }
            CustoCalculado calc = calcular(corpo);
            custoTotalDb = BigDecimal.valueOf(calc.custo()).setScale(2, RoundingMode.HALF_UP);

            if (largObj != null) {
                Double l = Validacao.numeroPositivo(largObj);
                if (l != null) largDb = BigDecimal.valueOf(l).setScale(2, RoundingMode.HALF_UP);
            }
            if (altObj != null) {
                Double a = Validacao.numeroPositivo(altObj);
                if (a != null) altDb = BigDecimal.valueOf(a).setScale(2, RoundingMode.HALF_UP);
            }
        }

        jdbc.sql("""
                UPDATE orcamento
                SET cliente_id = :clienteId, servico_id = :servicoId, largura = :largura,
                    altura = :altura, custo_total = :custoTotal, rascunho = :rascunho
                WHERE id = :id
                """)
                .param("clienteId", clienteId)
                .param("servicoId", servicoId)
                .param("largura", largDb)
                .param("altura", altDb)
                .param("custoTotal", custoTotalDb)
                .param("rascunho", rascunho)
                .param("id", orcExistente.id())
                .update();

        return buscar(id);
    }
}
