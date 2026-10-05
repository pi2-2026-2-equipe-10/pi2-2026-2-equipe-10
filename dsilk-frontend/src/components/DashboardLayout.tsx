import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Search, LogOut } from 'lucide-react';
import { Logo } from './Logo';

interface DashboardLayoutProps {
  children: ReactNode;
  activeMenu?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeMenu = 'Materiais' }) => {
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Materiais', path: '/materials' },
    { name: 'Clientes', path: '/clients' },
    { name: 'Serviços', path: '/services' },
    { name: 'Orçamentos', path: '/budgets' },
    { name: 'Planejamento', path: '/planning' },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <div 
            onClick={() => navigate('/materials')}
            style={{ 
              transform: 'scale(0.85)', 
              transformOrigin: 'left center', 
              marginBottom: '-2rem', 
              paddingTop: '10px',
              cursor: 'pointer' 
            }}
            title="Ir para tela inicial"
          >
             <Logo />
          </div>
        </div>
        
        <div className="dashboard-header-right">
          <div className="search-container">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="header-search"
            />
          </div>
          <div 
            className="header-profile-icon" 
            title="Sair / Logout"
            onClick={handleLogout}
          >
            <User size={20} />
          </div>
          <button 
            type="button"
            onClick={handleLogout}
            className="header-logout-btn"
            title="Encerrar sessão"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </header>

      <div className="dashboard-main">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          {menuItems.map(item => (
            <div 
              key={item.name} 
              className={`sidebar-nav-item ${activeMenu === item.name ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.name}
            </div>
          ))}
        </aside>

        {/* Content Area */}
        <main className="dashboard-content-area">
          {children}
        </main>
      </div>
    </div>
  );
};
