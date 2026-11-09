package com.grafica.api.repository;

import com.grafica.api.model.Perfil;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

// Acesso aos dados da tabela perfil. A tabela é a fonte dos perfis válidos:
// um perfil novo é só uma linha nova, sem alterar o código.
@Repository
public class PerfilRepository {

    private final JdbcClient jdbc;

    public PerfilRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Perfil> listar() {
        return jdbc.sql("SELECT codigo, nome FROM perfil ORDER BY codigo")
                .query((rs, i) -> new Perfil(rs.getString("codigo"), rs.getString("nome")))
                .list();
    }

    public Optional<Perfil> buscarPorCodigo(String codigo) {
        return jdbc.sql("SELECT codigo, nome FROM perfil WHERE codigo = :codigo")
                .param("codigo", codigo)
                .query((rs, i) -> new Perfil(rs.getString("codigo"), rs.getString("nome")))
                .optional();
    }

    public boolean existe(String codigo) {
        Integer total = jdbc.sql("SELECT COUNT(*) FROM perfil WHERE codigo = :codigo")
                .param("codigo", codigo)
                .query(Integer.class)
                .single();
        return total != null && total > 0;
    }
}
