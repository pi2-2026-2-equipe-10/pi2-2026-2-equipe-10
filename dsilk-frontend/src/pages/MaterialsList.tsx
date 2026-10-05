import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '../components/Button';
import { materialService, Material } from '../services/materialService';
import { getApiErrorMessage } from '../types/api';
import { RefreshCw, Plus, AlertCircle, Package } from 'lucide-react';

export const MaterialsList: React.FC = () => {
  const navigate = useNavigate();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarMateriais = async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = await materialService.listar();
      setMaterials(data);
    } catch (error) {
      setErro(getApiErrorMessage(error, 'Não foi possível carregar a lista de materiais.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMateriais();
  }, []);

  return (
    <DashboardLayout activeMenu="Materiais">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h2 className="auth-title" style={{ textAlign: 'left', marginBottom: '0.25rem' }}>Materiais</h2>
          <p className="auth-description" style={{ textAlign: 'left' }}>Consultar materiais cadastrados</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button 
            variant="outline" 
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }} 
            onClick={carregarMateriais}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            atualizar
          </Button>
          <Button 
            variant="primary" 
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }} 
            onClick={() => navigate('/materials/new')}
          >
            <Plus size={16} />
            novo material
          </Button>
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
            onClick={carregarMateriais}
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
            <p>Carregando materiais do servidor...</p>
          </div>
        ) : materials.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
            <Package size={36} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
            <p style={{ fontWeight: 500, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Nenhum material cadastrado</p>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Cadastre os insumos e materiais que serão utilizados nos serviços.</p>
            <Button variant="primary" style={{ width: 'auto', margin: '0 auto' }} onClick={() => navigate('/materials/new')}>
              + cadastrar primeiro material
            </Button>
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Unidade de medida</th>
                <th>Custo</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((mat) => (
                <tr key={mat.id}>
                  <td style={{ fontWeight: 500 }}>{mat.nome}</td>
                  <td>{mat.unidadeMedida}</td>
                  <td>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mat.custo)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      type="button"
                      onClick={() => navigate(`/materials/edit/${mat.id}`)} 
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        textDecoration: 'underline', 
                        color: 'var(--primary-color, #2563eb)', 
                        fontSize: '0.9rem', 
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};
