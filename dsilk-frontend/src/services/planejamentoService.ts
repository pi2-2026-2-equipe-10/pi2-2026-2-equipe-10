import api from './api';

export interface Atividade {
  id: number;
  titulo: string;
  descricao?: string | null;
  data: string;
}

export interface DiaPlanejamento {
  dia: string; // formato AAAA-MM-DD
  atividades: Atividade[];
}

export interface AtividadePayload {
  titulo: string;
  descricao?: string | null;
  data: string; // formato AAAA-MM-DD
}

export const planejamentoService = {
  /**
   * Consulta a agenda semanal agrupada por dia (RF010)
   * @param inicio Data no formato AAAA-MM-DD para ancorar a semana. Se omitido, retorna a semana corrente.
   */
  async obterSemana(inicio?: string): Promise<DiaPlanejamento[]> {
    const params = inicio ? { inicio } : {};
    const response = await api.get<DiaPlanejamento[]>('/planejamento', { params });
    return response.data;
  },

  /**
   * Registra uma nova atividade na agenda semanal (RF011)
   */
  async criarAtividade(payload: AtividadePayload): Promise<Atividade> {
    const response = await api.post<Atividade>('/atividades', payload);
    return response.data;
  },

  /**
   * Edita uma atividade agendada existente (RF011)
   */
  async atualizarAtividade(id: number | string, payload: AtividadePayload): Promise<Atividade> {
    const response = await api.put<Atividade>(`/atividades/${id}`, payload);
    return response.data;
  },
};

export default planejamentoService;
