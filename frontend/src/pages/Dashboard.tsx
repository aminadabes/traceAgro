import React from 'react';
import { 
  Package, 
  Beef, 
  ClipboardList, 
  TrendingDown, 
  AlertTriangle, 
  Lock 
} from 'lucide-react';

interface DashboardProps {
  stats: {
    produtosCount: number;
    ativosCount: number;
    inventariosAbertos: number;
    perdasPendentes: number;
  };
  warnings: Array<{
    id: string;
    tipo: 'VALIDADE' | 'QUARENTENA' | 'SAFETY_LOCK' | 'ESTOQUE_BAIXO';
    mensagem: string;
    grau: 'WARNING' | 'DANGER';
  }>;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, warnings }) => {
  return (
    <div style={styles.container}>
      {/* Overview Cards */}
      <div className="grid grid-cols-4">
        <div className="card card-primary" style={styles.statCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Produtos Cadastrados</span>
            <Package size={24} color="var(--color-primary)" />
          </div>
          <span style={styles.cardVal}>{stats.produtosCount}</span>
          <span style={styles.cardDesc}>Itens ativos no catálogo</span>
        </div>

        <div className="card card-blue" style={styles.statCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Ativos Biológicos</span>
            <Beef size={24} color="var(--color-secondary)" />
          </div>
          <span style={styles.cardVal}>{stats.ativosCount}</span>
          <span style={styles.cardDesc}>Animais sob rastreamento</span>
        </div>

        <div className="card card-warning" style={styles.statCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Inventários Abertos</span>
            <ClipboardList size={24} color="var(--color-warning)" />
          </div>
          <span style={styles.cardVal}>{stats.inventariosAbertos}</span>
          <span style={styles.cardDesc}>Áreas de estoque sob contagem</span>
        </div>

        <div className="card card-danger" style={styles.statCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Perdas Pendentes</span>
            <TrendingDown size={24} color="var(--color-danger)" />
          </div>
          <span style={styles.cardVal}>{stats.perdasPendentes}</span>
          <span style={styles.cardDesc}>Ajustes pendentes de alçada</span>
        </div>
      </div>

      {/* Main Content Dashboard Area */}
      <div style={styles.dashboardGrid}>
        {/* Warnings and Alerts Panel */}
        <div className="card" style={styles.warningsPanel}>
          <h3 style={styles.sectionTitle}>
            <AlertTriangle size={20} color="var(--color-warning)" />
            Alertas Operacionais & Segurança Sanitária
          </h3>
          <div style={styles.alertsList}>
            {warnings.length === 0 ? (
              <div style={styles.emptyState}>
                <span>✓ Nenhum alerta pendente no sistema. Todos os lotes e animais estão regulares.</span>
              </div>
            ) : (
              warnings.map((w) => (
                <div 
                  key={w.id} 
                  style={{
                    ...styles.alertItem,
                    backgroundColor: w.grau === 'DANGER' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                    borderLeftColor: w.grau === 'DANGER' ? 'var(--color-danger)' : 'var(--color-warning)',
                  }}
                >
                  <div style={styles.alertHeader}>
                    <span style={styles.alertBadge}>
                      {w.tipo === 'VALIDADE' && '⚠️ VENCIMENTO'}
                      {w.tipo === 'QUARENTENA' && '🛡️ QUARENTENA'}
                      {w.tipo === 'SAFETY_LOCK' && '🔒 SAFETY LOCK'}
                      {w.tipo === 'ESTOQUE_BAIXO' && '📉 ESTOQUE BAIXO'}
                    </span>
                    {w.tipo === 'SAFETY_LOCK' && <Lock size={12} color="var(--color-danger)" />}
                  </div>
                  <p style={styles.alertMessage}>{w.mensagem}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Audit Log / Actions Panel */}
        <div className="card" style={styles.actionPanel}>
          <h3 style={styles.sectionTitle}>Manual de Operação Rápida</h3>
          <div style={styles.manualContainer}>
            <p style={styles.manualText}>
              Este sistema implementa as regras corporativas da **COARF/TJMG**. Para simular e testar os comportamentos de segurança do sistema:
            </p>
            <ul style={styles.manualList}>
              <li>
                <strong>Alçada de Perdas (RF012):</strong> Registre uma perda de estoque no módulo Operações. Mude o perfil ativo para <em>Gerente</em> no cabeçalho para ver a aprovação/rejeição.
              </li>
              <li>
                <strong>Carência Sanitária (RF006):</strong> Aplique um medicamento veterinário em um animal. O animal entrará sob quarentena automática (Safety Lock), e qualquer tentativa de emitir GTA (Guia de Transporte) será bloqueada.
              </li>
              <li>
                <strong>Endereçamento Crítico (RN008):</strong> Defensivos agrícolas altamente tóxicos só podem ser estocados em localizações marcadas como <em>Área Crítica</em> (como o Talhão 5).
              </li>
              <li>
                <strong>Inventário físico (RN014):</strong> Ao abrir um inventário para um silo/galpão, todas as movimentações (entrada/saída) nessa localização ficam congeladas.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  cardTitle: {
    letterSpacing: '0.3px',
  },
  cardVal: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  cardDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: '3fr 2fr',
    gap: '20px',
  },
  warningsPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'var(--text-main)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px',
  },
  alertsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--color-primary)',
    fontSize: '0.9rem',
    fontWeight: 500,
    backgroundColor: 'rgba(16, 185, 129, 0.03)',
    border: '1px dashed rgba(16, 185, 129, 0.2)',
    borderRadius: '8px',
  },
  alertItem: {
    padding: '14px',
    borderRadius: '8px',
    borderLeft: '4px solid',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  alertHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertBadge: {
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.5px',
  },
  alertMessage: {
    fontSize: '0.85rem',
    color: 'var(--text-main)',
    lineHeight: '1.4',
  },
  actionPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  manualContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    fontSize: '0.85rem',
    lineHeight: '1.6',
    color: 'var(--text-muted)',
  },
  manualText: {
    color: 'var(--text-main)',
  },
  manualList: {
    paddingLeft: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  }
};
