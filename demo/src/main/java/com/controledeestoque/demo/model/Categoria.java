package com.controledeestoque.demo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_categoria")
@Getter
@Setter
@SQLDelete(sql = "UPDATE tb_categoria SET deletado = true, data_exclusao = NOW() WHERE id = ?")
@Where(clause = "deletado = false")
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    @Column(name = "lote_obrigatorio", nullable = false)
    private Boolean loteObrigatorio = false;

    @Column(name = "validade_obrigatoria", nullable = false)
    private Boolean validadeObrigatoria = false;

    @Column(name = "dias_alerta_vencimento", nullable = false)
    private Integer diasAlertaVencimento = 30; // default window

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "deletado", nullable = false)
    private Boolean deletado = false;

    @Column(name = "data_exclusao")
    private LocalDateTime dataExclusao;
}
