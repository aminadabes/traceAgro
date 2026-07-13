import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Produtos } from './pages/Produtos';
import { Movimentacoes } from './pages/Movimentacoes';
import { AtivosBiologicos } from './pages/AtivosBiologicos';
import { Operacoes } from './pages/Operacoes';

interface Categoria {
  id: number;
  nome: string;
  loteObrigatorio: boolean;
  validadeObrigatoria: boolean;
  diasAlertaVencimento: number;
}

interface Localizacao {
  id: number;
  fazenda: string;
  armazemGalpao?: string;
  siloCurralTalhao?: string;
  areaCritica: boolean;
  bloqueadoParaInventario?: boolean;
}

interface Produto {
  id: number;
  codigoInterno: string;
  ean: string;
  descricao: string;
  categoria: { id: number; nome?: string };
  unidadeCompra: string;
  unidadeConsumo: string;
  fatorConversao: number;
  destinacao: string;
  classeToxicologica?: string;
  registroMapa?: string;
  fichaTecnicaFispq?: string;
}

interface Lote {
  id: number;
  numeroLote: string;
  produto: Produto;
  dataValidade?: string;
  status: string;
}

interface SaldoEstoque {
  id: number;
  lote: Lote;
  localizacao: Localizacao;
  quantidade: number;
  custoMedio: number;
}

interface AtivoBiologico {
  id: number;
  identificadorUnico: string;
  especie: string;
  raca?: string;
  sexo: string;
  dataNascimento: string;
  pesoAtual: number;
  loteManejo?: string;
  statusSaude: string;
  localizacaoAtual?: Localizacao;
  dataFimCarencia?: string;
  categoriaIdade?: string;
}

interface Transferencia {
  id: number;
  produto: Produto;
  lote: Lote;
  quantidadeDespachada: number;
  quantidadeRecebida?: number;
  localizacaoOrigem: Localizacao;
  localizacaoDestino: Localizacao;
  transportador: string;
  status: string;
}

interface Inventario {
  id: number;
  localizacao: Localizacao;
  responsavel: string;
  status: string;
  dataAbertura: string;
}

interface PerdaEstoque {
  id: number;
  produto: Produto;
  lote: Lote;
  localizacao: Localizacao;
  quantidade: number;
  motivo: string;
  justificativa: string;
  status: string;
  usuarioSolicitante: string;
}

interface WarningAlert {
  id: string;
  tipo: 'VALIDADE' | 'QUARENTENA' | 'SAFETY_LOCK' | 'ESTOQUE_BAIXO';
  mensagem: string;
  grau: 'WARNING' | 'DANGER';
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState('ADMINISTRADOR');
  const [showWarningsModal, setShowWarningsModal] = useState(false);

  // Database lists
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [saldos, setSaldos] = useState<SaldoEstoque[]>([]);
  const [ativos, setAtivos] = useState<AtivoBiologico[]>([]);
  const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
  const [inventarios, setInventarios] = useState<Inventario[]>([]);
  const [perdas, setPerdas] = useState<PerdaEstoque[]>([]);
  
  // Dashboard alerts
  const [warnings, setWarnings] = useState<WarningAlert[]>([]);

  // Stats
  const [stats, setStats] = useState({
    produtosCount: 0,
    ativosCount: 0,
    inventariosAbertos: 0,
    perdasPendentes: 0
  });

  const headers = {
    'Content-Type': 'application/json',
    'X-User': currentUser,
    'X-IP': '127.0.0.1'
  };

  // Fetch all data from backend
  const refreshData = async () => {
    try {
      // 1. Fetch Products
      const prodRes = await fetch('/api/produtos');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProdutos(prodData);
      }

      // 2. Fetch Lookups
      const catRes = await fetch('/api/lookup/categorias');
      if (catRes.ok) setCategorias(await catRes.json());

      const locRes = await fetch('/api/lookup/localizacoes');
      if (locRes.ok) setLocalizacoes(await locRes.json());

      const salRes = await fetch('/api/lookup/saldos');
      if (salRes.ok) setSaldos(await salRes.json());

      const trRes = await fetch('/api/lookup/transferencias');
      if (trRes.ok) setTransferencias(await trRes.json());

      const invRes = await fetch('/api/lookup/inventarios');
      if (invRes.ok) setInventarios(await invRes.json());

      const lossRes = await fetch('/api/lookup/perdas');
      if (lossRes.ok) setPerdas(await lossRes.json());

      // 3. Fetch Animals
      const aniRes = await fetch('/api/ativos-biologicos');
      if (aniRes.ok) setAtivos(await aniRes.json());

    } catch (error) {
      console.error("Erro ao sincronizar dados com a API Spring Boot", error);
    }
  };

  // Initial load
  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  // Compute stats and warnings when lists change
  useEffect(() => {
    setStats({
      produtosCount: produtos.length,
      ativosCount: ativos.length,
      inventariosAbertos: inventarios.filter(i => i.status === 'ABERTO').length,
      perdasPendentes: perdas.filter(p => p.status === 'PENDENTE').length
    });

    const calculatedWarnings: WarningAlert[] = [];

    // 1. Expiry alerts (RN005)
    saldos.forEach(s => {
      if (s.lote.dataValidade && s.quantidade > 0) {
        const valDate = new Date(s.lote.dataValidade);
        const diffTime = valDate.getTime() - Date.now();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const prod = produtos.find(p => p.id === s.lote.produto.id);
        const cat = prod ? categorias.find(c => c.id === prod.categoria.id) : null;
        const windowAlert = cat ? cat.diasAlertaVencimento : 180;

        if (diffDays <= 0) {
          calculatedWarnings.push({
            id: `venc-danger-${s.id}`,
            tipo: 'VALIDADE',
            mensagem: `Lote ${s.lote.numeroLote} do produto "${prod?.descricao}" VENCIDO em ${valDate.toLocaleDateString('pt-BR')}! Bloqueado para uso/venda.`,
            grau: 'DANGER'
          });
        } else if (diffDays <= windowAlert) {
          calculatedWarnings.push({
            id: `venc-warn-${s.id}`,
            tipo: 'VALIDADE',
            mensagem: `Lote ${s.lote.numeroLote} do produto "${prod?.descricao}" vence em ${diffDays} dias (${valDate.toLocaleDateString('pt-BR')}).`,
            grau: 'WARNING'
          });
        }
      }
    });

    // 2. Animal quarantine alerts (RF006)
    ativos.forEach(a => {
      if (a.dataFimCarencia) {
        const carDate = new Date(a.dataFimCarencia);
        if (carDate.getTime() > Date.now()) {
          calculatedWarnings.push({
            id: `car-danger-${a.id}`,
            tipo: 'SAFETY_LOCK',
            mensagem: `Animal ${a.identificadorUnico} sob bloqueio de Safety Lock (GTA/venda travadas) até ${carDate.toLocaleString('pt-BR')}.`,
            grau: 'DANGER'
          });
        }
      }
    });

    // 3. Low stock alerts
    produtos.forEach(p => {
      const prodSaldos = saldos.filter(s => s.lote.produto.id === p.id);
      const totalQtd = prodSaldos.reduce((sum, s) => sum + s.quantidade, 0);
      if (totalQtd <= 50.0 && p.destinacao !== 'Uso Administrativo') {
        calculatedWarnings.push({
          id: `stock-low-${p.id}`,
          tipo: 'ESTOQUE_BAIXO',
          mensagem: `Produto "${p.descricao}" com estoque crítico de ressuprimento: ${totalQtd} ${p.unidadeConsumo} restantes.`,
          grau: 'WARNING'
        });
      }
    });

    setWarnings(calculatedWarnings);

  }, [produtos, categorias, localizacoes, saldos, ativos, inventarios, perdas]);

  // API Call wrappers
  const handleAddProduto = async (payload: any) => {
    const res = await fetch('/api/produtos', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Falha ao salvar produto.');
    }
    refreshData();
  };

  const handleRegistrarEntrada = async (payload: any) => {
    const res = await fetch('/api/movimentacoes/entrada', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Erro no lançamento de entrada.');
    }
    refreshData();
  };

  const handleRegistrarSaida = async (payload: any) => {
    const res = await fetch('/api/movimentacoes/saida', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Erro no lançamento de saída.');
    }
    refreshData();
  };

  const handleAddAnimal = async (payload: any) => {
    const res = await fetch('/api/ativos-biologicos', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Erro ao registrar animal.');
    }
    refreshData();
  };

  const handleRegistrarPesagem = async (id: string, peso: number) => {
    const res = await fetch(`/api/ativos-biologicos/${id}/pesagem?peso=${peso}`, {
      method: 'POST',
      headers
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Erro ao registrar pesagem.');
    }
    refreshData();
  };

  const handleAplicarMedicamento = async (id: string, diasCarencia: number) => {
    const res = await fetch(`/api/ativos-biologicos/${id}/aplicar-medicamento?diasCarencia=${diasCarencia}`, {
      method: 'POST',
      headers
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Erro ao aplicar vacina.');
    }
    refreshData();
  };

  const handleEmitirGta = async (id: string) => {
    const res = await fetch(`/api/ativos-biologicos/${id}/emitir-gta`, {
      method: 'GET',
      headers
    });
    const resText = await res.text();
    if (!res.ok) {
      throw new Error(resText || 'Bloqueio sanitário.');
    }
    return resText;
  };

  const handleFetchHistoricoPeso = async (id: string) => {
    const res = await fetch(`/api/ativos-biologicos/${id}/historico-peso`, {
      method: 'GET',
      headers
    });
    if (!res.ok) throw new Error('Falha ao ler histórico.');
    return await res.json();
  };

  const handleDespachar = async (payload: any) => {
    const queryParams = new URLSearchParams(payload).toString();
    const res = await fetch(`/api/operacoes/transferencias/despacho?${queryParams}`, {
      method: 'POST',
      headers
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Erro ao despachar.');
    }
    refreshData();
  };

  const handleReceber = async (id: number, payload: any) => {
    const queryParams = new URLSearchParams(payload).toString();
    const res = await fetch(`/api/operacoes/transferencias/${id}/recebimento?${queryParams}`, {
      method: 'POST',
      headers
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Erro ao receber.');
    }
    refreshData();
  };

  const handleAbrirInventario = async (localizacaoId: number, responsavel: string) => {
    const res = await fetch(`/api/operacoes/inventarios/abrir?localizacaoId=${localizacaoId}&responsavel=${responsavel}`, {
      method: 'POST',
      headers
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Erro ao abrir inventário.');
    }
    refreshData();
  };

  const handleConcluirInventario = async (id: number, contagens: any[]) => {
    const res = await fetch(`/api/operacoes/inventarios/${id}/concluir`, {
      method: 'POST',
      headers,
      body: JSON.stringify(contagens)
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Erro ao concluir inventário.');
    }
    refreshData();
  };

  const handleRegistrarPerda = async (payload: any) => {
    const queryParams = new URLSearchParams(payload).toString();
    const res = await fetch(`/api/operacoes/perdas?${queryParams}`, {
      method: 'POST',
      headers
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Erro ao registrar perda.');
    }
    refreshData();
  };

  const handleAprovarPerda = async (id: number, usuario: string, role: string) => {
    const res = await fetch(`/api/operacoes/perdas/${id}/aprovar?usuarioAprovador=${usuario}&roleAprovador=${role}`, {
      method: 'POST',
      headers
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Erro ao aprovar perda.');
    }
    refreshData();
  };

  const handleRejeitarPerda = async (id: number, usuario: string, role: string) => {
    const res = await fetch(`/api/operacoes/perdas/${id}/rejeitar?usuarioAprovador=${usuario}&roleAprovador=${role}`, {
      method: 'POST',
      headers
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Erro ao rejeitar perda.');
    }
    refreshData();
  };

  const handleAplicarAgricola = async (payload: any) => {
    const queryParams = new URLSearchParams(payload).toString();
    const res = await fetch(`/api/operacoes/aplicacoes-agricolas?${queryParams}`, {
      method: 'POST',
      headers
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Erro ao aplicar defensivo.');
    }
    refreshData();
  };

  const handleProduzir = async (payload: any) => {
    const queryParams = new URLSearchParams(payload).toString();
    const res = await fetch(`/api/operacoes/producao?${queryParams}`, {
      method: 'POST',
      headers
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Erro ao lançar produção.');
    }
    refreshData();
  };

  const handleFetchSugestaoCompra = async (produtoId: number, payload: any) => {
    const params = new URLSearchParams({ produtoId: produtoId.toString(), ...payload }).toString();
    const res = await fetch(`/api/operacoes/compras/sugestao?${params}`, {
      method: 'GET',
      headers
    });
    if (!res.ok) throw new Error('Falha ao calcular sugestão.');
    return await res.json();
  };

  const handleFetchRecall = async (lote: string, produtoId: number) => {
    const res = await fetch(`/api/operacoes/recall/rastreabilidade-reversa?numeroLote=${lote}&produtoId=${produtoId}`, {
      method: 'GET',
      headers
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Lote não localizado no histórico.');
    }
    return await res.json();
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Agropecuário';
      case 'produtos': return 'Cadastro de Produtos e Catálogos (RF001)';
      case 'movimentacoes': return 'Central de Movimentações de Estoque';
      case 'ativos': return 'Controle de Ativos Biológicos / Zootecnia (RF002)';
      case 'operacoes': return 'Módulo de Operações Especiais e Campo';
      default: return 'Sistema de Controle de Estoque';
    }
  };

  return (
    <div style={styles.app}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div style={styles.mainContainer}>
        <Header 
          currentUser={currentUser} 
          setCurrentUser={setCurrentUser} 
          title={getPageTitle()}
          warningsCount={warnings.length}
          onViewWarnings={() => setShowWarningsModal(true)}
        />

        <main style={styles.content}>
          {activeTab === 'dashboard' && <Dashboard stats={stats} warnings={warnings} />}
          {activeTab === 'produtos' && (
            <Produtos 
              produtos={produtos} 
              categorias={categorias} 
              onAddProduto={handleAddProduto} 
              currentUser={currentUser}
            />
          )}
          {activeTab === 'movimentacoes' && (
            <Movimentacoes 
              produtos={produtos} 
              localizacoes={localizacoes} 
              categorias={categorias}
              saldos={saldos}
              onRegistrarEntrada={handleRegistrarEntrada}
              onRegistrarSaida={handleRegistrarSaida}
              currentUser={currentUser}
            />
          )}
          {activeTab === 'ativos' && (
            <AtivosBiologicos 
              ativos={ativos} 
              localizacoes={localizacoes}
              onAddAnimal={handleAddAnimal}
              onRegistrarPesagem={handleRegistrarPesagem}
              onAplicarMedicamento={handleAplicarMedicamento}
              onEmitirGta={handleEmitirGta}
              onFetchHistoricoPeso={handleFetchHistoricoPeso}
              currentUser={currentUser}
            />
          )}
          {activeTab === 'operacoes' && (
            <Operacoes 
              produtos={produtos} 
              localizacoes={localizacoes}
              saldos={saldos}
              transferencias={transferencias}
              inventarios={inventarios}
              perdas={perdas}
              onDespachar={handleDespachar}
              onReceber={handleReceber}
              onAbrirInventario={handleAbrirInventario}
              onConcluirInventario={handleConcluirInventario}
              onRegistrarPerda={handleRegistrarPerda}
              onAprovarPerda={handleAprovarPerda}
              onRejeitarPerda={handleRejeitarPerda}
              onAplicarAgricola={handleAplicarAgricola}
              onProduzir={handleProduzir}
              onFetchSugestaoCompra={handleFetchSugestaoCompra}
              onFetchRecall={handleFetchRecall}
              currentUser={currentUser}
            />
          )}
        </main>
      </div>

      {/* Alertas Críticos Modal */}
      {showWarningsModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                🚨 Alertas Críticos Ativos ({warnings.length})
              </h2>
              <button onClick={() => setShowWarningsModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '60vh', overflowY: 'auto' }}>
              {warnings.map((w) => (
                <div 
                  key={w.id} 
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    borderLeft: '4px solid',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    backgroundColor: w.grau === 'DANGER' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                    borderLeftColor: w.grau === 'DANGER' ? 'var(--color-danger)' : 'var(--color-warning)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: w.grau === 'DANGER' ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                      {w.tipo === 'VALIDADE' && '⚠️ VENCIMENTO'}
                      {w.tipo === 'QUARENTENA' && '🛡️ QUARENTENA'}
                      {w.tipo === 'SAFETY_LOCK' && '🔒 SAFETY LOCK'}
                      {w.tipo === 'ESTOQUE_BAIXO' && '📉 ESTOQUE BAIXO'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>{w.mensagem}</p>
                </div>
              ))}
              {warnings.length === 0 && (
                <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Sem alertas ativos.</p>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowWarningsModal(false)} className="btn btn-primary">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-main)',
    color: 'var(--text-main)',
  },
  mainContainer: {
    flex: 1,
    marginLeft: 'var(--sidebar-width)',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  content: {
    padding: '30px',
    flex: 1,
  }
};

export default App;
