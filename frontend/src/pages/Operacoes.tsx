import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  ClipboardList, 
  Trash2, 
  Sprout, 
  Flame, 
  ShoppingCart, 
  SearchCode, 
  ShieldAlert, 
  Check, 
  X,
  FileCheck2,
  TreeDeciduous
} from 'lucide-react';

interface Localizacao {
  id: number;
  fazenda: string;
  armazemGalpao?: string;
  siloCurralTalhao?: string;
  areaCritica: boolean;
}

interface Produto {
  id: number;
  codigoInterno: string;
  descricao: string;
  categoria: { id: number };
  unidadeCompra: string;
  unidadeConsumo: string;
  fatorConversao: number;
}

interface Lote {
  id: number;
  numeroLote: string;
  produto: Produto;
}

interface SaldoEstoque {
  id: number;
  lote: Lote;
  localizacao: Localizacao;
  quantidade: number;
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
  status: string; // DESPACHADO, CONCLUIDO, DIVERGENCIA
}

interface Inventario {
  id: number;
  localizacao: Localizacao;
  responsavel: string;
  status: string; // ABERTO, CONCLUIDO
  dataAbertura: string;
  dataConclusao?: string;
}

interface PerdaEstoque {
  id: number;
  produto: Produto;
  lote: Lote;
  localizacao: Localizacao;
  quantidade: number;
  motivo: string;
  justificativa: string;
  status: string; // PENDENTE, APROVADO, REJEITADO
  usuarioSolicitante: string;
}

interface RecallResult {
  loteFinal: string;
  produtoFinal: string;
  dataProducao: string;
  insumosConsumidos: Array<{
    nomeInsumo: string;
    loteInsumo: string;
    fornecedorOriginal: string;
  }>;
  destinatariosLote: Array<{
    nomeCliente: string;
    dataVenda: string;
    quantidadeVendida: number;
  }>;
}

interface OperacoesProps {
  produtos: Produto[];
  localizacoes: Localizacao[];
  saldos: SaldoEstoque[];
  transferencias: Transferencia[];
  inventarios: Inventario[];
  perdas: PerdaEstoque[];
  onDespachar: (req: any) => Promise<void>;
  onReceber: (id: number, req: any) => Promise<void>;
  onAbrirInventario: (localizacaoId: number, responsavel: string) => Promise<void>;
  onConcluirInventario: (id: number, contagens: any[]) => Promise<void>;
  onRegistrarPerda: (req: any) => Promise<void>;
  onAprovarPerda: (id: number, usuario: string, role: string) => Promise<void>;
  onRejeitarPerda: (id: number, usuario: string, role: string) => Promise<void>;
  onAplicarAgricola: (req: any) => Promise<void>;
  onProduzir: (req: any) => Promise<void>;
  onFetchSugestaoCompra: (produtoId: number, req: any) => Promise<number>;
  onFetchRecall: (lote: string, produtoId: number) => Promise<RecallResult>;
  currentUser: string;
}

export const Operacoes: React.FC<OperacoesProps> = ({
  produtos,
  localizacoes,
  saldos,
  transferencias,
  inventarios,
  perdas,
  onDespachar,
  onReceber,
  onAbrirInventario,
  onConcluirInventario,
  onRegistrarPerda,
  onAprovarPerda,
  onRejeitarPerda,
  onAplicarAgricola,
  onProduzir,
  onFetchSugestaoCompra,
  onFetchRecall,
  currentUser
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'TRANSF' | 'INVENT' | 'PERDAS' | 'CAMPO' | 'PROD' | 'COMPRAS' | 'RECALL'>('TRANSF');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Transferencias State
  const [transfProdutoId, setTransfProdutoId] = useState('');
  const [transfLoteId, setTransfLoteId] = useState('');
  const [transfQtd, setTransfQtd] = useState('');
  const [transfOrigemId, setTransfOrigemId] = useState('');
  const [transfDestinoId, setTransfDestinoId] = useState('');
  const [transfTransportador, setTransfTransportador] = useState('');
  const [transfCentroCusto] = useState('SAFRA-2026');
  
  const [selectedTransfId, setSelectedTransfId] = useState('');
  const [recQtd, setRecQtd] = useState('');
  const [recDivergencia, setRecDivergencia] = useState('');

  // 2. Inventario State
  const [invLocalizacaoId, setInvLocalizacaoId] = useState('');
  const [invResponsavel, setInvResponsavel] = useState('');
  const [contagensFisicas, setContagensFisicas] = useState<Record<string, string>>({});

  // 3. Perdas State
  const [perdaProdutoId, setPerdaProdutoId] = useState('');
  const [perdaLoteId, setPerdaLoteId] = useState('');
  const [perdaLocalizacaoId, setPerdaLocalizacaoId] = useState('');
  const [perdaQtd, setPerdaQtd] = useState('');
  const [perdaMotivo, setPerdaMotivo] = useState('VENCIMENTO');
  const [perdaJustificativa, setPerdaJustificativa] = useState('');

  // 4. Aplicacao Agricola State
  const [agriTalhaoId, setAgriTalhaoId] = useState('');
  const [agriCultura, setAgriCultura] = useState('Milho');
  const [agriSafra] = useState('SAFRA-2026');
  const [agriArea, setAgriArea] = useState('');
  const [agriProdutoId, setAgriProdutoId] = useState('');
  const [agriQtd, setAgriQtd] = useState('');
  const [agriOperador, setAgriOperador] = useState('');
  const [agriMaquina, setAgriMaquina] = useState('');
  const [agriEngenheiro, setAgriEngenheiro] = useState('');
  const [agriReceituario, setAgriReceituario] = useState('');
  const [agriAssinaturaAtiva, setAgriAssinaturaAtiva] = useState(true);
  const [agriTemp, setAgriTemp] = useState('25');
  const [agriUmid, setAgriUmid] = useState('60');
  const [agriVento, setAgriVento] = useState('12');
  const [agriCarencia, setAgriCarencia] = useState('30');

  // 5. Producao Industrial State
  const [prodAcabadoId, setProdAcabadoId] = useState('');
  const [prodQtd, setProdQtd] = useState('');
  const [prodInsumosLocId, setProdInsumosLocId] = useState('');
  const [prodDestLocId, setProdDestLocId] = useState('');
  const [prodLoteNovo, setProdLoteNovo] = useState('');
  const [prodValidade, setProdValidade] = useState('');
  const [prodCentroCusto, setProdCentroCusto] = useState('SAFRA-2026');

  // 6. Compras State
  const [compraProdutoId, setCompraProdutoId] = useState('');
  const [compraPontoMin, setCompraPontoMin] = useState('100');
  const [compraConsumoMedio, setCompraConsumoMedio] = useState('10');
  const [compraLeadTime, setCompraLeadTime] = useState('7');
  const [compraPedidosAberto, setCompraPedidosAberto] = useState('0');
  const [compraSugestaoResult, setCompraSugestaoResult] = useState<number | null>(null);

  // 7. Recall State
  const [recallLote, setRecallLote] = useState('');
  const [recallProdutoId, setRecallProdutoId] = useState('');
  const [recallResult, setRecallResult] = useState<RecallResult | null>(null);

  const canManage = currentUser === 'ADMINISTRADOR' || currentUser === 'ALMOXARIFE';
  const canApprove = currentUser === 'ADMINISTRADOR' || currentUser === 'GERENTE';

  // Helpers
  const clearAlerts = () => { setErrorMsg(''); setSuccessMsg(''); };

  // Handlers
  const handleDespachar = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!transfProdutoId || !transfLoteId || !transfQtd || !transfOrigemId || !transfDestinoId || !transfTransportador) {
      setErrorMsg('Preencha todos os campos obrigatórios.');
      return;
    }
    try {
      await onDespachar({
        produtoId: parseInt(transfProdutoId),
        loteId: parseInt(transfLoteId),
        quantidade: parseFloat(transfQtd),
        localizacaoOrigemId: parseInt(transfOrigemId),
        localizacaoDestinoId: parseInt(transfDestinoId),
        transportador: transfTransportador,
        centroCustoSafra: transfCentroCusto
      });
      setSuccessMsg('Transferência despachada! O estoque está sob status Em Trânsito.');
      setTransfQtd('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao despachar.');
    }
  };

  const handleReceber = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!selectedTransfId || !recQtd) {
      setErrorMsg('Selecione uma transferência e informe a quantidade recebida.');
      return;
    }
    try {
      await onReceber(parseInt(selectedTransfId), {
        quantidadeRecebida: parseFloat(recQtd),
        justificativaDivergencia: recDivergencia || null,
        centroCustoSafra: 'SAFRA-2026'
      });
      setSuccessMsg('Recebimento confirmado no destino.');
      setSelectedTransfId('');
      setRecQtd('');
      setRecDivergencia('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao confirmar recebimento.');
    }
  };

  const handleAbrirInventario = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!invLocalizacaoId || !invResponsavel) return;
    try {
      await onAbrirInventario(parseInt(invLocalizacaoId), invResponsavel);
      setSuccessMsg('Inventário aberto. Esta localização foi congelada temporariamente para movimentações.');
      setInvResponsavel('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao abrir inventário.');
    }
  };

  const handleConcluirInventario = async (invId: number) => {
    clearAlerts();
    const contagens = Object.keys(contagensFisicas).map((key) => {
      const parts = key.split('_'); // format: prodId_loteId_locId
      return {
        produtoId: parseInt(parts[0]),
        localizacaoId: parseInt(parts[2]),
        numeroLote: parts[1] === 'null' ? null : parts[1],
        quantidadeContada: parseFloat(contagensFisicas[key]) || 0.0
      };
    });

    try {
      await onConcluirInventario(invId, contagens);
      setSuccessMsg('Inventário fechado com sucesso! Saldos ajustados e desbloqueados.');
      setContagensFisicas({});
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao fechar inventário.');
    }
  };

  const handleRegistrarPerda = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!perdaProdutoId || !perdaLoteId || !perdaLocalizacaoId || !perdaQtd || !perdaJustificativa) {
      setErrorMsg('Preencha os campos obrigatórios.');
      return;
    }
    try {
      await onRegistrarPerda({
        produtoId: parseInt(perdaProdutoId),
        loteId: parseInt(perdaLoteId),
        localizacaoId: parseInt(perdaLocalizacaoId),
        quantidade: parseFloat(perdaQtd),
        motivo: perdaMotivo,
        justificativa: perdaJustificativa
      });
      setSuccessMsg('Perda registrada! Se o valor for acima da alçada, aguardará aprovação do Gerente.');
      setPerdaQtd('');
      setPerdaJustificativa('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao registrar perda.');
    }
  };

  const handleAplicarAgricola = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!agriTalhaoId || !agriProdutoId || !agriQtd || !agriEngenheiro || !agriReceituario) {
      setErrorMsg('Preencha todos os campos.');
      return;
    }
    try {
      await onAplicarAgricola({
        talhaoId: parseInt(agriTalhaoId),
        cultura: agriCultura,
        safra: agriSafra,
        areaTratadaHa: parseFloat(agriArea),
        produtoId: parseInt(agriProdutoId),
        quantidadeConsumida: parseFloat(agriQtd),
        operador: agriOperador,
        maquina: agriMaquina,
        engenheiro: agriEngenheiro,
        receituario: agriReceituario,
        engenheiroAssinaturaAtiva: agriAssinaturaAtiva,
        temperatura: parseFloat(agriTemp),
        umidade: parseFloat(agriUmid),
        velocidadeVento: parseFloat(agriVento),
        diasCarenciaDefensivo: parseInt(agriCarencia)
      });
      setSuccessMsg('Aplicação registrada com sucesso! Baixa no estoque consolidada.');
      setAgriQtd('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro no registro de aplicação.');
    }
  };

  const handleProduzir = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!prodAcabadoId || !prodQtd || !prodInsumosLocId || !prodDestLocId || !prodLoteNovo || !prodValidade) {
      setErrorMsg('Preencha os campos obrigatórios.');
      return;
    }
    try {
      await onProduzir({
        produtoAcabadoId: parseInt(prodAcabadoId),
        quantidadeProduzir: parseFloat(prodQtd),
        localizacaoInsumosId: parseInt(prodInsumosLocId),
        localizacaoDestinoId: parseInt(prodDestLocId),
        numeroLoteNovo: prodLoteNovo,
        validadeNova: prodValidade,
        centroCustoSafra: prodCentroCusto
      });
      setSuccessMsg('Produção finalizada! Insumos consumidos por explosão de materiais e novo lote estocado.');
      setProdQtd('');
      setProdLoteNovo('');
      setProdValidade('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao registrar produção.');
    }
  };

  const handleCalcularSugestao = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!compraProdutoId) return;
    try {
      const res = await onFetchSugestaoCompra(parseInt(compraProdutoId), {
        pontoRessuprimentoMinimo: parseFloat(compraPontoMin),
        consumoMedioDiario: parseFloat(compraConsumoMedio),
        leadTimeFornecedorDias: parseInt(compraLeadTime),
        pedidosEmAbertoNaoEntregues: parseFloat(compraPedidosAberto)
      });
      setCompraSugestaoResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao calcular sugestão.');
    }
  };

  const handleRecallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!recallLote || !recallProdutoId) return;
    try {
      const res = await onFetchRecall(recallLote, parseInt(recallProdutoId));
      setRecallResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro na consulta do recall.');
      setRecallResult(null);
    }
  };

  return (
    <div style={styles.container}>
      {/* Sub Tabs Operations */}
      <div style={styles.subTabHeader}>
        <button onClick={() => { setActiveSubTab('TRANSF'); clearAlerts(); }} style={{...styles.subTabBtn, borderBottomColor: activeSubTab==='TRANSF'?'var(--color-primary)':'transparent', color: activeSubTab==='TRANSF'?'var(--color-primary)':'var(--text-muted)'}}><ArrowLeftRight size={14} /> Transferências</button>
        <button onClick={() => { setActiveSubTab('INVENT'); clearAlerts(); }} style={{...styles.subTabBtn, borderBottomColor: activeSubTab==='INVENT'?'var(--color-primary)':'transparent', color: activeSubTab==='INVENT'?'var(--color-primary)':'var(--text-muted)'}}><ClipboardList size={14} /> Inventário Físico</button>
        <button onClick={() => { setActiveSubTab('PERDAS'); clearAlerts(); }} style={{...styles.subTabBtn, borderBottomColor: activeSubTab==='PERDAS'?'var(--color-primary)':'transparent', color: activeSubTab==='PERDAS'?'var(--color-primary)':'var(--text-muted)'}}><Trash2 size={14} /> Perdas & Alçadas</button>
        <button onClick={() => { setActiveSubTab('CAMPO'); clearAlerts(); }} style={{...styles.subTabBtn, borderBottomColor: activeSubTab==='CAMPO'?'var(--color-primary)':'transparent', color: activeSubTab==='CAMPO'?'var(--color-primary)':'var(--text-muted)'}}><Sprout size={14} /> Aplicação Agrícola</button>
        <button onClick={() => { setActiveSubTab('PROD'); clearAlerts(); }} style={{...styles.subTabBtn, borderBottomColor: activeSubTab==='PROD'?'var(--color-primary)':'transparent', color: activeSubTab==='PROD'?'var(--color-primary)':'var(--text-muted)'}}><Flame size={14} /> Fábrica de Ração</button>
        <button onClick={() => { setActiveSubTab('COMPRAS'); clearAlerts(); }} style={{...styles.subTabBtn, borderBottomColor: activeSubTab==='COMPRAS'?'var(--color-primary)':'transparent', color: activeSubTab==='COMPRAS'?'var(--color-primary)':'var(--text-muted)'}}><ShoppingCart size={14} /> Sugestão Compra</button>
        <button onClick={() => { setActiveSubTab('RECALL'); clearAlerts(); }} style={{...styles.subTabBtn, borderBottomColor: activeSubTab==='RECALL'?'var(--color-primary)':'transparent', color: activeSubTab==='RECALL'?'var(--color-primary)':'var(--text-muted)'}}><SearchCode size={14} /> Rastreabilidade (Recall)</button>
      </div>

      {errorMsg && (
        <div style={styles.errorAlert}>
          <ShieldAlert size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div style={styles.successAlert}>
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. TRANSFERÊNCIAS VIEW */}
      {activeSubTab === 'TRANSF' && (
        <div style={styles.tabContent}>
          <div className="grid grid-cols-2">
            {/* Dispatch Form */}
            <div className="card">
              <h4 style={styles.subTitle}>1. Despachar Carga (Etapa 1 - Origem)</h4>
              <form onSubmit={handleDespachar} style={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Produto *</label>
                  <select className="form-select" value={transfProdutoId} onChange={(e)=>setTransfProdutoId(e.target.value)} required>
                    <option value="">Selecione...</option>
                    {produtos.map(p => <option key={p.id} value={p.id}>{p.codigoInterno} - {p.descricao}</option>)}
                  </select>
                </div>
                <div style={styles.formRow}>
                  <div className="form-group" style={{flex:1}}>
                    <label className="form-label">Lote *</label>
                    <select className="form-select" value={transfLoteId} onChange={(e)=>setTransfLoteId(e.target.value)} required>
                      <option value="">Selecione...</option>
                      {saldos.filter(s => s.lote.produto.id === parseInt(transfProdutoId)).map(s => (
                        <option key={s.lote.id} value={s.lote.id}>Lote: {s.lote.numeroLote} (Saldo: {s.quantidade})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{flex:1}}>
                    <label className="form-label">Quantidade *</label>
                    <input type="number" className="form-input" value={transfQtd} onChange={(e)=>setTransfQtd(e.target.value)} required />
                  </div>
                </div>
                <div style={styles.formRow}>
                  <div className="form-group" style={{flex:1}}>
                    <label className="form-label">Origem *</label>
                    <select className="form-select" value={transfOrigemId} onChange={(e)=>setTransfOrigemId(e.target.value)} required>
                      <option value="">Selecione...</option>
                      {localizacoes.map(l => <option key={l.id} value={l.id}>{l.fazenda} - {l.armazemGalpao || l.siloCurralTalhao}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{flex:1}}>
                    <label className="form-label">Destino *</label>
                    <select className="form-select" value={transfDestinoId} onChange={(e)=>setTransfDestinoId(e.target.value)} required>
                      <option value="">Selecione...</option>
                      {localizacoes.map(l => <option key={l.id} value={l.id}>{l.fazenda} - {l.armazemGalpao || l.siloCurralTalhao}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Transportador / Motorista *</label>
                  <input type="text" className="form-input" placeholder="Ex: Transportadora Sol Nascente" value={transfTransportador} onChange={(e)=>setTransfTransportador(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={!canManage}>Despachar Carga</button>
              </form>
            </div>

            {/* Receipt Form */}
            <div className="card">
              <h4 style={styles.subTitle}>2. Confirmar Recebimento (Etapa 2 - Destino)</h4>
              <form onSubmit={handleReceber} style={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Cargas Pendentes em Trânsito *</label>
                  <select className="form-select" value={selectedTransfId} onChange={(e)=>setSelectedTransfId(e.target.value)} required>
                    <option value="">Selecione a Carga...</option>
                    {transferencias.filter(t=>t.status==='DESPACHADO' || t.status==='TRANSITO').map(t=>(
                      <option key={t.id} value={t.id}>
                        Ref #{t.id}: {t.produto.descricao} ({t.quantidadeDespachada} unid) → {t.localizacaoDestino.fazenda} ({t.transportador})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Qtd Efetivamente Recebida *</label>
                  <input type="number" className="form-input" placeholder="Conferência física" value={recQtd} onChange={(e)=>setRecQtd(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Justificativa para Divergência (Quebras/Vazamentos em Trânsito)</label>
                  <textarea className="form-textarea" placeholder="Obrigatório se a quantidade recebida for menor que a despachada" value={recDivergencia} onChange={(e)=>setRecDivergencia(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{backgroundColor:'var(--color-secondary)'}} disabled={!canManage}>Confirmar Entrada</button>
              </form>
            </div>
          </div>

          {/* List of transfers */}
          <div className="table-container" style={{marginTop:'20px'}}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ref ID</th>
                  <th>Produto</th>
                  <th>Lote</th>
                  <th>Origem → Destino</th>
                  <th>Qtd Despachada</th>
                  <th>Qtd Recebida</th>
                  <th>Transportador</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transferencias.map(t => (
                  <tr key={t.id}>
                    <td>#{t.id}</td>
                    <td>{t.produto.codigoInterno}</td>
                    <td>{t.lote.numeroLote}</td>
                    <td>{t.localizacaoOrigem.armazemGalpao || t.localizacaoOrigem.siloCurralTalhao} → {t.localizacaoDestino.armazemGalpao || t.localizacaoDestino.siloCurralTalhao}</td>
                    <td>{t.quantidadeDespachada}</td>
                    <td>{t.quantidadeRecebida !== null ? t.quantidadeRecebida : '-'}</td>
                    <td>{t.transportador}</td>
                    <td>
                      <span className={`badge ${t.status==='CONCLUIDO'?'badge-success':t.status==='DIVERGENCIA'?'badge-danger':'badge-warning'}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. INVENTÁRIO VIEW */}
      {activeSubTab === 'INVENT' && (
        <div style={styles.tabContent}>
          <div className="grid grid-cols-2">
            {/* Open Inventario */}
            <div className="card">
              <h4 style={styles.subTitle}>Abrir Ordem de Inventário (RF011)</h4>
              <form onSubmit={handleAbrirInventario} style={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Localização Física *</label>
                  <select className="form-select" value={invLocalizacaoId} onChange={(e)=>setInvLocalizacaoId(e.target.value)} required>
                    <option value="">Selecione...</option>
                    {localizacoes.map(l => <option key={l.id} value={l.id}>{l.fazenda} - {l.armazemGalpao || l.siloCurralTalhao}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Operador Responsável pela Contagem *</label>
                  <input type="text" className="form-input" placeholder="Nome do Responsável" value={invResponsavel} onChange={(e)=>setInvResponsavel(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={!canManage}>Abrir Inventário</button>
              </form>
            </div>

            {/* List and Conclude */}
            <div className="card">
              <h4 style={styles.subTitle}>Inventários em Aberto (Lançar Contagens)</h4>
              {inventarios.filter(i=>i.status==='ABERTO').map(i => {
                const locSaldos = saldos.filter(s => s.localizacao.id === i.localizacao.id);
                return (
                  <div key={i.id} style={styles.inventoryBlock}>
                    <div style={styles.inventoryHeader}>
                      <span>Inventário #{i.id} - {i.localizacao.fazenda} ({i.localizacao.armazemGalpao || i.localizacao.siloCurralTalhao})</span>
                      <span className="badge badge-warning">ABERTO</span>
                    </div>

                    <div style={styles.contagemGrid}>
                      {locSaldos.map(s => {
                        const key = `${s.lote.produto.id}_${s.lote.numeroLote}_${s.localizacao.id}`;
                        return (
                          <div key={s.id} style={styles.contagemRow}>
                            <span>{s.lote.produto.descricao} (Lote: {s.lote.numeroLote})</span>
                            <input 
                              type="number" 
                              className="form-input" 
                              placeholder={`Saldo logístico: ${s.quantidade}`}
                              value={contagensFisicas[key] || ''}
                              onChange={(e) => {
                                setContagensFisicas({
                                  ...contagensFisicas,
                                  [key]: e.target.value
                                });
                              }}
                              style={{ width: '130px', padding: '4px 8px', fontSize: '0.8rem' }}
                            />
                          </div>
                        );
                      })}
                      {locSaldos.length === 0 && <p style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>Nenhum produto estocado nesta localização logística.</p>}
                    </div>

                    <button 
                      onClick={() => handleConcluirInventario(i.id)} 
                      className="btn btn-primary" 
                      style={{ marginTop: '12px', width: '100%', backgroundColor: 'var(--color-primary-hover)' }}
                      disabled={!canManage}
                    >
                      Concluir Contagem & Ajustar Saldos
                    </button>
                  </div>
                );
              })}
              {inventarios.filter(i=>i.status==='ABERTO').length === 0 && (
                <p style={{fontSize:'0.85rem', color:'var(--text-muted)', textAlign:'center', padding:'40px 0'}}>Nenhuma ordem de inventário ativa no momento.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. PERDAS VIEW */}
      {activeSubTab === 'PERDAS' && (
        <div style={styles.tabContent}>
          <div className="grid grid-cols-2">
            {/* Register Loss Form */}
            <div className="card">
              <h4 style={styles.subTitle}>Registrar Quebra / Descarte de Estoque (RF012)</h4>
              <form onSubmit={handleRegistrarPerda} style={styles.formGrid}>
                <div style={styles.formRow}>
                  <div className="form-group" style={{flex:1}}>
                    <label className="form-label">Produto *</label>
                    <select className="form-select" value={perdaProdutoId} onChange={(e)=>setPerdaProdutoId(e.target.value)} required>
                      <option value="">Selecione...</option>
                      {produtos.map(p => <option key={p.id} value={p.id}>{p.codigoInterno} - {p.descricao}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{flex:1}}>
                    <label className="form-label">Localização *</label>
                    <select className="form-select" value={perdaLocalizacaoId} onChange={(e)=>setPerdaLocalizacaoId(e.target.value)} required>
                      <option value="">Selecione...</option>
                      {localizacoes.map(l => <option key={l.id} value={l.id}>{l.fazenda} - {l.armazemGalpao || l.siloCurralTalhao}</option>)}
                    </select>
                  </div>
                </div>
                <div style={styles.formRow}>
                  <div className="form-group" style={{flex:1}}>
                    <label className="form-label">Lote *</label>
                    <select className="form-select" value={perdaLoteId} onChange={(e)=>setPerdaLoteId(e.target.value)} required>
                      <option value="">Selecione...</option>
                      {saldos.filter(s => s.lote.produto.id === parseInt(perdaProdutoId) && s.localizacao.id === parseInt(perdaLocalizacaoId)).map(s => (
                        <option key={s.lote.id} value={s.lote.id}>Lote: {s.lote.numeroLote} (Qtd: {s.quantidade})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{flex:1}}>
                    <label className="form-label">Qtd Quebrada *</label>
                    <input type="number" className="form-input" value={perdaQtd} onChange={(e)=>setPerdaQtd(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Motivo do Ajuste *</label>
                  <select className="form-select" value={perdaMotivo} onChange={(e)=>setPerdaMotivo(e.target.value)}>
                    <option value="VENCIMENTO">Vencimento do Prazo de Validade</option>
                    <option value="MOFO_UMIDADE">Mofo / Umidade Excessiva</option>
                    <option value="ROUBO_FURTO">Roubo ou Furto Declarado</option>
                    <option value="ACIDENTE_MANEJO">Acidente de Manejo / Vazamento</option>
                    <option value="QUARENTENA_DESCARTE">Descarte Sanitário / Carência</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Justificativa Detalhada * (Exigida para Auditoria)</label>
                  <textarea className="form-textarea" placeholder="Justificativa legal para auditoria..." value={perdaJustificativa} onChange={(e)=>setPerdaJustificativa(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={currentUser==='AUDITOR'}>Registrar Ocorrência</button>
              </form>
            </div>

            {/* Gerente Approvals Dashboard */}
            <div className="card">
              <h4 style={styles.subTitle}>
                Painel de Alçadas de Aprovação de Perdas
              </h4>
              <div style={styles.approvalList}>
                {perdas.filter(p=>p.status==='PENDENTE').map(p => (
                  <div key={p.id} style={styles.approvalItem}>
                    <div>
                      <div style={{fontWeight:600}}>{p.produto.descricao} (Lote: {p.lote.numeroLote})</div>
                      <div style={{fontSize:'0.8rem', color:'var(--text-muted)', marginTop:'4px'}}>
                        Qtd: <strong style={{color:'#fff'}}>{p.quantidade}</strong> | Motivo: <strong>{p.motivo}</strong> | Solicitante: <strong>{p.usuarioSolicitante}</strong>
                      </div>
                      <div style={styles.justifBlock}>"{p.justificativa}"</div>
                    </div>
                    {canApprove ? (
                      <div style={styles.actionRow}>
                        <button onClick={()=>onAprovarPerda(p.id, currentUser, currentUser)} className="btn btn-primary" style={{padding:'6px 12px', fontSize:'0.75rem'}}><Check size={14} /> Aprovar</button>
                        <button onClick={()=>onRejeitarPerda(p.id, currentUser, currentUser)} className="btn btn-danger" style={{padding:'6px 12px', fontSize:'0.75rem'}}><X size={14} /> Rejeitar</button>
                      </div>
                    ) : (
                      <div style={styles.noPermAlert}>⚠️ Apenas perfis GERENTE ou ADMINISTRADOR possuem alçada para liberar esse ajuste.</div>
                    )}
                  </div>
                ))}
                {perdas.filter(p=>p.status==='PENDENTE').length === 0 && (
                  <p style={{fontSize:'0.85rem', color:'var(--text-muted)', textAlign:'center', padding:'40px 0'}}>Nenhuma quebra aguardando liberação eletrônica.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. APLICAÇÃO AGRÍCOLA VIEW */}
      {activeSubTab === 'CAMPO' && (
        <div style={styles.tabContent} className="card">
          <h4 style={styles.subTitle}><Sprout size={18} color="var(--color-primary)" style={{marginRight:'8px', display:'inline'}} />Registrar Aplicação de Defensivos nos Talhões (RF013)</h4>
          <form onSubmit={handleAplicarAgricola} style={styles.formGrid}>
            <div style={styles.formRow}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Talhão de Destino *</label>
                <select className="form-select" value={agriTalhaoId} onChange={(e)=>setAgriTalhaoId(e.target.value)} required>
                  <option value="">Selecione...</option>
                  {localizacoes.filter(l=>l.siloCurralTalhao !== null).map(l => (
                    <option key={l.id} value={l.id}>{l.fazenda} - {l.siloCurralTalhao} {l.areaCritica?'(Crítico/Isolado)':''}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Defensivo / Insumo Consumido *</label>
                <select className="form-select" value={agriProdutoId} onChange={(e)=>setAgriProdutoId(e.target.value)} required>
                  <option value="">Selecione...</option>
                  {produtos.map(p => <option key={p.id} value={p.id}>{p.codigoInterno} - {p.descricao}</option>)}
                </select>
              </div>
            </div>

            <div style={styles.formRow}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Cultura Agrícola (Ex: Milho, Soja)</label>
                <input type="text" className="form-input" value={agriCultura} onChange={(e)=>setAgriCultura(e.target.value)} />
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Área Tratada (Hectares) *</label>
                <input type="number" step="any" className="form-input" placeholder="Ex: 50.5" value={agriArea} onChange={(e)=>setAgriArea(e.target.value)} required />
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Quantidade Consumida *</label>
                <input type="number" step="any" className="form-input" value={agriQtd} onChange={(e)=>setAgriQtd(e.target.value)} required />
              </div>
            </div>

            <div style={styles.formRow}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Operador da Máquina *</label>
                <input type="text" className="form-input" value={agriOperador} onChange={(e)=>setAgriOperador(e.target.value)} required />
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Máquina / Trator Utilizado</label>
                <input type="text" className="form-input" placeholder="Ex: Trator John Deere" value={agriMaquina} onChange={(e)=>setAgriMaquina(e.target.value)} />
              </div>
            </div>

            <div style={styles.formRow}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Engenheiro Agrônomo Responsável *</label>
                <input type="text" className="form-input" value={agriEngenheiro} onChange={(e)=>setAgriEngenheiro(e.target.value)} required />
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Número do Receituário Agronômico * (Exigência Legal)</label>
                <input type="text" className="form-input" value={agriReceituario} onChange={(e)=>setAgriReceituario(e.target.value)} required />
              </div>
              <div className="form-group" style={{flex:1, justifyContent:'center'}}>
                <label className="form-label" style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', marginTop:'18px'}}>
                  <input type="checkbox" checked={agriAssinaturaAtiva} onChange={(e)=>setAgriAssinaturaAtiva(e.target.checked)} />
                  Assinatura CREA Ativa
                </label>
              </div>
            </div>

            {/* Weather safety features */}
            <div style={styles.weatherPanel}>
              <div style={{fontWeight:600, fontSize:'0.85rem', marginBottom:'10px'}}>Condições Meteorológicas de Segurança (Evitar Deriva Agrícola)</div>
              <div style={styles.formRow}>
                <div className="form-group" style={{flex:1}}>
                  <label className="form-label">Temperatura (°C)</label>
                  <input type="number" className="form-input" value={agriTemp} onChange={(e)=>setAgriTemp(e.target.value)} />
                </div>
                <div className="form-group" style={{flex:1}}>
                  <label className="form-label">Umidade Relativa (%)</label>
                  <input type="number" className="form-input" value={agriUmid} onChange={(e)=>setAgriUmid(e.target.value)} />
                </div>
                <div className="form-group" style={{flex:1}}>
                  <label className="form-label">Velocidade Vento (km/h)</label>
                  <input type="number" className="form-input" value={agriVento} onChange={(e)=>setAgriVento(e.target.value)} />
                </div>
                <div className="form-group" style={{flex:1}}>
                  <label className="form-label">Carência do Defensivo (Dias)</label>
                  <input type="number" className="form-input" value={agriCarencia} onChange={(e)=>setAgriCarencia(e.target.value)} />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{width:'100%', marginTop:'10px'}} disabled={currentUser==='AUDITOR'}>Registrar Ordem de Aplicação Agrícola</button>
          </form>
        </div>
      )}

      {/* 5. PRODUÇÃO INDUSTIAL VIEW */}
      {activeSubTab === 'PROD' && (
        <div style={styles.tabContent} className="card">
          <h4 style={styles.subTitle}>Ordem de Produção de Ração / Explosão de Matérias-Primas (RF014)</h4>
          <form onSubmit={handleProduzir} style={styles.formGrid}>
            <div style={styles.formRow}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Produto Acabado a Produzir * (Ex: Ração)</label>
                <select className="form-select" value={prodAcabadoId} onChange={(e)=>setProdAcabadoId(e.target.value)} required>
                  <option value="">Selecione...</option>
                  {produtos.map(p => <option key={p.id} value={p.id}>{p.descricao}</option>)}
                </select>
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Quantidade de Produção (Toneladas) *</label>
                <input type="number" step="any" className="form-input" value={prodQtd} onChange={(e)=>setProdQtd(e.target.value)} required />
              </div>
            </div>

            <div style={styles.formRow}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Localização Origem dos Insumos *</label>
                <select className="form-select" value={prodInsumosLocId} onChange={(e)=>setProdInsumosLocId(e.target.value)} required>
                  <option value="">Selecione...</option>
                  {localizacoes.map(l => <option key={l.id} value={l.id}>{l.fazenda} - {l.armazemGalpao || l.siloCurralTalhao}</option>)}
                </select>
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Localização Destino do Acabado *</label>
                <select className="form-select" value={prodDestLocId} onChange={(e)=>setProdDestLocId(e.target.value)} required>
                  <option value="">Selecione...</option>
                  {localizacoes.map(l => <option key={l.id} value={l.id}>{l.fazenda} - {l.armazemGalpao || l.siloCurralTalhao}</option>)}
                </select>
              </div>
            </div>

            <div style={styles.formRow}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Número do Lote Novo *</label>
                <input type="text" className="form-input" placeholder="Ex: LOT-RACAO-A" value={prodLoteNovo} onChange={(e)=>setProdLoteNovo(e.target.value)} required />
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Data de Validade Nova *</label>
                <input type="date" className="form-input" value={prodValidade} onChange={(e)=>setProdValidade(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Centro Custo / Safra</label>
              <input type="text" className="form-input" value={prodCentroCusto} onChange={(e)=>setProdCentroCusto(e.target.value)} />
            </div>

            <button type="submit" className="btn btn-primary" style={{width:'100%', marginTop:'10px'}} disabled={!canManage}>Iniciar Formulação e Estocagem</button>
          </form>
        </div>
      )}

      {/* 6. SUGESTÃO DE COMPRA VIEW */}
      {activeSubTab === 'COMPRAS' && (
        <div style={styles.tabContent} className="grid grid-cols-2">
          {/* Inputs */}
          <div className="card">
            <h4 style={styles.subTitle}>Simulador de Reposição de Estoque Inteligente (RF015)</h4>
            <form onSubmit={handleCalcularSugestao} style={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Produto *</label>
                <select className="form-select" value={compraProdutoId} onChange={(e)=>setCompraProdutoId(e.target.value)} required>
                  <option value="">Selecione...</option>
                  {produtos.map(p => <option key={p.id} value={p.id}>{p.codigoInterno} - {p.descricao}</option>)}
                </select>
              </div>
              <div style={styles.formRow}>
                <div className="form-group" style={{flex:1}}>
                  <label className="form-label">Ponto de Ressuprimento (Mínimo)</label>
                  <input type="number" className="form-input" value={compraPontoMin} onChange={(e)=>setCompraPontoMin(e.target.value)} />
                </div>
                <div className="form-group" style={{flex:1}}>
                  <label className="form-label">Consumo Médio Diário</label>
                  <input type="number" className="form-input" value={compraConsumoMedio} onChange={(e)=>setCompraConsumoMedio(e.target.value)} />
                </div>
              </div>
              <div style={styles.formRow}>
                <div className="form-group" style={{flex:1}}>
                  <label className="form-label">Lead Time Fornecedor (Dias)</label>
                  <input type="number" className="form-input" value={compraLeadTime} onChange={(e)=>setCompraLeadTime(e.target.value)} />
                </div>
                <div className="form-group" style={{flex:1}}>
                  <label className="form-label">Pedidos em Aberto (Já emitidos)</label>
                  <input type="number" className="form-input" value={compraPedidosAberto} onChange={(e)=>setCompraPedidosAberto(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{backgroundColor:'var(--color-primary)'}}>Calcular Lote Econômico</button>
            </form>
          </div>

          {/* Results Output */}
          <div className="card" style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center'}}>
            <ShoppingCart size={48} color="var(--color-primary)" style={{marginBottom:'16px'}} />
            <h4 style={{fontSize:'1.1rem', fontWeight:600, marginBottom:'8px'}}>Quantidade Sugerida para Reposição</h4>
            {compraSugestaoResult !== null ? (
              <div>
                <span style={{fontSize:'3rem', fontWeight:700, color:'var(--color-primary)'}}>{compraSugestaoResult.toFixed(2)}</span>
                <p style={{fontSize:'0.85rem', color:'var(--text-muted)', marginTop:'8px'}}>unidades base calculadas de acordo com ponto de ressuprimento e pedidos em aberto.</p>
              </div>
            ) : (
              <p style={{fontSize:'0.85rem', color:'var(--text-muted)'}}>Preencha os dados e execute o cálculo de lote mínimo de segurança.</p>
            )}
          </div>
        </div>
      )}

      {/* 7. RECALL VIEW */}
      {activeSubTab === 'RECALL' && (
        <div style={styles.tabContent} className="card">
          <h4 style={styles.subTitle}><FileCheck2 size={18} color="var(--color-primary)" style={{marginRight:'8px', display:'inline'}} />Rastreabilidade Reversa de Lotes (Recall Sanitário - RF016)</h4>
          <form onSubmit={handleRecallSubmit} style={styles.formGrid}>
            <div style={styles.formRow}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Produto Final Comercializado *</label>
                <select className="form-select" value={recallProdutoId} onChange={(e)=>setRecallProdutoId(e.target.value)} required>
                  <option value="">Selecione...</option>
                  {produtos.map(p => <option key={p.id} value={p.id}>{p.codigoInterno} - {p.descricao}</option>)}
                </select>
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Número do Lote Final do Produto *</label>
                <input type="text" className="form-input" placeholder="Digite o Lote..." value={recallLote} onChange={(e)=>setRecallLote(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{width:'100%'}}><TreeDeciduous size={16} /> Rastrear Árvore Reversa</button>
          </form>

          {/* Traceability tree visualization */}
          {recallResult && (
            <div style={styles.recallResultContainer}>
              <h5 style={{fontWeight:600, fontSize:'0.95rem', borderBottom:'1px solid var(--border-color)', paddingBottom:'10px', display:'flex', alignItems:'center', gap:'8px'}}>
                🌲 Árvore de Rastreabilidade Reversa: Lote {recallResult.loteFinal}
              </h5>

              <div style={styles.treeGrid}>
                {/* Node 1: Finished Product */}
                <div style={styles.treeNode}>
                  <div style={styles.nodeTitle}>📦 Produto Acabado</div>
                  <div style={styles.nodeBody}>
                    <div>Nome: <strong>{recallResult.produtoFinal}</strong></div>
                    <div>Lote: <strong style={{color:'#60a5fa'}}>{recallResult.loteFinal}</strong></div>
                    <div>Produzido em: <strong>{new Date(recallResult.dataProducao).toLocaleDateString('pt-BR')}</strong></div>
                  </div>
                </div>

                <div style={styles.treeArrow}>↓</div>

                {/* Node 2: Consumed Inputs */}
                <div style={styles.treeNode}>
                  <div style={styles.nodeTitle}>🧬 Matérias-Primas & Insumos Utilizados</div>
                  <div style={styles.nodeBody}>
                    <table className="custom-table" style={{fontSize:'0.8rem'}}>
                      <thead>
                        <tr>
                          <th>Insumo</th>
                          <th>Lote Consumido</th>
                          <th>Fornecedor Original</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recallResult.insumosConsumidos.map((ins, idx) => (
                          <tr key={idx}>
                            <td>{ins.nomeInsumo}</td>
                            <td><strong style={{color:'var(--color-primary)'}}>{ins.loteInsumo}</strong></td>
                            <td>{ins.fornecedorOriginal || 'Criptografado (LGPD)'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={styles.treeArrow}>↓</div>

                {/* Node 3: Recipients (Clientes) */}
                <div style={styles.treeNode}>
                  <div style={styles.nodeTitle}>🚚 Destinatários (Escoamento / Recall Target)</div>
                  <div style={styles.nodeBody}>
                    {recallResult.destinatariosLote.length === 0 ? (
                      <p style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>Este lote ainda está estocado e não foi faturado ou transferido para clientes/fazendas externas.</p>
                    ) : (
                      <table className="custom-table" style={{fontSize:'0.8rem'}}>
                        <thead>
                          <tr>
                            <th>Cliente / Fazenda Destino</th>
                            <th>Data do Faturamento</th>
                            <th>Qtd Vendida</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recallResult.destinatariosLote.map((dest, idx) => (
                            <tr key={idx}>
                              <td>{dest.nomeCliente}</td>
                              <td>{new Date(dest.dataVenda).toLocaleDateString('pt-BR')}</td>
                              <td><strong>{dest.quantidadeVendida}</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
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
  subTabHeader: {
    display: 'flex',
    gap: '10px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '2px',
    overflowX: 'auto',
  },
  subTabBtn: {
    background: 'none',
    border: 'none',
    borderBottom: '3.5px solid transparent',
    padding: '10px 14px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '0.82rem',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  subTitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    marginBottom: '16px',
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
  inventoryBlock: {
    border: '1px solid var(--border-color-hover)',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  inventoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    fontWeight: 600,
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '8px',
    marginBottom: '12px',
  },
  contagemGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  contagemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.8rem',
  },
  approvalList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  approvalItem: {
    padding: '14px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'rgba(255,255,255,0.01)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
  },
  justifBlock: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
    marginTop: '6px',
  },
  actionRow: {
    display: 'flex',
    gap: '8px',
  },
  noPermAlert: {
    fontSize: '0.75rem',
    color: 'var(--color-warning)',
    maxWidth: '200px',
    lineHeight: '1.3',
  },
  weatherPanel: {
    backgroundColor: 'rgba(255,255,255,0.01)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '12px 14px',
    marginTop: '8px',
  },
  recallResultContainer: {
    marginTop: '20px',
    backgroundColor: 'rgba(255,255,255,0.01)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '16px',
  },
  treeGrid: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    marginTop: '16px',
  },
  treeNode: {
    width: '100%',
    maxWidth: '550px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'rgba(0,0,0,0.15)',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  nodeTitle: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderBottom: '1px solid var(--border-color)',
    padding: '8px 12px',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--color-primary)',
    textTransform: 'uppercase',
  },
  nodeBody: {
    padding: '12px',
    fontSize: '0.85rem',
    color: 'var(--text-main)',
    lineHeight: '1.6',
  },
  treeArrow: {
    fontSize: '1.2rem',
    color: 'var(--color-primary)',
    fontWeight: 700,
  },
  infoSpan: {
    fontSize: '0.75rem',
    color: 'var(--color-primary)',
    marginTop: '2px',
  }
};
