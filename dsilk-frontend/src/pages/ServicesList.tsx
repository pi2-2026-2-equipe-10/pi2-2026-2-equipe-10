import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '../components/Button';
import { servicoService, Servico, ItemComposicao } from '../services/servicoService';
import { materialService, Material } from '../services/materialService';
import { getApiErrorMessage } from '../types/api';
import { 
  RefreshCw, 
  Plus, 
  AlertCircle, 
  Layers, 
  Settings, 
  Trash2, 
  X, 
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';

export const ServicesList: React.FC = () => {
  const navigate = useNavigate();

  const [servicos, setServicos] = useState<Servico[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  // Estado do Modal de Composição
  const [servicoEmEdicao, setServicoEmEdicao] = useState<Servico | null>(null);
  const [loadingComposicao, setLoadingComposicao] = useState(false);
  const [modalComposicaoAberto, setModalComposicaoAberto] = useState(false);
  const [itensComposicao, setItensComposicao] = useState<{ materialId: number; quantidade: number }[]>([]);
  const [tempoOperacao, setTempoOperacao] = useState<string>('');
  const [custoHora, setCustoHora] = useState<string>('');
  const [erroModal, setErroModal] = useState<string | null>(null);
  const [salvandoComposicao, setSalvandoComposicao] = useState(false);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setErro(null);
      const [listaServicos, listaMateriais] = await Promise.all([
        servicoService.listar(),
        materialService.listar(),
      ]);
      setServicos(listaServicos);
      setMateriais(listaMateriais);
    } catch (error) {
      setErro(getApiErrorMessage(error, 'Não foi possível carregar os serviços.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const abrirModalComposicao = async (servico: Servico) => {
    setServicoEmEdicao(servico);
    setErroModal(null);
    setModalComposicaoAberto(true);
    setLoadingComposicao(true);

    try {
      const detalhes = await servicoService.buscarPorId(servico.id);
      setServicoEmEdicao(detalhes);

      if (detalhes.itens && detalhes.itens.length > 0) {
        setItensComposicao(
          detalhes.itens.map((it: ItemComposicao) => ({
            materialId: it.materialId,
            quantidade: it.quantidade,
          }))
        );
      } else {
        // Inicializa com 1 item em branco se não houver itens
        setItensComposicao(materiais.length > 0 ? [{ materialId: materiais[0].id, quantidade: 1 }] : []);
      }

      setTempoOperacao(detalhes.tempoOperacaoHoras ? String(detalhes.tempoOperacaoHoras) : '');
      setCustoHora(detalhes.custoHoraOperacao ? String(detalhes.custoHoraOperacao) : '');
    } catch (error) {
      setErroModal(getApiErrorMessage(error, 'Erro ao carregar composição do serviço.'));
    } finally {
      setLoadingComposicao(false);
    }
  };

  const fecharModalComposicao = () => {
    setModalComposicaoAberto(false);
    setServicoEmEdicao(null);
    setItensComposicao([]);
    setTempoOperacao('');
    setCustoHora('');
    setErroModal(null);
  };

  const adicionarLinhaItem = () => {
    if (materiais.length === 0) return;
    setItensComposicao([...itensComposicao, { materialId: materiais[0].id, quantidade: 1 }]);
  };

  const removerLinhaItem = (index: number) => {
    setItensComposicao(itensComposicao.filter((_, idx) => idx !== index));
  };

  const atualizarItem = (index: number, campo: 'materialId' | 'quantidade', valor: number) => {
    const novos = [...itensComposicao];
    novos[index] = { ...novos[index], [campo]: valor };
    setItensComposicao(novos);
  };

  const salvarComposicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!servicoEmEdicao) return;

    // Regra RN-01: Ao menos 1 item na composição
    if (itensComposicao.length === 0) {
      setErroModal('A composição deve conter ao menos um material (RN-01).');
      return;
    }

    // Regra RN-02: Quantidade maior que zero
    for (let i = 0; i < itensComposicao.length; i++) {
      if (!itensComposicao[i].quantidade || itensComposicao[i].quantidade <= 0) {
        setErroModal(`A quantidade do item ${i + 1} deve ser maior que zero (RN-02).`);
        return;
      }
    }

    let tempoNum: number | null = null;
    let custoHoraNum: number | null = null;

    if (tempoOperacao.trim()) {
      tempoNum = parseFloat(tempoOperacao.replace(',', '.'));
      if (isNaN(tempoNum) || tempoNum <= 0) {
        setErroModal('O tempo de operação deve ser um número maior que zero.');
        return;
      }
      if (!custoHora.trim()) {
        setErroModal('Informe o custo por hora de operação quando o tempo for preenchido.');
        return;
      }
      custoHoraNum = parseFloat(custoHora.replace(',', '.'));
      if (isNaN(custoHoraNum) || custoHoraNum <= 0) {
        setErroModal('O custo por hora de operação deve ser maior que zero.');
        return;
      }
    }

    try {
      setSalvandoComposicao(true);
      setErroModal(null);

      await servicoService.configurarComposicao(servicoEmEdicao.id, {
        itens: itensComposicao,
        tempoOperacaoHoras: tempoNum,
        custoHoraOperacao: custoHoraNum,
      });

      setSucesso(`Composição do serviço "${servicoEmEdicao.nome}" configurada com sucesso!`);
      fecharModalComposicao();
      carregarDados();
      setTimeout(() => setSucesso(null), 4000);
    } catch (error) {
      setErroModal(getApiErrorMessage(error, 'Erro ao salvar composição do serviço.'));
    } finally {
      setSalvandoComposicao(false);
    }
  };

  return (
    <DashboardLayout activeMenu="Serviços">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h2 className="auth-title" style={{ textAlign: 'left', marginBottom: '0.25rem' }}>Serviços Personalizados</h2>
          <p className="auth-description" style={{ textAlign: 'left' }}>
            Gerencie os serviços oferecidos pela gráfica e defina suas composições de insumos
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button 
            variant="outline" 
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }} 
            onClick={carregarDados}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </Button>
          <Button 
            variant="primary" 
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }} 
            onClick={() => navigate('/services/new')}
          >
            <Plus size={16} />
            Novo Serviço
          </Button>
        </div>
      </div>

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
            gap: '0.5rem',
            border: '1px solid #bbf7d0',
          }}
        >
          <CheckCircle size={20} />
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
            onClick={carregarDados}
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
            <p>Carregando serviços...</p>
          </div>
        ) : servicos.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
            <Layers size={36} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
            <p style={{ fontWeight: 500, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Nenhum serviço cadastrado</p>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Cadastre serviços com cálculo por metragem ou composição.</p>
            <Button variant="primary" style={{ width: 'auto', margin: '0 auto' }} onClick={() => navigate('/services/new')}>
              + Cadastrar Primeiro Serviço
            </Button>
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Nome do Serviço</th>
                <th>Tipo de Cálculo</th>
                <th>Configuração / Insumos</th>
                <th>Operação</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {servicos.map((servico) => (
                <tr key={servico.id}>
                  <td style={{ fontWeight: 600 }}>{servico.nome}</td>
                  <td>
                    {servico.tipoCalculo === 'METRAGEM' ? (
                      <span className="badge badge-cyan">Metragem</span>
                    ) : (
                      <span className="badge badge-magenta">Composição</span>
                    )}
                  </td>
                  <td>
                    {servico.tipoCalculo === 'METRAGEM' ? (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>
                        Material: <strong>{servico.material ? servico.material.nome : 'Material vinculado'}</strong>
                        {servico.material && (
                          <span style={{ color: 'var(--text-light)', marginLeft: '0.35rem' }}>
                            ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(servico.material.custo)}/{servico.material.unidadeMedida})
                          </span>
                        )}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                        Múltiplos insumos definidos na composição
                      </span>
                    )}
                  </td>
                  <td>
                    {servico.tempoOperacaoHoras ? (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>
                        {servico.tempoOperacaoHoras}h
                        {servico.custoHoraOperacao ? ` (${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(servico.custoHoraOperacao)}/h)` : ''}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {servico.tipoCalculo === 'COMPOSICAO' ? (
                      <button 
                        type="button"
                        onClick={() => abrirModalComposicao(servico)} 
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: 'var(--dsilk-cyan, #009FE3)', 
                          fontSize: '0.875rem', 
                          cursor: 'pointer',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Settings size={15} />
                        Composição
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>Automático</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Composição (RF005) */}
      {modalComposicaoAberto && servicoEmEdicao && (
        <div className="modal-overlay" onClick={fecharModalComposicao}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Composição de Materiais (RF005)</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', margin: '0.2rem 0 0 0' }}>
                  Serviço: <strong>{servicoEmEdicao.nome}</strong>
                </p>
              </div>
              <button type="button" className="modal-close-btn" onClick={fecharModalComposicao}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={salvarComposicao}>
              <div className="modal-body">
                {erroModal && (
                  <div 
                    style={{
                      backgroundColor: '#fee2e2',
                      color: '#b91c1c',
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                  >
                    <AlertCircle size={18} />
                    <span>{erroModal}</span>
                  </div>
                )}

                {loadingComposicao ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                    <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
                    <p>Carregando insumos do serviço...</p>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                        Materiais e Quantidades (RN-01, RN-02)
                      </label>
                      <button
                        type="button"
                        onClick={adicionarLinhaItem}
                        disabled={materiais.length === 0}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--dsilk-cyan)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <Plus size={15} />
                        Adicionar Material
                      </button>
                    </div>

                    {materiais.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: '#b91c1c' }}>
                        Nenhum material cadastrado no sistema. Cadastre materiais na aba 'Materiais' primeiro.
                      </p>
                    ) : itensComposicao.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '1.5rem', border: '1.5px dashed #E5E7EB', borderRadius: '8px' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>
                          Nenhum insumo adicionado a este serviço ainda.
                        </p>
                        <Button type="button" variant="outline" onClick={adicionarLinhaItem} style={{ width: 'auto', margin: '0 auto' }}>
                          + Incluir Material
                        </Button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {itensComposicao.map((item, index) => {
                          const matInfo = materiais.find(m => m.id === item.materialId);
                          return (
                            <div 
                              key={index} 
                              style={{ 
                                display: 'grid', 
                                gridTemplateColumns: '1fr 140px 40px', 
                                gap: '0.75rem', 
                                alignItems: 'center',
                                backgroundColor: '#F9FAFB',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB'
                              }}
                            >
                              <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '0.25rem' }}>
                                  Material
                                </label>
                                <select
                                  className="form-control"
                                  value={item.materialId}
                                  onChange={(e) => atualizarItem(index, 'materialId', Number(e.target.value))}
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    borderRadius: '6px',
                                    border: '1.5px solid #E5E7EB',
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  {materiais.map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {m.nome} ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.custo)} / {m.unidadeMedida})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '0.25rem' }}>
                                  Qtd {matInfo ? `(${matInfo.unidadeMedida})` : ''}
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="0.001"
                                  required
                                  value={item.quantidade}
                                  onChange={(e) => atualizarItem(index, 'quantidade', parseFloat(e.target.value) || 0)}
                                  placeholder="Ex: 2"
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    borderRadius: '6px',
                                    border: '1.5px solid #E5E7EB',
                                    fontSize: '0.875rem'
                                  }}
                                />
                              </div>

                              <div style={{ paddingTop: '1.25rem' }}>
                                <button
                                  type="button"
                                  onClick={() => removerLinhaItem(index)}
                                  title="Remover material"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    padding: '0.4rem',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)', display: 'block', marginBottom: '0.75rem' }}>
                        Tempo e Custo de Operação (Opcional)
                      </label>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '0.25rem' }}>
                            <Clock size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                            Tempo de Operação (Horas)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={tempoOperacao}
                            onChange={(e) => setTempoOperacao(e.target.value)}
                            placeholder="Ex: 0.5 para 30min"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              borderRadius: '6px',
                              border: '1.5px solid #E5E7EB',
                              fontSize: '0.875rem'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '0.25rem' }}>
                            <DollarSign size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                            Custo por Hora (R$)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={custoHora}
                            onChange={(e) => setCustoHora(e.target.value)}
                            placeholder="Ex: 40.00"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              borderRadius: '6px',
                              border: '1.5px solid #E5E7EB',
                              fontSize: '0.875rem'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <Button type="button" variant="outline" onClick={fecharModalComposicao} disabled={salvandoComposicao}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={salvandoComposicao || loadingComposicao}>
                  {salvandoComposicao ? 'Salvando...' : 'Salvar Composição'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ServicesList;
