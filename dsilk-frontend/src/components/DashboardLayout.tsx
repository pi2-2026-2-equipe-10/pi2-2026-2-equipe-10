import React, { ReactNode } from 'react';
import { User, Search } from 'lucide-react';
import { Logo } from './Logo';

interface DashboardLayoutProps {
  children: ReactNode;
  activeMenu?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeMenu = 'Materiais' }) => {
  const menuItems = ['Materiais', 'Clientes', 'Serviços', 'Orçamentos', 'Planejamento'];

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <div style={{ transform: 'scale(0.85)', transformOrigin: 'left center', marginBottom: '-2rem', paddingTop: '10px' }}>
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
          <div className="header-profile-icon">
            <User size={20} />
          </div>
        </div>
      </header>

      <div className="dashboard-main">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          {menuItems.map(item => (
            <div 
              key={item} 
              className={`sidebar-nav-item ${activeMenu === item ? 'active' : ''}`}
            >
              {item}
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
