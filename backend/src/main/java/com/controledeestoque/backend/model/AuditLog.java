package com.controledeestoque.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_audit_log")
@Getter
@Setter
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario", nullable = false, length = 100)
    private String usuario;

    @Column(name = "ip", length = 50)
    private String ip;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    @Column(name = "operacao", nullable = false, length = 50)
    private String operacao; // CRIAR, ATUALIZAR, INATIVAR

    @Column(name = "entidade", nullable = false, length = 100)
    private String entidade;

    @Column(name = "entidade_id")
    private Long entidadeId;

    @Lob
    @Column(name = "estado_anterior", length = 4000)
    private String estadoAnterior;

    @Lob
    @Column(name = "estado_posterior", length = 4000)
    private String estadoPosterior;
}
