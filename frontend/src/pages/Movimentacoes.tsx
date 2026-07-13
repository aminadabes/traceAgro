import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldAlert, 
  Lightbulb, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';

interface Localizacao {
  id: number;
  fazenda: string;
  armazemGalpao?: string;
  siloCurralTalhao?: string;
  areaCritica: boolean;
  bloqueadoParaInventario?: boolean;
}

interface Categoria {
  id: number;
  nome: string;
  loteObrigatorio: boolean;
  validadeObrigatoria: boolean;
  diasAlertaVencimento: number;
}

interface Produto {
  id: number;
  codigoInterno: string;
  descricao: string;
  categoria: { id: number };
  unidadeCompra: string;
  unidadeConsumo: string;
  fatorConversao: number;
  destinacao: string;
  classeToxicologica?: string;
}

interface SaldoEstoque {
  id: number;
  lote: {
    id: number;
    numeroLote: string;
    dataValidade?: string;
    dataFabricacao?: string;
    produto: { id: number };
    status: string;
  };
  localizacao: { id: number };
  quantidade: number;
  custoMedio: number;
}

interface MovimentacaoProps {
  produtos: Produto[];
  localizacoes: Localizacao[];
  categorias: Categoria[];
  saldos: SaldoEstoque[];
  onRegistrarEntrada: (req: any) => Promise<void>;
  onRegistrarSaida: (req: any) => Promise<void>;
  currentUser: string;
}

export const Movimentacoes: React.FC<MovimentacaoProps> = ({
  produtos,
  localizacoes,
  categorias,
  saldos,
  onRegistrarEntrada,
  onRegistrarSaida,
  currentUser
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Common fields
  const [selectedProdutoId, setSelectedProdutoId] = useState('');
  const [selectedLocalizacaoId, setSelectedLocalizacaoId] = useState('');
  
  // Entrada specific fields
  const [numeroLote, setNumeroLote] = useState('');
  const [dataFabricacao, setDataFabricacao] = useState('');
  const [dataValidade, setDataValidade] = useState('');
  const [quantidadeCompra, setQuantidadeCompra] = useState('');
  const [valorUnitario, setValorUnitario] = useState('');
  const [frete, setFrete] = useState('0');
  const [impostosRateados, setImpostosRateados] = useState('0');
  const [subTipoEntrada, setSubTipoEntrada] = useState('COMPRA');
  const [centroCustoSafra, setCentroCustoSafra] = useState('SAFRA-2026');
  const [chaveNfe, setChaveNfe] = useState('');
  const [fornecedorLote, setFornecedorLote] = useState('');

  // Saida specific fields
  const [quantidadeSaida, setQuantidadeSaida] = useState('');
  const [subTipoSaida, setSubTipoSaida] = useState('CONSUMO_INTERNO');

  // FEFO/FIFO suggestions
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suggestedLote, setSuggestedLote] = useState<any | null>(null);
  const [totalDisponivel, setTotalDisponivel] = useState(0);

  const selectedProduto = produtos.find(p => p.id === parseInt(selectedProdutoId));
  const selectedProdutoCat = selectedProduto ? categorias.find(c => c.id === selectedProduto.categoria.id) : null;
  const selectedLocalizacaoObj = localizacoes.find(l => l.id === parseInt(selectedLocalizacaoId));

  // Compute FEFO/FIFO when product changes
  useEffect(() => {
    if (!selectedProdutoId) {
      setSuggestions([]);
      setSuggestedLote(null);
      setTotalDisponivel(0);
      return;
    }

    const prodId = parseInt(selectedProdutoId);
    
    // Get all saldos for this product (across all locations)
    let filteredSaldos = saldos.filter(s => s.lote.produto.id === prodId && s.quantidade > 0);

    // If a location is selected, filter by location
    if (selectedLocalizacaoId) {
      const locId = parseInt(selectedLocalizacaoId);
      filteredSaldos = filteredSaldos.filter(s => s.localizacao.id === locId);
    }

    const total = filteredSaldos.reduce((sum, s) => sum + s.quantidade, 0);
    setTotalDisponivel(total);

    const isFEFO = selectedProdutoCat?.validadeObrigatoria;

    if (isFEFO) {
      // Sort by Expiration Date
      filteredSaldos.sort((a, b) => {
        if (!a.lote.dataValidade) return 1;
        if (!b.lote.dataValidade) return -1;
        return new Date(a.lote.dataValidade).getTime() - new Date(b.lote.dataValidade).getTime();
      });
    } else {
      // Sort by FIFO (Lote ID)
      filteredSaldos.sort((a, b) => a.lote.id - b.lote.id);
    }

    setSuggestions(filteredSaldos);
    
    // Suggest first unblocked batch
    const activeLote = filteredSaldos.find(s => s.lote.status !== 'BLOQUEADO');
    setSuggestedLote(activeLote || null);

  }, [selectedProdutoId, selectedLocalizacaoId, saldos, selectedProdutoCat]);

  const canOperate = currentUser !== 'AUDITOR' && currentUser !== 'OPERADOR';

  const handleEntradaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!canOperate) {
      setErrorMsg('O perfil de Auditor ou Operador não tem permissão para registrar entradas de NF-e.');
      return;
    }

    if (!selectedProdutoId || !selectedLocalizacaoId || !quantidadeCompra || !valorUnitario) {
      setErrorMsg('Por favor, preencha os campos obrigatórios.');
      return;
    }

    // Verify batch/validity requirements (RN004)
    if (selectedProdutoCat?.loteObrigatorio && !numeroLote) {
      setErrorMsg(`A categoria do produto exige a informação de Lote.`);
      return;
    }
    if (selectedProdutoCat?.validadeObrigatoria && !dataValidade) {
      setErrorMsg(`A categoria do produto exige a informação de Data de Validade.`);
      return;
    }

    // Verify critical area segregation (RN008)
    if (selectedProduto?.classeToxicologica && selectedLocalizacaoObj && !selectedLocalizacaoObj.areaCritica) {
      setErrorMsg('OPERACÃO BLOQUEADA: Produtos de alta toxicidade devem ser estocados em Área Crítica isolada.');
      return;
    }

    const req = {
      produtoId: parseInt(selectedProdutoId),
      localizacaoId: parseInt(selectedLocalizacaoId),
      numeroLote,
      dataFabricacao: dataFabricacao || null,
      dataValidade: dataValidade || null,
      quantidadeCompra: parseFloat(quantidadeCompra),
      valorUnitario: parseFloat(valorUnitario),
      frete: parseFloat(frete) || 0,
      impostosRateados: parseFloat(impostosRateados) || 0,
      subTipo: subTipoEntrada,
      centroCustoSafra,
      chaveNfe,
      fornecedorLote
    };

    try {
      await onRegistrarEntrada(req);
      setSuccessMsg('Entrada de estoque registrada com sucesso! Custo médio recalculado.');
      resetFields();
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao registrar entrada no backend.');
    }
  };

  const handleSaidaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (currentUser === 'AUDITOR') {
      setErrorMsg('Auditores não podem registrar movimentações de saída.');
      return;
    }

    if (!selectedProdutoId || !selectedLocalizacaoId || !quantidadeSaida) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const qty = parseFloat(quantidadeSaida);

    // Negative balance check (RN011)
    if (qty > totalDisponivel) {
      setErrorMsg(`OPERACÃO BLOQUEADA: Saldo insuficiente. Requisitado: ${qty}, Disponível: ${totalDisponivel}`);
      return;
    }

    const req = {
      produtoId: parseInt(selectedProdutoId),
      localizacaoId: parseInt(selectedLocalizacaoId),
      quantidadeSaidaConsumo: qty,
      subTipo: subTipoSaida,
      centroCustoSafra
    };

    try {
      await onRegistrarSaida(req);
      setSuccessMsg('Saída de estoque processada com sucesso!');
      resetFields();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao registrar saída de estoque.');
    }
  };

  const resetFields = () => {
    setSelectedProdutoId('');
    setSelectedLocalizacaoId('');
    setNumeroLote('');
    setDataFabricacao('');
    setDataValidade('');
    setQuantidadeCompra('');
    setValorUnitario('');
    setFrete('0');
    setImpostosRateados('0');
    setQuantidadeSaida('');
    setChaveNfe('');
    setFornecedorLote('');
  };

  return (
    <div style={styles.container}>
      {/* Sub Tabs */}
      <div style={styles.tabHeader}>
        <button 
          onClick={() => { setActiveSubTab('ENTRADA'); resetFields(); setErrorMsg(''); setSuccessMsg(''); }}
          style={{
            ...styles.tabBtn,
            borderBottomColor: activeSubTab === 'ENTRADA' ? 'var(--color-primary)' : 'transparent',
            color: activeSubTab === 'ENTRADA' ? 'var(--color-primary)' : 'var(--text-muted)'
          }}
        >
          <ArrowDownLeft size={16} />
          Entrada de Estoque (Compra / Produção)
        </button>
        <button 
          onClick={() => { setActiveSubTab('SAIDA'); resetFields(); setErrorMsg(''); setSuccessMsg(''); }}
          style={{
            ...styles.tabBtn,
            borderBottomColor: activeSubTab === 'SAIDA' ? 'var(--color-secondary)' : 'transparent',
            color: activeSubTab === 'SAIDA' ? 'var(--color-secondary)' : 'var(--text-muted)'
          }}
        >
          <ArrowUpRight size={16} />
          Saída de Estoque (Consumo / Baixas)
        </button>
      </div>

      <div className="grid grid-cols-3" style={{ alignItems: 'start' }}>
        {/* Registration Form */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 style={styles.formTitle}>
            {activeSubTab === 'ENTRADA' ? 'Registrar Nota Fiscal / Entrada' : 'Registrar Consumo / Saída'}
          </h3>

          {errorMsg && (
            <div style={styles.errorAlert}>
              <ShieldAlert size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={styles.successAlert}>
              <ShieldCheck size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {activeSubTab === 'ENTRADA' ? (
            <form onSubmit={handleEntradaSubmit} style={styles.formGrid}>
              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Produto *</label>
                  <select 
                    className="form-select"
                    value={selectedProdutoId}
                    onChange={(e) => setSelectedProdutoId(e.target.value)}
                    required
                  >
                    <option value="">Selecione o Produto...</option>
                    {produtos.map(p => (
                      <option key={p.id} value={p.id}>{p.codigoInterno} - {p.descricao}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Localização de Destino *</label>
                  <select 
                    className="form-select"
                    value={selectedLocalizacaoId}
                    onChange={(e) => setSelectedLocalizacaoId(e.target.value)}
                    required
                  >
                    <option value="">Selecione o Local...</option>
                    {localizacoes.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.fazenda} - {l.armazemGalpao || l.siloCurralTalhao} {l.areaCritica ? '(Área Crítica)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedLocalizacaoObj?.bloqueadoParaInventario && (
                <div style={styles.dangerNotice}>
                  ⚠️ <strong>Bloqueio de Inventário (RN014):</strong> Esta localização está bloqueada temporariamente para contagem. Nenhuma movimentação é permitida!
                </div>
              )}

              {selectedProdutoCat && (
                <div style={styles.requirementsPanel}>
                  📌 <strong>Requisitos de Categoria:</strong> {selectedProdutoCat.nome} exige:
                  {selectedProdutoCat.loteObrigatorio ? ' Lote [Sim]' : ' Lote [Não]'} | 
                  {selectedProdutoCat.validadeObrigatoria ? ' Validade [Sim]' : ' Validade [Não]'}
                </div>
              )}

              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Número do Lote {selectedProdutoCat?.loteObrigatorio && '*'}</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Lote do Fornecedor"
                    value={numeroLote}
                    onChange={(e) => setNumeroLote(e.target.value)}
                    required={selectedProdutoCat?.loteObrigatorio}
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Fornecedor do Lote</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Nome do Fornecedor"
                    value={fornecedorLote}
                    onChange={(e) => setFornecedorLote(e.target.value)}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Data de Fabricação</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={dataFabricacao}
                    onChange={(e) => setDataFabricacao(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Data de Validade {selectedProdutoCat?.validadeObrigatoria && '*'}</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={dataValidade}
                    onChange={(e) => setDataValidade(e.target.value)}
                    required={selectedProdutoCat?.validadeObrigatoria}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Qtd da Unidade de Compra *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder={`Qtd em ${selectedProduto?.unidadeCompra || 'Unidades'}`}
                    value={quantidadeCompra}
                    onChange={(e) => setQuantidadeCompra(e.target.value)}
                    required
                  />
                  {selectedProduto && quantidadeCompra && (
                    <span style={styles.infoSpan}>
                      Equivale a {parseFloat(quantidadeCompra) * selectedProduto.fatorConversao} {selectedProduto.unidadeConsumo} no saldo.
                    </span>
                  )}
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Valor Unitário Compra (R$) *</label>
                  <input 
                    type="number" 
                    step="any"
                    className="form-input" 
                    placeholder="0.00"
                    value={valorUnitario}
                    onChange={(e) => setValorUnitario(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Frete (Rateio) (R$)</label>
                  <input 
                    type="number" 
                    step="any"
                    className="form-input" 
                    value={frete}
                    onChange={(e) => setFrete(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Impostos Rateados (R$)</label>
                  <input 
                    type="number" 
                    step="any"
                    className="form-input" 
                    value={impostosRateados}
                    onChange={(e) => setImpostosRateados(e.target.value)}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Chave de NF-e (XML)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Chave de 44 dígitos"
                    value={chaveNfe}
                    onChange={(e) => setChaveNfe(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Centro Custo / Safra</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={centroCustoSafra}
                    onChange={(e) => setCentroCustoSafra(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tipo da Entrada</label>
                <select 
                  className="form-select"
                  value={subTipoEntrada}
                  onChange={(e) => setSubTipoEntrada(e.target.value)}
                >
                  <option value="COMPRA">Compra do Fornecedor</option>
                  <option value="PRODUCAO_PROPRIA">Produção Própria</option>
                  <option value="DEVOLUCAO">Devolução</option>
                  <option value="BONIFICACAO">Bonificação</option>
                  <option value="AJUSTE_INVENTARIO">Ajuste de Inventário</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
                disabled={selectedLocalizacaoObj?.bloqueadoParaInventario}
              >
                Confirmar Recebimento (RF008)
              </button>
            </form>
          ) : (
            <form onSubmit={handleSaidaSubmit} style={styles.formGrid}>
              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Produto *</label>
                  <select 
                    className="form-select"
                    value={selectedProdutoId}
                    onChange={(e) => setSelectedProdutoId(e.target.value)}
                    required
                  >
                    <option value="">Selecione o Produto...</option>
                    {produtos.map(p => (
                      <option key={p.id} value={p.id}>{p.codigoInterno} - {p.descricao}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Localização de Origem *</label>
                  <select 
                    className="form-select"
                    value={selectedLocalizacaoId}
                    onChange={(e) => setSelectedLocalizacaoId(e.target.value)}
                    required
                  >
                    <option value="">Selecione o Local...</option>
                    {localizacoes.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.fazenda} - {l.armazemGalpao || l.siloCurralTalhao}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedLocalizacaoObj?.bloqueadoParaInventario && (
                <div style={styles.dangerNotice}>
                  ⚠️ <strong>Bloqueio de Inventário (RN014):</strong> Esta localização está bloqueada temporariamente para contagem. Nenhuma movimentação é permitida!
                </div>
              )}

              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Quantidade de Consumo *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder={selectedProduto ? `Máx: ${totalDisponivel} ${selectedProduto.unidadeConsumo}` : 'Quantidade'}
                    value={quantidadeSaida}
                    onChange={(e) => setQuantidadeSaida(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Finalidade da Baixa</label>
                  <select 
                    className="form-select"
                    value={subTipoSaida}
                    onChange={(e) => setSubTipoSaida(e.target.value)}
                  >
                    <option value="CONSUMO_INTERNO">Consumo Interno</option>
                    <option value="PLANTIO_APLICACAO">Plantio / Aplicação de Insumos</option>
                    <option value="USO_VETERINARIO">Uso Veterinário</option>
                    <option value="VENDA">Faturamento / Venda</option>
                    <option value="PERDA_DESCARTE">Perda / Descarte</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Centro Custo / Safra *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={centroCustoSafra}
                  onChange={(e) => setCentroCustoSafra(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
                disabled={selectedLocalizacaoObj?.bloqueadoParaInventario}
              >
                Confirmar Baixa (RF009)
              </button>
            </form>
          )}
        </div>

        {/* Suggestion Panel */}
        <div className="card" style={styles.suggestionCard}>
          <h4 style={styles.panelTitle}>
            <Lightbulb size={16} color="var(--color-primary)" />
            Escoamento Recomendado
          </h4>

          {selectedProduto ? (
            <div style={styles.suggestionDetails}>
              <div style={styles.infoRow}>
                <span>Unicidade e Critério:</span>
                <strong style={{ color: 'var(--color-primary)' }}>
                  {selectedProdutoCat?.validadeObrigatoria ? 'FEFO (Vence Primeiro)' : 'FIFO (Entra Primeiro)'}
                </strong>
              </div>
              <div style={styles.infoRow}>
                <span>Saldo Físico Total:</span>
                <strong>{totalDisponivel} {selectedProduto.unidadeConsumo}</strong>
              </div>

              <div style={styles.suggestionBlock}>
                {suggestedLote ? (
                  <>
                    <div style={styles.suggestionBadge}>Lote Sugerido para Consumo</div>
                    <div style={styles.suggestedLoteBox}>
                      <div>Lote: <strong style={{ color: '#60a5fa' }}>{suggestedLote.lote.numeroLote}</strong></div>
                      <div>Validade: <strong>{suggestedLote.lote.dataValidade ? new Date(suggestedLote.lote.dataValidade).toLocaleDateString('pt-BR') : 'Sem data'}</strong></div>
                      <div>Quantidade: <strong>{suggestedLote.quantidade} {selectedProduto.unidadeConsumo}</strong></div>
                      <div>Custo Médio: <strong>R$ {suggestedLote.custoMedio.toFixed(4)}</strong></div>
                    </div>
                  </>
                ) : (
                  <div style={styles.emptyLotes}>
                    ⚠️ Sem saldos ou lotes ativos disponíveis no local selecionado.
                  </div>
                )}
              </div>

              {suggestions.length > 1 && (
                <div style={styles.otherLotes}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <Clock size={12} style={{ marginRight: '4px', display: 'inline' }} />
                    Fila de Lotes (Ordenado para Consumo):
                  </div>
                  <div style={styles.loteList}>
                    {suggestions.map((s, idx) => (
                      <div key={s.id} style={styles.loteItem}>
                        <span>#{idx + 1} - Lote: {s.lote.numeroLote} {s.lote.status === 'BLOQUEADO' ? '(BLOQUEADO)' : ''}</span>
                        <strong>{s.quantidade} {selectedProduto.unidadeConsumo}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>
              Selecione um produto para visualizar o escoamento FEFO/FIFO sugerido.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  tabHeader: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    gap: '20px',
    marginBottom: '10px',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    borderBottom: '3px solid transparent',
    padding: '12px 10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  },
  formTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '20px',
    color: 'var(--text-main)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px',
  },
  formGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
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
    marginBottom: '10px',
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
    marginBottom: '10px',
  },
  requirementsPanel: {
    fontSize: '0.8rem',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    padding: '10px',
    borderRadius: '6px',
    color: 'var(--text-muted)',
  },
  infoSpan: {
    fontSize: '0.75rem',
    color: 'var(--color-primary)',
    marginTop: '2px',
  },
  suggestionCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  panelTitle: {
    fontSize: '0.9rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px',
  },
  suggestionDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
  },
  suggestionBlock: {
    marginTop: '10px',
  },
  suggestionBadge: {
    fontSize: '0.7rem',
    fontWeight: 600,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: 'var(--color-primary)',
    padding: '4px 8px',
    borderRadius: '4px',
    display: 'inline-block',
    marginBottom: '6px',
  },
  suggestedLoteBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color-hover)',
    padding: '12px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '0.85rem',
  },
  emptyLotes: {
    fontSize: '0.8rem',
    color: 'var(--color-warning)',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    padding: '10px',
    borderRadius: '6px',
    borderLeft: '3px solid var(--color-warning)',
  },
  otherLotes: {
    marginTop: '10px',
  },
  loteList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxHeight: '120px',
    overflowY: 'auto',
  },
  loteItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    padding: '6px 8px',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
  },
  dangerNotice: {
    fontSize: '0.8rem',
    color: '#f87171',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    padding: '10px',
    borderRadius: '6px',
    borderLeft: '3px solid #ef4444',
    marginBottom: '10px',
    lineHeight: '1.4',
  }
};
