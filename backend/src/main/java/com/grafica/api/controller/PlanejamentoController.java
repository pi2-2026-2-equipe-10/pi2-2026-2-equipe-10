package com.grafica.api.controller;

import com.grafica.api.exception.ApiException;
import com.grafica.api.model.Atividade;
import com.grafica.api.util.Validacao;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@RestController
@Tag(name = "Planejamento e Atividades", description = "Agenda semanal de produção e tarefas de confecção (RF010 e RF011)")
public class PlanejamentoController {

    private final JdbcClient jdbc;

    public PlanejamentoController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public record DiaPlanejamento(String dia, List<Atividade> atividades) {}

    // GET /planejamento?inicio=AAAA-MM-DD (RF010)
    @GetMapping("/planejamento")
    @Operation(summary = "Visualizar planejamento semanal (RF010)", description = "Retorna a grade semanal de produção (7 dias, segunda a domingo) agrupada por dia.")
    @ApiResponse(responseCode = "200", description = "Grade semanal retornada com sucesso")
    public List<DiaPlanejamento> obterSemana(@RequestParam(required = false) String inicio) {
        LocalDate dataBase;
        if (inicio != null && !inicio.isBlank()) {
            try {
                dataBase = LocalDate.parse(inicio.trim());
            } catch (DateTimeParseException e) {
                throw new ApiException(400, "Formato de data inválido para 'inicio'. Use AAAA-MM-DD.");
            }
        } else {
            dataBase = LocalDate.now();
        }

        LocalDate segunda = dataBase.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate domingo = segunda.plusDays(6);

        List<Atividade> todas = jdbc.sql("""
                SELECT id, titulo, descricao, data
                FROM atividade
                WHERE data >= :inicio AND data <= :fim
                ORDER BY data, id
                """)
                .param("inicio", Date.valueOf(segunda))
                .param("fim", Date.valueOf(domingo))
                .query((rs, i) -> new Atividade(
                        rs.getInt("id"),
                        rs.getString("titulo"),
                        rs.getString("descricao"),
                        rs.getDate("data").toLocalDate().toString()
                ))
                .list();

        Map<String, List<Atividade>> porDia = new LinkedHashMap<>();
        for (int i = 0; i < 7; i++) {
            String diaStr = segunda.plusDays(i).toString();
            porDia.put(diaStr, new ArrayList<>());
        }

        for (Atividade atv : todas) {
            if (porDia.containsKey(atv.data())) {
                porDia.get(atv.data()).add(atv);
            }
        }

        List<DiaPlanejamento> resposta = new ArrayList<>();
        for (Map.Entry<String, List<Atividade>> entry : porDia.entrySet()) {
            resposta.add(new DiaPlanejamento(entry.getKey(), entry.getValue()));
        }

        return resposta;
    }

    // POST /atividades (RF011)
    @PostMapping("/atividades")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registrar atividade na agenda (RF011)", description = "Agenda um serviço ou atividade em uma data específica da produção.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Atividade registrada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Título ou data inválidos")
    })
    public Atividade criarAtividade(@RequestBody(required = false) Map<String, Object> corpo) {
        Object tituloObj = corpo == null ? null : corpo.get("titulo");
        Object dataObj = corpo == null ? null : corpo.get("data");
        Object descObj = corpo == null ? null : corpo.get("descricao");

        if (!Validacao.textoObrigatorio(tituloObj)) {
            throw new ApiException(400, "O campo 'titulo' é obrigatório.");
        }
        if (!Validacao.textoObrigatorio(dataObj)) {
            throw new ApiException(400, "O campo 'data' é obrigatório (AAAA-MM-DD).");
        }

        LocalDate dataParsed;
        try {
            dataParsed = LocalDate.parse(((String) dataObj).trim());
        } catch (DateTimeParseException e) {
            throw new ApiException(400, "Formato de data inválido. Use AAAA-MM-DD.");
        }

        String titulo = ((String) tituloObj).trim();
        String descricao = descObj != null ? ((String) descObj).trim() : null;
        if (descricao != null && descricao.isEmpty()) {
            descricao = null;
        }

        int novoId = jdbc.sql("""
                INSERT INTO atividade (titulo, descricao, data)
                VALUES (:titulo, :descricao, :data)
                RETURNING id
                """)
                .param("titulo", titulo)
                .param("descricao", descricao)
                .param("data", Date.valueOf(dataParsed))
                .query(Integer.class)
                .single();

        return new Atividade(novoId, titulo, descricao, dataParsed.toString());
    }

    // PUT /atividades/{id} (RF011)
    @PutMapping("/atividades/{id}")
    @Operation(summary = "Editar atividade do planejamento (RF011)", description = "Atualiza título, descrição ou data de uma atividade da semana.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Atividade atualizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Atividade não encontrada")
    })
    public Atividade atualizarAtividade(@PathVariable String id, @RequestBody(required = false) Map<String, Object> corpo) {
        Double idNum = Validacao.numeroPositivo(id);
        if (idNum == null || idNum != Math.floor(idNum)) {
            throw new ApiException(400, "O id informado na URL é inválido.");
        }

        boolean existe = jdbc.sql("SELECT COUNT(*) FROM atividade WHERE id = :id")
                .param("id", idNum.intValue())
                .query(Integer.class)
                .single() > 0;

        if (!existe) {
            throw new ApiException(404, "Atividade não encontrada.");
        }

        Object tituloObj = corpo == null ? null : corpo.get("titulo");
        Object dataObj = corpo == null ? null : corpo.get("data");
        Object descObj = corpo == null ? null : corpo.get("descricao");

        if (!Validacao.textoObrigatorio(tituloObj)) {
            throw new ApiException(400, "O campo 'titulo' é obrigatório.");
        }
        if (!Validacao.textoObrigatorio(dataObj)) {
            throw new ApiException(400, "O campo 'data' é obrigatório (AAAA-MM-DD).");
        }

        LocalDate dataParsed;
        try {
            dataParsed = LocalDate.parse(((String) dataObj).trim());
        } catch (DateTimeParseException e) {
            throw new ApiException(400, "Formato de data inválido. Use AAAA-MM-DD.");
        }

        String titulo = ((String) tituloObj).trim();
        String descricao = descObj != null ? ((String) descObj).trim() : null;
        if (descricao != null && descricao.isEmpty()) {
            descricao = null;
        }

        jdbc.sql("""
                UPDATE atividade
                SET titulo = :titulo, descricao = :descricao, data = :data
                WHERE id = :id
                """)
                .param("titulo", titulo)
                .param("descricao", descricao)
                .param("data", Date.valueOf(dataParsed))
                .param("id", idNum.intValue())
                .update();

        return new Atividade(idNum.intValue(), titulo, descricao, dataParsed.toString());
    }
}
