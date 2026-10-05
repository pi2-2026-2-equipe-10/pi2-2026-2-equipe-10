import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Lock, User } from 'lucide-react';
import { authService, Funcionario } from '../services/authService';
import { getApiErrorMessage } from '../types/api';

export const Login: React.FC = () => {
  const navigate = useNavigate();

  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loadingFuncionarios, setLoadingFuncionarios] = useState(true);
  const [selectedFuncionarioId, setSelectedFuncionarioId] = useState<string>('');
  const [senha, setSenha] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function carregarFuncionarios() {
      try {
        setLoadingFuncionarios(true);
        const data = await authService.getFuncionarios();
        if (isMounted) {
          setFuncionarios(data);
          // Se houver apenas 1 funcionário, pré-seleciona
          if (data.length === 1) {
            setSelectedFuncionarioId(String(data[0].id));
          }
        }
      } catch (error) {
        if (isMounted) {
          setErro(getApiErrorMessage(error, 'Não foi possível carregar os funcionários.'));
        }
      } finally {
        if (isMounted) {
          setLoadingFuncionarios(false);
        }
      }
    }

    carregarFuncionarios();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!selectedFuncionarioId) {
      setErro('Por favor, selecione seu nome na lista de funcionários.');
      return;
    }

    if (!senha.trim()) {
      setErro('Por favor, informe sua senha de acesso.');
      return;
    }

    try {
      setSubmitting(true);
      await authService.login(Number(selectedFuncionarioId), senha);
      navigate('/materials');
    } catch (error) {
      setErro(getApiErrorMessage(error, 'Falha ao autenticar. Verifique suas credenciais.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout 
      title="Bem-vindo de volta" 
      subtitle="Selecione seu nome e informe sua senha para acessar o sistema."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {erro && (
          <div 
            style={{
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              border: '1px solid #fca5a5',
              lineHeight: 1.4,
            }}
          >
            {erro}
          </div>
        )}

        <div className="input-group">
          <label htmlFor="funcionario-select" className="input-label">
            Funcionário
          </label>
          <div className="input-wrapper">
            <User className="input-icon" />
            <select
              id="funcionario-select"
              className="input-field"
              style={{
                paddingLeft: '2.75rem',
                appearance: 'auto',
                backgroundColor: 'var(--input-bg, #ffffff)',
                cursor: loadingFuncionarios ? 'wait' : 'pointer',
              }}
              value={selectedFuncionarioId}
              onChange={(e) => {
                setSelectedFuncionarioId(e.target.value);
                setErro(null);
              }}
              disabled={loadingFuncionarios || submitting}
              required
            >
              <option value="">
                {loadingFuncionarios ? 'Carregando funcionários...' : 'Selecione o seu nome...'}
              </option>
              {funcionarios.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Input 
            label="Senha" 
            type="password" 
            placeholder="••••••••" 
            icon={Lock}
            value={senha}
            onChange={(e) => {
              setSenha(e.target.value);
              setErro(null);
            }}
            disabled={submitting}
            required
          />
          <div style={{ textAlign: 'right' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              Esqueceu a senha?
            </Link>
          </div>
        </div>

        <Button type="submit" disabled={submitting || loadingFuncionarios}>
          {submitting ? 'Entrando...' : 'Entrar'}
        </Button>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', textAlign: 'center', marginTop: '-0.5rem' }}>
          Senha padrão para teste: <strong>123456</strong>
        </div>
      </form>
      
      <div className="auth-footer">
        Não possui uma conta? <Link to="/register">Cadastre-se</Link>
      </div>
    </AuthLayout>
  );
};
