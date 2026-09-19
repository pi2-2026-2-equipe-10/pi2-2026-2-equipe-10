import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { KeyRound, ArrowLeft } from 'lucide-react';

export const SendCode: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/reset-password');
  };

  return (
    <AuthLayout 
      title="Código Enviado!" 
      subtitle="Verifique sua caixa de entrada e digite o código numérico recebido."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <Input 
          label="Código de Verificação" 
          type="text" 
          placeholder="Ex: 123456" 
          icon={KeyRound}
          required
        />
        <Button type="submit">Verificar Código</Button>
      </form>
      
      <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <span>Não recebeu o e-mail? <a href="#" onClick={(e) => e.preventDefault()}>Reenviar</a></span>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
          <ArrowLeft size={16} /> Voltar para o Login
        </Link>
      </div>
    </AuthLayout>
  );
};
