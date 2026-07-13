package com.controledeestoque.demo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_aplicacao_agricola")
@Getter
@Setter
@SQLDelete(sql = "UPDATE tb_aplicacao_agricola SET deletado = true, data_exclusao = NOW() WHERE id = ?")
@Where(clause = "deletado = false")
public class AplicacaoAgricola {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "talhao_id", nullable = false)
    private Localizacao talhao;

    @Column(name = "cultura", nullable = false, length = 100)
    private String cultura;

    @Column(name = "safra_vinculada", nullable = false, length = 100)
    private String safraVinculada;

    @Column(name = "area_tratada_ha", nullable = false)
    private Double areaTratadaHa;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Column(name = "quantidade_consumida", nullable = false)
    private Double quantidadeConsumida; // in unit of consumption

    @Column(name = "operador", nullable = false, length = 100)
    private String operador;

    @Column(name = "maquina", length = 100)
    private String maquina;

    @Column(name = "engenheiro_responsavel", nullable = false, length = 150)
    private String engenheiroResponsavel;

    @Column(name = "receituario_agronomico", nullable = false, length = 100)
    private String receituarioAgronomico;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    @Column(name = "temperatura")
    private Double temperatura;

    @Column(name = "umidade")
    private Double umidade;

    @Column(name = "velocidade_vento")
    private Double velocidadeVento;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "deletado", nullable = false)
    private Boolean deletado = false;

    @Column(name = "data_exclusao")
    private LocalDateTime dataExclusao;
}
