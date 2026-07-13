import React from 'react';
import { User, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  currentUser: string;
  setCurrentUser: (user: string) => void;
  title: string;
  warningsCount: number;
  onViewWarnings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentUser, 
  setCurrentUser, 
  title,
  warningsCount,
  onViewWarnings
}) => {
  const users = [
    { value: 'ADMINISTRADOR', label: 'Administrador (Total)' },
    { value: 'GERENTE', label: 'Gerente (Aprovações)' },
    { value: 'ALMOXARIFE', label: 'Almoxarife (Estoque/WMS)' },
    { value: 'AGRONOMO', label: 'Agrônomo (Receituários/Talhões)' },
    { value: 'VETERINARIO', label: 'Veterinário (Medicamentos/GTA)' },
    { value: 'OPERADOR', label: 'Operador (Movimentação Simples)' },
    { value: 'AUDITOR', label: 'Auditor/Financeiro (Leitura/Custos)' }
  ];

  return (
    <header style={styles.header}>
      <h1 style={styles.title}>{title}</h1>

      <div style={styles.actions}>
        {warningsCount > 0 && (
          <button onClick={onViewWarnings} style={styles.warningIndicator}>
            <ShieldAlert size={18} color="var(--color-warning)" />
            <span style={styles.warningText}>{warningsCount} Alertas Críticos</span>
          </button>
        )}

        <div style={styles.userContainer}>
          <User size={16} style={styles.userIcon} />
          <div style={styles.selectWrapper}>
            <label style={styles.selectLabel}>Perfil Ativo</label>
            <select
              value={currentUser}
              onChange={(e) => setCurrentUser(e.target.value)}
              style={styles.select}
            >
              {users.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    height: '70px',
    backgroundColor: 'var(--bg-sidebar)',
    borderBottom: '1px solid var(--border-color)',
    padding: '0 30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 99,
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  warningIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    padding: '6px 12px',
    borderRadius: '20px',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
  },
  warningText: {
    fontSize: '0.8rem',
    fontWeight: 500,
    color: 'var(--color-warning)',
  },
  userContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    padding: '6px 16px',
    borderRadius: '8px',
  },
  userIcon: {
    color: 'var(--color-primary)',
  },
  selectWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  selectLabel: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: 600,
  },
  select: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-main)',
    fontSize: '0.85rem',
    fontWeight: 600,
    outline: 'none',
    cursor: 'pointer',
    paddingRight: '10px',
  }
};
