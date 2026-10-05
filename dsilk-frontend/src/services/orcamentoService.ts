import api from './api';
import { Cliente } from './clienteService';
import { Servico } from './servicoService';

export interface Orcamento {
  id: number;
  clienteId?: number | null;
  servicoId?: number | null;
  largura?: number | null;
  altura?: number | null;
  custoTotal?: number | null;
  rascunho: boolean;
  criadoEm: string;
  cliente?: Cliente | null;
  servico?: Servico | null;
}

export interface CalcularOrcamentoPayload {
  servicoId: number;
  largura?: number | null;
  altura?: number | null;
}

export interface CalcularOrcamentoResponse {
  custo: number;
}

export interface CriarOrcamentoPayload {
  rascunho?: boolean;
  clienteId?: number | null;
  servicoId?: number | null;
  largura?: number | null;
  altura?: number | null;
}

export const orcamentoService = {
  /**
   * Calcula o custo dinâmico de um serviço (RF006/RF007)
   */
  async calcular(payload: CalcularOrcamentoPayload): Promise<CalcularOrcamentoResponse> {
    const response = await api.post<CalcularOrcamentoResponse>('/orcamentos/calcular', payload);
    return response.data;
  },

  /**
   * Consulta a lista de orçamentos (RF009)
   */
  async listar(): Promise<Orcamento[]> {
    const response = await api.get<Orcamento[]>('/orcamentos');
    return response.data;
  },

  /**
   * Consulta um orçamento específico por ID (RF009)
   */
  async buscarPorId(id: number | string): Promise<Orcamento> {
    const response = await api.get<Orcamento>(`/orcamentos/${id}`);
    return response.data;
  },

  /**
   * Registra um novo orçamento ou salva como rascunho (RF008)
   */
  async criar(payload: CriarOrcamentoPayload): Promise<Orcamento> {
    const response = await api.post<Orcamento>('/orcamentos', payload);
    return response.data;
  },

  /**
   * Edita ou finaliza um orçamento existente (RF009)
   */
  async atualizar(id: number | string, payload: CriarOrcamentoPayload): Promise<Orcamento> {
    const response = await api.put<Orcamento>(`/orcamentos/${id}`, payload);
    return response.data;
  },
};

export default orcamentoService;
