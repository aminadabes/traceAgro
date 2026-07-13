package com.controledeestoque.demo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_inventario")
@Getter
@Setter
@SQLDelete(sql = "UPDATE tb_inventario SET deletado = true, data_exclusao = NOW() WHERE id = ?")
@Where(clause = "deletado = false")
public class Inventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "localizacao_id", nullable = false)
    private Localizacao localizacao;

    @Column(name = "data_abertura", nullable = false)
    private LocalDateTime dataAbertura;

    @Column(name = "data_fechamento")
    private LocalDateTime dataFechamento;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "ABERTO"; // ABERTO, CONCLUIDO

    @Column(name = "responsavel", nullable = false, length = 100)
    private String responsavel;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "deletado", nullable = false)
    private Boolean deletado = false;

    @Column(name = "data_exclusao")
    private LocalDateTime dataExclusao;
}
