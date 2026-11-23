import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Input } from '../components/Input';
import { planejamentoService, DiaPlanejamento, Atividade } from '../services/planejamentoService';
import { getApiErrorMessage } from '../types/api';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  X,
  Search,
  Clock,
  Edit3,
  Sparkles
} from 'lucide-react';

const SUGESTOES_ATIVIDADE = [
  'Impressão de banner em lona',
  'Estamparia de camisetas (Serigrafia)',
  'Corte de placas e acabamento',
  'Revisão de arte e prova de cor',
  'Entrega de pedido no balcão',
];

export const PlanningWeekly: React.FC = () => {
  const [diasSemana, setDiasSemana] = useState<DiaPlanejamento[]>([]);
  const [dataInicio, setDataInicio] = useState<string>(''); // AAAA-MM-DD
  const [busca, setBusca] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  // Modal de Atividade (Criar ou Editar)
  const [modalAberto, setModalAberto] = useState(false);
  const [atividadeEmEdicao, setAtividadeEmEdicao] = useState<Atividade | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataAtividade, setDataAtividade] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState<string | null>(null);

  const carregarSemana = useCallback(async (inicio?: string) => {
    try {
      setLoading(true);
      setErro(null);
      const dados = await planejamentoService.obterSemana(inicio);
      setDiasSemana(dados);
      if (dados.length > 0) {
        setDataInicio(dados[0].dia);
      }
    } catch (err) {
      setErro(getApiErrorMessage(err, 'Erro ao carregar planejamento semanal.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarSemana();
  }, [carregarSemana]);

  const navegarSemana = (diasOffset: number) => {
    if (!dataInicio) return;
    const [ano, mes, dia] = dataInicio.split('-').map(Number);
    const d = new Date(ano, mes - 1, dia);
    d.setDate(d.getDate() + diasOffset);
    const novaDataStr = d.toISOString().split('T')[0];
    carregarSemana(novaDataStr);
  };

  const irParaHoje = () => {
    carregarSemana(new Date().toISOString().split('T')[0]);
  };

  const abrirModalCriar = (diaPadrao?: string) => {
    const hoje = new Date().toISOString().split('T')[0];
    const diaNaSemanaAtual = diasSemana.find((d) => d.dia === hoje)?.dia;
    setAtividadeEmEdicao(null);
    setTitulo('');
    setDescricao('');
    setDataAtividade(
      diaPadrao || diaNaSemanaAtual || (diasSemana.length > 0 ? diasSemana[0].dia : hoje)
    );
    setErroModal(null);
    setModalAberto(true);
  };

  const abrirModalEditar = (atv: Atividade) => {
    setAtividadeEmEdicao(atv);
    setTitulo(atv.titulo);
    setDescricao(atv.descricao || '');
    const dataLimpa = atv.data.includes('T') ? atv.data.split('T')[0] : atv.data;
    setDataAtividade(dataLimpa);
    setErroModal(null);
    setModalAberto(true);
  };

  const fecharModal = () => {
    if (salvando) return;
    setModalAberto(false);
    setAtividadeEmEdicao(null);
    setTitulo('');
    setDescricao('');
    setDataAtividade('');
    setErroModal(null);
  };

  const handleSalvarAtividade = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim()) {
      setErroModal('O título da atividade é obrigatório.');
      return;
    }
    if (!dataAtividade.trim()) {
      setErroModal('Selecione uma data para a atividade.');
      return;
    }

    try {
      setSalvando(true);
      setErroModal(null);

      const payload = {
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        data: dataAtividade.trim(),
      };

      if (atividadeEmEdicao) {
        await planejamentoService.atualizarAtividade(atividadeEmEdicao.id, payload);
        setSucesso(`Atividade "${payload.titulo}" atualizada com sucesso!`);
      } else {
        await planejamentoService.criarAtividade(payload);
        setSucesso(`Atividade "${payload.titulo}" agendada com sucesso!`);
      }

      fecharModal();
      // Carrega a semana correspondente à data em que a atividade foi salva
      await carregarSemana(payload.data);
      setTimeout(() => setSucesso(null), 4000);
    } catch (err) {
      setErroModal(getApiErrorMessage(err, 'Erro ao salvar atividade.'));
    } finally {
      setSalvando(false);
    }
  };

  const formatarCabecalhoDia = (diaStr: string) => {
    const [ano, mes, dia] = diaStr.split('-').map(Number);
    const d = new Date(ano, mes - 1, dia);
    const nomeDia = d
      .toLocaleDateString('pt-BR', { weekday: 'long' })
      .replace('-feira', '');
    const nomeDiaCurto = d
      .toLocaleDateString('pt-BR', { weekday: 'short' })
      .replace('.', '');
    const dataFormatada = d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
    return { nomeDia, nomeDiaCurto, dataFormatada };
  };

  const formatarIntervaloSemana = () => {
    if (diasSemana.length === 0) return 'Semana atual';
    try {
      const inicio = diasSemana[0].dia.split('-').map(Number);
      const fim = diasSemana[diasSemana.length - 1].dia.split('-').map(Number);
      const dInicio = new Date(inicio[0], inicio[1] - 1, inicio[2]);
      const dFim = new Date(fim[0], fim[1] - 1, fim[2]);
      const fmtInicio = dInicio.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
      });
      const fmtFim = dFim.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      return `${fmtInicio} — ${fmtFim}`;
    } catch {
      return dataInicio;
    }
  };

  const hojeStr = new Date().toISOString().split('T')[0];
  const termo = busca.trim().toLowerCase();

  const totalAtividadesSemana = diasSemana.reduce(
    (acc, d) => acc + (d.atividades ? d.atividades.length : 0),
    0
  );
  const diasComProducao = diasSemana.filter(
    (d) => d.atividades && d.atividades.length > 0
  ).length;
  const contemHoje = diasSemana.some((d) => d.dia === hojeStr);

  return (
    <DashboardLayout activeMenu="Planejamento">
      {/* Cabeçalho Principal */}
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
          <div className="category-breadcrumb">PRODUÇÃO & AGENDA</div>
          <h1 className="page-main-title">Planejamento Semanal</h1>
          <p className="page-main-subtitle" style={{ marginBottom: 0 }}>
            Organize a fila de produção por dia da semana, clique em um cartão para editar ou adicione novas tarefas diretamente na coluna desejada.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            className="btn-outline-figma"
            onClick={() => carregarSemana(dataInicio)}
            disabled={loading}
            title="Atualizar agenda"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>

          <button
            type="button"
            className="btn-dark"
            onClick={() => abrirModalCriar()}
          >
            <Plus size={16} />
            Nova Atividade
          </button>
        </div>
      </div>

      {/* Barra de Controle e Resumo da Semana */}
      <div className="planning-toolbar-card">
        {/* Navegação de Semana + Seletor de Data */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '0.2rem',
            }}
          >
            <button
              type="button"
              onClick={() => navegarSemana(-7)}
              title="Semana anterior"
              style={{
                background: 'none',
                border: 'none',
                padding: '0.45rem 0.6rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: '#334155',
                borderRadius: '6px',
              }}
            >
              <ChevronLeft size={17} />
            </button>

            <div
              style={{
                padding: '0 0.85rem',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: '#0F172A',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                minWidth: '195px',
                justifyContent: 'center',
              }}
            >
              <CalendarIcon size={15} color="#009FE3" />
              <span>{formatarIntervaloSemana()}</span>
            </div>

            <button
              type="button"
              onClick={() => navegarSemana(7)}
              title="Próxima semana"
              style={{
                background: 'none',
                border: 'none',
                padding: '0.45rem 0.6rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: '#334155',
                borderRadius: '6px',
              }}
            >
              <ChevronRight size={17} />
            </button>
          </div>

          <button
            type="button"
            className={contemHoje ? 'btn-dark' : 'btn-outline-figma'}
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.825rem' }}
            onClick={irParaHoje}
          >
            Semana Atual (Hoje)
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <label
              htmlFor="seletor-semana-input"
              style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}
            >
              Ir para:
            </label>
            <input
              id="seletor-semana-input"
              type="date"
              value={dataInicio}
              onChange={(e) => {
                if (e.target.value) {
                  carregarSemana(e.target.value);
                }
              }}
              className="header-search"
              style={{
                width: '150px',
                padding: '0.42rem 0.65rem',
                fontSize: '0.82rem',
                backgroundColor: '#FFFFFF',
              }}
            />
          </div>
        </div>

        {/* Busca rápida na semana + Indicadores de Ocupação */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge-status badge-aprovada">
              {totalAtividadesSemana}{' '}
              {totalAtividadesSemana === 1 ? 'atividade' : 'atividades'}
            </span>
            <span
              className="badge-status"
              style={{ backgroundColor: '#F1F5F9', color: '#475569' }}
            >
              {diasComProducao}/7 dias com produção
            </span>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '0.75rem' }} />
            <input
              type="text"
              placeholder="Filtrar atividade na semana..."
              className="header-search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{
                width: '220px',
                padding: '0.45rem 0.75rem 0.45rem 2.15rem',
                fontSize: '0.825rem',
                backgroundColor: '#FFFFFF',
              }}
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca('')}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dica rápida quando a semana selecionada está sem atividades */}
      {!loading && totalAtividadesSemana === 0 && (
        <div
          style={{
            backgroundColor: '#F0F9FF',
            border: '1px solid #BAE6FD',
            borderRadius: '10px',
            padding: '0.9rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0369A1', fontSize: '0.875rem' }}>
            <Sparkles size={18} style={{ flexShrink: 0 }} />
            <span>
              Esta semana ainda está livre. Clique em <strong>+ Agendar</strong> em qualquer coluna abaixo ou veja a semana de demonstração do sistema.
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn-outline-figma"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', backgroundColor: '#FFFFFF' }}
              onClick={() => carregarSemana('2026-09-22')}
            >
              Ver semana de demonstração (21/09 a 27/09)
            </button>
            <button
              type="button"
              className="btn-dark"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
              onClick={() => abrirModalCriar()}
            >
              + Agendar nesta semana
            </button>
          </div>
        </div>
      )}

      {sucesso && (
        <div 
          style={{
            backgroundColor: '#dcfce7',
            color: '#15803d',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid #bbf7d0',
            fontSize: '0.875rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} />
            <span style={{ fontWeight: 500 }}>{sucesso}</span>
          </div>
          <button
            type="button"
            onClick={() => setSucesso(null)}
            style={{ background: 'none', border: 'none', color: '#15803d', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {erro && (
        <div 
          style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
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
            onClick={() => carregarSemana(dataInicio)}
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

      {/* Quadro Kanban Semanal de 7 Colunas */}
      {loading ? (
        <div className="dashboard-card" style={{ padding: '3.5rem', textAlign: 'center', color: '#64748B' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
          <p style={{ margin: 0, fontWeight: 500 }}>Carregando quadro semanal de produção...</p>
        </div>
      ) : (
        <div className="weekly-grid">
          {diasSemana.map((diaItem, colIndex) => {
            const { nomeDia, dataFormatada } = formatarCabecalhoDia(diaItem.dia);
            const isHoje = diaItem.dia === hojeStr;
            const atividadesFiltradas = termo
              ? diaItem.atividades.filter(
                  (a) =>
                    a.titulo.toLowerCase().includes(termo) ||
                    (a.descricao && a.descricao.toLowerCase().includes(termo))
                )
              : diaItem.atividades;

            // Alterna cor da borda lateral dos cartões para facilitar leitura visual
            const coresBorda = ['#009FE3', '#0284C7', '#E6007E', '#F59E0B', '#10B981'];

            return (
              <div
                key={diaItem.dia}
                className={`weekly-day-col ${isHoje ? 'today' : ''}`}
              >
                {/* Cabeçalho do Dia */}
                <div className="weekly-day-header">
                  <div className="weekly-day-top-row">
                    <div className="weekly-day-name">
                      <span>{nomeDia}</span>
                      {isHoje && (
                        <span
                          style={{
                            backgroundColor: '#009FE3',
                            color: '#FFFFFF',
                            fontSize: '0.62rem',
                            padding: '0.1rem 0.45rem',
                            borderRadius: '999px',
                            fontWeight: 800,
                          }}
                        >
                          HOJE
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => abrirModalCriar(diaItem.dia)}
                      title={`Agendar atividade em ${nomeDia} (${dataFormatada})`}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0284C7',
                        cursor: 'pointer',
                        padding: '0.15rem',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="weekly-day-date-row">
                    <span className="weekly-day-date">{dataFormatada}</span>
                    <span
                      className={`weekly-day-count-badge ${
                        atividadesFiltradas.length > 0 ? 'has-items' : ''
                      }`}
                    >
                      {atividadesFiltradas.length === 0
                        ? 'Livre'
                        : `${atividadesFiltradas.length} ${
                            atividadesFiltradas.length === 1 ? 'item' : 'itens'
                          }`}
                    </span>
                  </div>
                </div>

                {/* Corpo da Coluna */}
                <div className="weekly-day-body">
                  {atividadesFiltradas.length === 0 ? (
                    <div
                      className="weekly-empty-slot"
                      onClick={() => abrirModalCriar(diaItem.dia)}
                      title="Clique para agendar uma atividade neste dia"
                    >
                      <Clock size={18} style={{ marginBottom: '0.35rem', opacity: 0.45 }} />
                      <span>{termo ? 'Sem resultados' : 'Dia livre'}</span>
                      <span style={{ fontSize: '0.7rem', marginTop: '0.2rem', opacity: 0.75 }}>
                        Clique para agendar
                      </span>
                    </div>
                  ) : (
                    atividadesFiltradas.map((atv, idx) => (
                      <div
                        key={atv.id}
                        className="activity-card"
                        style={{
                          borderLeftColor: coresBorda[(colIndex + idx) % coresBorda.length],
                        }}
                        onClick={() => abrirModalEditar(atv)}
                        title="Clique para editar detalhes ou reagendar"
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: '0.35rem',
                          }}
                        >
                          <div className="activity-title">{atv.titulo}</div>
                          <Edit3
                            size={13}
                            color="#94A3B8"
                            style={{ flexShrink: 0, marginTop: '0.15rem' }}
                          />
                        </div>
                        {atv.descricao && (
                          <div className="activity-desc">{atv.descricao}</div>
                        )}
                      </div>
                    ))
                  )}

                  <button
                    type="button"
                    className="add-activity-btn"
                    onClick={() => abrirModalCriar(diaItem.dia)}
                  >
                    <Plus size={14} />
                    Agendar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Intuitivo de Criação / Edição de Atividade */}
      {modalAberto && (
        <div
          onClick={fecharModal}
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
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              margin: 0,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CalendarIcon size={22} color="#009FE3" />
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                    {atividadeEmEdicao ? 'Editar Atividade' : 'Agendar Nova Atividade'}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.15rem 0 0 0' }}>
                    {atividadeEmEdicao
                      ? `Registro #${atividadeEmEdicao.id} do planejamento semanal`
                      : 'Defina o título, escolha o dia da semana e adicione instruções.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={fecharModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            {erroModal && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#FEE2E2',
                  color: '#B91C1C',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  border: '1px solid #FCA5A5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={17} />
                <span>{erroModal}</span>
              </div>
            )}

            <form
              onSubmit={handleSalvarAtividade}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}
            >
              <div>
                <Input
                  label="Título da Atividade ou Serviço *"
                  type="text"
                  required
                  placeholder="Ex: Impressão de banner 2x1m, Entrega pedido #10..."
                  value={titulo}
                  onChange={(e) => {
                    setTitulo(e.target.value);
                    setErroModal(null);
                  }}
                />
                {!atividadeEmEdicao && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '0.35rem' }}>
                      Sugestões rápidas:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {SUGESTOES_ATIVIDADE.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => setTitulo(sug)}
                          style={{
                            fontSize: '0.72rem',
                            padding: '0.25rem 0.55rem',
                            borderRadius: '999px',
                            border: '1px solid #E2E8F0',
                            backgroundColor: titulo === sug ? '#E0F2FE' : '#F8FAFC',
                            color: titulo === sug ? '#0284C7' : '#475569',
                            cursor: 'pointer',
                            fontWeight: 500,
                          }}
                        >
                          + {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Seletor rápido de dia da semana visível + input date */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#0F172A',
                    marginBottom: '0.4rem',
                  }}
                >
                  Dia do Agendamento *
                </label>

                {diasSemana.length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: '0.35rem',
                      marginBottom: '0.65rem',
                    }}
                  >
                    {diasSemana.map((d) => {
                      const { nomeDiaCurto, dataFormatada } = formatarCabecalhoDia(d.dia);
                      const selecionado = dataAtividade === d.dia;
                      return (
                        <button
                          key={d.dia}
                          type="button"
                          onClick={() => setDataAtividade(d.dia)}
                          style={{
                            padding: '0.4rem 0.2rem',
                            borderRadius: '8px',
                            border: selecionado ? '1.5px solid #009FE3' : '1px solid #E2E8F0',
                            backgroundColor: selecionado ? '#E0F2FE' : '#FFFFFF',
                            color: selecionado ? '#0284C7' : '#334155',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          <span style={{ textTransform: 'uppercase' }}>{nomeDiaCurto}</span>
                          <span style={{ fontSize: '0.78rem', marginTop: '0.1rem' }}>
                            {dataFormatada}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <Input
                  type="date"
                  required
                  value={dataAtividade}
                  onChange={(e) => setDataAtividade(e.target.value)}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#0F172A',
                    marginBottom: '0.35rem',
                  }}
                >
                  Descrição / Observações de Produção (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Retirada às 14h, acabamento com ilhós nos quatro cantos..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '0.35rem',
                }}
              >
                <button
                  type="button"
                  className="btn-outline-figma"
                  onClick={fecharModal}
                  disabled={salvando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-dark"
                  disabled={salvando}
                >
                  {salvando
                    ? 'Salvando...'
                    : atividadeEmEdicao
                    ? 'Salvar Alterações'
                    : 'Agendar Atividade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PlanningWeekly;
