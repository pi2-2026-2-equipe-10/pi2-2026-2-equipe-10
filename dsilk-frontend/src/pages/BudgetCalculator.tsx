import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { orcamentoService } from '../services/orcamentoService';
import { servicoService, Servico } from '../services/servicoService';
import { clienteService, Cliente } from '../services/clienteService';
import { materialService, Material } from '../services/materialService';
import { getApiErrorMessage } from '../types/api';
import { 
  AlertCircle, 
  CheckCircle, 
  X,
  RefreshCw,
  Calculator
} from 'lucide-react';

export const BudgetCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orcamentoIdParam = searchParams.get('id');

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);

  // Campos do Formulário
  const [clienteId, setClienteId] = useState<number | ''>('');
  const [validade, setValidade] = useState('7 dias');
  const [servicoId, setServicoId] = useState<number | ''>('');
  const [materialId, setMaterialId] = useState<number | ''>('');
  const [quantidade, setQuantidade] = useState<string>('40');
  const [cor, setCor] = useState('Preto');
  const [tamanhos, setTamanhos] = useState('P: 10 - M: 15 - G: 15');
  const [largura, setLargura] = useState<string>('2.0');
  const [altura, setAltura] = useState<string>('1.5');
  const [areasImpressao, setAreasImpressao] = useState<string[]>(['Frente A4']);

  const [custoCalculado, setCustoCalculado] = useState<number | null>(1380);
  const [loadingDados, setLoadingDados] = useState(true);
  const [calculando, setCalculando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  // Modal para cadastro rápido de cliente
  const [modalClienteAberto, setModalClienteAberto] = useState(false);
  const [novoClienteNome, setNovoClienteNome] = useState('');
  const [novoClienteTelefone, setNovoClienteTelefone] = useState('');
  const [novoClienteEmail, setNovoClienteEmail] = useState('');
  const [salvandoCliente, setSalvandoCliente] = useState(false);
  const [erroModalCliente, setErroModalCliente] = useState<string | null>(null);

  const servicoSelecionado = servicos.find(s => s.id === Number(servicoId));
  const clienteSelecionado = clientes.find(c => c.id === Number(clienteId));

  useEffect(() => {
    const carregarTudo = async () => {
      try {
        setLoadingDados(true);
        setErro(null);
        const [listaClientes, listaServicos, listaMateriais] = await Promise.all([
          clienteService.listar(),
          servicoService.listar(),
          materialService.listar(),
        ]);
        setClientes(listaClientes);
        setServicos(listaServicos);
        setMateriais(listaMateriais);

        if (listaClientes.length > 0) {
          setClienteId(listaClientes[0].id);
        }
        if (listaServicos.length > 0) {
          setServicoId(listaServicos[0].id);
        }
        if (listaMateriais.length > 0) {
          setMaterialId(listaMateriais[0].id);
        }

        if (orcamentoIdParam) {
          const orc = await orcamentoService.buscarPorId(orcamentoIdParam);
          if (orc.clienteId) setClienteId(orc.clienteId);
          if (orc.servicoId) setServicoId(orc.servicoId);
          if (orc.largura) setLargura(String(orc.largura));
          if (orc.altura) setAltura(String(orc.altura));
          if (orc.custoTotal != null) setCustoCalculado(orc.custoTotal);
        }
      } catch (err) {
        setErro(getApiErrorMessage(err, 'Falha ao carregar informações para o orçamento.'));
      } finally {
        setLoadingDados(false);
      }
    };

    carregarTudo();
  }, [orcamentoIdParam]);

  const toggleAreaImpressao = (area: string) => {
    if (areasImpressao.includes(area)) {
      setAreasImpressao(areasImpressao.filter(a => a !== area));
    } else {
      setAreasImpressao([...areasImpressao, area]);
    }
  };

  const calcularCusto = async () => {
    if (!servicoId) return;

    try {
      setCalculando(true);
      setErro(null);

      const payload: { servicoId: number; largura?: number; altura?: number } = {
        servicoId: Number(servicoId),
      };

      if (servicoSelecionado?.tipoCalculo === 'METRAGEM') {
        const l = parseFloat(largura.replace(',', '.'));
        const a = parseFloat(altura.replace(',', '.'));
        if (!isNaN(l) && l > 0 && !isNaN(a) && a > 0) {
          payload.largura = l;
          payload.altura = a;
        }
      }

      const res = await orcamentoService.calcular(payload);
      setCustoCalculado(res.custo);
    } catch (err) {
      setErro(getApiErrorMessage(err, 'Não foi possível calcular o custo do orçamento.'));
    } finally {
      setCalculando(false);
    }
  };

  const handleSalvar = async (comoRascunho: boolean) => {
    if (!servicoId) {
      setErro('Selecione um serviço para o orçamento.');
      return;
    }

    try {
      setSalvando(true);
      setErro(null);

      const payload = {
        rascunho: comoRascunho,
        clienteId: clienteId ? Number(clienteId) : null,
        servicoId: Number(servicoId),
        largura: servicoSelecionado?.tipoCalculo === 'METRAGEM' ? parseFloat(largura.replace(',', '.')) : null,
        altura: servicoSelecionado?.tipoCalculo === 'METRAGEM' ? parseFloat(altura.replace(',', '.')) : null,
      };

      if (orcamentoIdParam) {
        await orcamentoService.atualizar(orcamentoIdParam, payload);
        setSucesso('Orçamento atualizado com sucesso!');
      } else {
        await orcamentoService.criar(payload);
        setSucesso(comoRascunho ? 'Orçamento salvo como rascunho com sucesso!' : 'Proposta de orçamento registrada com sucesso!');
      }

      setTimeout(() => {
        navigate('/budgets');
      }, 1200);
    } catch (err) {
      setErro(getApiErrorMessage(err, 'Falha ao salvar orçamento.'));
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

  const orcamentoNumeroFormatado = orcamentoIdParam 
    ? `#00${orcamentoIdParam}` 
    : '#0052';

  const nomeExibicaoCliente = clienteSelecionado?.nome || 'Ana Clara Studio';
  const valorTotalFormatado = custoCalculado != null 
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(custoCalculado) 
    : 'R$ 1.380,00';

  return (
    <DashboardLayout activeMenu="Orçamentos">
      {/* Cabeçalho estilo Figma (Image 4) */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div className="category-breadcrumb">ORÇAMENTOS</div>
        <h1 className="page-main-title">Novo orçamento</h1>
        <p className="page-main-subtitle">Monte uma proposta completa em poucos passos.</p>
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
            gap: '0.5rem',
            border: '1px solid #fca5a5',
          }}
        >
          <AlertCircle size={20} />
          <span>{erro}</span>
        </div>
      )}

      {loadingDados ? (
        <div className="dashboard-card" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
          <p>Carregando dados para orçamento...</p>
        </div>
      ) : (
        /* Layout em 2 Colunas (Figma Image 4) */
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Coluna Esquerda: Passos 1 e 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Passo 1: Cliente */}
            <div className="dashboard-card" style={{ padding: '1.75rem 2rem' }}>
              <div className="step-header">
                <div className="step-number-badge">1</div>
                <div>
                  <h3 className="step-title">Cliente</h3>
                  <p className="step-subtitle">Para quem é este orçamento?</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.825rem', fontWeight: 600, color: '#0F172A' }}>
                      Cliente
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setModalClienteAberto(true)}
                      style={{ background: 'none', border: 'none', color: '#009FE3', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      + Novo
                    </button>
                  </div>
                  <select
                    className="header-search"
                    style={{ width: '100%', paddingLeft: '0.85rem', backgroundColor: '#FFFFFF', appearance: 'auto' }}
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value ? Number(e.target.value) : '')}
                  >
                    {clientes.map((cli) => (
                      <option key={cli.id} value={cli.id}>
                        {cli.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}>
                    Validade
                  </label>
                  <input
                    type="text"
                    className="header-search"
                    style={{ width: '100%', paddingLeft: '0.85rem', backgroundColor: '#FFFFFF' }}
                    value={validade}
                    onChange={(e) => setValidade(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Passo 2: Composição do pedido */}
            <div className="dashboard-card" style={{ padding: '1.75rem 2rem' }}>
              <div className="step-header">
                <div className="step-number-badge">2</div>
                <div>
                  <h3 className="step-title">Composição do pedido</h3>
                  <p className="step-subtitle">Defina material, quantidade e impressão.</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}>
                      Serviço Personalizado
                    </label>
                    <select
                      className="header-search"
                      style={{ width: '100%', paddingLeft: '0.85rem', backgroundColor: '#FFFFFF', appearance: 'auto' }}
                      value={servicoId}
                      onChange={(e) => {
                        setServicoId(Number(e.target.value));
                        setCustoCalculado(null);
                      }}
                    >
                      {servicos.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nome} ({s.tipoCalculo === 'METRAGEM' ? 'Metragem' : 'Composição'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}>
                      Material Principal
                    </label>
                    <select
                      className="header-search"
                      style={{ width: '100%', paddingLeft: '0.85rem', backgroundColor: '#FFFFFF', appearance: 'auto' }}
                      value={materialId}
                      onChange={(e) => setMaterialId(Number(e.target.value))}
                    >
                      {materiais.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}>
                      Quantidade
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="40"
                      className="header-search"
                      style={{ width: '100%', paddingLeft: '0.85rem', backgroundColor: '#FFFFFF' }}
                      value={quantidade}
                      onChange={(e) => setQuantidade(e.target.value)}
                    />
                  </div>

                  {servicoSelecionado?.tipoCalculo === 'METRAGEM' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}>
                          Largura (metros)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="2.0"
                          className="header-search"
                          style={{ width: '100%', paddingLeft: '0.85rem', backgroundColor: '#FFFFFF' }}
                          value={largura}
                          onChange={(e) => setLargura(e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}>
                          Altura (metros)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="1.5"
                          className="header-search"
                          style={{ width: '100%', paddingLeft: '0.85rem', backgroundColor: '#FFFFFF' }}
                          value={altura}
                          onChange={(e) => setAltura(e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}>
                          Cor
                        </label>
                        <input
                          type="text"
                          className="header-search"
                          style={{ width: '100%', paddingLeft: '0.85rem', backgroundColor: '#FFFFFF' }}
                          value={cor}
                          onChange={(e) => setCor(e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}>
                          Tamanhos / Especificação
                        </label>
                        <input
                          type="text"
                          className="header-search"
                          style={{ width: '100%', paddingLeft: '0.85rem', backgroundColor: '#FFFFFF' }}
                          value={tamanhos}
                          onChange={(e) => setTamanhos(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.05em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                      ÁREAS DE IMPRESSÃO
                    </label>
                    <div style={{ display: 'flex', gap: '0.65rem' }}>
                      <button
                        type="button"
                        onClick={() => toggleAreaImpressao('Frente A4')}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          fontSize: '0.825rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: areasImpressao.includes('Frente A4') ? '1.5px solid #009FE3' : '1.5px solid #E2E8F0',
                          backgroundColor: areasImpressao.includes('Frente A4') ? '#F0F9FF' : '#FFFFFF',
                          color: areasImpressao.includes('Frente A4') ? '#0284C7' : '#64748B',
                        }}
                      >
                        Frente A4
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleAreaImpressao('Costas A4')}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          fontSize: '0.825rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: areasImpressao.includes('Costas A4') ? '1.5px solid #009FE3' : '1.5px solid #E2E8F0',
                          backgroundColor: areasImpressao.includes('Costas A4') ? '#F0F9FF' : '#FFFFFF',
                          color: areasImpressao.includes('Costas A4') ? '#0284C7' : '#64748B',
                        }}
                      >
                        Costas A4
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={calcularCusto}
                      disabled={calculando}
                      className="btn-outline-figma"
                      style={{ fontSize: '0.825rem', padding: '0.55rem 1rem' }}
                    >
                      <Calculator size={15} />
                      {calculando ? 'Calculando...' : 'Recalcular Custo'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Card Escuro — RESUMO DA PROPOSTA (Figma Image 4) */}
          <div>
            <div className="proposal-summary-card">
              <div className="proposal-summary-tag">RESUMO DA PROPOSTA</div>
              <h2 className="proposal-summary-title">{orcamentoNumeroFormatado}</h2>

              <div className="proposal-summary-client-label">CLIENTE</div>
              <div className="proposal-summary-client-name">{nomeExibicaoCliente}</div>

              <div className="proposal-divider"></div>

              <div className="proposal-item-row">
                <span>{quantidade} {servicoSelecionado?.nome || 'camisetas'}</span>
                <span style={{ fontWeight: 600 }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(custoCalculado ? custoCalculado * 0.8 : 1120)}
                </span>
              </div>

              <div className="proposal-item-row">
                <span>Estampa frontal A4</span>
                <span style={{ fontWeight: 600 }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(custoCalculado ? custoCalculado * 0.2 : 260)}
                </span>
              </div>

              <div className="proposal-divider"></div>

              <div className="proposal-total-row">
                <span className="proposal-total-label">Total estimado</span>
                <span className="proposal-total-value">{valorTotalFormatado}</span>
              </div>

              <button
                type="button"
                className="btn-cyan"
                onClick={() => handleSalvar(false)}
                disabled={salvando}
                style={{ width: '100%', marginBottom: '0.75rem' }}
              >
                {salvando ? 'Salvando...' : 'Continuar'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => handleSalvar(true)}
                  disabled={salvando}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textUnderlineOffset: '2px',
                  }}
                >
                  Salvar como rascunho
                </button>
              </div>
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
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Novo Cliente</h3>
              <button 
                type="button" 
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
                  placeholder="(61) 99999-9999"
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
