import React, { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LogOut, UserPlus, ShieldAlert, X, CheckCircle, Lock, User, Shield } from 'lucide-react';
import { getUser, clearSession } from '../services/storage';
import { Logo } from './Logo';
import { authService } from '../services/authService';
import { getApiErrorMessage } from '../types/api';

interface DashboardLayoutProps {
  children: ReactNode;
  activeMenu?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeMenu = 'Visão geral' }) => {
  const navigate = useNavigate();
  const user = getUser();
  const userName = user?.nome || 'Diego Silva';
  const isAdmin = user?.perfil === 'ADMINISTRADOR';
  const userRole = isAdmin ? 'Administrador' : 'Funcionário';

  // Obter as iniciais do nome para o avatar (ex: "Diego Silva" -> "DS")
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const userInitials = getInitials(userName);

  // Estado para mensagens globais de 403 Forbidden (Frontend 3)
  const [forbiddenError, setForbiddenError] = useState<string | null>(null);

  useEffect(() => {
    const handleForbidden = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string }>;
      setForbiddenError(
        customEvent.detail?.message ||
          'Acesso negado: seu perfil de usuário não tem permissão para realizar esta operação.'
      );
    };

    window.addEventListener('dsilk:forbidden', handleForbidden);
    return () => {
      window.removeEventListener('dsilk:forbidden', handleForbidden);
    };
  }, []);

  // Estado do Modal de Cadastro de Funcionário (exclusivo para Administrador - Frontend 2)
  const [modalOpen, setModalOpen] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [novoPerfil, setNovoPerfil] = useState<'ADMINISTRADOR' | 'FUNCIONARIO'>('FUNCIONARIO');
  const [salvandoColaborador, setSalvandoColaborador] = useState(false);
  const [modalErro, setModalErro] = useState<string | null>(null);
  const [modalSucesso, setModalSucesso] = useState<string | null>(null);

  const handleSalvarColaborador = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalErro(null);
    setModalSucesso(null);

    if (!novoNome.trim()) {
      setModalErro('Informe o nome completo do colaborador.');
      return;
    }
    if (!novaSenha.trim()) {
      setModalErro('Informe a senha de acesso.');
      return;
    }

    try {
      setSalvandoColaborador(true);
      await authService.cadastrarFuncionario({
        nome: novoNome.trim(),
        senha: novaSenha,
        perfil: novoPerfil,
        ativo: true,
      });
      setModalSucesso('Colaborador cadastrado com sucesso!');
      setNovoNome('');
      setNovaSenha('');
      setNovoPerfil('FUNCIONARIO');
      setTimeout(() => {
        setModalOpen(false);
        setModalSucesso(null);
      }, 1500);
    } catch (err) {
      setModalErro(getApiErrorMessage(err, 'Erro ao cadastrar funcionário.'));
    } finally {
      setSalvandoColaborador(false);
    }
  };

  const menuItems = [
    { name: 'Visão geral', path: '/overview' },
    { name: 'Materiais', path: '/materials' },
    { name: 'Clientes', path: '/clients' },
    { name: 'Serviços', path: '/services' },
    { name: 'Orçamentos', path: '/budgets' },
    { name: 'Planejamento', path: '/planning' },
  ];

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      {/* Header Superior Estilo Figma */}
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <div 
            className="dashboard-logo" 
            onClick={() => navigate('/overview')}
            title="Ir para Visão Geral"
            style={{ cursor: 'pointer' }}
          >
            <Logo size={36} />
          </div>
        </div>
        
        <div className="dashboard-header-right">
          <div className="search-container">
            <Search className="search-icon" size={17} />
            <input 
              type="text" 
              placeholder="Buscar clientes, pedidos..." 
              className="header-search"
            />
          </div>

          {/* Interface adaptada ao perfil (Frontend 2): botão visível APENAS para Administrador */}
          {isAdmin && (
            <button
              type="button"
              className="btn-outline-figma"
              onClick={() => {
                setModalErro(null);
                setModalSucesso(null);
                setModalOpen(true);
              }}
              title="Gerenciar funcionários (Acesso de Administrador)"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', gap: '0.35rem' }}
            >
              <UserPlus size={15} />
              <span>+ Colaborador</span>
            </button>
          )}

          <div className="header-user-badge">
            <div className="user-avatar-circle" title={userName}>
              {userInitials}
            </div>
            <div className="user-info-text">
              <span className="user-info-name">{userName}</span>
              <span className={`user-info-role ${isAdmin ? 'text-cyan-600 font-semibold' : ''}`}>
                {userRole}
              </span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleLogout}
            className="header-logout-btn"
            title="Encerrar sessão"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </header>

      <div className="dashboard-main">
        {/* Sidebar Estilo Figma */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-section-title">MENU PRINCIPAL</div>

          {menuItems.map(item => (
            <div 
              key={item.name} 
              className={`sidebar-nav-item ${activeMenu === item.name ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.name}
            </div>
          ))}

          {/* Card de Suporte no rodapé da Sidebar (Figma Image 4) */}
          <div className="sidebar-support-card">
            <div className="support-tag">SUPORTE</div>
            <div className="support-title">Precisa de ajuda?</div>
            <div className="support-desc">Fale com nossa equipe</div>
            <button 
              type="button" 
              className="support-link"
              onClick={() => alert('Central de Suporte Dsilk: contato@dsilk.com.br')}
            >
              Chamar suporte
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="dashboard-content-area">
          {/* Banner de Erro 403 Forbidden (Frontend 3 - Tratamento com mensagem do Design) */}
          {forbiddenError && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                color: '#991b1b',
                padding: '0.85rem 1.25rem',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                border: '1px solid #fecaca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldAlert size={20} color="#dc2626" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{forbiddenError}</span>
              </div>
              <button
                type="button"
                onClick={() => setForbiddenError(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#991b1b',
                  padding: '0.2rem',
                }}
                title="Dispensar aviso"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {children}
        </main>
      </div>

      {/* Modal de Cadastro de Funcionário (Visível apenas para Administrador) */}
      {modalOpen && isAdmin && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(2px)',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '2rem',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                  Novo Colaborador
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            {modalSucesso && (
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  color: '#166534',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                }}
              >
                <CheckCircle size={18} />
                <span>{modalSucesso}</span>
              </div>
            )}

            {modalErro && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  color: '#991b1b',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: '1px solid #fecaca',
                  fontSize: '0.875rem',
                }}
              >
                {modalErro}
              </div>
            )}

            <form onSubmit={handleSalvarColaborador} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Nome Completo
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User size={16} color="#94A3B8" style={{ position: 'absolute', left: '0.85rem' }} />
                  <input
                    type="text"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Ex: Mariana Silva"
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Senha de Acesso
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '0.85rem' }} />
                  <input
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Perfil de Acesso (Matriz de Permissões)
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Shield size={16} color="#94A3B8" style={{ position: 'absolute', left: '0.85rem' }} />
                  <select
                    value={novoPerfil}
                    onChange={(e) => setNovoPerfil(e.target.value as 'ADMINISTRADOR' | 'FUNCIONARIO')}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="FUNCIONARIO">Funcionário (Acesso operacional)</option>
                    <option value="ADMINISTRADOR">Administrador (Gestão de equipe e operacional)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={salvandoColaborador}
                  style={{
                    padding: '0.65rem 1.15rem',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    background: '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoColaborador}
                  className="btn-dark"
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: salvandoColaborador ? 'wait' : 'pointer',
                  }}
                >
                  {salvandoColaborador ? 'Salvando...' : 'Cadastrar Colaborador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
