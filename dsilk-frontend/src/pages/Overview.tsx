import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { orcamentoService } from '../services/orcamentoService';
import { 
  FileText, 
  Clock, 
  Check, 
  TrendingUp, 
  ChevronRight, 
  ArrowUpRight 
} from 'lucide-react';

export const Overview: React.FC = () => {
  const navigate = useNavigate();
  const [totalOrcamentos, setTotalOrcamentos] = useState<number>(8);

  useEffect(() => {
    async function carregarDadosReais() {
      try {
        const orcs = await orcamentoService.listar();
        if (orcs && orcs.length > 0) {
          setTotalOrcamentos(orcs.length);
        }
      } catch {
        // Fallback para valores da interface Figma
      }
    }
    carregarDadosReais();
  }, []);

  return (
    <DashboardLayout activeMenu="Visão geral">
      {/* 4 Cards Métricos Superiores (Figma Image 1) */}
      <div className="metric-cards-grid">
        {/* Card 1: Orçamentos em aberto */}
        <div 
          className="figma-metric-card metric-accent-cyan"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/budgets')}
        >
          <div className="metric-card-top">
            <span className="metric-card-title">Orçamentos em aberto</span>
            <div className="metric-icon-circle metric-circle-cyan">
              <FileText size={16} />
            </div>
          </div>
          <div className="metric-card-value">
            {totalOrcamentos < 10 ? `0${totalOrcamentos}` : totalOrcamentos}
          </div>
          <div className="metric-card-subtitle text-positive">
            <ArrowUpRight size={14} />
            <span>+12% este mês</span>
          </div>
        </div>

        {/* Card 2: Em produção */}
        <div 
          className="figma-metric-card metric-accent-magenta"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/planning')}
        >
          <div className="metric-card-top">
            <span className="metric-card-title">Em produção</span>
            <div className="metric-icon-circle metric-circle-magenta">
              <Clock size={16} />
            </div>
          </div>
          <div className="metric-card-value">05</div>
          <div className="metric-card-subtitle">
            <span>2 para entregar hoje</span>
          </div>
        </div>

        {/* Card 3: Finalizados no mês */}
        <div className="figma-metric-card metric-accent-yellow">
          <div className="metric-card-top">
            <span className="metric-card-title">Finalizados no mês</span>
            <div className="metric-icon-circle metric-circle-yellow">
              <Check size={16} />
            </div>
          </div>
          <div className="metric-card-value">24</div>
          <div className="metric-card-subtitle text-positive">
            <ArrowUpRight size={14} />
            <span>+8% versus abril</span>
          </div>
        </div>

        {/* Card 4: Faturamento estimado */}
        <div className="figma-metric-card metric-accent-dark">
          <div className="metric-card-top">
            <span className="metric-card-title">Faturamento estimado</span>
            <div className="metric-icon-circle metric-circle-dark">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="metric-card-value">R$ 8.420</div>
          <div className="metric-card-subtitle">
            <span>Meta: R$ 12 mil</span>
          </div>
        </div>
      </div>

      {/* Grid Inferior: Pedidos Recentes + Produção da Semana (Figma Image 1) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Coluna Esquerda: Pedidos recentes */}
        <div className="dashboard-card" style={{ padding: '1.75rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                Pedidos recentes
              </h3>
              <p style={{ fontSize: '0.825rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
                Acompanhe o andamento da produção
              </p>
            </div>
            <button 
              type="button" 
              onClick={() => navigate('/budgets')}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#009FE3', 
                fontWeight: 600, 
                fontSize: '0.85rem', 
                cursor: 'pointer' 
              }}
            >
              Ver todos
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {/* Item 1 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8' }}>#0048</span>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0F172A' }}>Ana Clara Studio</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>40 camisetas</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="badge-status badge-producao">Produção</span>
                <ChevronRight size={16} color="#94A3B8" />
              </div>
            </div>

            {/* Item 2 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8' }}>#0047</span>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0F172A' }}>Loja Sol Nascente</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>25 ecobags</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="badge-status badge-aprovada">Arte aprovada</span>
                <ChevronRight size={16} color="#94A3B8" />
              </div>
            </div>

            {/* Item 3 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8' }}>#0046</span>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0F172A' }}>Marcos Ferreira</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>12 uniformes</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="badge-status badge-finalizado">Finalizado</span>
                <ChevronRight size={16} color="#94A3B8" />
              </div>
            </div>

            {/* Item 4 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8' }}>#0045</span>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0F172A' }}>Instituto Viver</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>60 camisetas</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="badge-status badge-aguardando">Aguardando</span>
                <ChevronRight size={16} color="#94A3B8" />
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Produção da semana (Figma Image 1) */}
        <div className="dashboard-card" style={{ padding: '1.75rem 2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
              Produção da semana
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
              Peças finalizadas
            </p>
          </div>

          {/* Gráfico de Barras Estilo Figma */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '170px', padding: '0 0.5rem', marginBottom: '1.75rem' }}>
            {/* Seg */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ width: '22px', height: '70px', backgroundColor: '#E0F2FE', borderRadius: '4px' }}></div>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Seg</span>
            </div>

            {/* Ter */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ width: '22px', height: '110px', backgroundColor: '#E0F2FE', borderRadius: '4px' }}></div>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Ter</span>
            </div>

            {/* Qua */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ width: '22px', height: '90px', backgroundColor: '#E0F2FE', borderRadius: '4px' }}></div>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Qua</span>
            </div>

            {/* Qui (Ativo / Destaque) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ width: '22px', height: '145px', backgroundColor: '#0284C7', borderRadius: '4px', boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)' }}></div>
              <span style={{ fontSize: '0.75rem', color: '#0F172A', fontWeight: 700 }}>Qui</span>
            </div>

            {/* Sex */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ width: '22px', height: '125px', backgroundColor: '#E0F2FE', borderRadius: '4px' }}></div>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Sex</span>
            </div>

            {/* Sáb */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ width: '22px', height: '60px', backgroundColor: '#E0F2FE', borderRadius: '4px' }}></div>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Sáb</span>
            </div>
          </div>

          {/* Resumo inferior */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>128</div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>peças nesta semana</div>
            </div>
            <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.3rem 0.65rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700 }}>
              +18%
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
