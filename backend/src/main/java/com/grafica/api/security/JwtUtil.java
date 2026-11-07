package com.grafica.api.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

public final class JwtUtil {

    private JwtUtil() {}

    // Só para desenvolvimento. Depois, mova para variável de ambiente.
    private static final String SEGREDO = "segredo-de-desenvolvimento-com-pelo-menos-32-caracteres";
    private static final SecretKey CHAVE = Keys.hmacShaKeyFor(SEGREDO.getBytes(StandardCharsets.UTF_8));
    private static final long DOZE_HORAS = 12L * 60 * 60 * 1000;

    public static String gerar(int id, String nome, String perfil) {
        Date agora = new Date();
        return Jwts.builder()
                .claim("id", id)
                .claim("nome", nome)
                .claim("perfil", perfil != null ? perfil : "FUNCIONARIO")
                .issuedAt(agora)
                .expiration(new Date(agora.getTime() + DOZE_HORAS))
                .signWith(CHAVE)
                .compact();
    }

    public static String gerar(int id, String nome) {
        return gerar(id, nome, "FUNCIONARIO");
    }

    public static Claims validar(String token) {
        return Jwts.parser()
                .verifyWith(CHAVE)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}