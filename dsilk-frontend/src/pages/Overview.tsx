import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { orcamentoService, Orcamento } from '../services/orcamentoService';
import { planejamentoService, DiaPlanejamento } from '../services/planejamentoService';
import { getApiErrorMessage } from '../types/api';
import { 
  FileText, 
  Clock, 
  Check, 
  TrendingUp, 
  ChevronRight, 
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  Plus,
  Calendar
} from 'lucide-react';

export const Overview: React.FC = () => {
  const navigate = useNavigate();

  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [diasSemana, setDiasSemana] = useState<DiaPlanejamento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarIndicadores = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const [listaOrcamentos, agendaSemana] = await Promise.all([
        orcamentoService.listar(),
        planejamentoService.obterSemana(),
      ]);
      setOrcamentos(listaOrcamentos);
      setDiasSemana(agendaSemana);
    } catch (err) {
      setErro(getApiErrorMessage(err, 'Não foi possível carregar os indicadores da visão geral.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarIndicadores();
  }, [carregarIndicadores]);

  const hojeStr = new Date().toISOString().split('T')[0];

  // Métricas reais derivadas do backend
  const orcamentosEmAberto = orcamentos.filter((o) => o.rascunho).length;
  const orcamentosRegistrados = orcamentos.filter((o) => !o.rascunho).length;
  const faturamentoEstimado = orcamentos
    .filter((o) => !o.rascunho && o.custoTotal != null)
    .reduce((acc, o) => acc + (o.custoTotal || 0), 0);

  const valorEmRascunhos = orcamentos
    .filter((o) => o.rascunho && o.custoTotal != null)
    .reduce((acc, o) => acc + (o.custoTotal || 0), 0);

  const totalAtividadesSemana = diasSemana.reduce(
    (acc, d) => acc + (d.atividades ? d.atividades.length : 0),
    0
  );
  const atividadesHoje =
    diasSemana.find((d) => d.dia === hojeStr)?.atividades?.length || 0;

  // Últimos 5 orçamentos ordenados pelo mais recente
  const pedidosRecentes = [...orcamentos]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  const formatarNumeroDoisDigitos = (valor: number) =>
    valor < 10 && valor > 0 ? `0${valor}` : String(valor);

  const formatarMoeda = (valor: number, semCentavos = false) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: semCentavos ? 0 : 2,
      maximumFractionDigits: semCentavos ? 0 : 2,
    }).format(valor);

  const obterRotuloDiaCurto = (diaStr: string, index: number) => {
    const rotulosPadrao = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    try {
      const [ano, mes, dia] = diaStr.split('-').map(Number);
      const d = new Date(ano, mes - 1, dia);
      const curto = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      return curto.charAt(0).toUpperCase() + curto.slice(1, 3);
    } catch {
      return rotulosPadrao[index] || diaStr;
    }
  };

  // Prepara barras do gráfico da semana (até 6 dias úteis Seg-Sáb ou todos os dias retornados)
  const diasGrafico = diasSemana.slice(0, 6);
  const maiorQtdAtividades = Math.max(
    1,
    ...diasGrafico.map((d) => (d.atividades ? d.atividades.length : 0))
  );

  return (
    <DashboardLayout activeMenu="Visão geral">
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
          <div className="category-breadcrumb">PAINEL OPERACIONAL</div>
          <h1 className="page-main-title">Visão geral</h1>
          <p className="page-main-subtitle">
            Indicadores em tempo real de propostas, faturamento e fila semanal da gráfica.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn-outline-figma"
            onClick={carregarIndicadores}
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
            <Plus size={15} />
            Novo Orçamento
          </button>
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
            onClick={carregarIndicadores}
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

      {/* 4 Cards Métricos Superiores consumindo dados reais */}
      <div className="metric-cards-grid">
        {/* Card 1: Orçamentos em aberto (Rascunhos) */}
        <div
          className="figma-metric-card metric-accent-cyan"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/budgets')}
        >
          <div className="metric-card-top">
            <span className="metric-card-title">Orçamentos em aberto</span>
            <div className="metric-icon-circle metric-circle-cyan">
              <FileText size={16} />
            </div>
          </div>
          <div className="metric-card-value">
            {loading ? '...' : formatarNumeroDoisDigitos(orcamentosEmAberto)}
          </div>
          <div className="metric-card-subtitle text-positive">
            <ArrowUpRight size={14} />
            <span>
              {orcamentos.length} proposta{orcamentos.length === 1 ? '' : 's'} no total
            </span>
          </div>
        </div>

        {/* Card 2: Atividades na semana */}
        <div
          className="figma-metric-card metric-accent-magenta"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/planning')}
        >
          <div className="metric-card-top">
            <span className="metric-card-title">Atividades na semana</span>
            <div className="metric-icon-circle metric-circle-magenta">
              <Clock size={16} />
            </div>
          </div>
          <div className="metric-card-value">
            {loading ? '...' : formatarNumeroDoisDigitos(totalAtividadesSemana)}
          </div>
          <div className="metric-card-subtitle">
            <span>
              {atividadesHoje > 0
                ? `${atividadesHoje} agendada${atividadesHoje === 1 ? '' : 's'} para hoje`
                : 'Nenhuma agendada para hoje'}
            </span>
          </div>
        </div>

        {/* Card 3: Orçamentos registrados */}
        <div
          className="figma-metric-card metric-accent-yellow"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/budgets')}
        >
          <div className="metric-card-top">
            <span className="metric-card-title">Propostas registradas</span>
            <div className="metric-icon-circle metric-circle-yellow">
              <Check size={16} />
            </div>
          </div>
          <div className="metric-card-value">
            {loading ? '...' : formatarNumeroDoisDigitos(orcamentosRegistrados)}
          </div>
          <div className="metric-card-subtitle text-positive">
            <ArrowUpRight size={14} />
            <span>
              {orcamentos.length > 0
                ? `${Math.round((orcamentosRegistrados / orcamentos.length) * 100)}% de conversão`
                : 'Aguardando propostas'}
            </span>
          </div>
        </div>

        {/* Card 4: Faturamento estimado */}
        <div
          className="figma-metric-card metric-accent-dark"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/budgets')}
        >
          <div className="metric-card-top">
            <span className="metric-card-title">Faturamento registrado</span>
            <div className="metric-icon-circle metric-circle-dark">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="metric-card-value">
            {loading ? '...' : formatarMoeda(faturamentoEstimado, true)}
          </div>
          <div className="metric-card-subtitle">
            <span>
              Em rascunhos: {formatarMoeda(valorEmRascunhos, true)}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Inferior: Pedidos Recentes + Produção da Semana */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* Coluna Esquerda: Pedidos recentes (Orçamentos reais) */}
        <div className="dashboard-card" style={{ padding: '1.75rem 2rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                Orçamentos recentes
              </h3>
              <p style={{ fontSize: '0.825rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
                Últimas propostas e rascunhos registrados no sistema
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/budgets')}
              style={{
                background: 'none',
                border: 'none',
                color: '#009FE3',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Ver todos
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748B' }}>
              <RefreshCw
                size={22}
                style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem auto' }}
              />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Carregando orçamentos recentes...</p>
            </div>
          ) : pedidosRecentes.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748B' }}>
              <FileText size={32} style={{ margin: '0 auto 0.75rem auto', opacity: 0.45 }} />
              <p style={{ fontWeight: 600, color: '#0F172A', margin: '0 0 0.35rem 0' }}>
                Nenhum orçamento cadastrado
              </p>
              <p style={{ fontSize: '0.85rem', margin: '0 0 1.25rem 0' }}>
                Crie um novo orçamento para acompanhar propostas recentes aqui.
              </p>
              <button
                type="button"
                className="btn-dark"
                onClick={() => navigate('/budgets/new')}
              >
                + Criar Orçamento
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {pedidosRecentes.map((orc, index) => {
                const numeroFormatado = `#${String(orc.id).padStart(4, '0')}`;
                const nomeCliente = orc.cliente?.nome || 'Cliente não informado';
                const nomeServico = orc.servico?.nome || 'Serviço não definido';
                const detalheSecundario =
                  orc.largura && orc.altura
                    ? `${nomeServico} • ${orc.largura}m × ${orc.altura}m`
                    : nomeServico;

                return (
                  <div
                    key={orc.id}
                    onClick={() => navigate(`/budgets/new?id=${orc.id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.8rem 0.5rem',
                      borderBottom:
                        index < pedidosRecentes.length - 1 ? '1px solid #F1F5F9' : 'none',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      transition: 'background-color 0.15s ease',
                    }}
                    title="Clique para abrir este orçamento"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8' }}>
                        {numeroFormatado}
                      </span>
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0F172A' }}>
                          {nomeCliente}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                          {detalheSecundario}
                          {orc.custoTotal != null ? ` • ${formatarMoeda(orc.custoTotal)}` : ''}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <span
                        className={`badge-status ${
                          orc.rascunho ? 'badge-aguardando' : 'badge-finalizado'
                        }`}
                      >
                        {orc.rascunho ? 'Rascunho' : 'Registrado'}
                      </span>
                      <ChevronRight size={16} color="#94A3B8" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Coluna Direita: Produção da semana (Planejamento real) */}
        <div className="dashboard-card" style={{ padding: '1.75rem 2rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                Planejamento da semana
              </h3>
              <p style={{ fontSize: '0.825rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
                Atividades agendadas por dia
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/planning')}
              style={{
                background: 'none',
                border: 'none',
                color: '#009FE3',
                fontWeight: 600,
                fontSize: '0.825rem',
                cursor: 'pointer',
              }}
            >
              Agenda
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748B' }}>
              <RefreshCw
                size={22}
                style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem auto' }}
              />
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Carregando agenda semanal...</p>
            </div>
          ) : diasGrafico.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748B' }}>
              <Calendar size={30} style={{ margin: '0 auto 0.5rem auto', opacity: 0.45 }} />
              <p style={{ fontSize: '0.875rem', margin: 0 }}>
                Nenhuma atividade encontrada para a semana atual.
              </p>
            </div>
          ) : (
            <>
              {/* Gráfico de Barras Dinâmico */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  height: '170px',
                  padding: '0 0.5rem',
                  marginBottom: '1.75rem',
                }}
              >
                {diasGrafico.map((diaObj, idx) => {
                  const qtd = diaObj.atividades ? diaObj.atividades.length : 0;
                  const ehHoje = diaObj.dia === hojeStr;
                  const alturaPx =
                    qtd === 0 ? 14 : Math.max(28, Math.round((qtd / maiorQtdAtividades) * 140));
                  const rotulo = obterRotuloDiaCurto(diaObj.dia, idx);

                  return (
                    <div
                      key={diaObj.dia}
                      onClick={() => navigate('/planning')}
                      title={`${rotulo} (${diaObj.dia}): ${qtd} atividade(s)`}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.45rem',
                        height: '100%',
                        justifyContent: 'flex-end',
                        cursor: 'pointer',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: ehHoje ? '#0284C7' : '#64748B',
                        }}
                      >
                        {qtd}
                      </span>
                      <div
                        style={{
                          width: '24px',
                          height: `${alturaPx}px`,
                          backgroundColor: ehHoje
                            ? '#0284C7'
                            : qtd > 0
                            ? '#7DD3FC'
                            : '#E2E8F0',
                          borderRadius: '4px',
                          boxShadow: ehHoje ? '0 4px 10px rgba(2, 132, 199, 0.3)' : 'none',
                          transition: 'height 0.25s ease',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: ehHoje ? '#0F172A' : '#94A3B8',
                          fontWeight: ehHoje ? 700 : 500,
                        }}
                      >
                        {rotulo}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Resumo inferior real */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '1rem',
                  borderTop: '1px solid #F1F5F9',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '1.75rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      lineHeight: 1,
                    }}
                  >
                    {totalAtividadesSemana}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.25rem' }}>
                    atividade{totalAtividadesSemana === 1 ? '' : 's'} programada
                    {totalAtividadesSemana === 1 ? '' : 's'} na semana
                  </div>
                </div>
                <span className="badge-status badge-aprovada">
                  {atividadesHoje > 0 ? `${atividadesHoje} hoje` : 'Em dia'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
