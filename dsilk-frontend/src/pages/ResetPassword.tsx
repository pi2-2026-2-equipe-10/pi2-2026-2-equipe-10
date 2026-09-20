import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Lock } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Senha alterada com sucesso!');
    navigate('/');
  };

  return (
    <AuthLayout 
      title="Criar Nova Senha" 
      subtitle="O código foi validado. Crie uma nova senha para sua conta."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <Input 
          label="Nova Senha" 
          type="password" 
          placeholder="Mínimo de 8 caracteres" 
          icon={Lock}
          required
        />
        <Input 
          label="Confirmar Nova Senha" 
          type="password" 
          placeholder="Repita a nova senha" 
          icon={Lock}
          required
        />
        <Button type="submit">Redefinir Senha</Button>
      </form>
    </AuthLayout>
  );
};
