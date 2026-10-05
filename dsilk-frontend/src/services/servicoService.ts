import api from './api';
import { Material } from './materialService';

export interface ItemComposicao {
  id?: number;
  servicoId?: number;
  materialId: number;
  quantidade: number;
  material?: Material;
}

export interface Servico {
  id: number;
  nome: string;
  tipoCalculo: 'METRAGEM' | 'COMPOSICAO';
  materialId?: number | null;
  tempoOperacaoHoras?: number | null;
  custoHoraOperacao?: number | null;
  material?: Material | null;
  itens?: ItemComposicao[];
}

export interface ServicoPayload {
  nome: string;
  tipoCalculo: 'METRAGEM' | 'COMPOSICAO';
  materialId?: number | null;
}

export interface ComposicaoItemPayload {
  materialId: number;
  quantidade: number;
}

export interface ComposicaoPayload {
  itens: ComposicaoItemPayload[];
  tempoOperacaoHoras?: number | null;
  custoHoraOperacao?: number | null;
}

export const servicoService = {
  /**
   * Consulta a lista de serviços cadastrados (RF004)
   */
  async listar(): Promise<Servico[]> {
    const response = await api.get<Servico[]>('/servicos');
    return response.data;
  },

  /**
   * Consulta os dados de um serviço por ID com seus materiais e composição (RF004/RF005)
   */
  async buscarPorId(id: number | string): Promise<Servico> {
    const response = await api.get<Servico>(`/servicos/${id}`);
    return response.data;
  },

  /**
   * Cadastra um novo serviço (RF004)
   */
  async cadastrar(payload: ServicoPayload): Promise<Servico> {
    const response = await api.post<Servico>('/servicos', payload);
    return response.data;
  },

  /**
   * Configura a composição de materiais e tempos de um serviço (RF005)
   */
  async configurarComposicao(id: number | string, payload: ComposicaoPayload): Promise<Servico> {
    const response = await api.put<Servico>(`/servicos/${id}/composicao`, payload);
    return response.data;
  },
};

export default servicoService;
