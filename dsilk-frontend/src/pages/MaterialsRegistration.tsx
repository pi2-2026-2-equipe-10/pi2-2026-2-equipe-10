import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export const MaterialsRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert(isEditing ? 'Material atualizado com sucesso!' : 'Material salvo com sucesso!');
    navigate('/materials');
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
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <Input 
              label="Nome do material" 
              placeholder="Ex: Tinta Cyan 1L" 
              defaultValue={isEditing ? 'Lona Banner' : ''}
              required 
            />
            
            <Input 
              label="Unidade de Medida" 
              placeholder="Ex: Litro, kg, Metro, Unidade" 
              defaultValue={isEditing ? 'm' : ''}
              required 
            />
            
            <Input 
              label="Custo por unidade" 
              placeholder="R$ 0,00" 
              type="number"
              step="0.01"
              defaultValue={isEditing ? '18.00' : ''}
              required 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button type="button" variant="outline" style={{ width: 'auto' }} onClick={() => navigate('/materials')}>
              cancelar
            </Button>
            <Button type="submit" variant="primary" style={{ width: 'auto' }}>
              {isEditing ? 'atualizar material' : 'salvar material'}
            </Button>
          </div>
          
        </form>
      </div>
    </DashboardLayout>
  );
};
