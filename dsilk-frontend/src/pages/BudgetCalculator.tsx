import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { orcamentoService } from '../services/orcamentoService';
import { servicoService, Servico } from '../services/servicoService';
import { clienteService, Cliente } from '../services/clienteService';
import { getApiErrorMessage } from '../types/api';
import { 
  ArrowLeft, 
  Calculator, 
  AlertCircle, 
  CheckCircle, 
  UserPlus, 
  Save, 
  FileCheck,
  X,
  RefreshCw
} from 'lucide-react';

export const BudgetCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orcamentoIdParam = searchParams.get('id');

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [clienteId, setClienteId] = useState<number | ''>('');
  const [servicoId, setServicoId] = useState<number | ''>('');
  const [largura, setLargura] = useState<string>('');
  const [altura, setAltura] = useState<string>('');
  const [custoCalculado, setCustoCalculado] = useState<number | null>(null);

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
          if (orc.clienteId) setClienteId(orc.clienteId);
          if (orc.servicoId) setServicoId(orc.servicoId);
          if (orc.largura) setLargura(String(orc.largura));
          if (orc.altura) setAltura(String(orc.altura));
          if (orc.custoTotal != null) setCustoCalculado(orc.custoTotal);
        }
      } catch (err) {
        setErro(getApiErrorMessage(err, 'Falha ao carregar informações para o cálculo.'));
      } finally {
        setLoadingDados(false);
      }
    };

    carregarTudo();
  }, [orcamentoIdParam]);

  // Recalcula automaticamente quando há dados válidos
  const calcularCusto = async () => {
    if (!servicoId) {
      setErro('Selecione um serviço para calcular o custo.');
      return;
    }

    const payload: { servicoId: number; largura?: number; altura?: number } = {
      servicoId: Number(servicoId),
    };

    if (servicoSelecionado?.tipoCalculo === 'METRAGEM') {
      const l = parseFloat(largura.replace(',', '.'));
      const a = parseFloat(altura.replace(',', '.'));

      if (isNaN(l) || l <= 0 || isNaN(a) || a <= 0) {
        setErro('Para cálculo por metragem, informe largura e altura maiores que zero.');
        return;
      }
      payload.largura = l;
      payload.altura = a;
    }

    try {
      setCalculando(true);
      setErro(null);
      const res = await orcamentoService.calcular(payload);
      setCustoCalculado(res.custo);
    } catch (err) {
      setErro(getApiErrorMessage(err, 'Erro ao calcular o custo do orçamento.'));
      setCustoCalculado(null);
    } finally {
      setCalculando(false);
    }
  };

  const handleSalvar = async (rascunho: boolean) => {
    if (!rascunho && !servicoId) {
      setErro('Selecione um serviço para registrar o orçamento.');
      return;
    }

    let largNum: number | null = null;
    let altNum: number | null = null;

    if (largura.trim()) {
      largNum = parseFloat(largura.replace(',', '.'));
      if (isNaN(largNum) || largNum <= 0) {
        if (!rascunho) {
          setErro('A largura informada é inválida.');
          return;
        }
      }
    }

    if (altura.trim()) {
      altNum = parseFloat(altura.replace(',', '.'));
      if (isNaN(altNum) || altNum <= 0) {
        if (!rascunho) {
          setErro('A altura informada é inválida.');
          return;
        }
      }
    }

    try {
      setSalvando(true);
      setErro(null);

      const payload = {
        rascunho,
        clienteId: clienteId ? Number(clienteId) : null,
        servicoId: servicoId ? Number(servicoId) : null,
        largura: largNum,
        altura: altNum,
      };

      if (orcamentoIdParam) {
        await orcamentoService.atualizar(orcamentoIdParam, payload);
        setSucesso(rascunho ? 'Rascunho atualizado com sucesso!' : 'Orçamento registrado com sucesso!');
      } else {
        await orcamentoService.criar(payload);
        setSucesso(rascunho ? 'Rascunho salvo com sucesso!' : 'Orçamento registrado com sucesso!');
      }

      setTimeout(() => {
        navigate('/budgets');
      }, 1200);
    } catch (err) {
      setErro(getApiErrorMessage(err, 'Erro ao salvar orçamento.'));
    } finally {
      setSalvando(false);
    }
  };

  const handleSalvarNovoCliente = async (e: React.FormEvent) => {
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
        telefone: novoClienteTelefone.trim() || null,
        email: novoClienteEmail.trim() || null,
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

  return (
    <DashboardLayout activeMenu="Orçamentos">
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => navigate('/budgets')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.875rem',
            cursor: 'pointer',
            marginBottom: '1.5rem',
          }}
        >
          <ArrowLeft size={16} />
          Voltar para a lista de orçamentos
        </button>

        <div className="dashboard-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div 
              style={{ 
                backgroundColor: 'rgba(0, 159, 227, 0.1)', 
                color: 'var(--dsilk-cyan)', 
                padding: '0.6rem', 
                borderRadius: '8px' 
              }}
            >
              <Calculator size={24} />
            </div>
            <div>
              <h2 className="auth-title" style={{ textAlign: 'left', marginBottom: '0.2rem', fontSize: '1.4rem' }}>
                {orcamentoIdParam ? `Orçamento #${orcamentoIdParam}` : 'Criação e Cálculo de Orçamento'}
              </h2>
              <p className="auth-description" style={{ textAlign: 'left', fontSize: '0.85rem' }}>
                Selecione o cliente, o serviço e calcule dinamicamente os valores (RF006, RF007, RF008)
              </p>
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
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                border: '1px solid #fca5a5',
                fontSize: '0.875rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{erro}</span>
            </div>
          )}

          {loadingDados ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
              <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
              <p>Carregando dados do orçamento...</p>
            </div>
          ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
            {/* Formulário Principal */}
            <div>
              {/* Cliente */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                    Cliente (Opcional)
                  </label>
                  <button
                    type="button"
                    onClick={() => setModalClienteAberto(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--dsilk-cyan)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                    }}
                  >
                    <UserPlus size={14} />
                    + Cadastrar Novo Cliente
                  </button>
                </div>
                <select
                  className="form-control"
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value ? Number(e.target.value) : '')}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid #E5E7EB',
                    fontSize: '0.95rem',
                  }}
                >
                  <option value="">Selecione um cliente (ou deixe em branco)</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} {c.telefone ? `(${c.telefone})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Serviço */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                  Serviço Solicitado *
                </label>
                <select
                  className="form-control"
                  value={servicoId}
                  onChange={(e) => {
                    setServicoId(e.target.value ? Number(e.target.value) : '');
                    setCustoCalculado(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid #E5E7EB',
                    fontSize: '0.95rem',
                  }}
                >
                  <option value="">Selecione o serviço...</option>
                  {servicos.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome} [{s.tipoCalculo === 'METRAGEM' ? 'Por Metragem' : 'Por Composição'}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Campos dinâmicos conforme tipo do serviço */}
              {servicoSelecionado && (
                <div style={{ marginBottom: '1.5rem', backgroundColor: '#F9FAFB', padding: '1.25rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  {servicoSelecionado.tipoCalculo === 'METRAGEM' ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                        <span className="badge badge-cyan">Cálculo por Metragem</span>
                        {servicoSelecionado.material && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                            Material: {servicoSelecionado.material.nome} ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(servicoSelecionado.material.custo)}/m²)
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                            Largura (em metros) *
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="Ex: 2.00"
                            value={largura}
                            onChange={(e) => {
                              setLargura(e.target.value);
                              setCustoCalculado(null);
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                            Altura (em metros) *
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="Ex: 1.50"
                            value={altura}
                            onChange={(e) => {
                              setAltura(e.target.value);
                              setCustoCalculado(null);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                        <span className="badge badge-magenta">Cálculo por Composição</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', margin: 0 }}>
                        O custo será calculado somando todos os materiais cadastrados na composição deste serviço
                        {servicoSelecionado.tempoOperacaoHoras ? ` + ${servicoSelecionado.tempoOperacaoHoras}h de operação` : ''}.
                      </p>
                    </div>
                  )}

                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="button"
                      variant="outline"
                      style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={calcularCusto}
                      disabled={calculando}
                    >
                      <Calculator size={15} />
                      {calculando ? 'Calculando...' : 'Calcular Custo'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Coluna da Direita: Card de Resumo e Ações */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div 
                style={{ 
                  backgroundColor: '#F8FAFC', 
                  border: '1.5px solid #E2E8F0', 
                  borderRadius: '12px', 
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-dark)', margin: 0 }}>
                  Resumo do Custo
                </h3>

                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.25rem' }}>
                    Custo Total Estimado
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: custoCalculado != null ? '#16a34a' : 'var(--text-light)' }}>
                    {custoCalculado != null 
                      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(custoCalculado) 
                      : 'R$ 0,00'}
                  </div>
                  {custoCalculado == null && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', margin: '0.25rem 0 0 0' }}>
                      Clique em "Calcular Custo" ou preencha os parâmetros para calcular
                    </p>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-light)' }}>
                  <div>• Os valores não sofrem reajustes automáticos após o registro.</div>
                  <div>• O cliente pode ser vinculado depois através da edição.</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => handleSalvar(false)}
                  disabled={salvando || !servicoId}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <FileCheck size={18} />
                  {salvando ? 'Gravando...' : 'Registrar Orçamento'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSalvar(true)}
                  disabled={salvando}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Save size={18} />
                  Salvar como Rascunho
                </Button>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Modal de Cadastro Rápido de Cliente */}
      {modalClienteAberto && (
        <div className="modal-overlay" onClick={() => setModalClienteAberto(false)}>
          <div className="modal-container" style={{ maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cadastrar Novo Cliente (RF003)</h3>
              <button type="button" className="modal-close-btn" onClick={() => setModalClienteAberto(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarNovoCliente}>
              <div className="modal-body">
                {erroModalCliente && (
                  <div style={{ padding: '0.75rem', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: '6px', fontSize: '0.85rem' }}>
                    {erroModalCliente}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                    Nome do Cliente *
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="Ex: João da Silva"
                    value={novoClienteNome}
                    onChange={(e) => setNovoClienteNome(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                    Telefone
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: (85) 99999-8888"
                    value={novoClienteTelefone}
                    onChange={(e) => setNovoClienteTelefone(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                    E-mail
                  </label>
                  <Input
                    type="email"
                    placeholder="Ex: cliente@email.com"
                    value={novoClienteEmail}
                    onChange={(e) => setNovoClienteEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <Button type="button" variant="outline" onClick={() => setModalClienteAberto(false)} disabled={salvandoCliente}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={salvandoCliente}>
                  {salvandoCliente ? 'Salvando...' : 'Salvar Cliente'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default BudgetCalculator;
