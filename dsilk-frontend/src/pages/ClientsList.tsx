import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { clienteService, Cliente } from '../services/clienteService';
import { orcamentoService, Orcamento } from '../services/orcamentoService';
import { getApiErrorMessage } from '../types/api';
import { 
  Users, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Phone, 
  Mail, 
  FileText,
  Search,
  Eye,
  Plus,
  ExternalLink
} from 'lucide-react';

export const ClientsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const clienteIdQuery = searchParams.get('clienteId');

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  // Estado do Modal de Perfil do Cliente (TEL-09 / Matriz 5 e 5.1)
  const [clientePerfil, setClientePerfil] = useState<Cliente | null>(null);

  // Estado do Modal de Cadastro de Cliente
  const [modalAberto, setModalAberto] = useState(false);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState<string | null>(null);

  const carregarClientes = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const [listaClientes, listaOrcamentos] = await Promise.all([
        clienteService.listar(),
        orcamentoService.listar().catch(() => [] as Orcamento[]),
      ]);
      setClientes(listaClientes);
      setOrcamentos(listaOrcamentos);
    } catch (error) {
      setErro(getApiErrorMessage(error, 'Não foi possível carregar a lista de clientes.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

  // Abre o perfil automaticamente quando navegado via busca global (?clienteId=...)
  useEffect(() => {
    if (clienteIdQuery && clientes.length > 0) {
      const encontrado = clientes.find((c) => String(c.id) === String(clienteIdQuery));
      if (encontrado) {
        setClientePerfil(encontrado);
      }
    }
  }, [clienteIdQuery, clientes]);

  const fecharPerfilCliente = () => {
    setClientePerfil(null);
    if (clienteIdQuery) {
      searchParams.delete('clienteId');
      setSearchParams(searchParams, { replace: true });
    }
  };

  const obterOrcamentosDoCliente = (clienteId: number) =>
    orcamentos.filter(
      (o) => o.clienteId === clienteId || (o.cliente && o.cliente.id === clienteId)
    );

  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  const formatarData = (dataStr: string) => {
    try {
      return new Date(dataStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dataStr;
    }
  };

  const abrirModal = () => {
    setNome('');
    setTelefone('');
    setEmail('');
    setObservacoes('');
    setErroModal(null);
    setModalAberto(true);
  };

  const fecharModal = useCallback(() => {
    if (salvando) return;
    setModalAberto(false);
    setErroModal(null);
  }, [salvando]);

  // Acessibilidade: fechar modais com tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modalAberto) fecharModal();
        if (clientePerfil) {
          setClientePerfil(null);
          if (clienteIdQuery) {
            searchParams.delete('clienteId');
            setSearchParams(searchParams, { replace: true });
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalAberto, clientePerfil, fecharModal, clienteIdQuery, searchParams, setSearchParams]);

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

  const termo = busca.trim().toLowerCase();
  const clientesFiltrados = termo
    ? clientes.filter(
        (c) =>
          c.nome.toLowerCase().includes(termo) ||
          (c.telefone && c.telefone.toLowerCase().includes(termo)) ||
          (c.email && c.email.toLowerCase().includes(termo)) ||
          (c.observacoes && c.observacoes.toLowerCase().includes(termo))
      )
    : clientes;

  const orcamentosPerfil = clientePerfil ? obterOrcamentosDoCliente(clientePerfil.id) : [];
  const totalFinanceiroPerfil = orcamentosPerfil
    .filter((o) => !o.rascunho && o.custoTotal != null)
    .reduce((acc, o) => acc + (o.custoTotal || 0), 0);

  return (
    <DashboardLayout activeMenu="Clientes">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div className="category-breadcrumb">CONTATOS</div>
          <h1 className="page-main-title">Clientes</h1>
          <p className="page-main-subtitle">
            Centralize contatos, consulte o perfil detalhado e o histórico de pedidos de cada cliente.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '0.75rem' }} />
            <input
              type="text"
              placeholder="Filtrar por nome, telefone ou e-mail..."
              className="header-search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{
                paddingLeft: '2.25rem',
                width: '260px',
                backgroundColor: '#FFFFFF',
              }}
            />
          </div>
          <button 
            type="button"
            className="btn-outline-figma" 
            onClick={carregarClientes}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
          <button 
            type="button"
            className="btn-dark" 
            onClick={abrirModal}
          >
            + Novo Cliente
          </button>
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
            aria-label="Dispensar mensagem de sucesso"
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
        ) : clientesFiltrados.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-light)' }}>
            <Search size={32} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
            <p style={{ fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}>
              Nenhum cliente encontrado para "{busca}"
            </p>
            <button
              type="button"
              onClick={() => setBusca('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#009FE3',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Limpar filtro
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>E-mail</th>
                  <th>Pedidos</th>
                  <th>Observações</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((cli) => {
                  const orcsCli = obterOrcamentosDoCliente(cli.id);
                  return (
                    <tr
                      key={cli.id}
                      onClick={() => setClientePerfil(cli)}
                      style={{ cursor: 'pointer' }}
                      title="Clique para visualizar o perfil e histórico do cliente"
                    >
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
                      <td>
                        <span className={`badge ${orcsCli.length > 0 ? 'badge-cyan' : 'badge-draft'}`}>
                          {orcsCli.length} {orcsCli.length === 1 ? 'pedido' : 'pedidos'}
                        </span>
                      </td>
                      <td style={{ maxWidth: '240px' }}>
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
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setClientePerfil(cli);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#009FE3',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <Eye size={15} />
                          Ver perfil
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Perfil do Cliente e Histórico de Pedidos (TEL-09 / Matriz 5 e 5.1) */}
      {clientePerfil && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            backdropFilter: 'blur(2px)',
          }}
        >
          <div
            className="dashboard-card"
            style={{
              width: '100%',
              maxWidth: '680px',
              margin: 0,
              maxHeight: '88vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1.25rem',
                gap: '1rem',
              }}
            >
              <div>
                <div className="category-breadcrumb">PERFIL DO CLIENTE</div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0.2rem 0', color: '#0F172A' }}>
                  {clientePerfil.nome}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    fontSize: '0.85rem',
                    color: '#64748B',
                    marginTop: '0.35rem',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Phone size={14} />
                    {clientePerfil.telefone || 'Telefone não informado'}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={14} />
                    {clientePerfil.email || 'E-mail não informado'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                aria-label="Fechar perfil do cliente"
                onClick={fecharPerfilCliente}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={22} />
              </button>
            </div>

            {clientePerfil.observacoes && (
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.85rem',
                  color: '#334155',
                  marginBottom: '1.25rem',
                }}
              >
                <strong>Observações:</strong> {clientePerfil.observacoes}
              </div>
            )}

            {/* Resumo Financeiro do Cliente */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.85rem',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  backgroundColor: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0369A1' }}>
                  TOTAL DE PEDIDOS
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
                  {orcamentosPerfil.length}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803D' }}>
                  VALOR REGISTRADO
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#166534', marginTop: '0.2rem' }}>
                  {formatarMoeda(totalFinanceiroPerfil)}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#B45309' }}>
                  EM RASCUNHO
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#92400E', marginTop: '0.2rem' }}>
                  {orcamentosPerfil.filter((o) => o.rascunho).length}
                </div>
              </div>
            </div>

            {/* Histórico de Orçamentos / Pedidos do Cliente */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                Histórico de Orçamentos e Pedidos
              </h4>
              <button
                type="button"
                className="btn-dark"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                onClick={() => navigate(`/budgets/new?clienteId=${clientePerfil.id}`)}
              >
                <Plus size={14} />
                Novo Orçamento para {clientePerfil.nome.split(' ')[0]}
              </button>
            </div>

            {orcamentosPerfil.length === 0 ? (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px dashed #CBD5E1',
                  color: '#64748B',
                  fontSize: '0.875rem',
                }}
              >
                Nenhum orçamento vinculado a este cliente ainda.
              </div>
            ) : (
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                <table className="dashboard-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th># ID</th>
                      <th>Serviço</th>
                      <th>Valor</th>
                      <th>Status</th>
                      <th>Data</th>
                      <th style={{ textAlign: 'right' }}>Detalhes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orcamentosPerfil.map((orc) => (
                      <tr key={orc.id}>
                        <td style={{ fontWeight: 600, color: '#64748B' }}>#{orc.id}</td>
                        <td>
                          {orc.servico?.nome || 'Não definido'}
                          {orc.largura && orc.altura ? ` (${orc.largura}m × ${orc.altura}m)` : ''}
                        </td>
                        <td style={{ fontWeight: 700, color: '#15803D' }}>
                          {orc.custoTotal != null ? formatarMoeda(orc.custoTotal) : 'Pendente'}
                        </td>
                        <td>
                          <span className={`badge ${orc.rascunho ? 'badge-draft' : 'badge-success'}`}>
                            {orc.rascunho ? 'Rascunho' : 'Registrado'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#64748B' }}>
                          {formatarData(orc.criadoEm)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => navigate(`/budgets/new?id=${orc.id}`)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#009FE3',
                              fontWeight: 600,
                              fontSize: '0.825rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            Abrir
                            <ExternalLink size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn-outline-figma"
                onClick={fecharPerfilCliente}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

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
                aria-label="Fechar modal de cadastro de cliente"
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
