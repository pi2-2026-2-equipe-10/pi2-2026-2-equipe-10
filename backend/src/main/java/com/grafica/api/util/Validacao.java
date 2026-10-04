package com.grafica.api.util;

public final class Validacao {

    private Validacao() {}

    // Aceita número ou texto numérico ("12.5"). Retorna null se não for número.
    public static Double numero(Object valor) {
        if (valor == null || valor instanceof Boolean) return null;
        try {
            double n;
            if (valor instanceof Number num) {
                n = num.doubleValue();
            } else if (valor instanceof String s && !s.isBlank()) {
                n = Double.parseDouble(s.trim());
            } else {
                return null;
            }
            return Double.isFinite(n) ? n : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    // Número maior que zero, ou null
    public static Double numeroPositivo(Object valor) {
        Double n = numero(valor);
        return (n != null && n > 0) ? n : null;
    }

    // Texto obrigatório: não pode ser vazio nem só espaços
    public static boolean textoObrigatorio(Object valor) {
        return valor instanceof String s && !s.isBlank();
    }
}