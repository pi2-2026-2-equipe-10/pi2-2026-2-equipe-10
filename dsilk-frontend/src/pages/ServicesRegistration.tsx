import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { servicoService } from '../services/servicoService';
import { materialService, Material } from '../services/materialService';
import { getApiErrorMessage } from '../types/api';
import { AlertCircle, ArrowLeft, Layers, CheckCircle } from 'lucide-react';

export const ServicesRegistration: React.FC = () => {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [tipoCalculo, setTipoCalculo] = useState<'METRAGEM' | 'COMPOSICAO'>('METRAGEM');
  const [materialId, setMaterialId] = useState<number | ''>('');
  const [materiais, setMateriais] = useState<Material[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingMateriais, setLoadingMateriais] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const carregarMateriais = async () => {
      try {
        setLoadingMateriais(true);
        const data = await materialService.listar();
        setMateriais(data);
        if (data.length > 0) {
          setMaterialId(data[0].id);
        }
      } catch (err) {
        setErro(getApiErrorMessage(err, 'Erro ao carregar lista de materiais.'));
      } finally {
        setLoadingMateriais(false);
      }
    };

    carregarMateriais();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      setErro('O nome do serviço é obrigatório.');
      return;
    }

    if (tipoCalculo === 'METRAGEM' && !materialId) {
      setErro('Para serviços por metragem, selecione o material principal.');
      return;
    }

    try {
      setLoading(true);
      setErro(null);

      await servicoService.cadastrar({
        nome: nome.trim(),
        tipoCalculo,
        materialId: tipoCalculo === 'METRAGEM' ? Number(materialId) : null,
      });

      navigate('/services');
    } catch (err) {
      setErro(getApiErrorMessage(err, 'Falha ao cadastrar serviço. Verifique os dados.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activeMenu="Serviços">
      <div style={{ maxWidth: '650px', margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => navigate('/services')}
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
          Voltar para a lista de serviços
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
              <Layers size={24} />
            </div>
            <div>
              <h2 className="auth-title" style={{ textAlign: 'left', marginBottom: '0.2rem', fontSize: '1.4rem' }}>
                Novo Serviço Personalizado (RF004)
              </h2>
              <p className="auth-description" style={{ textAlign: 'left', fontSize: '0.85rem' }}>
                Defina o nome e a regra de precificação do serviço
              </p>
            </div>
          </div>

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

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
                Nome do Serviço *
              </label>
              <Input
                type="text"
                placeholder="Ex: Banner Frontlight, Cartão de Visita Especial..."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
                Tipo de Cálculo de Custo *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div
                  onClick={() => setTipoCalculo('METRAGEM')}
                  style={{
                    border: `2px solid ${tipoCalculo === 'METRAGEM' ? 'var(--dsilk-cyan)' : '#E5E7EB'}`,
                    backgroundColor: tipoCalculo === 'METRAGEM' ? 'rgba(0, 159, 227, 0.04)' : '#FFF',
                    padding: '1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-dark)' }}>Por Metragem (m²)</strong>
                    <input
                      type="radio"
                      name="tipoCalculo"
                      checked={tipoCalculo === 'METRAGEM'}
                      onChange={() => setTipoCalculo('METRAGEM')}
                    />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', margin: 0 }}>
                    Cálculo baseado em largura × altura × custo do material associado (ex: banners, lonas, adesivos).
                  </p>
                </div>

                <div
                  onClick={() => setTipoCalculo('COMPOSICAO')}
                  style={{
                    border: `2px solid ${tipoCalculo === 'COMPOSICAO' ? 'var(--dsilk-magenta)' : '#E5E7EB'}`,
                    backgroundColor: tipoCalculo === 'COMPOSICAO' ? 'rgba(228, 0, 124, 0.04)' : '#FFF',
                    padding: '1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-dark)' }}>Por Composição</strong>
                    <input
                      type="radio"
                      name="tipoCalculo"
                      checked={tipoCalculo === 'COMPOSICAO'}
                      onChange={() => setTipoCalculo('COMPOSICAO')}
                    />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', margin: 0 }}>
                    Soma de insumos, materiais e tempo de operação/mão de obra (ex: cartões, camisetas, brindes).
                  </p>
                </div>
              </div>
            </div>

            {tipoCalculo === 'METRAGEM' ? (
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
                  Material Associado (RN-03) *
                </label>
                {loadingMateriais ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Carregando materiais disponíveis...</p>
                ) : materiais.length === 0 ? (
                  <div style={{ padding: '0.85rem', backgroundColor: '#FEF3C7', borderRadius: '6px', color: '#92400E', fontSize: '0.85rem' }}>
                    Nenhum material cadastrado. Cadastre ao menos um material antes de criar um serviço por metragem.
                  </div>
                ) : (
                  <select
                    className="form-control"
                    value={materialId}
                    onChange={(e) => setMaterialId(Number(e.target.value))}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid #E5E7EB',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  >
                    {materiais.map((mat) => (
                      <option key={mat.id} value={mat.id}>
                        {mat.nome} — {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mat.custo)} / {mat.unidadeMedida}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <div 
                style={{ 
                  marginBottom: '2rem', 
                  backgroundColor: '#F9FAFB', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  border: '1px solid #E5E7EB' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dark)', fontWeight: 500, fontSize: '0.875rem' }}>
                  <CheckCircle size={18} color="var(--dsilk-magenta)" />
                  <span>Configuração de Composição (RF005)</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', margin: '0.35rem 0 0 0' }}>
                  Após registrar este serviço, você poderá definir a lista de insumos e o tempo de operação clicando no botão <strong>Composição</strong> na lista de serviços.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <Button
                type="button"
                variant="outline"
                style={{ width: 'auto' }}
                onClick={() => navigate('/services')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                style={{ width: 'auto' }}
                disabled={loading || (tipoCalculo === 'METRAGEM' && materiais.length === 0)}
              >
                {loading ? 'Cadastrando...' : 'Cadastrar Serviço'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ServicesRegistration;
