import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '../components/Button';

export const MaterialsList: React.FC = () => {
  const navigate = useNavigate();

  const materials = [
    { id: 1, name: 'Lona Banner', unit: 'm', cost: 0 },
    { id: 2, name: 'Papel couché 250g', unit: 'folha', cost: 0 },
    { id: 3, name: 'Vinil Adesivo', unit: 'm', cost: 0 },
  ];

  return (
    <DashboardLayout activeMenu="Materiais">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h2 className="auth-title" style={{ textAlign: 'left', marginBottom: '0.25rem' }}>Materiais</h2>
          <p className="auth-description" style={{ textAlign: 'left' }}>Consultar materiais cadastrados</p>
        </div>
        <Button variant="primary" style={{ width: 'auto' }} onClick={() => navigate('/materials/new')}>
          + novo material
        </Button>
      </div>

      <div className="dashboard-card" style={{ padding: '0' }}>
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Unidade de medida</th>
              <th>Custo</th>
              <th style={{ textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {materials.map(mat => (
              <tr key={mat.id}>
                <td style={{ fontWeight: 500 }}>{mat.name}</td>
                <td>{mat.unit}</td>
                <td>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mat.cost)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button 
                    type="button"
                    onClick={() => navigate(`/materials/edit/${mat.id}`)} 
                    style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--text-light)', fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};
