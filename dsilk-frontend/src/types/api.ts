/**
 * Contrato de erro padronizado conforme especificação em backend/ROTAS.md
 */
export interface ApiErrorResponse {
  erro: string;
}

/**
 * Interface genérica para extração de mensagens de erro amigáveis da API
 * com mensagens escritas pelo Design para 401 e 403.
 */
export function getApiErrorMessage(error: unknown, fallback = 'Ocorreu um erro inesperado.'): string {
  if (!error) return fallback;

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

  const status = err.response?.status;

  // Mensagem padronizada pelo Design para 403 Forbidden (Acesso negado por perfil)
  if (status === 403) {
    return err.response?.data?.erro || 'Acesso negado: seu perfil de usuário não tem permissão para realizar esta operação.';
  }

  // Mensagem padronizada pelo Design para 401 Unauthorized (Sessão expirada ou não autenticado)
  if (status === 401) {
    return err.response?.data?.erro || 'Sua sessão expirou por inatividade ou segurança. Faça login novamente para continuar.';
  }

  // Mensagem retornada pelo backend ({ "erro": "mensagem" })
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
