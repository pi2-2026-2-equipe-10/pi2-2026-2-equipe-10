import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { User, Mail, Lock } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Cadastro realizado com sucesso!');
    navigate('/');
  };

  return (
    <AuthLayout 
      title="Crie sua conta" 
      subtitle="Preencha os dados abaixo para acesso ao sistema interno."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <Input 
          label="Nome Completo" 
          type="text" 
          placeholder="Seu nome" 
          icon={User}
          required
        />
        <Input 
          label="E-mail Corporativo" 
          type="email" 
          placeholder="seu@email.com" 
          icon={Mail}
          required
        />
        <Input 
          label="Senha" 
          type="password" 
          placeholder="Crie uma senha forte" 
          icon={Lock}
          required
        />
        <Input 
          label="Confirmar Senha" 
          type="password" 
          placeholder="Repita a senha" 
          icon={Lock}
          required
        />
        <Button type="submit">Cadastrar</Button>
      </form>
      
      <div className="auth-footer">
        Já tem uma conta? <Link to="/">Fazer Login</Link>
      </div>
    </AuthLayout>
  );
};
