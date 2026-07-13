package com.controledeestoque.demo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;

@Entity
@Table(name = "tb_ativo_biologico")
@Getter
@Setter
@SQLDelete(sql = "UPDATE tb_ativo_biologico SET deletado = true, data_exclusao = NOW() WHERE id = ?")
@Where(clause = "deletado = false")
public class AtivoBiologico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "identificador_unico", nullable = false, unique = true, length = 100)
    private String identificadorUnico; // Brinco, RFID, Tatuagem

    @Column(name = "lote_manejo", length = 100)
    private String loteManejo;

    @Column(name = "especie", nullable = false, length = 100)
    private String especie;

    @Column(name = "raca", length = 100)
    private String raca;

    @Column(name = "sexo", length = 10)
    private String sexo; // M, F

    @Column(name = "data_nascimento", nullable = false)
    private LocalDate dataNascimento;

    @Column(name = "peso_atual", nullable = false)
    private Double pesoAtual = 0.0;

    @Column(name = "genealogia_pai", length = 150)
    private String genealogiaPai;

    @Column(name = "genealogia_mae", length = 150)
    private String genealogiaMae;

    @Column(name = "status_saude", length = 100)
    private String statusSaude; // SAUDAVEL, EM_TRATAMENTO, QUARENTENA

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "localizacao_id")
    private Localizacao localizacaoAtual; // Curral / Piquete

    @Column(name = "data_fim_carencia")
    private LocalDateTime dataFimCarencia; // RN007 (Safety Lock)

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "deletado", nullable = false)
    private Boolean deletado = false;

    @Column(name = "data_exclusao")
    private LocalDateTime dataExclusao;

    // RN003 (Alteração automática de categoria de idade)
    public String getCategoriaIdade() {
        if (dataNascimento == null) return "Indefinida";
        Period periodo = Period.between(dataNascimento, LocalDate.now());
        int meses = periodo.getYears() * 12 + periodo.getMonths();
        
        if ("M".equalsIgnoreCase(sexo)) {
            if (meses < 12) return "Bezerro";
            if (meses < 24) return "Garrote";
            return "Boi";
        } else {
            if (meses < 12) return "Bezerra";
            if (meses < 24) return "Novilha";
            return "Vaca";
        }
    }
}
