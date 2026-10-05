import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '../components/Button';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  activeMenu: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, activeMenu }) => {
  const navigate = useNavigate();

  return (
    <DashboardLayout activeMenu={activeMenu}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 className="auth-title" style={{ textAlign: 'left', marginBottom: '0.25rem' }}>{title}</h2>
        <p className="auth-description" style={{ textAlign: 'left' }}>Módulo em desenvolvimento</p>
      </div>

      <div className="dashboard-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <Construction size={48} style={{ color: 'var(--dsilk-cyan)', marginBottom: '1rem', display: 'inline-block' }} />
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Módulo de {title}</h3>
        <p style={{ color: 'var(--text-light)', maxWidth: '450px', margin: '0 auto 1.5rem auto' }}>
          Esta tela será implementada e integrada às rotas do backend na próxima etapa do sistema (Issue #56).
        </p>
        <Button variant="primary" style={{ width: 'auto' }} onClick={() => navigate('/materials')}>
          Ir para Gestão de Materiais
        </Button>
      </div>
    </DashboardLayout>
  );
};
