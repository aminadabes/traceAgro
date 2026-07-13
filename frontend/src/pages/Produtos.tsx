import React, { useState } from 'react';
import { Plus, Search, ShieldAlert, Sparkles } from 'lucide-react';

interface Categoria {
  id: number;
  nome: string;
  loteObrigatorio: boolean;
  validadeObrigatoria: boolean;
  diasAlertaVencimento: number;
}

interface Produto {
  id?: number;
  codigoInterno: string;
  ean: string;
  qrCode?: string;
  descricao: string;
  categoria: { id: number; nome?: string };
  subcategoria?: string;
  marcaFabricante?: string;
  fornecedorPrincipal?: string;
  fornecedoresSecundarios?: string;
  pesoLiquido?: number;
  volume?: number;
  densidade?: number;
  classificacaoFiscalNcm?: string;
  origem?: string;
  imagemUrl?: string;
  fichaTecnicaFispq?: string;
  classeToxicologica?: string;
  registroMapa?: string;
  unidadeCompra: string;
  unidadeConsumo: string;
  fatorConversao: number;
  destinacao: string;
}

interface ProdutosProps {
  produtos: Produto[];
  categorias: Categoria[];
  onAddProduto: (produto: Produto) => Promise<void>;
  currentUser: string;
}

export const Produtos: React.FC<ProdutosProps> = ({ 
  produtos, 
  categorias, 
  onAddProduto,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDetailsProduct, setSelectedDetailsProduct] = useState<Produto | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [codigoInterno, setCodigoInterno] = useState('');
  const [ean, setEan] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [subcategoria, setSubcategoria] = useState('');
  const [marcaFabricante, setMarcaFabricante] = useState('');
  const [fornecedorPrincipal, setFornecedorPrincipal] = useState('');
  const [unidadeCompra, setUnidadeCompra] = useState('UNIDADE');
  const [unidadeConsumo, setUnidadeConsumo] = useState('UNIDADE');
  const [fatorConversao, setFatorConversao] = useState(1);
  const [destinacao, setDestinacao] = useState('Consumivel');
  const [classeToxicologica, setClasseToxicologica] = useState('');
  const [registroMapa, setRegistroMapa] = useState('');
  const [ncm, setNcm] = useState('');

  const destinacoes = [
    'Consumivel', 'Revenda', 'Producao Própria', 'Imobilizado', 
    'Uso Veterinario', 'Uso Agricola', 'Uso Administrativo'
  ];

  const filteredProdutos = produtos.filter(p => 
    p.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigoInterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.ean && p.ean.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const canAdd = currentUser === 'ADMINISTRADOR' || currentUser === 'ALMOXARIFE';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!codigoInterno || !descricao || !categoriaId || !unidadeCompra || !unidadeConsumo) {
      setErrorMsg('Os campos com * são de preenchimento obrigatório.');
      return;
    }

    // Check MAPA requirement for Agricultural / Vet use
    if ((destinacao === 'Uso Agricola' || destinacao === 'Uso Veterinario') && !registroMapa) {
      setErrorMsg('Produtos de uso agrícola ou veterinário necessitam de Registro no MAPA obrigatório.');
      return;
    }

    const payload: Produto = {
      codigoInterno,
      ean,
      descricao,
      categoria: { id: parseInt(categoriaId) },
      subcategoria,
      marcaFabricante,
      fornecedorPrincipal,
      unidadeCompra,
      unidadeConsumo,
      fatorConversao: parseFloat(fatorConversao.toString()),
      destinacao,
      classeToxicologica,
      registroMapa,
      classificacaoFiscalNcm: ncm
    };

    try {
      await onAddProduto(payload);
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao cadastrar produto no backend.');
    }
  };

  const resetForm = () => {
    setCodigoInterno('');
    setEan('');
    setDescricao('');
    setCategoriaId('');
    setSubcategoria('');
    setMarcaFabricante('');
    setFornecedorPrincipal('');
    setUnidadeCompra('UNIDADE');
    setUnidadeConsumo('UNIDADE');
    setFatorConversao(1);
    setDestinacao('Consumivel');
    setClasseToxicologica('');
    setRegistroMapa('');
    setNcm('');
    setErrorMsg('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.actionsBar}>
        <div style={styles.searchWrapper}>
          <Search size={18} style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Pesquisar por descrição, código ou EAN..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => {
            if (!canAdd) {
              alert('Apenas usuários com perfil ADMINISTRADOR ou ALMOXARIFE podem cadastrar novos produtos.');
              return;
            }
            setIsModalOpen(true);
          }}
          disabled={!canAdd}
          style={{ opacity: canAdd ? 1 : 0.6 }}
        >
          <Plus size={18} />
          Cadastrar Produto
        </button>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Código</th>
              <th>EAN</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Destinação</th>
              <th>Conversão Unidade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProdutos.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  Nenhum produto localizado.
                </td>
              </tr>
            ) : (
              filteredProdutos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td><strong>{p.codigoInterno}</strong></td>
                  <td>{p.ean || '-'}</td>
                  <td>
                    <div>
                      <div>{p.descricao}</div>
                      {p.classeToxicologica && (
                        <span style={styles.toxicBadge} title="Classe Toxicológica">
                          ☣️ {p.classeToxicologica}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{categorias.find(c => c.id === p.categoria.id)?.nome || `Categoria #${p.categoria.id}`}</td>
                  <td>
                    <span className="badge badge-info">{p.destinacao}</span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    1 {p.unidadeCompra} = <strong style={{ color: 'var(--color-primary)' }}>{p.fatorConversao}</strong> {p.unidadeConsumo}
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setSelectedDetailsProduct(p)}
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cadastrar Produto Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Cadastrar Novo Produto (RF001)</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={styles.closeBtn}
              >✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={styles.modalBodyGrid}>
                {errorMsg && (
                  <div style={styles.errorAlert}>
                    <ShieldAlert size={18} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div style={styles.formRow}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Código Interno *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Ex: PROD-102"
                      value={codigoInterno}
                      onChange={(e) => setCodigoInterno(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Código de Barras (EAN)</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="Ex: 7891234567890" 
                      value={ean}
                      onChange={(e) => setEan(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Descrição *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Descrição detalhada do produto"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    required
                  />
                </div>

                <div style={styles.formRow}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Categoria *</label>
                    <select 
                      className="form-select"
                      value={categoriaId}
                      onChange={(e) => setCategoriaId(e.target.value)}
                      required
                    >
                      <option value="">Selecione...</option>
                      {categorias.map(c => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Destinação *</label>
                    <select 
                      className="form-select"
                      value={destinacao}
                      onChange={(e) => setDestinacao(e.target.value)}
                    >
                      {destinacoes.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Marca/Fabricante</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={marcaFabricante}
                      onChange={(e) => setMarcaFabricante(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Fornecedor Principal (LGPD Criptografado no DB)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={fornecedorPrincipal}
                      onChange={(e) => setFornecedorPrincipal(e.target.value)}
                    />
                  </div>
                </div>

                {/* Conversion Section */}
                <div style={styles.conversionPanel}>
                  <h4 style={styles.conversionTitle}>
                    <Sparkles size={14} color="var(--color-primary)" />
                    Fator de Conversão de Unidades de Medida
                  </h4>
                  <div style={styles.formRow}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Unidade de Compra *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Ex: CAIXA"
                        value={unidadeCompra}
                        onChange={(e) => setUnidadeCompra(e.target.value.toUpperCase())}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Unidade de Aplicação/Consumo *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Ex: UNIDADE"
                        value={unidadeConsumo}
                        onChange={(e) => setUnidadeConsumo(e.target.value.toUpperCase())}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Fator Multiplicador *</label>
                      <input 
                        type="number" 
                        step="any"
                        className="form-input" 
                        value={fatorConversao}
                        onChange={(e) => setFatorConversao(parseFloat(e.target.value) || 1)}
                        required
                      />
                    </div>
                  </div>
                  <div style={styles.conversionHelper}>
                    1 {unidadeCompra || 'COMPRA'} equivale a <strong style={{ color: 'var(--color-primary)' }}>{fatorConversao}</strong> {unidadeConsumo || 'CONSUMO'} em estoque.
                  </div>
                </div>

                {/* Specific features for agriculture/defensives */}
                {(destinacao === 'Uso Agricola' || destinacao === 'Uso Veterinario') && (
                  <div style={styles.legalPanel}>
                    <div style={styles.formRow}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Registro MAPA * (Obrigatório)</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Registro do Ministério"
                          value={registroMapa}
                          onChange={(e) => setRegistroMapa(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Classe Toxicológica</label>
                        <select 
                          className="form-select"
                          value={classeToxicologica}
                          onChange={(e) => setClasseToxicologica(e.target.value)}
                        >
                          <option value="">Nenhuma</option>
                          <option value="ALTAMENTE_TOXICO">Classe I - Altamente Tóxico</option>
                          <option value="MEDIANAMENTE_TOXICO">Classe II - Medianamente Tóxico</option>
                          <option value="POUCO_TOXICO">Classe III - Pouco Tóxico</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Classificação Fiscal (NCM)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Ex: 3105.20.00"
                        value={ncm}
                        onChange={(e) => setNcm(e.target.value)}
                      />
                    </div>
                    {classeToxicologica === 'ALTAMENTE_TOXICO' && (
                      <div style={styles.warningNote}>
                        ⚠️ <strong>Aviso WMS:</strong> Devido à alta toxicidade, o sistema exigirá o estoque deste produto em Área Crítica isolada (Galpão com isolamento sanitário).
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
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

      {/* Detalhes do Produto Modal */}
      {selectedDetailsProduct && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Detalhes do Produto: {selectedDetailsProduct.codigoInterno}</h2>
              <button onClick={() => setSelectedDetailsProduct(null)} style={styles.closeBtn}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Descrição</span>
                <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{selectedDetailsProduct.descricao}</strong>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Código de Barras (EAN)</span>
                  <strong>{selectedDetailsProduct.ean || 'Sem registro'}</strong>
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Categoria</span>
                  <strong>{categorias.find(c => c.id === selectedDetailsProduct.categoria.id)?.nome || `Categoria #${selectedDetailsProduct.categoria.id}`}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Destinação</span>
                  <span className="badge badge-info">{selectedDetailsProduct.destinacao}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Fornecedor Principal</span>
                  <strong>{selectedDetailsProduct.fornecedorPrincipal || 'Não informado'}</strong>
                </div>
              </div>
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.15)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--color-primary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Fator de Conversão de Estoque</span>
                1 {selectedDetailsProduct.unidadeCompra} = <strong style={{ color: 'var(--color-primary)' }}>{selectedDetailsProduct.fatorConversao}</strong> {selectedDetailsProduct.unidadeConsumo}
              </div>
              
              {(selectedDetailsProduct.registroMapa || selectedDetailsProduct.classificacaoFiscalNcm || selectedDetailsProduct.classeToxicologica) && (
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Informações Fiscais & Regulatórias</span>
                  {selectedDetailsProduct.registroMapa && (
                    <div>Registro MAPA: <strong>{selectedDetailsProduct.registroMapa}</strong></div>
                  )}
                  {selectedDetailsProduct.classificacaoFiscalNcm && (
                    <div>Classificação Fiscal NCM: <strong>{selectedDetailsProduct.classificacaoFiscalNcm}</strong></div>
                  )}
                  {selectedDetailsProduct.classeToxicologica && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Classe Toxicológica: 
                      <span className="badge badge-danger">
                        ☣️ {selectedDetailsProduct.classeToxicologica}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setSelectedDetailsProduct(null)} className="btn btn-primary">Fechar</button>
            </div>
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
  toxicBadge: {
    display: 'inline-block',
    fontSize: '0.7rem',
    color: '#f87171',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    padding: '2px 6px',
    borderRadius: '4px',
    marginTop: '4px',
    fontWeight: 600,
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
  conversionPanel: {
    backgroundColor: 'rgba(16, 185, 129, 0.03)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    borderRadius: '8px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  conversionTitle: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--color-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  conversionHelper: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  legalPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  warningNote: {
    fontSize: '0.75rem',
    color: 'var(--color-warning)',
    lineHeight: '1.4',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    padding: '8px 10px',
    borderRadius: '6px',
    borderLeft: '3px solid var(--color-warning)',
  }
};
