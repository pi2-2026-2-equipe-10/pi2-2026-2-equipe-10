import api from './api';
import { setToken, setUser, clearSession } from './storage';

export interface Funcionario {
  id: number;
  nome: string;
}

export interface LoginResponse {
  token: string;
  funcionario: {
    id: number;
    nome: string;
  };
}

export const authService = {
  /**
   * Obtém a lista de funcionários ativos para seleção na tela de login (RF013)
   */
  async getFuncionarios(): Promise<Funcionario[]> {
    const response = await api.get<Funcionario[]>('/funcionarios');
    return response.data;
  },

  /**
   * Autentica o funcionário com seu ID e senha, salvando token e dados de sessão
   */
  async login(funcionarioId: number, senha: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/login', {
      funcionarioId,
      senha,
    });
    const { token, funcionario } = response.data;
    setToken(token);
    setUser({
      id: funcionario.id,
      nome: funcionario.nome,
    });
    return response.data;
  },

  /**
   * Encerra a sessão do usuário
   */
  logout(): void {
    clearSession();
  },
};

export default authService;
