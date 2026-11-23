import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [redefinidaComSucesso, setRedefinidaComSucesso] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    // RN-08: A nova senha deve possuir no mínimo 8 caracteres e ser diferente da senha anteriormente utilizada
    if (novaSenha.length < 8) {
      setErro('A nova senha deve possuir no mínimo 8 caracteres (RN-08).');
      return;
    }

    if (novaSenha === '123456') {
      setErro('A nova senha deve ser diferente da senha anteriormente utilizada (RN-08).');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('A confirmação de senha não coincide com a nova senha informada.');
      return;
    }

    try {
      sessionStorage.removeItem('@dsilk:recovery_email');
      sessionStorage.removeItem('@dsilk:recovery_verified');
    } catch {
      // Ignora erro de storage
    }

    setRedefinidaComSucesso(true);
  };

  return (
    <AuthLayout 
      title="Criar Nova Senha" 
      subtitle="A nova senha deve ter no mínimo 8 caracteres e ser diferente da senha anterior (RN-08)."
    >
      {redefinidaComSucesso ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              backgroundColor: '#dcfce7',
              color: '#15803d',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              border: '1px solid #86efac',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              lineHeight: 1.45,
            }}
          >
            <CheckCircle size={20} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
                Senha redefinida com sucesso!
              </strong>
              <span>
                Sua nova senha atende aos requisitos de segurança (RN-08). Você já pode retornar à tela de login para acessar o sistema.
              </span>
            </div>
          </div>

          <Button type="button" onClick={() => navigate('/login')}>
            Retornar à Tela de Login
          </Button>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {erro && (
            <div
              style={{
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                border: '1px solid #fca5a5',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                lineHeight: 1.4,
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{erro}</span>
            </div>
          )}

          <Input 
            label="Nova Senha (mínimo 8 caracteres)" 
            type="password" 
            placeholder="Mínimo de 8 caracteres" 
            icon={Lock}
            value={novaSenha}
            onChange={(e) => {
              setNovaSenha(e.target.value);
              setErro(null);
            }}
            required
          />
          <Input 
            label="Confirmar Nova Senha" 
            type="password" 
            placeholder="Repita a nova senha" 
            icon={Lock}
            value={confirmarSenha}
            onChange={(e) => {
              setConfirmarSenha(e.target.value);
              setErro(null);
            }}
            required
          />
          <Button type="submit">Salvar Nova Senha</Button>

          <div className="auth-footer">
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <ArrowLeft size={16} /> Voltar para o Login
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};
