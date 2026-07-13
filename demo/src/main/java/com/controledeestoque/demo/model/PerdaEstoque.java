package com.controledeestoque.demo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_perda_estoque")
@Getter
@Setter
@SQLDelete(sql = "UPDATE tb_perda_estoque SET deletado = true, data_exclusao = NOW() WHERE id = ?")
@Where(clause = "deletado = false")
public class PerdaEstoque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
    private Double quantidade;

    @Column(name = "motivo", nullable = false, length = 100)
    private String motivo; // VENCIMENTO, PRAGAS, MOFO, ROUBO, ACIDENTE, CONTAMINACAO, DESCARTE_CARENCIA, PERDA_TRANSITO

    @Column(name = "justificativa", nullable = false, length = 1000)
    private String justificativa;

    @Column(name = "valor_monetario", nullable = false)
    private Double valorMonetario;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "PENDENTE_APROVACAO"; // PENDENTE_APROVACAO, APROVADO, REJEITADO

    @Column(name = "data_registro", nullable = false)
    private LocalDateTime dataRegistro;

    @Column(name = "usuario_registro", nullable = false, length = 100)
    private String usuarioRegistro;

    @Column(name = "usuario_aprovador", length = 100)
    private String usuarioAprovador;

    @Column(name = "data_aprovacao")
    private LocalDateTime dataAprovacao;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "deletado", nullable = false)
    private Boolean deletado = false;

    @Column(name = "data_exclusao")
    private LocalDateTime dataExclusao;
}
