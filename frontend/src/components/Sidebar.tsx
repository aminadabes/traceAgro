import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  Beef, 
  Briefcase 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'produtos', label: 'Produtos', icon: Package },
    { id: 'movimentacoes', label: 'Movimentações', icon: ArrowLeftRight },
    { id: 'ativos', label: 'Ativos Biológicos', icon: Beef },
    { id: 'operacoes', label: 'Operações e Campo', icon: Briefcase },
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>🚜</div>
        <div>
          <h2 style={styles.logoText}>AgroEstoque</h2>
          <span style={styles.logoSubtext}>TJMG Enterprise v2.0</span>
        </div>
      </div>

      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.navLink,
                backgroundColor: isActive ? 'var(--color-primary-glow)' : 'transparent',
                borderColor: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={styles.footer}>
        <div style={styles.footerStatus}>● Conectado (Online)</div>
        <div style={styles.footerVersion}>Banco: H2 In-Memory</div>
      </div>
    </aside>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 'var(--sidebar-width)',
    height: '100vh',
    backgroundColor: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
  },
  logoContainer: {
    padding: '24px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid var(--border-color)',
  },
  logoIcon: {
    fontSize: '1.8rem',
  },
  logoText: {
    fontSize: '1.1rem',
    fontWeight: 700,
    letterSpacing: '0.5px',
    color: 'var(--text-main)',
  },
  logoSubtext: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    display: 'block',
    marginTop: '2px',
  },
  nav: {
    padding: '20px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    border: 'none',
    borderLeft: '3px solid transparent',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
    textAlign: 'left',
    transition: 'all 0.2s ease',
  },
  footer: {
    padding: '20px',
    borderTop: '1px solid var(--border-color)',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  footerStatus: {
    color: '#34d399',
    fontWeight: 500,
  },
  footerVersion: {
    opacity: 0.8,
  }
};
