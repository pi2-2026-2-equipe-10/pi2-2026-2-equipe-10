import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { User, Lock, Shield, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { authService } from '../services/authService';
import { getUser } from '../services/storage';
import { getApiErrorMessage } from '../types/api';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const usuarioLogado = getUser();
  const isAdmin = usuarioLogado?.perfil === 'ADMINISTRADOR';

  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [perfil, setPerfil] = useState<'FUNCIONARIO' | 'ADMINISTRADOR'>('FUNCIONARIO');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (!isAdmin) {
      setErro(
        'Conforme a Matriz de Autorização, apenas usuários autenticados com perfil Administrador podem cadastrar novos colaboradores.'
      );
      return;
    }

    if (!nome.trim()) {
      setErro('Informe o nome completo do funcionário.');
      return;
    }

    if (senha.length < 6) {
      setErro('A senha deve possuir pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas informadas não coincidem.');
      return;
    }

    try {
      setSalvando(true);
      await authService.cadastrarFuncionario({
        nome: nome.trim(),
        senha,
        perfil,
        ativo: true,
      });
      setSucesso(`Colaborador "${nome.trim()}" cadastrado com sucesso!`);
      setNome('');
      setSenha('');
      setConfirmarSenha('');
      setTimeout(() => {
        navigate('/overview');
      }, 1500);
    } catch (err) {
      setErro(getApiErrorMessage(err, 'Não foi possível cadastrar o colaborador.'));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <AuthLayout 
      title="Cadastro de Colaborador" 
      subtitle="Registro de novos funcionários no sistema interno Dsilk."
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {!isAdmin && (
          <div
            style={{
              backgroundColor: '#eff6ff',
              color: '#1e40af',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              lineHeight: 1.45,
            }}
          >
            <Info size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <span>
              <strong>Controle de Acesso (RBAC):</strong> O cadastro de colaboradores (`POST /funcionarios`) exige autenticação com perfil <strong>Administrador</strong>. Faça login como administrador ou utilize o botão <strong>+ Colaborador</strong> no painel.
            </span>
          </div>
        )}

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

        {sucesso && (
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
            <span>{sucesso}</span>
          </div>
        )}

        <Input 
          label="Nome Completo" 
          type="text" 
          placeholder="Ex: Mariana Ribeiro" 
          icon={User}
          value={nome}
          onChange={(e) => {
            setNome(e.target.value);
            setErro(null);
          }}
          disabled={salvando}
          required
        />

        <div className="input-group">
          <label htmlFor="perfil-select" className="input-label">
            Perfil de Acesso
          </label>
          <div className="input-wrapper">
            <Shield className="input-icon" />
            <select
              id="perfil-select"
              className="input-field"
              style={{
                paddingLeft: '2.75rem',
                appearance: 'auto',
                backgroundColor: 'var(--input-bg, #ffffff)',
              }}
              value={perfil}
              onChange={(e) => setPerfil(e.target.value as 'FUNCIONARIO' | 'ADMINISTRADOR')}
              disabled={salvando}
            >
              <option value="FUNCIONARIO">Funcionário (Operacional)</option>
              <option value="ADMINISTRADOR">Administrador (Gestão)</option>
            </select>
          </div>
        </div>

        <Input 
          label="Senha" 
          type="password" 
          placeholder="Crie uma senha de acesso" 
          icon={Lock}
          value={senha}
          onChange={(e) => {
            setSenha(e.target.value);
            setErro(null);
          }}
          disabled={salvando}
          required
        />
        <Input 
          label="Confirmar Senha" 
          type="password" 
          placeholder="Repita a senha" 
          icon={Lock}
          value={confirmarSenha}
          onChange={(e) => {
            setConfirmarSenha(e.target.value);
            setErro(null);
          }}
          disabled={salvando}
          required
        />
        <Button type="submit" disabled={salvando}>
          {salvando ? 'Cadastrando...' : 'Cadastrar Colaborador'}
        </Button>
      </form>
      
      <div className="auth-footer">
        Já possui acesso? <Link to="/login">Ir para o Login</Link>
      </div>
    </AuthLayout>
  );
};
