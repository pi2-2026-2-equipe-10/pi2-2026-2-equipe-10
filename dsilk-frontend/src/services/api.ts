import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, clearSession } from './storage';
import { ApiErrorResponse, getApiErrorMessage } from '../types/api';

/**
 * URL base da API obtida das variáveis de ambiente (Vite)
 * Padrão aponta para o backend rodando no container Docker (http://localhost:3000)
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Instância centralizada do cliente HTTP Axios
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Interceptor de Requisição:
 * Injeta automaticamente o token JWT (Authorization: Bearer <token>) caso exista
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Resposta:
 * Trata respostas de erro padronizadas do backend ({ "erro": "mensagem" })
 * com mensagens escritas pelo Design para sessão expirada (401) e permissão negada (403)
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status;
    const message = getApiErrorMessage(error);

    // 401: Sessão expirada ou não autenticado
    if (status === 401) {
      clearSession();
      try {
        sessionStorage.setItem('@dsilk:session_message', message);
      } catch {
        // Ignora erros de storage
      }

      const publicPaths = ['/', '/login', '/register', '/forgot-password', '/send-code', '/reset-password'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login?expired=1';
      }
    }

    // 403: Acesso negado pelo controle de perfil (RBAC)
    if (status === 403) {
      try {
        window.dispatchEvent(
          new CustomEvent('dsilk:forbidden', {
            detail: { message },
          })
        );
      } catch {
        // Ignora erros de evento
      }
    }

    if (error.response?.data) {
      error.message = message;
    }

    return Promise.reject(error);
  }
);

export default api;
