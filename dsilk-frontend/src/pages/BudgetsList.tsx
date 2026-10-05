import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '../components/Button';
import { orcamentoService, Orcamento } from '../services/orcamentoService';
import { getApiErrorMessage } from '../types/api';
import { RefreshCw, Plus, AlertCircle, Calculator } from 'lucide-react';

export const BudgetsList: React.FC = () => {
  const navigate = useNavigate();

  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
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

  return (
    <DashboardLayout activeMenu="Orçamentos">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h2 className="auth-title" style={{ textAlign: 'left', marginBottom: '0.25rem' }}>Orçamentos & Propostas</h2>
          <p className="auth-description" style={{ textAlign: 'left' }}>
            Consulte orçamentos gerados, finalize rascunhos e emita novas propostas (RF006 a RF009)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button 
            variant="outline" 
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }} 
            onClick={carregarOrcamentos}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </Button>
          <Button 
            variant="primary" 
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }} 
            onClick={() => navigate('/budgets/new')}
          >
            <Plus size={16} />
            Novo Orçamento
          </Button>
        </div>
      </div>

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
        ) : (
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
              {orcamentos.map((orc) => (
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
                      {orc.rascunho ? 'Concluir' : 'Visualizar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BudgetsList;
