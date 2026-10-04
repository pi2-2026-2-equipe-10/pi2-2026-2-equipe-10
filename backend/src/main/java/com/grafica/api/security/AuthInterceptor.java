package com.grafica.api.security;

import com.grafica.api.exception.ApiException;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.HandlerInterceptor;

public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String cabecalho = request.getHeader("Authorization");

        if (cabecalho == null || !cabecalho.startsWith("Bearer ")) {
            throw new ApiException(401, "Não autenticado: envie o cabeçalho Authorization: Bearer <token>.");
        }

        String token = cabecalho.substring(7);

        try {
            request.setAttribute("funcionario", JwtUtil.validar(token));
            return true;
        } catch (ExpiredJwtException e) {
            throw new ApiException(401, "Token expirado: faça login novamente.");
        } catch (JwtException | IllegalArgumentException e) {
            throw new ApiException(401, "Token inválido.");
        }
    }
}