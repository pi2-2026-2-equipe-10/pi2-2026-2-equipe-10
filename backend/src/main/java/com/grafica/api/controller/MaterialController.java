package com.grafica.api.controller;

import com.grafica.api.data.Dados;
import com.grafica.api.exception.ApiException;
import com.grafica.api.model.Material;
import com.grafica.api.util.Validacao;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/materiais")
public class MaterialController {

    // GET /materiais
    @GetMapping
    public List<Material> listar() {
        return Dados.MATERIAIS.stream()
                .sorted(Comparator.comparing(Material::nome, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    // GET /materiais/{id}
    @GetMapping("/{id}")
    public Material buscar(@PathVariable String id) {
        Double idNumerico = Validacao.numeroPositivo(id);
        if (idNumerico == null) {
            throw new ApiException(400, "O id informado na URL é inválido.");
        }

        return Dados.MATERIAIS.stream()
                .filter(m -> m.id() == idNumerico)
                .findFirst()
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

        int novoId = Dados.MATERIAIS.stream().mapToInt(Material::id).max().orElse(0) + 1;
        Material novo = new Material(novoId, ((String) nome).trim(), ((String) unidade).trim(), custoNumerico);
        Dados.MATERIAIS.add(novo);

        return novo;
    }
}