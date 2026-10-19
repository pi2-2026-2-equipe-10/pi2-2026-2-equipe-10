package com.grafica.api.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.Map;

@RestControllerAdvice
public class TratadorDeErros {

    private ResponseEntity<Map<String, String>> resposta(int status, String mensagem) {
        return ResponseEntity.status(status).body(Map.of("erro", mensagem));
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, String>> api(ApiException e) {
        return resposta(e.getStatus(), e.getMessage());
    }

    // Violação de UNIQUE no banco (ex.: material com nome repetido, cliente com e-mail repetido)
    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<Map<String, String>> duplicado(DuplicateKeyException e) {
        String detalhe = e.getMostSpecificCause().getMessage();
        String mensagem = "Já existe um registro com este valor.";
        if (detalhe != null) {
            if (detalhe.contains("material_nome_key")) {
                mensagem = "Já existe um material com este nome.";
            } else if (detalhe.contains("cliente_email_key")) {
                mensagem = "Já existe um cliente com este e-mail.";
            }
        }
        return resposta(409, mensagem);
    }

    // Violação de FK, CHECK, NOT NULL ou valor fora do limite da coluna
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> integridade(DataIntegrityViolationException e) {
        return resposta(400, "Os dados informados violam uma restrição do banco "
                + "(referência inexistente ou valor fora do permitido).");
    }

    // JSON malformado
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> jsonInvalido(HttpMessageNotReadableException e) {
        return resposta(400, "JSON inválido no corpo da requisição.");
    }

    // Faltou Content-Type: application/json
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<Map<String, String>> tipoInvalido(HttpMediaTypeNotSupportedException e) {
        return resposta(415, "Envie o cabeçalho Content-Type: application/json.");
    }

    // Rota que não existe
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, String>> rotaInexistente(NoResourceFoundException e) {
        return resposta(404, "Rota não encontrada.");
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, String>> metodoInvalido(HttpRequestMethodNotSupportedException e) {
        return resposta(405, "Método HTTP não permitido para esta rota.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> inesperado(Exception e) {
        e.printStackTrace();
        return resposta(500, "Erro interno do servidor.");
    }
}
