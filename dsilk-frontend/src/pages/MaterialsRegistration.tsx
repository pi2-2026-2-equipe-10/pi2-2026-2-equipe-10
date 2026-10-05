import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { materialService } from '../services/materialService';
import { getApiErrorMessage } from '../types/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const MaterialsRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [nome, setNome] = useState('');
  const [unidadeMedida, setUnidadeMedida] = useState('');
  const [custo, setCusto] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    async function carregarMaterial() {
      try {
        setLoading(true);
        setErro(null);
        const data = await materialService.buscarPorId(id!);
        if (isMounted) {
          setNome(data.nome);
          setUnidadeMedida(data.unidadeMedida);
          setCusto(String(data.custo));
        }
      } catch (error) {
        if (isMounted) {
          setErro(getApiErrorMessage(error, 'Não foi possível carregar os dados do material.'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    carregarMaterial();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const nomeLimpo = nome.trim();
    const unidadeLimpa = unidadeMedida.trim();
    const custoNumerico = parseFloat(custo.replace(',', '.'));

    if (!nomeLimpo) {
      setErro('O campo "Nome do material" é obrigatório.');
      return;
    }

    if (!unidadeLimpa) {
      setErro('O campo "Unidade de Medida" é obrigatório.');
      return;
    }

    if (isNaN(custoNumerico) || custoNumerico <= 0) {
      setErro('O campo "Custo por unidade" é obrigatório e deve ser maior que zero.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        nome: nomeLimpo,
        unidadeMedida: unidadeLimpa,
        custo: custoNumerico,
      };

      if (isEditing && id) {
        await materialService.editar(id, payload);
      } else {
        await materialService.cadastrar(payload);
      }

      navigate('/materials');
    } catch (error) {
      setErro(getApiErrorMessage(error, 'Falha ao salvar material. Verifique as informações.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout activeMenu="Materiais">
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 className="auth-title" style={{ textAlign: 'left', marginBottom: '0.25rem' }}>
          {isEditing ? 'Editar Material' : 'Novo Material'}
        </h2>
        <p className="auth-description" style={{ textAlign: 'left' }}>
          {isEditing ? 'Editar dados e custo do material cadastrado' : 'Cadastrar dados e custo do material'}
        </p>
      </div>

      <div className="dashboard-card">
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

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
            <p>Carregando dados do material...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <Input 
                label="Nome do material" 
                placeholder="Ex: Tinta Cyan 1L" 
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  setErro(null);
                }}
                disabled={submitting}
                required 
              />
              
              <Input 
                label="Unidade de Medida" 
                placeholder="Ex: m², kg, litro, folha, unidade" 
                value={unidadeMedida}
                onChange={(e) => {
                  setUnidadeMedida(e.target.value);
                  setErro(null);
                }}
                disabled={submitting}
                required 
              />
              
              <Input 
                label="Custo por unidade" 
                placeholder="0.00" 
                type="number"
                step="0.01"
                min="0.01"
                value={custo}
                onChange={(e) => {
                  setCusto(e.target.value);
                  setErro(null);
                }}
                disabled={submitting}
                required 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <Button 
                type="button" 
                variant="outline" 
                style={{ width: 'auto' }} 
                onClick={() => navigate('/materials')}
                disabled={submitting}
              >
                cancelar
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                style={{ width: 'auto' }}
                disabled={submitting}
              >
                {submitting ? 'salvando...' : isEditing ? 'atualizar material' : 'salvar material'}
              </Button>
            </div>
            
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};
