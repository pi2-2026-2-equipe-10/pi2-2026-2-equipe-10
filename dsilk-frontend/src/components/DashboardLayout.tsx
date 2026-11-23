import React, { ReactNode, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  LogOut, 
  UserPlus, 
  ShieldAlert, 
  X, 
  CheckCircle, 
  Lock, 
  User, 
  Shield,
  Users,
  FileText,
  HelpCircle,
  Mail,
  Clock
} from 'lucide-react';
import { getUser, clearSession } from '../services/storage';
import { Logo } from './Logo';
import { authService } from '../services/authService';
import { clienteService, Cliente } from '../services/clienteService';
import { orcamentoService, Orcamento } from '../services/orcamentoService';
import { getApiErrorMessage } from '../types/api';

interface DashboardLayoutProps {
  children: ReactNode;
  activeMenu?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeMenu = 'Visão geral' }) => {
  const navigate = useNavigate();
  const user = getUser();
  const userName = user?.nome || 'Colaborador';
  const isAdmin = user?.perfil === 'ADMINISTRADOR';
  const userRole = isAdmin ? 'Administrador' : 'Funcionário';

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

  // Estado da Busca Global Funcional (Frontend 1 - Milestone 5)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchLoaded, setSearchLoaded] = useState(false);
  const [clientesBusca, setClientesBusca] = useState<Cliente[]>([]);
  const [orcamentosBusca, setOrcamentosBusca] = useState<Orcamento[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const carregarDadosBuscaGlobal = async () => {
    if (searchLoaded || searchLoading) return;
    try {
      setSearchLoading(true);
      const [clis, orcs] = await Promise.all([
        clienteService.listar(),
        orcamentoService.listar(),
      ]);
      setClientesBusca(clis);
      setOrcamentosBusca(orcs);
      setSearchLoaded(true);
    } catch {
      // Silencioso no dropdown de busca rápida
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const termoLimpo = searchQuery.trim().toLowerCase();

  const clientesFiltrados = termoLimpo
    ? clientesBusca
        .filter(
          (c) =>
            c.nome.toLowerCase().includes(termoLimpo) ||
            (c.email && c.email.toLowerCase().includes(termoLimpo)) ||
            (c.telefone && c.telefone.toLowerCase().includes(termoLimpo))
        )
        .slice(0, 4)
    : [];

  const orcamentosFiltrados = termoLimpo
    ? orcamentosBusca
        .filter(
          (o) =>
            String(o.id).includes(termoLimpo.replace('#', '')) ||
            (o.cliente?.nome && o.cliente.nome.toLowerCase().includes(termoLimpo)) ||
            (o.servico?.nome && o.servico.nome.toLowerCase().includes(termoLimpo))
        )
        .slice(0, 4)
    : [];

  // Estado do Modal de Suporte (substituindo alert() nativo)
  const [supportModalOpen, setSupportModalOpen] = useState(false);

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
          {/* Busca Global Funcional */}
          <div
            className="search-container"
            ref={searchContainerRef}
            style={{ position: 'relative' }}
          >
            <Search className="search-icon" size={17} />
            <input 
              type="text" 
              placeholder="Buscar clientes, pedidos (#ID)..." 
              className="header-search"
              value={searchQuery}
              onFocus={() => {
                setSearchOpen(true);
                carregarDadosBuscaGlobal();
              }}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
                carregarDadosBuscaGlobal();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setSearchOpen(false);
                }
              }}
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Limpar busca"
                onClick={() => {
                  setSearchQuery('');
                  setSearchOpen(false);
                }}
                style={{
                  position: 'absolute',
                  right: '0.6rem',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={14} />
              </button>
            )}

            {searchOpen && termoLimpo.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  minWidth: '310px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 12px 24px -4px rgba(15, 23, 42, 0.14)',
                  zIndex: 1100,
                  padding: '0.5rem',
                  maxHeight: '360px',
                  overflowY: 'auto',
                }}
              >
                {searchLoading ? (
                  <div style={{ padding: '0.85rem', fontSize: '0.825rem', color: '#64748B', textAlign: 'center' }}>
                    Buscando registros...
                  </div>
                ) : clientesFiltrados.length === 0 && orcamentosFiltrados.length === 0 ? (
                  <div style={{ padding: '0.85rem', fontSize: '0.825rem', color: '#64748B', textAlign: 'center' }}>
                    Nenhum cliente ou orçamento encontrado para "{searchQuery}".
                  </div>
                ) : (
                  <>
                    {clientesFiltrados.length > 0 && (
                      <div style={{ marginBottom: orcamentosFiltrados.length > 0 ? '0.5rem' : 0 }}>
                        <div
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: '#94A3B8',
                            padding: '0.25rem 0.5rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          Clientes ({clientesFiltrados.length})
                        </div>
                        {clientesFiltrados.map((cli) => (
                          <button
                            key={`cli-${cli.id}`}
                            type="button"
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery('');
                              navigate(`/clients?clienteId=${cli.id}`);
                            }}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.6rem',
                              padding: '0.5rem 0.6rem',
                              background: 'none',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                          >
                            <Users size={15} color="#0284C7" style={{ flexShrink: 0 }} />
                            <div style={{ overflow: 'hidden' }}>
                              <div
                                style={{
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  color: '#0F172A',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {cli.nome}
                              </div>
                              <div style={{ fontSize: '0.73rem', color: '#64748B' }}>
                                {cli.telefone || cli.email || 'Ver perfil do cliente'}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {orcamentosFiltrados.length > 0 && (
                      <div>
                        <div
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: '#94A3B8',
                            padding: '0.25rem 0.5rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          Orçamentos ({orcamentosFiltrados.length})
                        </div>
                        {orcamentosFiltrados.map((orc) => (
                          <button
                            key={`orc-${orc.id}`}
                            type="button"
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery('');
                              navigate(`/budgets/new?id=${orc.id}`);
                            }}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.6rem',
                              padding: '0.5rem 0.6rem',
                              background: 'none',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
                              <FileText size={15} color="#0284C7" style={{ flexShrink: 0 }} />
                              <div style={{ overflow: 'hidden' }}>
                                <div
                                  style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    color: '#0F172A',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  #{orc.id} — {orc.cliente?.nome || 'Sem cliente'}
                                </div>
                                <div style={{ fontSize: '0.73rem', color: '#64748B' }}>
                                  {orc.servico?.nome || 'Serviço'}
                                </div>
                              </div>
                            </div>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                color: orc.rascunho ? '#B45309' : '#15803D',
                                flexShrink: 0,
                              }}
                            >
                              {orc.rascunho ? 'Rascunho' : 'Registrado'}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
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

          {/* Card de Suporte no rodapé da Sidebar (Sem alert() nativo) */}
          <div className="sidebar-support-card">
            <div className="support-tag">SUPORTE</div>
            <div className="support-title">Precisa de ajuda?</div>
            <div className="support-desc">Fale com nossa equipe</div>
            <button 
              type="button" 
              className="support-link"
              onClick={() => setSupportModalOpen(true)}
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

      {/* Modal de Suporte Técnico Dsilk */}
      {supportModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(2px)',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '1.75rem 2rem',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HelpCircle size={20} color="#009FE3" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                  Central de Suporte Dsilk
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSupportModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Precisa de auxílio com fichas técnicas de serigrafia, insumos ou permissões de acesso? Entre em contato pelos canais abaixo:
            </p>

            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', color: '#0F172A' }}>
                <Mail size={16} color="#0284C7" />
                <span>
                  <strong>E-mail:</strong> contato@dsilk.com.br
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', color: '#0F172A' }}>
                <Clock size={16} color="#0284C7" />
                <span>
                  <strong>Atendimento:</strong> Seg a Sex, 08h às 18h
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', color: '#0F172A' }}>
                <Shield size={16} color="#0284C7" />
                <span>
                  <strong>Seu perfil atual:</strong> {userRole}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-dark"
                onClick={() => setSupportModalOpen(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

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
