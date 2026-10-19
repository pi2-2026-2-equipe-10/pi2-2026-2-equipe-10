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
      {/* Left Sidebar - Branding (Figma Image 2) */}
      <div className="auth-sidebar">
        <h1 className="auth-sidebar-title" style={{ fontSize: '2rem', fontWeight: 700, color: '#334155' }}>
          Gestão simples para ideias que ganham forma.
        </h1>
        <div style={{ display: 'flex', width: '120px', height: '5px', marginTop: '1.5rem', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ flex: 1, backgroundColor: '#009FE3' }}></div>
          <div style={{ flex: 1, backgroundColor: '#E6007E' }}></div>
          <div style={{ flex: 1, backgroundColor: '#FFD100' }}></div>
          <div style={{ flex: 1, backgroundColor: '#18181B' }}></div>
        </div>
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
