import React, { ReactNode } from 'react';
import { Logo } from './Logo';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="auth-layout">
      {/* Left Sidebar - Branding */}
      <div className="auth-sidebar">
        <h1 className="auth-sidebar-title">Gestão Inteligente</h1>
        <p className="auth-sidebar-subtitle">
          Sistema interno de orçamentos e planejamento para a gráfica Dsilk.
        </p>
      </div>

      {/* Right Side - Auth Content */}
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <Logo />
            <h2 className="auth-title">{title}</h2>
            <p className="auth-description">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
