package com.controledeestoque.demo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_transferencia")
@Getter
@Setter
@SQLDelete(sql = "UPDATE tb_transferencia SET deletado = true, data_exclusao = NOW() WHERE id = ?")
@Where(clause = "deletado = false")
public class Transferencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lote_id", nullable = false)
    private Lote lote;

    @Column(name = "quantidade", nullable = false)
    private Double quantidade;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "localizacao_origem_id", nullable = false)
    private Localizacao localizacaoOrigem;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "localizacao_destino_id", nullable = false)
    private Localizacao localizacaoDestino;

    @Column(name = "transportador", nullable = false, length = 150)
    private String transportador;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "EM_TRANSITO"; // EM_TRANSITO, RECEBIDO, CONCLUIDO_COM_PERDAS

    @Column(name = "data_despacho", nullable = false)
    private LocalDateTime dataDespacho;

    @Column(name = "data_recebimento")
    private LocalDateTime dataRecebimento;

    @Column(name = "usuario_despacho", nullable = false, length = 100)
    private String usuarioDespacho;

    @Column(name = "usuario_recebimento", length = 100)
    private String usuarioRecebimento;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "deletado", nullable = false)
    private Boolean deletado = false;

    @Column(name = "data_exclusao")
    private LocalDateTime dataExclusao;
}
