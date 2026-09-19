import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Mail, ArrowLeft } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending email and go to next step
    navigate('/send-code');
  };

  return (
    <AuthLayout 
      title="Recuperar Senha" 
      subtitle="Digite o e-mail associado à sua conta para receber um código de recuperação."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <Input 
          label="E-mail" 
          type="email" 
          placeholder="seu@email.com" 
          icon={Mail}
          required
        />
        <Button type="submit">Enviar Código</Button>
      </form>
      
      <div className="auth-footer">
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <ArrowLeft size={16} /> Voltar para o Login
        </Link>
      </div>
    </AuthLayout>
  );
};
