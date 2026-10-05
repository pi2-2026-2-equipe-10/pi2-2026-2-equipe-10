import api from './api';

export interface Material {
  id: number;
  nome: string;
  unidadeMedida: string;
  custo: number;
}

export interface MaterialPayload {
  nome: string;
  unidadeMedida: string;
  custo: number;
}

export const materialService = {
  /**
   * Consulta a lista de materiais cadastrados (RF002)
   */
  async listar(): Promise<Material[]> {
    const response = await api.get<Material[]>('/materiais');
    return response.data;
  },

  /**
   * Consulta os dados de um material específico (RF002)
   */
  async buscarPorId(id: number | string): Promise<Material> {
    const response = await api.get<Material>(`/materiais/${id}`);
    return response.data;
  },

  /**
   * Cadastra um novo material (RF001)
   */
  async cadastrar(payload: MaterialPayload): Promise<Material> {
    const response = await api.post<Material>('/materiais', payload);
    return response.data;
  },

  /**
   * Edita os dados de um material existente (RF002)
   */
  async editar(id: number | string, payload: MaterialPayload): Promise<Material> {
    const response = await api.put<Material>(`/materiais/${id}`, payload);
    return response.data;
  },
};

export default materialService;
