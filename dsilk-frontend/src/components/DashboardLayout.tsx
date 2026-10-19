import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LogOut } from 'lucide-react';
import { getUser, clearSession } from '../services/storage';

interface DashboardLayoutProps {
  children: ReactNode;
  activeMenu?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeMenu = 'Visão geral' }) => {
  const navigate = useNavigate();
  const user = getUser();
  const userName = user?.nome || 'Diego Silva';

  // Obter as iniciais do nome para o avatar (ex: "Diego Silva" -> "DS")
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const userInitials = getInitials(userName);

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
          >
            <div className="logo-icon">
              <div className="logo-blade blade-cyan"></div>
              <div className="logo-blade blade-magenta"></div>
              <div className="logo-blade blade-yellow"></div>
              <div className="logo-blade blade-black"></div>
            </div>
            <span className="logo-text">Dsilk</span>
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

          <div className="header-user-badge">
            <div className="user-avatar-circle" title={userName}>
              {userInitials}
            </div>
            <div className="user-info-text">
              <span className="user-info-name">{userName}</span>
              <span className="user-info-role">Administrador</span>
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
          {children}
        </main>
      </div>
    </div>
  );
};
