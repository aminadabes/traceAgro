package com.controledeestoque.demo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_localizacao")
@Getter
@Setter
@SQLDelete(sql = "UPDATE tb_localizacao SET deletado = true, data_exclusao = NOW() WHERE id = ?")
@Where(clause = "deletado = false")
public class Localizacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fazenda", nullable = false, length = 100)
    private String fazenda;

    @Column(name = "filial", length = 100)
    private String filial;

    @Column(name = "armazem_galpao", length = 100)
    private String armazemGalpao;

    @Column(name = "silo_curral_talhao", length = 100)
    private String siloCurralTalhao;

    @Column(name = "rua", length = 50)
    private String rua;

    @Column(name = "bloco", length = 50)
    private String bloco;

    @Column(name = "prateleira_posicao", length = 50)
    private String prateleiraPosicao;

    @Column(name = "area_critica", nullable = false)
    private Boolean areaCritica = false; // RN008 (Segregação de Área Crítica)

    @Column(name = "bloqueado_para_inventario", nullable = false)
    private Boolean bloqueadoParaInventario = false; // RN014 (Bloqueio de Movimentação por Inventário)

    @Column(name = "data_fim_carencia_talhao")
    private LocalDateTime dataFimCarenciaTalhao; // RN007 (Safety Lock para plantio/colheita)

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "deletado", nullable = false)
    private Boolean deletado = false;

    @Column(name = "data_exclusao")
    private LocalDateTime dataExclusao;

    // Helper for displaying full path
    public String getCaminhoCompleto() {
        StringBuilder sb = new StringBuilder();
        sb.append(fazenda);
        if (filial != null) sb.append(" -> ").append(filial);
        if (armazemGalpao != null) sb.append(" -> ").append(armazemGalpao);
        if (siloCurralTalhao != null) sb.append(" -> ").append(siloCurralTalhao);
        if (rua != null) sb.append(" -> ").append(rua);
        if (bloco != null) sb.append(" -> ").append(bloco);
        if (prateleiraPosicao != null) sb.append(" -> ").append(prateleiraPosicao);
        return sb.toString();
    }
}
