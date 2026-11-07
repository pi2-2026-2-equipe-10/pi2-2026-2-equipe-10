import api from './api';
import { setToken, setUser, clearSession } from './storage';

export interface Funcionario {
  id: number;
  nome: string;
  perfil?: string;
}

export interface LoginResponse {
  token: string;
  funcionario: {
    id: number;
    nome: string;
    perfil: string;
  };
}

export interface CadastrarFuncionarioData {
  nome: string;
  senha: string;
  perfil?: 'ADMINISTRADOR' | 'FUNCIONARIO' | string;
  ativo?: boolean;
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
      perfil: funcionario.perfil,
    });
    return response.data;
  },

  /**
   * Cadastra um novo funcionário no sistema (RF012).
   * Operação permitida apenas para o perfil ADMINISTRADOR.
   */
  async cadastrarFuncionario(dados: CadastrarFuncionarioData): Promise<Funcionario> {
    const response = await api.post<Funcionario>('/funcionarios', dados);
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
