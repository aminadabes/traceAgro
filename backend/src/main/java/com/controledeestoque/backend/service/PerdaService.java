package com.controledeestoque.backend.service;

import com.controledeestoque.backend.model.*;
import com.controledeestoque.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class PerdaService {

    @Autowired
    private PerdaEstoqueRepository perdaRepository;

    @Autowired
    private SaldoEstoqueRepository saldoRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private LocalizacaoRepository localizacaoRepository;

    @Autowired
    private LoteRepository loteRepository;

    @Autowired
    private MovimentacaoService movimentacaoService;

    @Autowired
    private AuditLogService auditLogService;

    // Parametrizável via properties, com fallback de R$ 1.000,00
    @Value("${app.limite-alcada-perda:1000.0}")
    private Double limiteAlcadaPerda;

    @Transactional
    public PerdaEstoque registrarPerda(
            Long produtoId, Long loteId, Long localizacaoId, Double quantidade,
            String motivo, String justificativa, String usuario, String ip) {

        Produto produto = produtoRepository.findById(produtoId)
            .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado."));
        Localizacao localizacao = localizacaoRepository.findById(localizacaoId)
            .orElseThrow(() -> new IllegalArgumentException("Localização não encontrada."));
        Lote lote = loteRepository.findById(loteId)
            .orElseThrow(() -> new IllegalArgumentException("Lote não encontrado."));

        SaldoEstoque saldo = saldoRepository.findByLoteIdAndLocalizacaoId(loteId, localizacaoId)
            .orElseThrow(() -> new IllegalArgumentException("Saldo não cadastrado para esta localização."));

        if (saldo.getQuantidade() < quantidade) {
            throw new IllegalArgumentException("A quantidade de perda informada é maior que o saldo disponível.");
        }

        // Calculate monetary value based on average cost
        Double valorMonetario = quantidade * saldo.getCustoMedio();

        PerdaEstoque perda = new PerdaEstoque();
        perda.setProduto(produto);
        perda.setLote(lote);
        perda.setLocalizacao(localizacao);
        perda.setQuantidade(quantidade);
        perda.setMotivo(motivo);
        perda.setJustificativa(justificativa);
        perda.setValorMonetario(valorMonetario);
        perda.setDataRegistro(LocalDateTime.now());
        perda.setUsuarioRegistro(usuario);

        // RN015 (Fluxo de Alçadas de Aprovação)
        if (valorMonetario <= limiteAlcadaPerda) {
            perda.setStatus("APROVADO");
            perda.setUsuarioAprovador("SISTEMA (AUTO)");
            perda.setDataAprovacao(LocalDateTime.now());
            
            // Deduct stock immediately
            movimentacaoService.registrarSaida(
                produtoId, localizacaoId, quantidade, "PERDA_DESCARTE", 
                usuario, ip, "PERDAS"
            );
        } else {
            perda.setStatus("PENDENTE_APROVACAO");
        }

        PerdaEstoque salva = perdaRepository.save(perda);
        auditLogService.log(usuario, ip, "CRIAR", "tb_perda_estoque", salva.getId(), null, salva);

        return salva;
    }

    @Transactional
    public void aprovarPerda(Long perdaId, String usuarioAprovador, String roleAprovador, String usuario, String ip) {
        // Validation of role
        if (!"GERENTE".equalsIgnoreCase(roleAprovador) && !"DIRETOR".equalsIgnoreCase(roleAprovador)) {
            throw new IllegalStateException("OPERACÃO BLOQUEADA: Apenas perfis de Gerente ou Diretor podem aprovar alçadas de perdas.");
        }

        PerdaEstoque perda = perdaRepository.findById(perdaId)
            .orElseThrow(() -> new IllegalArgumentException("Registro de perda não encontrado."));

        if (!"PENDENTE_APROVACAO".equals(perda.getStatus())) {
            throw new IllegalStateException("Esta perda já foi processada (status atual: " + perda.getStatus() + ").");
        }

        Object anterior = cloneState(perda);

        // Deduct stock now
        movimentacaoService.registrarSaida(
            perda.getProduto().getId(),
            perda.getLocalizacao().getId(),
            perda.getQuantidade(),
            "PERDA_DESCARTE",
            perda.getUsuarioRegistro(),
            ip, "PERDAS"
        );

        perda.setStatus("APROVADO");
        perda.setUsuarioAprovador(usuarioAprovador);
        perda.setDataAprovacao(LocalDateTime.now());
        perdaRepository.save(perda);

        auditLogService.log(usuario, ip, "ATUALIZAR", "tb_perda_estoque", perda.getId(), anterior, perda);
    }

    @Transactional
    public void rejeitarPerda(Long perdaId, String usuarioAprovador, String roleAprovador, String usuario, String ip) {
        if (!"GERENTE".equalsIgnoreCase(roleAprovador) && !"DIRETOR".equalsIgnoreCase(roleAprovador)) {
            throw new IllegalStateException("OPERACÃO BLOQUEADA: Apenas perfis de Gerente ou Diretor podem rejeitar alçadas de perdas.");
        }

        PerdaEstoque perda = perdaRepository.findById(perdaId)
            .orElseThrow(() -> new IllegalArgumentException("Registro de perda não encontrado."));

        if (!"PENDENTE_APROVACAO".equals(perda.getStatus())) {
            throw new IllegalStateException("Esta perda já foi processada.");
        }

        Object anterior = cloneState(perda);

        perda.setStatus("REJEITADO");
        perda.setUsuarioAprovador(usuarioAprovador);
        perda.setDataAprovacao(LocalDateTime.now());
        perdaRepository.save(perda);

        auditLogService.log(usuario, ip, "ATUALIZAR", "tb_perda_estoque", perda.getId(), anterior, perda);
    }

    public void setLimiteAlcadaPerda(Double limite) {
        this.limiteAlcadaPerda = limite;
    }

    private PerdaEstoque cloneState(PerdaEstoque original) {
        PerdaEstoque clone = new PerdaEstoque();
        clone.setId(original.getId());
        clone.setStatus(original.getStatus());
        clone.setUsuarioAprovador(original.getUsuarioAprovador());
        clone.setDataAprovacao(original.getDataAprovacao());
        return clone;
    }
}
