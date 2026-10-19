import api from './api';

export interface Cliente {
  id: number;
  nome: string;
  telefone?: string | null;
  email?: string | null;
  observacoes?: string | null;
}

export interface ClientePayload {
  nome: string;
  telefone?: string | null;
  email?: string | null;
  observacoes?: string | null;
}

export const clienteService = {
  /**
   * Consulta a lista de clientes cadastrados (RF003)
   */
  async listar(): Promise<Cliente[]> {
    const response = await api.get<Cliente[]>('/clientes');
    return response.data;
  },

  /**
   * Consulta os dados de um cliente específico por ID (RF003)
   */
  async buscarPorId(id: number | string): Promise<Cliente> {
    const response = await api.get<Cliente>(`/clientes/${id}`);
    return response.data;
  },

  /**
   * Cadastra um novo cliente (RF003)
   */
  async cadastrar(payload: ClientePayload): Promise<Cliente> {
    const response = await api.post<Cliente>('/clientes', payload);
    return response.data;
  },
};

export default clienteService;
