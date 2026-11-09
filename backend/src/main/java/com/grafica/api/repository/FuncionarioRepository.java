package com.grafica.api.repository;

import com.grafica.api.model.Funcionario;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

// Acesso aos dados da tabela funcionario (os usuários do sistema).
// A senha só existe como hash BCrypt: o banco recusa qualquer outro formato
// (constraint funcionario_senha_hash_bcrypt_chk).
@Repository
public class FuncionarioRepository {

    // Dados necessários para autenticar: é o único ponto em que o hash da senha sai do banco
    public record Credenciais(int id, String nome, String senhaHash, boolean ativo, String perfil) {}

    private final JdbcClient jdbc;

    public FuncionarioRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    private static Funcionario mapear(ResultSet rs, int i) throws SQLException {
        return new Funcionario(
                rs.getInt("id"),
                rs.getString("nome"),
                rs.getString("perfil"),
                rs.getBoolean("ativo"));
    }

    // Só ativos, em ordem alfabética (lista da tela de login)
    public List<Funcionario> listarAtivos() {
        return jdbc.sql("SELECT id, nome, perfil, ativo FROM funcionario WHERE ativo = TRUE ORDER BY nome")
                .query(FuncionarioRepository::mapear)
                .list();
    }

    // Ativos e inativos (gestão de funcionários)
    public List<Funcionario> listarTodos() {
        return jdbc.sql("SELECT id, nome, perfil, ativo FROM funcionario ORDER BY nome")
                .query(FuncionarioRepository::mapear)
                .list();
    }

    public Optional<Funcionario> buscarPorId(int id) {
        return jdbc.sql("SELECT id, nome, perfil, ativo FROM funcionario WHERE id = :id")
                .param("id", id)
                .query(FuncionarioRepository::mapear)
                .optional();
    }

    public Optional<Credenciais> buscarCredenciais(int id) {
        return jdbc.sql("SELECT id, nome, senha_hash, ativo, perfil FROM funcionario WHERE id = :id")
                .param("id", id)
                .query((rs, i) -> new Credenciais(
                        rs.getInt("id"),
                        rs.getString("nome"),
                        rs.getString("senha_hash"),
                        rs.getBoolean("ativo"),
                        rs.getString("perfil")))
                .optional();
    }

    // Recebe a senha JÁ em hash BCrypt; devolve o id gerado
    public int cadastrar(String nome, String senhaHash, boolean ativo, String perfil) {
        return jdbc.sql("""
                INSERT INTO funcionario (nome, senha_hash, ativo, perfil)
                VALUES (:nome, :hash, :ativo, :perfil) RETURNING id
                """)
                .param("nome", nome)
                .param("hash", senhaHash)
                .param("ativo", ativo)
                .param("perfil", perfil)
                .query(Integer.class)
                .single();
    }

    // Atualiza nome, situação e perfil; devolve false se o id não existe
    public boolean atualizar(int id, String nome, boolean ativo, String perfil) {
        int linhas = jdbc.sql("""
                UPDATE funcionario SET nome = :nome, ativo = :ativo, perfil = :perfil
                WHERE id = :id
                """)
                .param("nome", nome)
                .param("ativo", ativo)
                .param("perfil", perfil)
                .param("id", id)
                .update();
        return linhas > 0;
    }

    // Recebe a nova senha JÁ em hash BCrypt; devolve false se o id não existe
    public boolean atualizarSenha(int id, String senhaHash) {
        int linhas = jdbc.sql("UPDATE funcionario SET senha_hash = :hash WHERE id = :id")
                .param("hash", senhaHash)
                .param("id", id)
                .update();
        return linhas > 0;
    }
}
