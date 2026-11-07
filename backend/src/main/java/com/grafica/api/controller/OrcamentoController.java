package com.grafica.api.controller;

import com.grafica.api.exception.ApiException;
import com.grafica.api.model.*;
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
@RequestMapping("/orcamentos")
@Tag(name = "Orçamentos e Cálculos", description = "Cálculo matemático de custos e gestão de propostas (RF006, RF007, RF008, RF009)")
public class OrcamentoController {

    private final JdbcClient jdbc;
    private final ServicoController servicoController;

    public OrcamentoController(JdbcClient jdbc, ServicoController servicoController) {
        this.jdbc = jdbc;
        this.servicoController = servicoController;
    }

    public record CustoCalculado(double custo) {}

    private record DadosOrcamento(
            Integer clienteId,
            Integer servicoId,
            BigDecimal largura,
            BigDecimal altura,
            BigDecimal custoTotal,
            boolean rascunho) {}

    // POST /orcamentos/calcular (RF006, RF007, RN-01, RN-03)
    @PostMapping("/calcular")
    @Operation(summary = "Calcular custo prévio (RF006/RF007)", description = "Executa o cálculo matemático de custo sem persistir, para conferência antes de emitir a proposta.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cálculo efetuado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dimensões ausentes ou serviço sem composição"),
            @ApiResponse(responseCode = "404", description = "Serviço não encontrado")
    })
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

    // GET /orcamentos (RF009)
    @GetMapping
    @Operation(summary = "Listar orçamentos (RF009)", description = "Retorna todos os orçamentos com cruzamento de dados de cliente e serviço em ordem decrescente de criação.")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
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

    // GET /orcamentos/{id} (RF009)
    @GetMapping("/{id}")
    @Operation(summary = "Consultar orçamento por ID (RF009)", description = "Retorna os detalhes completos de um orçamento.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Orçamento encontrado"),
            @ApiResponse(responseCode = "400", description = "ID inválido"),
            @ApiResponse(responseCode = "404", description = "Orçamento não encontrado")
    })
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

    private static boolean vazio(Object valor) {
        return valor == null || (valor instanceof String s && s.isBlank());
    }

    private static Integer idOpcional(Object valor, String campo) {
        if (vazio(valor)) return null;
        Double n = Validacao.numero(valor);
        if (n == null || n < 0 || n != Math.floor(n)) {
            throw new ApiException(400, "O campo '" + campo + "' deve ser um número inteiro maior que zero.");
        }
        return n == 0 ? null : n.intValue();
    }

    private static BigDecimal dimensaoOpcional(Object valor, String campo) {
        if (vazio(valor)) return null;
        Double n = Validacao.numero(valor);
        if (n == null) {
            throw new ApiException(400, "O campo '" + campo + "' deve ser numérico.");
        }
        if (n < 0) {
            throw new ApiException(400, "O campo '" + campo + "' não pode ser negativo.");
        }
        if (n == 0) return null;
        return BigDecimal.valueOf(n).setScale(2, RoundingMode.HALF_UP);
    }

    private DadosOrcamento lerDados(Map<String, Object> corpo) {
        boolean rascunho = corpo != null && Boolean.TRUE.equals(corpo.get("rascunho"));

        Integer clienteId = idOpcional(corpo == null ? null : corpo.get("clienteId"), "clienteId");
        Integer servicoId = idOpcional(corpo == null ? null : corpo.get("servicoId"), "servicoId");
        BigDecimal largura = dimensaoOpcional(corpo == null ? null : corpo.get("largura"), "largura");
        BigDecimal altura = dimensaoOpcional(corpo == null ? null : corpo.get("altura"), "altura");

        if (clienteId != null) {
            boolean existe = jdbc.sql("SELECT COUNT(*) FROM cliente WHERE id = :id")
                    .param("id", clienteId)
                    .query(Integer.class)
                    .single() > 0;
            if (!existe) {
                throw new ApiException(404, "Cliente não encontrado.");
            }
        }

        if (servicoId != null) {
            boolean existe = jdbc.sql("SELECT COUNT(*) FROM servico WHERE id = :id")
                    .param("id", servicoId)
                    .query(Integer.class)
                    .single() > 0;
            if (!existe) {
                throw new ApiException(404, "Serviço não encontrado.");
            }
        }

        BigDecimal custoTotal = null;
        if (!rascunho) {
            if (servicoId == null) {
                throw new ApiException(400, "O campo 'servicoId' é obrigatório para registrar orçamento.");
            }
            CustoCalculado calc = calcular(corpo);
            custoTotal = BigDecimal.valueOf(calc.custo()).setScale(2, RoundingMode.HALF_UP);
        }

        return new DadosOrcamento(clienteId, servicoId, largura, altura, custoTotal, rascunho);
    }

    // POST /orcamentos (RF008)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Criar orçamento ou rascunho (RF008)", description = "Registra um novo orçamento com cálculo automático consolidado ou salva como rascunho.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Orçamento registrado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados ausentes ou inválidos"),
            @ApiResponse(responseCode = "404", description = "Cliente ou serviço não encontrado")
    })
    public Orcamento criar(@RequestBody(required = false) Map<String, Object> corpo) {
        DadosOrcamento d = lerDados(corpo);

        int novoId = jdbc.sql("""
                INSERT INTO orcamento (cliente_id, servico_id, largura, altura, custo_total, rascunho, criado_em)
                VALUES (:clienteId, :servicoId, :largura, :altura, :custoTotal, :rascunho, NOW())
                RETURNING id
                """)
                .param("clienteId", d.clienteId())
                .param("servicoId", d.servicoId())
                .param("largura", d.largura())
                .param("altura", d.altura())
                .param("custoTotal", d.custoTotal())
                .param("rascunho", d.rascunho())
                .query(Integer.class)
                .single();

        return buscar(String.valueOf(novoId));
    }

    // PUT /orcamentos/{id} (RF009)
    @PutMapping("/{id}")
    @Operation(summary = "Editar orçamento ou finalizar rascunho (RF009)", description = "Atualiza os dados de um orçamento e recalcula o custo total.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Orçamento atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Orçamento, cliente ou serviço não encontrado")
    })
    public Orcamento atualizar(@PathVariable String id, @RequestBody(required = false) Map<String, Object> corpo) {
        Orcamento existente = buscar(id);
        DadosOrcamento d = lerDados(corpo);

        jdbc.sql("""
                UPDATE orcamento
                SET cliente_id = :clienteId, servico_id = :servicoId, largura = :largura,
                    altura = :altura, custo_total = :custoTotal, rascunho = :rascunho
                WHERE id = :id
                """)
                .param("clienteId", d.clienteId())
                .param("servicoId", d.servicoId())
                .param("largura", d.largura())
                .param("altura", d.altura())
                .param("custoTotal", d.custoTotal())
                .param("rascunho", d.rascunho())
                .param("id", existente.id())
                .update();

        return buscar(id);
    }
}
