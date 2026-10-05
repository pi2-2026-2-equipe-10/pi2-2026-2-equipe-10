/**
 * Contrato de erro padronizado conforme especificação em backend/ROTAS.md
 */
export interface ApiErrorResponse {
  erro: string;
}

/**
 * Interface genérica para extração de mensagens de erro da API
 */
export function getApiErrorMessage(error: unknown, fallback = 'Ocorreu um erro inesperado.'): string {
  if (!error) return fallback;

  // Axios error com resposta do backend
  const err = error as {
    response?: {
      data?: {
        erro?: string;
        message?: string;
      };
      status?: number;
    };
    message?: string;
  };

  if (err.response?.data?.erro) {
    return err.response.data.erro;
  }

  if (err.response?.data?.message) {
    return err.response.data.message;
  }

  if (err.message) {
    if (err.message.includes('Network Error') || err.message.includes('ECONNREFUSED')) {
      return 'Não foi possível conectar ao servidor backend. Verifique se o container está em execução.';
    }
    return err.message;
  }

  return fallback;
}
