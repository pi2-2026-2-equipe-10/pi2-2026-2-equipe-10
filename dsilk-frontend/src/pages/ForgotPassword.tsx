import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Mail, ArrowLeft, AlertCircle } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const emailLimpo = email.trim();
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailLimpo || !regexEmail.test(emailLimpo)) {
      setErro('Informe um endereço de e-mail válido cadastrado no sistema.');
      return;
    }

    setEnviando(true);
    try {
      sessionStorage.setItem('@dsilk:recovery_email', emailLimpo);
    } catch {
      // Ignora erro de storage
    }

    setTimeout(() => {
      setEnviando(false);
      navigate('/send-code');
    }, 350);
  };

  return (
    <AuthLayout 
      title="Recuperar Senha" 
      subtitle="Informe o e-mail cadastrado para receber um código de verificação de 5 dígitos."
    >
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
          label="E-mail cadastrado" 
          type="email" 
          placeholder="colaborador@dsilk.com.br" 
          icon={Mail}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErro(null);
          }}
          disabled={enviando}
          required
        />
        <Button type="submit" disabled={enviando}>
          {enviando ? 'Enviando código...' : 'Enviar Código de 5 Dígitos'}
        </Button>
      </form>
      
      <div className="auth-footer">
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <ArrowLeft size={16} /> Voltar para o Login
        </Link>
      </div>
    </AuthLayout>
  );
};
