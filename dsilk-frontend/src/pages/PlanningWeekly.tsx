import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '../components/Button';
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
  X
} from 'lucide-react';

export const PlanningWeekly: React.FC = () => {
  const [diasSemana, setDiasSemana] = useState<DiaPlanejamento[]>([]);
  const [dataInicio, setDataInicio] = useState<string>(''); // AAAA-MM-DD
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

  const carregarSemana = async (inicio?: string) => {
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
  };

  useEffect(() => {
    carregarSemana();
  }, []);

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
    setAtividadeEmEdicao(null);
    setTitulo('');
    setDescricao('');
    setDataAtividade(diaPadrao || (diasSemana.length > 0 ? diasSemana[0].dia : ''));
    setErroModal(null);
    setModalAberto(true);
  };

  const abrirModalEditar = (atv: Atividade) => {
    setAtividadeEmEdicao(atv);
    setTitulo(atv.titulo);
    setDescricao(atv.descricao || '');
    // Caso venha timestamp ISO, pega apenas a parte AAAA-MM-DD
    const dataLimpa = atv.data.includes('T') ? atv.data.split('T')[0] : atv.data;
    setDataAtividade(dataLimpa);
    setErroModal(null);
    setModalAberto(true);
  };

  const fecharModal = () => {
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
        setSucesso('Atividade atualizada com sucesso!');
      } else {
        await planejamentoService.criarAtividade(payload);
        setSucesso('Atividade agendada com sucesso!');
      }

      fecharModal();
      carregarSemana(dataInicio);
      setTimeout(() => setSucesso(null), 3500);
    } catch (err) {
      setErroModal(getApiErrorMessage(err, 'Erro ao salvar atividade.'));
    } finally {
      setSalvando(false);
    }
  };

  const formatarCabecalhoDia = (diaStr: string) => {
    const [ano, mes, dia] = diaStr.split('-').map(Number);
    const d = new Date(ano, mes - 1, dia);
    const nomeDia = d.toLocaleDateString('pt-BR', { weekday: 'short' });
    const dataFormatada = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    return { nomeDia, dataFormatada };
  };

  const hojeStr = new Date().toISOString().split('T')[0];

  return (
    <DashboardLayout activeMenu="Planejamento">
      {/* Cabeçalho da Tela */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="auth-title" style={{ textAlign: 'left', marginBottom: '0.25rem' }}>Planejamento Semanal</h2>
          <p className="auth-description" style={{ textAlign: 'left' }}>
            Acompanhe a fila de produção e atividades agendadas da semana (RF010 e RF011)
          </p>
        </div>

        {/* Controles de Navegação de Semana */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Button 
            variant="outline" 
            style={{ width: 'auto', padding: '0.5rem 0.75rem' }} 
            onClick={() => navegarSemana(-7)}
            title="Semana anterior"
          >
            <ChevronLeft size={18} />
          </Button>

          <Button 
            variant="outline" 
            style={{ width: 'auto', fontSize: '0.85rem' }} 
            onClick={irParaHoje}
          >
            Hoje
          </Button>

          <Button 
            variant="outline" 
            style={{ width: 'auto', padding: '0.5rem 0.75rem' }} 
            onClick={() => navegarSemana(7)}
            title="Próxima semana"
          >
            <ChevronRight size={18} />
          </Button>

          <Button 
            variant="outline" 
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }} 
            onClick={() => carregarSemana(dataInicio)}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>

          <Button 
            variant="primary" 
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }} 
            onClick={() => abrirModalCriar()}
          >
            <Plus size={16} />
            Nova Atividade
          </Button>
        </div>
      </div>

      {sucesso && (
        <div 
          style={{
            backgroundColor: '#dcfce7',
            color: '#15803d',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: '1px solid #bbf7d0',
            fontSize: '0.875rem',
          }}
        >
          <CheckCircle size={18} />
          <span>{sucesso}</span>
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

      {/* Grid de 7 Colunas da Semana */}
      {loading ? (
        <div className="dashboard-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
          <p>Carregando agenda semanal...</p>
        </div>
      ) : (
        <div className="weekly-grid">
          {diasSemana.map((diaItem) => {
            const { nomeDia, dataFormatada } = formatarCabecalhoDia(diaItem.dia);
            const isHoje = diaItem.dia === hojeStr;

            return (
              <div 
                key={diaItem.dia} 
                className={`weekly-day-col ${isHoje ? 'today' : ''}`}
              >
                <div className="weekly-day-header">
                  <div className="weekly-day-name" style={{ color: isHoje ? 'var(--dsilk-cyan)' : 'inherit' }}>
                    {nomeDia} {isHoje && <span style={{ fontSize: '0.7rem', color: 'var(--dsilk-cyan)', fontWeight: 'bold' }}>(Hoje)</span>}
                  </div>
                  <div className="weekly-day-date">{dataFormatada}</div>
                </div>

                <div className="weekly-day-body">
                  {diaItem.atividades.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1rem 0.5rem', color: '#9CA3AF', fontSize: '0.75rem' }}>
                      Sem atividades
                    </div>
                  ) : (
                    diaItem.atividades.map((atv) => (
                      <div 
                        key={atv.id} 
                        className="activity-card"
                        onClick={() => abrirModalEditar(atv)}
                        title="Clique para editar"
                      >
                        <div className="activity-title">{atv.titulo}</div>
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
                    Adicionar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criação / Edição de Atividade */}
      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-container" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarIcon size={20} color="var(--dsilk-cyan)" />
                <h3>{atividadeEmEdicao ? 'Editar Atividade' : 'Nova Atividade (RF011)'}</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={fecharModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarAtividade}>
              <div className="modal-body">
                {erroModal && (
                  <div style={{ padding: '0.75rem', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: '6px', fontSize: '0.85rem' }}>
                    {erroModal}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                    Título da Atividade / Serviço *
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="Ex: Entregar banner da Maria, Impressão de adesivos..."
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                    Data do Agendamento *
                  </label>
                  <Input
                    type="date"
                    required
                    value={dataAtividade}
                    onChange={(e) => setDataAtividade(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                    Descrição / Observações (Opcional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ex: Retirada às 14h, acabamento com ilhós nos quatro cantos..."
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid #E5E7EB',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <Button type="button" variant="outline" onClick={fecharModal} disabled={salvando}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={salvando}>
                  {salvando ? 'Salvando...' : (atividadeEmEdicao ? 'Salvar Alterações' : 'Criar Atividade')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PlanningWeekly;
