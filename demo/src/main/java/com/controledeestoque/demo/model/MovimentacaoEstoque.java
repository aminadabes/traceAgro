package com.controledeestoque.demo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_movimentacao_estoque")
@Getter
@Setter
@SQLDelete(sql = "UPDATE tb_movimentacao_estoque SET deletado = true, data_exclusao = NOW() WHERE id = ?")
@Where(clause = "deletado = false")
public class MovimentacaoEstoque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tipo", nullable = false, length = 20)
    private String tipo; // ENTRADA, SAIDA

    @Column(name = "sub_tipo", nullable = false, length = 50)
    private String subTipo; // COMPRA, PRODUCAO_PROPRIA, DEVOLUCAO, BONIFICACAO, IMPORTACAO, AJUSTE_INVENTARIO, VENDA, CONSUMO_INTERNO, PLANTIO_APLICACAO, USO_VETERINARIO, PERDA_DESCARTE, ROUBO, TRANSFERENCIA_DESPACHO, TRANSFERENCIA_RECEBIMENTO

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lote_id", nullable = false)
    private Lote lote;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "localizacao_id", nullable = false)
    private Localizacao localizacao;

    @Column(name = "quantidade", nullable = false)
    private Double quantidade; // in unit of consumption

    @Column(name = "valor_unitario")
    private Double valorUnitario = 0.0;

    @Column(name = "frete")
    private Double frete = 0.0;

    @Column(name = "impostos_rateados")
    private Double impostosRateados = 0.0;

    @Column(name = "data_movimentacao", nullable = false)
    private LocalDateTime dataMovimentacao;

    @Column(name = "usuario", nullable = false, length = 100)
    private String usuario; // RN012 (Responsabilidade Obrigatória)

    @Column(name = "centro_custo_safra", nullable = false, length = 100)
    private String centroCustoSafra; // RN012 (Responsabilidade Obrigatória)

    @Column(name = "chave_nfe", length = 50)
    private String chaveNfe;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "deletado", nullable = false)
    private Boolean deletado = false;

    @Column(name = "data_exclusao")
    private LocalDateTime dataExclusao;
}
