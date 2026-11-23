import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { KeyRound, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

export const SendCode: React.FC = () => {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [emailRecuperacao, setEmailRecuperacao] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [avisoReenvio, setAvisoReenvio] = useState<string | null>(null);

  useEffect(() => {
    try {
      const salvo = sessionStorage.getItem('@dsilk:recovery_email');
      if (salvo) {
        setEmailRecuperacao(salvo);
      }
    } catch {
      // Ignora erro de storage
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setAvisoReenvio(null);

    const codigoLimpo = codigo.trim();
    // RN-06 e RN-07: código de verificação deve possuir exatamente 5 dígitos numéricos
    if (!/^\d{5}$/.test(codigoLimpo)) {
      setErro('O código de verificação deve conter exatamente 5 dígitos numéricos.');
      return;
    }

    try {
      sessionStorage.setItem('@dsilk:recovery_verified', '1');
    } catch {
      // Ignora erro de storage
    }

    navigate('/reset-password');
  };

  const handleReenviar = () => {
    setErro(null);
    const destino = emailRecuperacao || 'seu e-mail cadastrado';
    setAvisoReenvio(`Um novo código de 5 dígitos foi encaminhado para ${destino}.`);
  };

  return (
    <AuthLayout 
      title="Validar Código" 
      subtitle={
        emailRecuperacao
          ? `Digite o código de 5 dígitos enviado para ${emailRecuperacao}.`
          : 'Verifique sua caixa de entrada e informe o código de 5 dígitos recebido.'
      }
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

        {avisoReenvio && (
          <div
            style={{
              backgroundColor: '#dcfce7',
              color: '#15803d',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              border: '1px solid #86efac',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              lineHeight: 1.4,
            }}
          >
            <CheckCircle size={18} style={{ flexShrink: 0 }} />
            <span>{avisoReenvio}</span>
          </div>
        )}

        <Input 
          label="Código de Verificação (5 dígitos)" 
          type="text" 
          inputMode="numeric"
          maxLength={5}
          placeholder="Ex: 12345" 
          icon={KeyRound}
          value={codigo}
          onChange={(e) => {
            const apenasDigitos = e.target.value.replace(/\D/g, '').slice(0, 5);
            setCodigo(apenasDigitos);
            setErro(null);
          }}
          required
        />
        <Button type="submit">Validar Código</Button>
      </form>
      
      <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <span>
          Não recebeu o e-mail?{' '}
          <button
            type="button"
            onClick={handleReenviar}
            style={{
              background: 'none',
              border: 'none',
              color: '#009FE3',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
              fontSize: 'inherit',
            }}
          >
            Reenviar código
          </button>
        </span>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
          <ArrowLeft size={16} /> Voltar para o Login
        </Link>
      </div>
    </AuthLayout>
  );
};
