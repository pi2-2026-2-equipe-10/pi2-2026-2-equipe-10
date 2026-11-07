package com.grafica.api.security;

import com.grafica.api.exception.ApiException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.HandlerInterceptor;

public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // GET /funcionarios é rota pública (alimenta a tela de seleção inicial de login)
        String uri = request.getRequestURI();
        if ("GET".equalsIgnoreCase(request.getMethod()) && uri.matches("^/funcionarios(/.*)?$")) {
            return true;
        }

        String cabecalho = request.getHeader("Authorization");

        if (cabecalho == null || !cabecalho.startsWith("Bearer ")) {
            throw new ApiException(401, "Não autenticado: envie o cabeçalho Authorization: Bearer <token>.");
        }

        String token = cabecalho.substring(7);

        try {
            Claims claims = JwtUtil.validar(token);
            request.setAttribute("funcionario", claims);
            request.setAttribute("funcionarioId", claims.get("id", Integer.class));
            request.setAttribute("funcionarioNome", claims.get("nome", String.class));
            String perfil = claims.get("perfil", String.class);
            request.setAttribute("funcionarioPerfil", perfil);

            // Verificação de autorização por perfil conforme Matriz de Requisitos / docs/perfis-de-acesso.md:
            // Apenas o perfil 'ADMINISTRADOR' pode gerenciar funcionários (POST/PUT/DELETE /funcionarios)
            if (uri.matches("^/funcionarios(/.*)?$") && !"GET".equalsIgnoreCase(request.getMethod())) {
                if (!"ADMINISTRADOR".equalsIgnoreCase(perfil)) {
                    throw new ApiException(403, "Acesso negado: seu perfil de usuário não tem permissão para gerenciar funcionários.");
                }
            }

            return true;
        } catch (ApiException e) {
            throw e;
        } catch (ExpiredJwtException e) {
            throw new ApiException(401, "Token expirado: faça login novamente.");
        } catch (JwtException | IllegalArgumentException e) {
            throw new ApiException(401, "Token inválido.");
        }
    }
}
