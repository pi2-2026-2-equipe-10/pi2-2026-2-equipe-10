import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { orcamentoService } from '../services/orcamentoService';
import { servicoService, Servico } from '../services/servicoService';
import { clienteService, Cliente } from '../services/clienteService';
import { getApiErrorMessage } from '../types/api';
import { 
  AlertCircle, 
  CheckCircle, 
  X,
  RefreshCw,
  Calculator,
  Layers,
  Ruler,
  UserPlus,
  ArrowLeft,
  Save,
  Check
} from 'lucide-react';

const MEDIDAS_RAPIDAS = [
  { rotulo: '1,0m × 0,5m (0,5 m²)', largura: '1.0', altura: '0.5' },
  { rotulo: '1,5m × 1,0m (1,5 m²)', largura: '1.5', altura: '1.0' },
  { rotulo: '2,0m × 1,0m (2,0 m²)', largura: '2.0', altura: '1.0' },
  { rotulo: '2,0m × 1,5m (3,0 m²)', largura: '2.0', altura: '1.5' },
  { rotulo: '3,0m × 1,5m (4,5 m²)', largura: '3.0', altura: '1.5' },
];

export const BudgetCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orcamentoIdParam = searchParams.get('id');
  const clienteIdParam = searchParams.get('clienteId');

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);

  // Filtro visual para ajudar a achar serviços de Metragem ou Composição rapidamente
  const [filtroTipoServico, setFiltroTipoServico] = useState<'TODOS' | 'METRAGEM' | 'COMPOSICAO'>('TODOS');

  // Campos reais do Orçamento (RF006, RF007, RF008, RF009, RN-01, RN-03, RN-04)
  const [clienteId, setClienteId] = useState<number | ''>('');
  const [servicoId, setServicoId] = useState<number | ''>('');
  const [servicoDetalhado, setServicoDetalhado] = useState<Servico | null>(null);
  const [loadingDetalheServico, setLoadingDetalheServico] = useState(false);

  const [largura, setLargura] = useState<string>('2.0');
  const [altura, setAltura] = useState<string>('1.5');

  const [custoCalculado, setCustoCalculado] = useState<number | null>(null);
  const [loadingDados, setLoadingDados] = useState(true);
  const [calculando, setCalculando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [erroCalculo, setErroCalculo] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  // Modal para cadastro rápido de cliente
  const [modalClienteAberto, setModalClienteAberto] = useState(false);
  const [novoClienteNome, setNovoClienteNome] = useState('');
  const [novoClienteTelefone, setNovoClienteTelefone] = useState('');
  const [novoClienteEmail, setNovoClienteEmail] = useState('');
  const [salvandoCliente, setSalvandoCliente] = useState(false);
  const [erroModalCliente, setErroModalCliente] = useState<string | null>(null);

  // Acessibilidade: fechar modal com tecla Escape
  useEffect(() => {
    if (!modalClienteAberto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !salvandoCliente) {
        setModalClienteAberto(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalClienteAberto, salvandoCliente]);

  const servicoSelecionado =
    servicoDetalhado && servicoDetalhado.id === Number(servicoId)
      ? servicoDetalhado
      : servicos.find((s) => s.id === Number(servicoId)) || null;

  const clienteSelecionado = clientes.find((c) => c.id === Number(clienteId));

  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  // Carrega clientes, serviços e (se for edição) o orçamento existente
  useEffect(() => {
    const carregarTudo = async () => {
      try {
        setLoadingDados(true);
        setErro(null);
        const [listaClientes, listaServicos] = await Promise.all([
          clienteService.listar(),
          servicoService.listar(),
        ]);
        setClientes(listaClientes);
        setServicos(listaServicos);

        if (orcamentoIdParam) {
          const orc = await orcamentoService.buscarPorId(orcamentoIdParam);
          setClienteId(orc.clienteId ?? '');
          setServicoId(orc.servicoId ?? (listaServicos[0]?.id || ''));
          setLargura(orc.largura != null ? String(orc.largura) : '2.0');
          setAltura(orc.altura != null ? String(orc.altura) : '1.5');
          if (orc.custoTotal != null) {
            setCustoCalculado(orc.custoTotal);
          }
        } else {
          if (clienteIdParam && listaClientes.some((c) => String(c.id) === String(clienteIdParam))) {
            setClienteId(Number(clienteIdParam));
          } else if (listaClientes.length > 0) {
            setClienteId(listaClientes[0].id);
          }

          if (listaServicos.length > 0) {
            setServicoId(listaServicos[0].id);
          }
        }
      } catch (err) {
        setErro(getApiErrorMessage(err, 'Falha ao carregar informações para o orçamento.'));
      } finally {
        setLoadingDados(false);
      }
    };

    carregarTudo();
  }, [orcamentoIdParam, clienteIdParam]);

  // Busca os detalhes completos do serviço selecionado (incluindo ficha técnica de composição via GET /servicos/:id)
  useEffect(() => {
    if (!servicoId) {
      setServicoDetalhado(null);
      return;
    }

    let ativo = true;
    const carregarDetalhe = async () => {
      try {
        setLoadingDetalheServico(true);
        const det = await servicoService.buscarPorId(Number(servicoId));
        if (ativo) {
          setServicoDetalhado(det);
        }
      } catch {
        // Fallback para o item da listagem
      } finally {
        if (ativo) {
          setLoadingDetalheServico(false);
        }
      }
    };

    carregarDetalhe();
    return () => {
      ativo = false;
    };
  }, [servicoId]);

  // Função que chama POST /orcamentos/calcular no backend
  const recalcularNaApi = useCallback(
    async (idSrv: number, tipoCalc: string, largStr: string, altStr: string) => {
      try {
        setCalculando(true);
        setErroCalculo(null);

        const payload: { servicoId: number; largura?: number; altura?: number } = {
          servicoId: idSrv,
        };

        if (tipoCalc === 'METRAGEM') {
          const l = parseFloat(largStr.replace(',', '.'));
          const a = parseFloat(altStr.replace(',', '.'));
          if (isNaN(l) || l <= 0 || isNaN(a) || a <= 0) {
            setCustoCalculado(null);
            setErroCalculo('Informe largura e altura maiores que zero para calcular o valor em m².');
            return;
          }
          payload.largura = l;
          payload.altura = a;
        }

        const res = await orcamentoService.calcular(payload);
        setCustoCalculado(res.custo);
      } catch (err) {
        setCustoCalculado(null);
        setErroCalculo(getApiErrorMessage(err, 'Não foi possível calcular o custo deste serviço.'));
      } finally {
        setCalculando(false);
      }
    },
    []
  );

  // Cálculo automático em tempo real sempre que serviço, largura ou altura mudarem
  useEffect(() => {
    if (loadingDados || !servicoId) {
      setCustoCalculado(null);
      return;
    }

    const srv = servicos.find((s) => s.id === Number(servicoId));
    if (!srv) return;

    const timer = setTimeout(() => {
      recalcularNaApi(Number(servicoId), srv.tipoCalculo, largura, altura);
    }, 200);

    return () => clearTimeout(timer);
  }, [servicoId, largura, altura, loadingDados, servicos, recalcularNaApi]);

  const handleSalvar = async (comoRascunho: boolean) => {
    setErro(null);

    if (!comoRascunho && !servicoId) {
      setErro('Selecione um serviço antes de registrar o orçamento.');
      return;
    }

    const ehMetragem = servicoSelecionado?.tipoCalculo === 'METRAGEM';
    const largNum = ehMetragem ? parseFloat(largura.replace(',', '.')) : null;
    const altNum = ehMetragem ? parseFloat(altura.replace(',', '.')) : null;

    if (!comoRascunho && ehMetragem) {
      if (!largNum || largNum <= 0 || !altNum || altNum <= 0) {
        setErro('Para registrar um orçamento por metragem, informe largura e altura maiores que zero.');
        return;
      }
    }

    try {
      setSalvando(true);

      const payload = {
        rascunho: comoRascunho,
        clienteId: clienteId ? Number(clienteId) : null,
        servicoId: servicoId ? Number(servicoId) : null,
        largura: ehMetragem && largNum && largNum > 0 ? largNum : null,
        altura: ehMetragem && altNum && altNum > 0 ? altNum : null,
      };

      if (orcamentoIdParam) {
        await orcamentoService.atualizar(orcamentoIdParam, payload);
        setSucesso(
          comoRascunho
            ? `Rascunho #${orcamentoIdParam} atualizado com sucesso!`
            : `Orçamento #${orcamentoIdParam} registrado com sucesso!`
        );
      } else {
        const criado = await orcamentoService.criar(payload);
        setSucesso(
          comoRascunho
            ? `Rascunho #${criado.id} salvo com sucesso!`
            : `Orçamento #${criado.id} registrado com sucesso!`
        );
      }

      setTimeout(() => {
        navigate('/budgets');
      }, 1000);
    } catch (err) {
      setErro(getApiErrorMessage(err, 'Falha ao salvar orçamento. Verifique os dados informados.'));
    } finally {
      setSalvando(false);
    }
  };

  const handleCadastrarClienteRapido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoClienteNome.trim()) {
      setErroModalCliente('O nome do cliente é obrigatório.');
      return;
    }

    try {
      setSalvandoCliente(true);
      setErroModalCliente(null);
      const novo = await clienteService.cadastrar({
        nome: novoClienteNome.trim(),
        telefone: novoClienteTelefone.trim() || undefined,
        email: novoClienteEmail.trim() || undefined,
      });

      setClientes([...clientes, novo]);
      setClienteId(novo.id);
      setModalClienteAberto(false);
      setNovoClienteNome('');
      setNovoClienteTelefone('');
      setNovoClienteEmail('');
    } catch (err) {
      setErroModalCliente(getApiErrorMessage(err, 'Erro ao cadastrar cliente.'));
    } finally {
      setSalvandoCliente(false);
    }
  };

  const servicosExibidos = servicos.filter((s) =>
    filtroTipoServico === 'TODOS' ? true : s.tipoCalculo === filtroTipoServico
  );

  const largNum = parseFloat(largura.replace(',', '.')) || 0;
  const altNum = parseFloat(altura.replace(',', '.')) || 0;
  const areaCalculadaM2 = largNum > 0 && altNum > 0 ? largNum * altNum : 0;

  const itensComposicao = servicoDetalhado?.itens || [];
  const subtotalMateriaisComposicao = itensComposicao.reduce(
    (acc, item) => acc + item.quantidade * (item.material?.custo || 0),
    0
  );
  const custoMaoDeObraComposicao =
    (servicoDetalhado?.tempoOperacaoHoras || 0) * (servicoDetalhado?.custoHoraOperacao || 0);

  return (
    <DashboardLayout activeMenu="Orçamentos">
      {/* Cabeçalho com botão de voltar */}
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
          <div className="category-breadcrumb">CALCULADORA DE PROPOSTAS</div>
          <h1 className="page-main-title">
            {orcamentoIdParam ? `Editar Orçamento #${orcamentoIdParam}` : 'Novo Orçamento'}
          </h1>
          <p className="page-main-subtitle" style={{ marginBottom: 0 }}>
            Escolha o serviço, informe as medidas (se for por m²) e o valor é calculado automaticamente em tempo real.
          </p>
        </div>

        <button
          type="button"
          className="btn-outline-figma"
          onClick={() => navigate('/budgets')}
        >
          <ArrowLeft size={16} />
          Voltar para Orçamentos
        </button>
      </div>

      {sucesso && (
        <div 
          style={{
            backgroundColor: '#dcfce7',
            color: '#15803d',
            padding: '1rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            border: '1px solid #bbf7d0',
            fontWeight: 600,
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
            padding: '1rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            border: '1px solid #fca5a5',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{erro}</span>
          </div>
          <button
            type="button"
            aria-label="Dispensar mensagem de erro"
            onClick={() => setErro(null)}
            style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {loadingDados ? (
        <div className="dashboard-card" style={{ padding: '3.5rem', textAlign: 'center', color: '#64748B' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
          <p style={{ margin: 0, fontWeight: 500 }}>Carregando catálogo de serviços e clientes...</p>
        </div>
      ) : (
        <div className="budget-calculator-grid">
          {/* Coluna Esquerda: Passos Claros e Diretos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
            
            {/* PASSO 1: Escolha o Serviço */}
            <div className="dashboard-card" style={{ padding: '1.5rem 1.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginBottom: '1.15rem',
                }}
              >
                <div className="step-header" style={{ marginBottom: 0 }}>
                  <div className="step-number-badge">1</div>
                  <div>
                    <h3 className="step-title">Escolha o Serviço</h3>
                    <p className="step-subtitle">
                      Clique em um serviço abaixo para selecioná-lo
                    </p>
                  </div>
                </div>

                {/* Filtro rápido de tipo de cálculo */}
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => setFiltroTipoServico('TODOS')}
                    className={filtroTipoServico === 'TODOS' ? 'btn-dark' : 'btn-outline-figma'}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    Todos ({servicos.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroTipoServico('METRAGEM')}
                    className={filtroTipoServico === 'METRAGEM' ? 'btn-dark' : 'btn-outline-figma'}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    Por Metragem (m²)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroTipoServico('COMPOSICAO')}
                    className={filtroTipoServico === 'COMPOSICAO' ? 'btn-dark' : 'btn-outline-figma'}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    Por Composição
                  </button>
                </div>
              </div>

              {/* Grade de Cartões Clicáveis de Serviço */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                {servicosExibidos.map((srv) => {
                  const ativo = Number(servicoId) === srv.id;
                  const ehMetragem = srv.tipoCalculo === 'METRAGEM';
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => setServicoId(srv.id)}
                      style={{
                        textAlign: 'left',
                        padding: '0.9rem 1rem',
                        borderRadius: '10px',
                        border: ativo ? '2px solid #009FE3' : '1px solid #E2E8F0',
                        backgroundColor: ativo ? '#F0F9FF' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        boxShadow: ativo ? '0 4px 12px rgba(0, 159, 227, 0.12)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>
                          {srv.nome}
                        </span>
                        {ativo && (
                          <span
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: '#009FE3',
                              color: '#FFFFFF',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Check size={12} />
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                        <span
                          className={`badge ${ehMetragem ? 'badge-cyan' : 'badge-magenta'}`}
                          style={{ fontSize: '0.68rem' }}
                        >
                          {ehMetragem ? 'Por Metragem (m²)' : 'Por Composição'}
                        </span>
                        {ehMetragem && srv.material && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                            {formatarMoeda(srv.material.custo)}/m²
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PASSO 2: Medidas (Metragem) ou Ficha Técnica (Composição) */}
            <div className="dashboard-card" style={{ padding: '1.5rem 1.75rem' }}>
              <div className="step-header">
                <div className="step-number-badge">2</div>
                <div>
                  <h3 className="step-title">
                    {servicoSelecionado?.tipoCalculo === 'METRAGEM'
                      ? 'Informe as Dimensões em Metros'
                      : 'Ficha Técnica da Composição'}
                  </h3>
                  <p className="step-subtitle">
                    {servicoSelecionado?.tipoCalculo === 'METRAGEM'
                      ? 'O custo é calculado automaticamente multiplicando Largura × Altura × Custo do Material por m².'
                      : 'Serviço calculado pela soma dos materiais da ficha técnica mais o tempo de operação.'}
                  </p>
                </div>
              </div>

              {!servicoSelecionado ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748B', fontSize: '0.9rem' }}>
                  Selecione um serviço no Passo 1 acima para configurar o cálculo.
                </div>
              ) : servicoSelecionado.tipoCalculo === 'METRAGEM' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                  {/* Info do Material vinculado ao Serviço */}
                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#334155' }}>
                      <Ruler size={17} color="#009FE3" />
                      <span>
                        Material do serviço:{' '}
                        <strong style={{ color: '#0F172A' }}>
                          {servicoSelecionado.material?.nome || 'Não vinculado'}
                        </strong>
                      </span>
                    </div>
                    {servicoSelecionado.material && (
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0284C7' }}>
                        {formatarMoeda(servicoSelecionado.material.custo)} por {servicoSelecionado.material.unidadeMedida}
                      </span>
                    )}
                  </div>

                  {/* Botões de Medidas Rápidas */}
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: '0.45rem', textTransform: 'uppercase' }}>
                      Tamanhos frequentes (clique para preencher):
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                      {MEDIDAS_RAPIDAS.map((m) => {
                        const selecionado = largura === m.largura && altura === m.altura;
                        return (
                          <button
                            key={m.rotulo}
                            type="button"
                            onClick={() => {
                              setLargura(m.largura);
                              setAltura(m.altura);
                            }}
                            style={{
                              padding: '0.4rem 0.75rem',
                              borderRadius: '999px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              border: selecionado ? '1.5px solid #009FE3' : '1px solid #CBD5E1',
                              backgroundColor: selecionado ? '#E0F2FE' : '#FFFFFF',
                              color: selecionado ? '#0284C7' : '#334155',
                            }}
                          >
                            {m.rotulo}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Inputs de Largura e Altura */}
                  <div className="dimensions-input-grid">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}>
                        Largura (metros) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="Ex: 2.0"
                        className="header-search"
                        style={{ width: '100%', paddingLeft: '0.85rem', backgroundColor: '#FFFFFF', fontSize: '1rem', fontWeight: 600 }}
                        value={largura}
                        onChange={(e) => setLargura(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}>
                        Altura (metros) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="Ex: 1.5"
                        className="header-search"
                        style={{ width: '100%', paddingLeft: '0.85rem', backgroundColor: '#FFFFFF', fontSize: '1rem', fontWeight: 600 }}
                        value={altura}
                        onChange={(e) => setAltura(e.target.value)}
                      />
                    </div>

                    <div
                      style={{
                        backgroundColor: '#F0F9FF',
                        border: '1px solid #BAE6FD',
                        borderRadius: '8px',
                        padding: '0.6rem 0.85rem',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0369A1', textTransform: 'uppercase' }}>
                        Área Total
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                        {areaCalculadaM2.toFixed(2)} m²
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Visualização da Ficha Técnica para Serviços por Composição */
                <div>
                  {loadingDetalheServico ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>
                      Carregando ficha técnica da composição...
                    </div>
                  ) : itensComposicao.length === 0 ? (
                    <div
                      style={{
                        backgroundColor: '#FFFBEB',
                        color: '#92400E',
                        padding: '1rem 1.15rem',
                        borderRadius: '8px',
                        border: '1px solid #FDE68A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem' }}>
                        <Layers size={18} style={{ flexShrink: 0 }} />
                        <span>
                          Este serviço por composição ainda não possui materiais cadastrados na ficha técnica.
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn-dark"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                        onClick={() => navigate('/services')}
                      >
                        Configurar em Serviços →
                      </button>
                    </div>
                  ) : (
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                      <table className="dashboard-table" style={{ margin: 0 }}>
                        <thead>
                          <tr>
                            <th>Insumo / Material</th>
                            <th>Quantidade</th>
                            <th>Custo Unit.</th>
                            <th style={{ textAlign: 'right' }}>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {itensComposicao.map((item, idx) => {
                            const custoUnit = item.material?.custo || 0;
                            const sub = item.quantidade * custoUnit;
                            return (
                              <tr key={item.id || idx}>
                                <td style={{ fontWeight: 600 }}>{item.material?.nome || `Material #${item.materialId}`}</td>
                                <td>
                                  {item.quantidade} {item.material?.unidadeMedida || 'un'}
                                </td>
                                <td>{formatarMoeda(custoUnit)}</td>
                                <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatarMoeda(sub)}</td>
                              </tr>
                            );
                          })}
                          {custoMaoDeObraComposicao > 0 && (
                            <tr style={{ backgroundColor: '#F8FAFC' }}>
                              <td colSpan={3} style={{ fontSize: '0.825rem', color: '#475569' }}>
                                Tempo de operação ({servicoDetalhado?.tempoOperacaoHoras}h × {formatarMoeda(servicoDetalhado?.custoHoraOperacao || 0)}/h)
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                {formatarMoeda(custoMaoDeObraComposicao)}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PASSO 3: Cliente (Opcional) */}
            <div className="dashboard-card" style={{ padding: '1.5rem 1.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                }}
              >
                <div className="step-header" style={{ marginBottom: 0 }}>
                  <div className="step-number-badge">3</div>
                  <div>
                    <h3 className="step-title">Cliente (Opcional)</h3>
                    <p className="step-subtitle">
                      Associe a um cliente cadastrado ou mantenha como orçamento avulso.
                    </p>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn-outline-figma"
                  onClick={() => setModalClienteAberto(true)}
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                >
                  <UserPlus size={15} />
                  + Cadastrar Novo Cliente
                </button>
              </div>

              <select
                className="header-search"
                style={{ width: '100%', paddingLeft: '0.85rem', backgroundColor: '#FFFFFF', appearance: 'auto', fontSize: '0.92rem' }}
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Sem cliente vinculado (Orçamento avulso)</option>
                {clientes.map((cli) => (
                  <option key={cli.id} value={cli.id}>
                    {cli.nome} {cli.telefone ? `— ${cli.telefone}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Coluna Direita: Resumo em Tempo Real e Ações */}
          <div style={{ position: 'sticky', top: '1.5rem' }}>
            <div className="proposal-summary-card">
              <div className="proposal-summary-tag">RESUMO DO ORÇAMENTO</div>
              <h2 className="proposal-summary-title">
                {orcamentoIdParam ? `Proposta #${String(orcamentoIdParam).padStart(4, '0')}` : 'Nova Proposta'}
              </h2>

              <div className="proposal-summary-client-label">CLIENTE</div>
              <div className="proposal-summary-client-name">
                {clienteSelecionado?.nome || 'Orçamento avulso (Sem cliente)'}
              </div>

              <div className="proposal-divider"></div>

              <div className="proposal-item-row">
                <span style={{ color: '#94A3B8' }}>Serviço</span>
                <span style={{ fontWeight: 600, textAlign: 'right' }}>
                  {servicoSelecionado?.nome || 'Não selecionado'}
                </span>
              </div>

              <div className="proposal-item-row">
                <span style={{ color: '#94A3B8' }}>Tipo de cálculo</span>
                <span style={{ fontWeight: 600 }}>
                  {servicoSelecionado?.tipoCalculo === 'METRAGEM'
                    ? 'Por Metragem (m²)'
                    : servicoSelecionado?.tipoCalculo === 'COMPOSICAO'
                    ? 'Por Composição'
                    : '—'}
                </span>
              </div>

              {servicoSelecionado?.tipoCalculo === 'METRAGEM' ? (
                <>
                  <div className="proposal-item-row">
                    <span style={{ color: '#94A3B8' }}>Dimensões</span>
                    <span style={{ fontWeight: 600 }}>
                      {largNum > 0 && altNum > 0
                        ? `${largNum}m × ${altNum}m (${areaCalculadaM2.toFixed(2)} m²)`
                        : 'Informe largura e altura'}
                    </span>
                  </div>
                  {servicoSelecionado.material && (
                    <div className="proposal-item-row">
                      <span style={{ color: '#94A3B8' }}>Custo do material</span>
                      <span style={{ fontWeight: 600 }}>
                        {formatarMoeda(servicoSelecionado.material.custo)} / m²
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="proposal-item-row">
                    <span style={{ color: '#94A3B8' }}>Insumos da composição</span>
                    <span style={{ fontWeight: 600 }}>
                      {formatarMoeda(subtotalMateriaisComposicao)}
                    </span>
                  </div>
                  <div className="proposal-item-row">
                    <span style={{ color: '#94A3B8' }}>Operação / Mão de obra</span>
                    <span style={{ fontWeight: 600 }}>
                      {formatarMoeda(custoMaoDeObraComposicao)}
                    </span>
                  </div>
                </>
              )}

              <div className="proposal-divider"></div>

              <div className="proposal-total-row">
                <span className="proposal-total-label">Custo Total Calculado</span>
                <span className="proposal-total-value" style={{ color: '#38BDF8' }}>
                  {calculando
                    ? 'Calculando...'
                    : custoCalculado != null
                    ? formatarMoeda(custoCalculado)
                    : '—'}
                </span>
              </div>

              {erroCalculo && (
                <div
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(248, 113, 113, 0.4)',
                    color: '#FCA5A5',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    marginBottom: '1rem',
                    lineHeight: 1.4,
                  }}
                >
                  {erroCalculo}
                </div>
              )}

              {/* Botão Principal: Registrar Orçamento */}
              <button
                type="button"
                className="btn-cyan"
                onClick={() => handleSalvar(false)}
                disabled={salvando || calculando || custoCalculado == null}
                style={{ width: '100%', marginBottom: '0.75rem' }}
              >
                <Calculator size={17} />
                {salvando
                  ? 'Salvando...'
                  : orcamentoIdParam
                  ? 'Salvar e Registrar Orçamento'
                  : 'Registrar Orçamento'}
              </button>

              {/* Botão Secundário: Salvar como Rascunho */}
              <button
                type="button"
                onClick={() => handleSalvar(true)}
                disabled={salvando}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #3F3F46',
                  backgroundColor: '#27272A',
                  color: '#E2E8F0',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                }}
              >
                <Save size={15} />
                Salvar como Rascunho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Cadastro Rápido de Cliente */}
      {modalClienteAberto && (
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
            style={{ width: '100%', maxWidth: '480px', margin: 0, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Cadastrar Novo Cliente</h3>
              <button 
                type="button" 
                aria-label="Fechar modal de cadastro de cliente"
                onClick={() => setModalClienteAberto(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7 }}
              >
                <X size={20} />
              </button>
            </div>

            {erroModalCliente && (
              <div 
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#b91c1c',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                }}
              >
                {erroModalCliente}
              </div>
            )}

            <form onSubmit={handleCadastrarClienteRapido} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Nome do Cliente *
                </label>
                <input 
                  type="text"
                  placeholder="Ex: Ana Clara Studio"
                  className="header-search"
                  style={{ width: '100%', paddingLeft: '0.85rem', backgroundColor: '#FFFFFF' }}
                  value={novoClienteNome}
                  onChange={(e) => setNovoClienteNome(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Telefone / WhatsApp
                </label>
                <input 
                  type="text"
                  placeholder="(85) 99999-9999"
                  className="header-search"
                  style={{ width: '100%', paddingLeft: '0.85rem', backgroundColor: '#FFFFFF' }}
                  value={novoClienteTelefone}
                  onChange={(e) => setNovoClienteTelefone(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  E-mail
                </label>
                <input 
                  type="email"
                  placeholder="cliente@email.com"
                  className="header-search"
                  style={{ width: '100%', paddingLeft: '0.85rem', backgroundColor: '#FFFFFF' }}
                  value={novoClienteEmail}
                  onChange={(e) => setNovoClienteEmail(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button 
                  type="button" 
                  className="btn-outline-figma"
                  onClick={() => setModalClienteAberto(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-dark"
                  disabled={salvandoCliente}
                >
                  {salvandoCliente ? 'Salvando...' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
