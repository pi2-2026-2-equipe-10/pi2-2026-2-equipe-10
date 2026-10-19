import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { clienteService, Cliente } from '../services/clienteService';
import { getApiErrorMessage } from '../types/api';
import { 
  Users, 
  Plus, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Phone, 
  Mail, 
  FileText 
} from 'lucide-react';

export const ClientsList: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  // Estado do Modal de Cadastro de Cliente
  const [modalAberto, setModalAberto] = useState(false);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState<string | null>(null);

  const carregarClientes = async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = await clienteService.listar();
      setClientes(data);
    } catch (error) {
      setErro(getApiErrorMessage(error, 'Não foi possível carregar a lista de clientes.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  const abrirModal = () => {
    setNome('');
    setTelefone('');
    setEmail('');
    setObservacoes('');
    setErroModal(null);
    setModalAberto(true);
  };

  const fecharModal = () => {
    if (salvando) return;
    setModalAberto(false);
    setErroModal(null);
  };

  const handleSalvarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroModal(null);

    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      setErroModal('O campo "Nome do cliente" é obrigatório.');
      return;
    }

    try {
      setSalvando(true);
      const novoCliente = await clienteService.cadastrar({
        nome: nomeLimpo,
        telefone: telefone.trim() || undefined,
        email: email.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
      });

      setSucesso(`Cliente "${novoCliente.nome}" cadastrado com sucesso!`);
      setModalAberto(false);
      await carregarClientes();
      setTimeout(() => setSucesso(null), 5000);
    } catch (error) {
      setErroModal(getApiErrorMessage(error, 'Erro ao cadastrar cliente. Verifique os dados informados.'));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <DashboardLayout activeMenu="Clientes">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h2 className="auth-title" style={{ textAlign: 'left', marginBottom: '0.25rem' }}>Clientes</h2>
          <p className="auth-description" style={{ textAlign: 'left' }}>
            Centralize contatos e histórico de pedidos
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button 
            variant="outline" 
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }} 
            onClick={carregarClientes}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </Button>
          <Button 
            variant="primary" 
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }} 
            onClick={abrirModal}
          >
            <Plus size={16} />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Alerta de Sucesso */}
      {sucesso && (
        <div 
          style={{
            backgroundColor: '#dcfce7',
            color: '#15803d',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid #86efac',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={20} />
            <span style={{ fontWeight: 500 }}>{sucesso}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setSucesso(null)} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15803d' }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Alerta de Erro */}
      {erro && (
        <div 
          style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid #fca5a5',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} />
            <span>{erro}</span>
          </div>
          <button
            type="button"
            onClick={carregarClientes}
            style={{
              background: 'none',
              border: 'none',
              color: '#b91c1c',
              textDecoration: 'underline',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Tabela ou Estados de Tela */}
      <div className="dashboard-card" style={{ padding: '0' }}>
        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-light)' }}>
            <RefreshCw size={26} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
            <p style={{ fontWeight: 500 }}>Carregando clientes do servidor...</p>
          </div>
        ) : clientes.length === 0 ? (
          <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-light)' }}>
            <Users size={40} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
            <p style={{ fontWeight: 600, fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Nenhum cliente cadastrado
            </p>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
              Cadastre seus clientes para associá-los diretamente aos orçamentos e propostas comerciais.
            </p>
            <Button variant="primary" style={{ width: 'auto', margin: '0 auto' }} onClick={abrirModal}>
              + Cadastrar Primeiro Cliente
            </Button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>E-mail</th>
                  <th>Observações</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cli) => (
                  <tr key={cli.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={16} style={{ opacity: 0.5 }} />
                        <span>{cli.nome}</span>
                      </div>
                    </td>
                    <td>
                      {cli.telefone ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Phone size={14} style={{ opacity: 0.5 }} />
                          {cli.telefone}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Não informado</span>
                      )}
                    </td>
                    <td>
                      {cli.email ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Mail size={14} style={{ opacity: 0.5 }} />
                          {cli.email}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Não informado</span>
                      )}
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      {cli.observacoes ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <FileText size={14} style={{ opacity: 0.5, flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {cli.observacoes}
                          </span>
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Cadastro de Cliente */}
      {modalAberto && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div 
            className="dashboard-card" 
            style={{ 
              width: '100%', 
              maxWidth: '520px', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              margin: 0,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={22} style={{ color: 'var(--primary-color, #2563eb)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Cadastrar Novo Cliente</h3>
              </div>
              <button 
                type="button" 
                onClick={fecharModal} 
                disabled={salvando}
                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7 }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginBottom: '1.5rem' }}>
              Os dados do cliente ficarão disponíveis imediatamente para vincular aos orçamentos e serviços.
            </p>

            {erroModal && (
              <div 
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#b91c1c',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  marginBottom: '1.25rem',
                  fontSize: '0.875rem',
                  border: '1px solid #fca5a5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={18} />
                <span>{erroModal}</span>
              </div>
            )}

            <form onSubmit={handleSalvarCliente} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Input 
                label="Nome do Cliente *" 
                placeholder="Ex: João da Silva / Gráfica Central" 
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  setErroModal(null);
                }}
                disabled={salvando}
                required 
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input 
                  label="Telefone / WhatsApp" 
                  placeholder="(61) 99999-9999" 
                  value={telefone}
                  onChange={(e) => {
                    setTelefone(e.target.value);
                    setErroModal(null);
                  }}
                  disabled={salvando}
                />
                <Input 
                  label="E-mail" 
                  type="email" 
                  placeholder="cliente@email.com" 
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErroModal(null);
                  }}
                  disabled={salvando}
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="obs-cliente">
                  Observações (Opcional)
                </label>
                <textarea 
                  id="obs-cliente"
                  className="input-field"
                  placeholder="Informações adicionais, endereço ou condições especiais..."
                  rows={3}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  disabled={salvando}
                  style={{ resize: 'vertical', width: '100%', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button 
                  type="button" 
                  variant="outline" 
                  style={{ width: 'auto' }} 
                  onClick={fecharModal}
                  disabled={salvando}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  style={{ width: 'auto' }}
                  disabled={salvando}
                >
                  {salvando ? 'Salvando...' : 'Cadastrar Cliente'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
