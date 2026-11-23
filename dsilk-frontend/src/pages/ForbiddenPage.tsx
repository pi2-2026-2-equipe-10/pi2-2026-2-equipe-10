import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { Logo } from '../components/Logo';
import { getUser, clearSession } from '../services/storage';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const user = getUser();
  const userName = user?.nome || 'Colaborador';
  const userRole = user?.perfil === 'ADMINISTRADOR' ? 'Administrador' : 'Funcionário';

  const handleTrocarConta = () => {
    clearSession();
    navigate('/login');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        fontFamily: 'var(--font-body, Inter, sans-serif)',
      }}
    >
      <div
        className="dashboard-card"
        style={{
          width: '100%',
          maxWidth: '480px',
          textAlign: 'center',
          padding: '2.5rem 2rem',
          borderTop: '4px solid #E6007E',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <Logo size={42} />
        </div>

        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
          }}
        >
          <ShieldAlert size={32} color="#DC2626" aria-hidden="true" />
        </div>

        <span
          style={{
            display: 'inline-block',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#BE185D',
            backgroundColor: '#FCE7F3',
            padding: '0.25rem 0.75rem',
            borderRadius: '999px',
            marginBottom: '0.75rem',
          }}
        >
          Erro 403 • Acesso Restrito
        </span>

        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0 0 0.65rem 0',
          }}
        >
          Sem permissão de acesso
        </h1>

        <p
          style={{
            fontSize: '0.9rem',
            color: '#475569',
            lineHeight: 1.55,
            margin: '0 0 1.5rem 0',
          }}
        >
          Você não possui permissão para acessar esta funcionalidade. Conforme a Matriz de
          Autorização da Dsilk, esta operação é restrita ao perfil <strong>Administrador</strong>.
        </p>

        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            fontSize: '0.825rem',
            color: '#334155',
          }}
        >
          <Lock size={15} color="#0284C7" style={{ flexShrink: 0 }} aria-hidden="true" />
          <span>
            Conectado como <strong>{userName}</strong> ({userRole})
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn-dark"
            onClick={() => navigate('/overview')}
            style={{ width: '100%', padding: '0.75rem 1.25rem' }}
          >
            <ArrowLeft size={16} />
            Voltar para Visão Geral
          </button>

          <button
            type="button"
            className="btn-outline-figma"
            onClick={handleTrocarConta}
            style={{ width: '100%', padding: '0.7rem 1.25rem' }}
          >
            Entrar com outra conta
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
