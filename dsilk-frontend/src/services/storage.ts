/**
 * Utilitários para persistência de sessão e tokens de autenticação (JWT)
 */

export const TOKEN_STORAGE_KEY = '@dsilk:token';
export const USER_STORAGE_KEY = '@dsilk:user';

export interface StoredUser {
  id?: number;
  nome: string;
  email?: string;
  perfil?: 'ADMINISTRADOR' | 'FUNCIONARIO' | string;
}

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (e) {
    console.error('Erro ao salvar token de autenticação:', e);
  }
};

export const removeToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (e) {
    console.error('Erro ao remover token:', e);
  }
};

export const getUser = (): StoredUser | null => {
  try {
    const data = localStorage.getItem(USER_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const setUser = (user: StoredUser): void => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Erro ao salvar dados do usuário:', e);
  }
};

export const removeUser = (): void => {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (e) {
    console.error('Erro ao remover dados do usuário:', e);
  }
};

export const clearSession = (): void => {
  removeToken();
  removeUser();
};

export const isAuthenticated = (): boolean => {
  return Boolean(getToken());
};
