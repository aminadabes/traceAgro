import React, { useState } from 'react';
import { 
  Search, 
  Scale, 
  HeartPulse, 
  FileCheck, 
  ShieldAlert, 
  UserPlus 
} from 'lucide-react';

interface Localizacao {
  id: number;
  fazenda: string;
  armazemGalpao?: string;
  siloCurralTalhao?: string;
}

interface AtivoBiologico {
  id?: number;
  identificadorUnico: string;
  loteManejo?: string;
  especie: string;
  raca?: string;
  sexo: string;
  dataNascimento: string;
  pesoAtual: number;
  genealogiaPai?: string;
  genealogiaMae?: string;
  statusSaude: string;
  localizacaoAtual?: Localizacao;
  dataFimCarencia?: string;
  categoriaIdade?: string;
}

interface HistoricoPeso {
  id?: number;
  peso: number;
  dataPesagem: string;
}

interface AtivosBiologicosProps {
  ativos: AtivoBiologico[];
  localizacoes: Localizacao[];
  onAddAnimal: (animal: AtivoBiologico) => Promise<void>;
  onRegistrarPesagem: (id: string, peso: number) => Promise<void>;
  onAplicarMedicamento: (id: string, diasCarencia: number) => Promise<void>;
  onEmitirGta: (id: string) => Promise<string>;
  onFetchHistoricoPeso: (id: string) => Promise<HistoricoPeso[]>;
  currentUser: string;
}

export const AtivosBiologicos: React.FC<AtivosBiologicosProps> = ({
  ativos,
  localizacoes,
  onAddAnimal,
  onRegistrarPesagem,
  onAplicarMedicamento,
  onEmitirGta,
  onFetchHistoricoPeso,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<AtivoBiologico | null>(null);
  
  // Detail views state
  const [historicoPeso, setHistoricoPeso] = useState<HistoricoPeso[]>([]);
  const [pesoInput, setPesoInput] = useState('');
  const [carenciaInput, setCarenciaInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Register Animal Form State
  const [identificadorUnico, setIdentificadorUnico] = useState('');
  const [especie, setEspecie] = useState('Bovino');
  const [raca, setRaca] = useState('');
  const [sexo, setSexo] = useState('M');
  const [dataNascimento, setDataNascimento] = useState('');
  const [pesoInicial, setPesoInicial] = useState('');
  const [loteManejo, setLoteManejo] = useState('');
  const [genealogiaPai, setGenealogiaPai] = useState('');
  const [genealogiaMae, setGenealogiaMae] = useState('');
  const [localizacaoId, setLocalizacaoId] = useState('');

  const filteredAtivos = ativos.filter(a => 
    a.identificadorUnico.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.especie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.loteManejo && a.loteManejo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const canEdit = currentUser === 'ADMINISTRADOR' || currentUser === 'VETERINARIO' || currentUser === 'OPERADOR';
  const canVet = currentUser === 'ADMINISTRADOR' || currentUser === 'VETERINARIO';

  const handleSelectAnimal = async (animal: AtivoBiologico) => {
    setSelectedAnimal(animal);
    setErrorMsg('');
    setSuccessMsg('');
    setPesoInput('');
    setCarenciaInput('');
    try {
      const history = await onFetchHistoricoPeso(animal.identificadorUnico);
      setHistoricoPeso(history);
    } catch (err) {
      console.error(err);
      setHistoricoPeso([]);
    }
  };

  const handleRegisterAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identificadorUnico || !especie || !dataNascimento || !pesoInicial) {
      setErrorMsg('Os campos marcados com * são obrigatórios.');
      return;
    }

    const payload: AtivoBiologico = {
      identificadorUnico,
      especie,
      raca,
      sexo,
      dataNascimento,
      pesoAtual: parseFloat(pesoInicial),
      loteManejo,
      genealogiaPai,
      genealogiaMae,
      statusSaude: 'SAUDAVEL',
      localizacaoAtual: localizacaoId ? { id: parseInt(localizacaoId), fazenda: '' } : undefined
    };

    try {
      await onAddAnimal(payload);
      setIsModalOpen(false);
      resetRegisterForm();
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao cadastrar animal.');
    }
  };

  const resetRegisterForm = () => {
    setIdentificadorUnico('');
    setEspecie('Bovino');
    setRaca('');
    setSexo('M');
    setDataNascimento('');
    setPesoInicial('');
    setLoteManejo('');
    setGenealogiaPai('');
    setGenealogiaMae('');
    setLocalizacaoId('');
    setErrorMsg('');
  };

  const handlePesagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimal || !pesoInput) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await onRegistrarPesagem(selectedAnimal.identificadorUnico, parseFloat(pesoInput));
      setSuccessMsg('Pesagem registrada com sucesso!');
      
      // Update local state
      const updatedAnimal = { ...selectedAnimal, pesoAtual: parseFloat(pesoInput) };
      setSelectedAnimal(updatedAnimal);
      setPesoInput('');

      // Refresh history
      const history = await onFetchHistoricoPeso(selectedAnimal.identificadorUnico);
      setHistoricoPeso(history);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao registrar pesagem.');
    }
  };

  const handleMedicamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimal || !carenciaInput) return;
    setErrorMsg('');
    setSuccessMsg('');

    if (!canVet) {
      setErrorMsg('Apenas Veterinários ou Administradores podem aplicar medicamentos.');
      return;
    }

    try {
      await onAplicarMedicamento(selectedAnimal.identificadorUnico, parseInt(carenciaInput));
      setSuccessMsg('Medicamento aplicado. Animal em quarentena (Safety Lock ativado).');
      
      // Refresh animal list details
      const dateFim = new Date();
      dateFim.setDate(dateFim.getDate() + parseInt(carenciaInput));
      
      const updatedAnimal = { 
        ...selectedAnimal, 
        statusSaude: 'QUARENTENA',
        dataFimCarencia: dateFim.toISOString()
      };
      setSelectedAnimal(updatedAnimal);
      setCarenciaInput('');

      // Refresh history
      const history = await onFetchHistoricoPeso(selectedAnimal.identificadorUnico);
      setHistoricoPeso(history);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao aplicar medicamento.');
    }
  };

  const handleGTA = async () => {
    if (!selectedAnimal) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await onEmitirGta(selectedAnimal.identificadorUnico);
      setSuccessMsg(`✓ GTA EMITIDA COM SUCESSO: ${response}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Bloqueio na emissão da GTA.');
    }
  };

  // Helper to draw SVG Chart path
  const renderWeightChart = () => {
    if (historicoPeso.length < 2) {
      return (
        <div style={styles.chartEmpty}>
          Insira pelo menos 2 pesagens para plotar o histórico.
        </div>
      );
    }

    // Sort ascending for graph plotting
    const sortedHistory = [...historicoPeso].reverse();
    const width = 450;
    const height = 150;
    const padding = 30;

    const weights = sortedHistory.map(h => h.peso);
    const maxWeight = Math.max(...weights) * 1.1;
    const minWeight = Math.min(...weights) * 0.9;
    const weightRange = maxWeight - minWeight || 1;

    // Map data points to SVG coordinates
    const points = sortedHistory.map((h, index) => {
      const x = padding + (index / (sortedHistory.length - 1)) * (width - padding * 2);
      const y = height - padding - ((h.peso - minWeight) / weightRange) * (height - padding * 2);
      return { x, y, ...h };
    });

    // Create SVG Path string
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    return (
      <div style={styles.chartContainer}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={styles.svg}>
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.05)" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.05)" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.1)" />

          {/* Line Path */}
          <path d={pathD} fill="none" stroke="var(--color-primary)" strokeWidth="3" />

          {/* Points */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r="5" fill="var(--bg-main)" stroke="var(--color-primary)" strokeWidth="2" />
              <text x={p.x} y={p.y - 10} textAnchor="middle" fill="var(--text-main)" fontSize="9" fontWeight="600">
                {p.peso} kg
              </text>
            </g>
          ))}
        </svg>
        <div style={styles.chartLabelRow}>
          <span>{new Date(sortedHistory[0].dataPesagem).toLocaleDateString('pt-BR')}</span>
          <span>Evolução de Peso (Histórico Temporal)</span>
          <span>{new Date(sortedHistory[sortedHistory.length - 1].dataPesagem).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    );
  };

  const isQuarantine = selectedAnimal?.statusSaude === 'QUARENTENA' || 
    (selectedAnimal?.dataFimCarencia && new Date(selectedAnimal.dataFimCarencia).getTime() > Date.now());

  return (
    <div style={styles.container}>
      <div style={styles.layoutGrid}>
        {/* Left Side: Animal Catalog */}
        <div>
          <div style={styles.actionsBar}>
            <div style={styles.searchWrapper}>
              <Search size={18} style={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Pesquisar por brinco, espécie ou lote..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <button 
              className="btn btn-primary"
              onClick={() => {
                if (!canEdit) {
                  alert('Apenas Veterinários, Almoxarifes ou Administradores cadastram animais.');
                  return;
                }
                setIsModalOpen(true);
              }}
              disabled={!canEdit}
              style={{ opacity: canEdit ? 1 : 0.6 }}
            >
              <UserPlus size={18} />
              Adicionar Animal
            </button>
          </div>

          <div className="table-container" style={{ marginTop: '16px' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Identificador (Brinco/RFID)</th>
                  <th>Espécie / Raça</th>
                  <th>Idade / Categoria</th>
                  <th>Peso Atual</th>
                  <th>Status Saúde</th>
                  <th>Localização</th>
                </tr>
              </thead>
              <tbody>
                {filteredAtivos.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      Nenhum ativo biológico catalogado.
                    </td>
                  </tr>
                ) : (
                  filteredAtivos.map((a) => {
                    const isAnimalLock = a.statusSaude === 'QUARENTENA' || 
                      (a.dataFimCarencia && new Date(a.dataFimCarencia).getTime() > Date.now());
                    return (
                      <tr 
                        key={a.id} 
                        onClick={() => handleSelectAnimal(a)}
                        style={{ 
                          cursor: 'pointer',
                          backgroundColor: selectedAnimal?.id === a.id ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
                        }}
                      >
                        <td><strong>{a.identificadorUnico}</strong></td>
                        <td>{a.especie} {a.raca ? `/ ${a.raca}` : ''}</td>
                        <td>
                          <span className="badge badge-info">{a.categoriaIdade || 'Indefinida'}</span>
                        </td>
                        <td>{a.pesoAtual} kg</td>
                        <td>
                          <span className={`badge ${isAnimalLock ? 'badge-danger' : 'badge-success'}`}>
                            {isAnimalLock ? '🏥 Quarentena' : '🟢 Saudável'}
                          </span>
                        </td>
                        <td>{a.localizacaoAtual ? `${a.localizacaoAtual.fazenda} - ${a.localizacaoAtual.armazemGalpao || a.localizacaoAtual.siloCurralTalhao}` : 'Sem local'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Animal Details & Operations */}
        <div className="card" style={styles.detailCard}>
          {selectedAnimal ? (
            <div style={styles.detailContent}>
              <div style={styles.detailHeader}>
                <h3 style={styles.detailTitle}>Ficha Zootécnica: {selectedAnimal.identificadorUnico}</h3>
                <span className={`badge ${isQuarantine ? 'badge-danger' : 'badge-success'}`}>
                  {isQuarantine ? 'CARÊNCIA SANITÁRIA ATIVA' : 'APTO PARA MOVIMENTAÇÃO'}
                </span>
              </div>

              {errorMsg && (
                <div style={styles.errorAlert}>
                  <ShieldAlert size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div style={styles.successAlert}>
                  <FileCheck size={18} />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Safety Lock Info */}
              {isQuarantine && (
                <div style={styles.quarantineNotice}>
                  <ShieldAlert size={20} color="var(--color-danger)" />
                  <div>
                    <strong>Safety Lock Ativo (RN007):</strong> O animal está sob carência sanitária.
                    {selectedAnimal.dataFimCarencia && (
                      <div>Fim do bloqueio: <strong style={{ color: '#fff' }}>{new Date(selectedAnimal.dataFimCarencia).toLocaleString('pt-BR')}</strong></div>
                    )}
                    <span style={{ fontSize: '0.75rem', opacity: 0.9, display: 'block', marginTop: '4px' }}>
                      Emissão de GTA, venda e abate estão bloqueados pelo sistema de forma automática.
                    </span>
                  </div>
                </div>
              )}

              {/* Animal Attributes */}
              <div style={styles.attributesGrid}>
                <div style={styles.attrItem}><span>Espécie/Raça:</span> <strong>{selectedAnimal.especie} ({selectedAnimal.raca || 'Mestiço'})</strong></div>
                <div style={styles.attrItem}><span>Sexo:</span> <strong>{selectedAnimal.sexo === 'M' ? 'Macho' : 'Fêmea'}</strong></div>
                <div style={styles.attrItem}><span>Categoria Idade:</span> <strong>{selectedAnimal.categoriaIdade || 'Indefinida'}</strong></div>
                <div style={styles.attrItem}><span>Lote de Manejo:</span> <strong>{selectedAnimal.loteManejo || 'Não informado'}</strong></div>
                <div style={styles.attrItem}><span>Genealogia:</span> <strong style={{ fontSize: '0.75rem' }}>Pai: {selectedAnimal.genealogiaPai || '?'}, Mãe: {selectedAnimal.genealogiaMae || '?'}</strong></div>
              </div>

              {/* Weight Chart (RF003) */}
              <div>
                <h4 style={styles.subTitle}>Pesagens Históricas</h4>
                {renderWeightChart()}
              </div>

              {/* Quick Actions Form */}
              <div style={styles.formsSection}>
                {/* 1. Weighing Form */}
                <form onSubmit={handlePesagem} style={styles.quickForm}>
                  <Scale size={16} color="var(--color-primary)" />
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="Nova pesagem (kg)" 
                    value={pesoInput}
                    onChange={(e) => setPesoInput(e.target.value)}
                    style={{ flex: 1, padding: '6px 10px', fontSize: '0.85rem' }}
                    required
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                  >
                    Gravar Peso
                  </button>
                </form>

                {/* 2. Medicine Form */}
                <form onSubmit={handleMedicamento} style={styles.quickForm}>
                  <HeartPulse size={16} color="var(--color-warning)" />
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="Carência do Medicamento (dias)" 
                    value={carenciaInput}
                    onChange={(e) => setCarenciaInput(e.target.value)}
                    style={{ flex: 1, padding: '6px 10px', fontSize: '0.85rem' }}
                    required
                  />
                  <button 
                    type="submit" 
                    className="btn btn-danger"
                    style={{ padding: '6px 14px', fontSize: '0.85rem', backgroundColor: 'var(--color-warning)' }}
                  >
                    Aplicar Vacina
                  </button>
                </form>

                {/* 3. Emit GTA Button */}
                <button 
                  onClick={handleGTA}
                  className="btn btn-secondary"
                  style={styles.gtaBtn}
                >
                  <FileCheck size={18} />
                  Emitir Guia de Transporte (GTA)
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.emptyDetails}>
              Selecione um animal da listagem para visualizar a ficha zootécnica e registrar pesagens ou medicamentos.
            </div>
          )}
        </div>
      </div>

      {/* Add Animal Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Cadastrar Ativo Biológico (RF002)</h2>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}>✕</button>
            </div>
            
            <form onSubmit={handleRegisterAnimal}>
              <div className="modal-body" style={styles.modalBodyGrid}>
                {errorMsg && (
                  <div style={styles.errorAlert}>
                    <ShieldAlert size={18} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Identificador Único * (Brinco / RFID / RFID-Chip)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ex: BR-8822"
                    value={identificadorUnico}
                    onChange={(e) => setIdentificadorUnico(e.target.value)}
                    required
                  />
                </div>

                <div style={styles.formRow}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Espécie *</label>
                    <select 
                      className="form-select"
                      value={especie}
                      onChange={(e) => setEspecie(e.target.value)}
                      required
                    >
                      <option value="Bovino">Bovino (Gado)</option>
                      <option value="Suino">Suíno (Porcos)</option>
                      <option value="Ovino">Ovino (Ovelhas)</option>
                      <option value="Equino">Equino (Cavalos)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Raça</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Ex: Nelore, Angus"
                      value={raca}
                      onChange={(e) => setRaca(e.target.value)}
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Sexo *</label>
                    <select 
                      className="form-select"
                      value={sexo}
                      onChange={(e) => setSexo(e.target.value)}
                    >
                      <option value="M">Macho</option>
                      <option value="F">Fêmea</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Data de Nascimento *</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Peso Inicial (kg) *</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="Ex: 120"
                      value={pesoInicial}
                      onChange={(e) => setPesoInicial(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Lote de Manejo</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Ex: LOTE-MANEJO-A"
                      value={loteManejo}
                      onChange={(e) => setLoteManejo(e.target.value)}
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Genealogia Pai</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Nome do Touro Pai"
                      value={genealogiaPai}
                      onChange={(e) => setGenealogiaPai(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Genealogia Mãe</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Nome da Vaca Mãe"
                      value={genealogiaMae}
                      onChange={(e) => setGenealogiaMae(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Localização Inicial *</label>
                  <select 
                    className="form-select"
                    value={localizacaoId}
                    onChange={(e) => setLocalizacaoId(e.target.value)}
                    required
                  >
                    <option value="">Selecione o Curral/Piquete...</option>
                    {localizacoes.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.fazenda} - {l.armazemGalpao || l.siloCurralTalhao}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '4fr 3fr',
    gap: '20px',
    alignItems: 'start',
  },
  actionsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
  },
  searchWrapper: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-muted)',
  },
  searchInput: {
    width: '100%',
    padding: '12px 12px 12px 42px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    color: 'var(--text-main)',
    outline: 'none',
    fontSize: '0.95rem',
  },
  detailCard: {
    minHeight: '400px',
  },
  detailContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  detailHeader: {
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  detailTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#f87171',
    padding: '12px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.85rem',
  },
  successAlert: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    color: '#34d399',
    padding: '12px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.85rem',
  },
  quarantineNotice: {
    display: 'flex',
    gap: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '8px',
    padding: '14px',
    color: '#f87171',
    fontSize: '0.85rem',
    lineHeight: '1.4',
  },
  attributesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    fontSize: '0.85rem',
    backgroundColor: 'rgba(255,255,255,0.01)',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
  },
  attrItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    color: 'var(--text-muted)',
  },
  subTitle: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    marginBottom: '10px',
  },
  chartContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '10px',
  },
  chartEmpty: {
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    border: '1px dashed var(--border-color)',
    borderRadius: '8px',
  },
  svg: {
    display: 'block',
  },
  chartLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    marginTop: '6px',
  },
  formsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '20px',
  },
  quickForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(255,255,255,0.01)',
    border: '1px solid var(--border-color)',
    padding: '8px 12px',
    borderRadius: '8px',
  },
  gtaBtn: {
    width: '100%',
    padding: '12px',
    fontWeight: 600,
    backgroundColor: 'transparent',
    border: '1.5px solid var(--color-primary)',
    color: 'var(--color-primary)',
  },
  emptyDetails: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    padding: '50px 30px',
    lineHeight: '1.5',
    border: '1px dashed var(--border-color)',
    borderRadius: '12px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '1.2rem',
  },
  modalBodyGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
  }
};
