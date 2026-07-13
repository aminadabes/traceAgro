package com.controledeestoque.demo.model;

import com.controledeestoque.demo.config.CryptoConverter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_produto")
@Getter
@Setter
@SQLDelete(sql = "UPDATE tb_produto SET deletado = true, data_exclusao = NOW() WHERE id = ?")
@Where(clause = "deletado = false")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_interno", nullable = false, unique = true, length = 50)
    private String codigoInterno;

    @Column(name = "ean", unique = true, length = 50)
    private String ean;

    @Column(name = "qr_code", length = 255)
    private String qrCode;

    @Column(name = "descricao", nullable = false, length = 255)
    private String descricao;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(name = "subcategoria", length = 100)
    private String subcategoria;

    @Column(name = "marca_fabricante", length = 100)
    private String marcaFabricante;

    // Encrypted principal vendor field to align with LGPD standards for sensitive data protection
    @Convert(converter = CryptoConverter.class)
    @Column(name = "fornecedor_principal", length = 255)
    private String fornecedorPrincipal;

    @Column(name = "fornecedores_secundarios", length = 1000)
    private String fornecedoresSecundarios;

    @Column(name = "peso_liquido")
    private Double pesoLiquido;

    @Column(name = "volume")
    private Double volume;

    @Column(name = "densidade")
    private Double densidade;

    @Column(name = "classificacao_fiscal_ncm", length = 20)
    private String classificacaoFiscalNcm;

    @Column(name = "origem", length = 100)
    private String origem;

    @Column(name = "imagem_url", length = 500)
    private String imagemUrl;

    @Column(name = "ficha_tecnica_fispq", length = 2000)
    private String fichaTecnicaFispq;

    @Column(name = "classe_toxicologica", length = 100)
    private String classeToxicologica;

    @Column(name = "registro_mapa", unique = true, length = 100)
    private String registroMapa;

    @Column(name = "unidade_compra", nullable = false, length = 20)
    private String unidadeCompra;

    @Column(name = "unidade_consumo", nullable = false, length = 20)
    private String unidadeConsumo;

    @Column(name = "fator_conversao", nullable = false)
    private Double fatorConversao = 1.0;

    @Column(name = "destinacao", nullable = false, length = 50)
    private String destinacao; // Consumivel, Revenda, Producao Propria, Imobilizado, Uso Veterinario, Uso Agricola, Uso Administrativo

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "deletado", nullable = false)
    private Boolean deletado = false;

    @Column(name = "data_exclusao")
    private LocalDateTime dataExclusao;
}
