import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { servicoService, Servico, ItemComposicao } from '../services/servicoService';
import { materialService, Material } from '../services/materialService';
import { getApiErrorMessage } from '../types/api';
import { 
  RefreshCw, 
  AlertCircle, 
  Layers, 
  Trash2, 
  X, 
  CheckCircle
} from 'lucide-react';

export const ServicesList: React.FC = () => {

  const [servicos, setServicos] = useState<Servico[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  // Estado do formulário "Novo Serviço" inline (Figma Image 3)
  const [formNovoAberto, setFormNovoAberto] = useState(true);
  const [novoNome, setNovoNome] = useState('');
  const [novoTipoCalculo, setNovoTipoCalculo] = useState<'METRAGEM' | 'COMPOSICAO'>('METRAGEM');
  const [novoMaterialId, setNovoMaterialId] = useState<number | ''>('');
  const [salvandoNovo, setSalvandoNovo] = useState(false);
  const [erroNovo, setErroNovo] = useState<string | null>(null);

  const formNovoRef = useRef<HTMLDivElement>(null);
  const inputNomeRef = useRef<HTMLInputElement>(null);

  const handleNovoServicoClick = () => {
    setFormNovoAberto(true);
    setTimeout(() => {
      formNovoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      inputNomeRef.current?.focus();
    }, 60);
  };

  // Estado do Modal de Composição Técnica
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
      if (listaMateriais.length > 0 && !novoMaterialId) {
        setNovoMaterialId(listaMateriais[0].id);
      }
    } catch (error) {
      setErro(getApiErrorMessage(error, 'Não foi possível carregar os serviços.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSalvarNovoServico = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroNovo(null);

    const nomeLimpo = novoNome.trim();
    if (!nomeLimpo) {
      setErroNovo('O campo "Nome do serviço" é obrigatório.');
      return;
    }

    if (novoTipoCalculo === 'METRAGEM' && !novoMaterialId) {
      setErroNovo('Para serviços por metragem, selecione o material principal.');
      return;
    }

    try {
      setSalvandoNovo(true);
      const novoServico = await servicoService.cadastrar({
        nome: nomeLimpo,
        tipoCalculo: novoTipoCalculo,
        materialId: novoTipoCalculo === 'METRAGEM' ? Number(novoMaterialId) : null,
      });

      setSucesso(`Serviço "${novoServico.nome}" cadastrado com sucesso!`);
      setNovoNome('');
      await carregarDados();

      // Se for por composição, abre imediatamente o modal de configuração técnica
      if (novoTipoCalculo === 'COMPOSICAO') {
        abrirModalComposicao(novoServico);
      }
    } catch (err) {
      setErroNovo(getApiErrorMessage(err, 'Falha ao salvar serviço. Verifique os dados.'));
    } finally {
      setSalvandoNovo(false);
    }
  };

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
    if (salvandoComposicao) return;
    setModalComposicaoAberto(false);
    setServicoEmEdicao(null);
    setItensComposicao([]);
    setTempoOperacao('');
    setCustoHora('');
    setErroModal(null);
  };

  // Acessibilidade: fechar modal de composição via tecla Escape
  useEffect(() => {
    if (!modalComposicaoAberto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !salvandoComposicao) {
        fecharModalComposicao();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalComposicaoAberto, salvandoComposicao]);

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

    if (itensComposicao.length === 0) {
      setErroModal('A composição deve conter ao menos um material.');
      return;
    }

    for (let i = 0; i < itensComposicao.length; i++) {
      if (!itensComposicao[i].quantidade || itensComposicao[i].quantidade <= 0) {
        setErroModal(`A quantidade do item ${i + 1} deve ser maior que zero.`);
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
      setTimeout(() => setSucesso(null), 5000);
    } catch (error) {
      setErroModal(getApiErrorMessage(error, 'Erro ao salvar composição do serviço.'));
    } finally {
      setSalvandoComposicao(false);
    }
  };

  return (
    <DashboardLayout activeMenu="Serviços">
      {/* Cabeçalho da Página (Figma Image 3) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
        <div>
          <div className="category-breadcrumb">CATÁLOGO</div>
          <h1 className="page-main-title">Serviços</h1>
          <p className="page-main-subtitle">Tipos de serviço personalizado oferecidos pela gráfica.</p>
        </div>
        <button 
          type="button" 
          className="btn-dark"
          onClick={handleNovoServicoClick}
        >
          Novo serviço
        </button>
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
            gap: '0.5rem',
            border: '1px solid #bbf7d0',
          }}
        >
          <CheckCircle size={20} />
          <span>{sucesso}</span>
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

      {/* Tabela de Serviços (Figma Image 3) */}
      <div className="dashboard-card" style={{ padding: '0', marginBottom: '2.5rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
            <p>Carregando serviços...</p>
          </div>
        ) : servicos.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
            <Layers size={36} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
            <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Nenhum serviço cadastrado</p>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Cadastre serviços com cálculo por metragem ou composição.</p>
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>NOME DO SERVIÇO</th>
                <th>TIPO DE CÁLCULO</th>
                <th style={{ textAlign: 'right' }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {servicos.map((servico) => (
                <tr key={servico.id}>
                  <td style={{ fontWeight: 700, color: '#0F172A' }}>{servico.nome}</td>
                  <td style={{ color: '#475569' }}>
                    {servico.tipoCalculo === 'METRAGEM' ? 'Metragem' : 'Composição'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      type="button"
                      onClick={() => abrirModalComposicao(servico)}
                      className="table-action-link"
                    >
                      Composição
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Seção / Card NOVO SERVIÇO (Destaque Figma Image 3) */}
      {formNovoAberto && (
        <div 
          ref={formNovoRef}
          className="dashboard-card dashboard-card-highlight"
          style={{ scrollMarginTop: '1.5rem' }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#0F172A' }}>
            Novo serviço
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1.5rem 0' }}>
            Defina o nome e a forma de cálculo usada nos orçamentos.
          </p>

          {erroNovo && (
            <div 
              style={{
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                border: '1px solid #fca5a5',
              }}
            >
              {erroNovo}
            </div>
          )}

          <form onSubmit={handleSalvarNovoServico} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="services-form-grid">
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.4rem' }}>
                  Nome do serviço
                </label>
                <input 
                  ref={inputNomeRef}
                  type="text"
                  placeholder="Ex: Banner sob medida"
                  className="header-search"
                  style={{ width: '100%', paddingLeft: '1rem', backgroundColor: '#FFFFFF' }}
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  disabled={salvandoNovo}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.4rem' }}>
                  Tipo de cálculo
                </label>
                <div className="toggle-group">
                  <button 
                    type="button"
                    className={`toggle-pill ${novoTipoCalculo === 'METRAGEM' ? 'active' : ''}`}
                    onClick={() => setNovoTipoCalculo('METRAGEM')}
                  >
                    Por metragem
                  </button>
                  <button 
                    type="button"
                    className={`toggle-pill ${novoTipoCalculo === 'COMPOSICAO' ? 'active' : ''}`}
                    onClick={() => setNovoTipoCalculo('COMPOSICAO')}
                  >
                    Por Composição
                  </button>
                </div>
              </div>
            </div>

            {novoTipoCalculo === 'METRAGEM' && (
              <div style={{ maxWidth: '400px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.4rem' }}>
                  Material Vinculado (para cálculo por m²)
                </label>
                <select
                  className="header-search"
                  style={{ width: '100%', paddingLeft: '1rem', backgroundColor: '#FFFFFF', appearance: 'auto' }}
                  value={novoMaterialId}
                  onChange={(e) => setNovoMaterialId(Number(e.target.value))}
                  disabled={salvandoNovo}
                  required
                >
                  {materiais.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome} ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.custo)}/{m.unidadeMedida})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                className="btn-outline-figma"
                onClick={() => setFormNovoAberto(false)}
                disabled={salvandoNovo}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-dark"
                disabled={salvandoNovo}
              >
                {salvandoNovo ? 'Salvando...' : 'Salvar e configurar composição'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal de Composição Técnica */}
      {modalComposicaoAberto && servicoEmEdicao && (
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
              maxWidth: '650px', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              margin: 0,
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <div className="category-breadcrumb">COMPOSIÇÃO</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                  Ficha Técnica: {servicoEmEdicao.nome}
                </h3>
              </div>
              <button 
                type="button" 
                aria-label="Fechar modal de composição técnica"
                onClick={fecharModalComposicao} 
                disabled={salvandoComposicao}
                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7 }}
              >
                <X size={20} />
              </button>
            </div>

            {loadingComposicao ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748B' }}>
                <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
                <p>Carregando itens da composição...</p>
              </div>
            ) : (
              <form onSubmit={salvarComposicao} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {erroModal && (
                  <div 
                    style={{
                      backgroundColor: '#fee2e2',
                      color: '#b91c1c',
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      border: '1px solid #fca5a5',
                    }}
                  >
                    {erroModal}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>
                    Materiais e Insumos Utilizados
                  </label>
                  <button 
                    type="button" 
                    onClick={adicionarLinhaItem} 
                    style={{ background: 'none', border: 'none', color: '#009FE3', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    + Adicionar Insumo
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {itensComposicao.map((item, index) => (
                    <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 40px', gap: '0.75rem', alignItems: 'center' }}>
                      <select
                        className="header-search"
                        style={{ width: '100%', paddingLeft: '0.75rem', backgroundColor: '#FFFFFF', appearance: 'auto' }}
                        value={item.materialId}
                        onChange={(e) => atualizarItem(index, 'materialId', Number(e.target.value))}
                        disabled={salvandoComposicao}
                      >
                        {materiais.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nome} ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.custo)}/{m.unidadeMedida})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="Qtd"
                        className="header-search"
                        style={{ width: '100%', paddingLeft: '0.75rem', backgroundColor: '#FFFFFF' }}
                        value={item.quantidade}
                        onChange={(e) => atualizarItem(index, 'quantidade', parseFloat(e.target.value) || 0)}
                        disabled={salvandoComposicao}
                        required
                      />

                      <button
                        type="button"
                        aria-label={`Remover insumo ${index + 1}`}
                        onClick={() => removerLinhaItem(index)}
                        disabled={itensComposicao.length <= 1 || salvandoComposicao}
                        style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '0.5rem' }}
                        title="Remover insumo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}>
                      Tempo de Produção (horas)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="Ex: 1.5"
                      className="header-search"
                      style={{ width: '100%', paddingLeft: '0.75rem', backgroundColor: '#FFFFFF' }}
                      value={tempoOperacao}
                      onChange={(e) => setTempoOperacao(e.target.value)}
                      disabled={salvandoComposicao}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}>
                      Custo da Hora (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Ex: 35.00"
                      className="header-search"
                      style={{ width: '100%', paddingLeft: '0.75rem', backgroundColor: '#FFFFFF' }}
                      value={custoHora}
                      onChange={(e) => setCustoHora(e.target.value)}
                      disabled={salvandoComposicao}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button 
                    type="button" 
                    className="btn-outline-figma" 
                    onClick={fecharModalComposicao}
                    disabled={salvandoComposicao}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn-dark"
                    disabled={salvandoComposicao}
                  >
                    {salvandoComposicao ? 'Salvando...' : 'Salvar Composição'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
