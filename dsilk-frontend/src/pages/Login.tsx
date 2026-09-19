import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Mail, Lock } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Login realizado com sucesso! (A tela principal ainda será implementada)');
  };

  return (
    <AuthLayout 
      title="Bem-vindo de volta" 
      subtitle="Acesse sua conta para gerenciar orçamentos e serviços."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <Input 
          label="E-mail" 
          type="email" 
          placeholder="seu@email.com" 
          icon={Mail}
          required
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Input 
            label="Senha" 
            type="password" 
            placeholder="••••••••" 
            icon={Lock}
            required
          />
          <div style={{ textAlign: 'right' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              Esqueceu a senha?
            </Link>
          </div>
        </div>
        <Button type="submit">Entrar</Button>
      </form>
      
      <div className="auth-footer">
        Não possui uma conta? <Link to="/register">Cadastre-se</Link>
      </div>
    </AuthLayout>
  );
};
