import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '../components/Button';
import { orcamentoService, Orcamento } from '../services/orcamentoService';
import { getApiErrorMessage } from '../types/api';
import { RefreshCw, AlertCircle, Calculator, Search } from 'lucide-react';

export const BudgetsList: React.FC = () => {
  const navigate = useNavigate();

  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'REGISTRADOS' | 'RASCUNHOS'>('TODOS');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarOrcamentos = async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = await orcamentoService.listar();
      setOrcamentos(data);
    } catch (error) {
      setErro(getApiErrorMessage(error, 'Não foi possível carregar os orçamentos.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarOrcamentos();
  }, []);

  const formatarData = (dataStr: string) => {
    try {
      const d = new Date(dataStr);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dataStr;
    }
  };

  const termo = busca.trim().toLowerCase();
  const orcamentosFiltrados = orcamentos.filter((orc) => {
    if (filtroStatus === 'REGISTRADOS' && orc.rascunho) return false;
    if (filtroStatus === 'RASCUNHOS' && !orc.rascunho) return false;
    if (!termo) return true;
    const idMatch = String(orc.id).includes(termo.replace('#', ''));
    const cliMatch = orc.cliente?.nome?.toLowerCase().includes(termo);
    const srvMatch = orc.servico?.nome?.toLowerCase().includes(termo);
    return Boolean(idMatch || cliMatch || srvMatch);
  });

  const qtdRegistrados = orcamentos.filter((o) => !o.rascunho).length;
  const qtdRascunhos = orcamentos.filter((o) => o.rascunho).length;

  return (
    <DashboardLayout activeMenu="Orçamentos">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div className="category-breadcrumb">PROPOSTAS</div>
          <h1 className="page-main-title">Orçamentos</h1>
          <p className="page-main-subtitle">
            Consulte orçamentos gerados, filtre por status, finalize rascunhos e emita novas propostas.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            type="button"
            className="btn-outline-figma" 
            onClick={carregarOrcamentos}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
          <button 
            type="button"
            className="btn-dark" 
            onClick={() => navigate('/budgets/new')}
          >
            + Novo Orçamento
          </button>
        </div>
      </div>

      {/* Barra de Busca e Filtros de Status */}
      {!loading && orcamentos.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setFiltroStatus('TODOS')}
              className={filtroStatus === 'TODOS' ? 'btn-dark' : 'btn-outline-figma'}
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
            >
              Todos ({orcamentos.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroStatus('REGISTRADOS')}
              className={filtroStatus === 'REGISTRADOS' ? 'btn-dark' : 'btn-outline-figma'}
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
            >
              Registrados ({qtdRegistrados})
            </button>
            <button
              type="button"
              onClick={() => setFiltroStatus('RASCUNHOS')}
              className={filtroStatus === 'RASCUNHOS' ? 'btn-dark' : 'btn-outline-figma'}
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
            >
              Rascunhos ({qtdRascunhos})
            </button>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '0.75rem' }} />
            <input
              type="text"
              placeholder="Buscar por #ID, cliente ou serviço..."
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
        </div>
      )}

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
            onClick={carregarOrcamentos}
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

      <div className="dashboard-card" style={{ padding: '0' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
            <p>Carregando orçamentos...</p>
          </div>
        ) : orcamentos.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
            <Calculator size={36} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
            <p style={{ fontWeight: 500, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Nenhum orçamento cadastrado</p>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Realize cálculos dinâmicos de custos e emita propostas para os seus clientes.
            </p>
            <Button variant="primary" style={{ width: 'auto', margin: '0 auto' }} onClick={() => navigate('/budgets/new')}>
              + Criar Primeiro Orçamento
            </Button>
          </div>
        ) : orcamentosFiltrados.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-light)' }}>
            <Search size={32} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
            <p style={{ fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}>
              Nenhum orçamento corresponde aos filtros aplicados
            </p>
            <button
              type="button"
              onClick={() => {
                setBusca('');
                setFiltroStatus('TODOS');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#009FE3',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th># ID</th>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th>Dimensões</th>
                  <th>Custo Total</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {orcamentosFiltrados.map((orc) => (
                  <tr key={orc.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-light)' }}>#{orc.id}</td>
                    <td>
                      {orc.cliente ? (
                        <div>
                          <div style={{ fontWeight: 600 }}>{orc.cliente.nome}</div>
                          {orc.cliente.telefone && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{orc.cliente.telefone}</div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontStyle: 'italic', fontSize: '0.85rem' }}>Não informado</span>
                      )}
                    </td>
                    <td>
                      {orc.servico ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>{orc.servico.nome}</span>
                          <span className={`badge ${orc.servico.tipoCalculo === 'METRAGEM' ? 'badge-cyan' : 'badge-magenta'}`} style={{ fontSize: '0.65rem' }}>
                            {orc.servico.tipoCalculo === 'METRAGEM' ? 'm²' : 'comp'}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Não definido</span>
                      )}
                    </td>
                    <td>
                      {orc.largura && orc.altura ? (
                        <span style={{ fontSize: '0.85rem' }}>
                          {orc.largura}m × {orc.altura}m <small style={{ color: 'var(--text-light)' }}>({(orc.largura * orc.altura).toFixed(2)}m²)</small>
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      {orc.custoTotal != null ? (
                        <span style={{ fontWeight: 700, color: '#16a34a' }}>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orc.custoTotal)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontSize: '0.85rem', fontStyle: 'italic' }}>Pendente</span>
                      )}
                    </td>
                    <td>
                      {orc.rascunho ? (
                        <span className="badge badge-draft">Rascunho</span>
                      ) : (
                        <span className="badge badge-success">Registrado</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                      {formatarData(orc.criadoEm)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => navigate(`/budgets/new?id=${orc.id}`)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--dsilk-cyan)',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        {orc.rascunho ? 'Concluir' : 'Editar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BudgetsList;
