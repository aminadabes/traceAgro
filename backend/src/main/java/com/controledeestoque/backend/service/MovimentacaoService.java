package com.controledeestoque.backend.service;

import com.controledeestoque.backend.model.*;
import com.controledeestoque.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MovimentacaoService {

    @Autowired
    private MovimentacaoEstoqueRepository movimentacaoRepository;

    @Autowired
    private SaldoEstoqueRepository saldoRepository;

    @Autowired
    private LoteRepository loteRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private LocalizacaoRepository localizacaoRepository;

    @Autowired
    private AuditLogService auditLogService;

    // RF008 – Entrada de Estoque
    @Transactional
    public MovimentacaoEstoque registrarEntrada(
            Long produtoId, Long localizacaoId, String numeroLote, LocalDate dataFabricacao, LocalDate dataValidade,
            Double quantidadeCompra, Double valorUnitario, Double frete, Double impostosRateados, String subTipo,
            String usuario, String ip, String centroCustoSafra, String chaveNfe, String fornecedorLote) {

        if (quantidadeCompra == null || quantidadeCompra <= 0) {
            throw new IllegalArgumentException("A quantidade de entrada deve ser maior que zero.");
        }
        if (valorUnitario == null || valorUnitario <= 0) {
            throw new IllegalArgumentException("O valor unitário deve ser maior que zero.");
        }

        Produto produto = produtoRepository.findById(produtoId)
            .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado."));
        Localizacao localizacao = localizacaoRepository.findById(localizacaoId)
            .orElseThrow(() -> new IllegalArgumentException("Localização não encontrada."));

        // RN014 (Bloqueio de Movimentação por Inventário)
        if (Boolean.TRUE.equals(localizacao.getBloqueadoParaInventario())) {
            throw new IllegalStateException("OPERACÃO BLOQUEADA: A localização física está sob contagem de inventário.");
        }

        // RN004 (Rastreabilidade por Categoria)
        Categoria categoria = produto.getCategoria();
        if (Boolean.TRUE.equals(categoria.getLoteObrigatorio()) && (numeroLote == null || numeroLote.trim().isEmpty())) {
            throw new IllegalArgumentException("Lote é obrigatório para esta categoria de produto.");
        }
        if (Boolean.TRUE.equals(categoria.getValidadeObrigatoria()) && dataValidade == null) {
            throw new IllegalArgumentException("Data de validade é obrigatória para esta categoria de produto.");
        }

        // RN008 (Segregação de Área Crítica)
        if (produto.getClasseToxicologica() != null && !produto.getClasseToxicologica().trim().isEmpty()) {
            if (!Boolean.TRUE.equals(localizacao.getAreaCritica())) {
                throw new IllegalArgumentException("OPERACÃO BLOQUEADA: Produtos de alta toxicidade devem ser estocados em Área Crítica isolada.");
            }
        }

        // Find or create Lote
        Lote lote = null;
        if (numeroLote != null && !numeroLote.trim().isEmpty()) {
            lote = loteRepository.findByNumeroLoteAndProdutoId(numeroLote, produtoId)
                .orElseGet(() -> {
                    Lote novoLote = new Lote();
                    novoLote.setNumeroLote(numeroLote);
                    novoLote.setProduto(produto);
                    novoLote.setFornecedor(fornecedorLote);
                    novoLote.setDataFabricacao(dataFabricacao);
                    novoLote.setDataValidade(dataValidade);
                    novoLote.setStatus("ATIVO");
                    return loteRepository.save(novoLote);
                });
        }

        // RN006 (Bloqueio Automático por Vencimento)
        if (lote != null && lote.getDataValidade() != null && lote.getDataValidade().isBefore(LocalDate.now())) {
            lote.setStatus("BLOQUEADO");
            loteRepository.save(lote);
        }

        // Conversão de medida: Entrada é registrada na unidade de compra, mas saldo é atualizado na unidade de consumo.
        Double quantidadeConsumo = quantidadeCompra * produto.getFatorConversao();

        // Recalcular Custo Médio Ponderado (RN009)
        final Lote finalLote = lote;
        Optional<SaldoEstoque> saldoOpt = saldoRepository.findByLoteIdAndLocalizacaoId(lote.getId(), localizacao.getId());
        SaldoEstoque saldo = saldoOpt.orElseGet(() -> {
            SaldoEstoque s = new SaldoEstoque();
            s.setLote(finalLote);
            s.setLocalizacao(localizacao);
            s.setQuantidade(0.0);
            s.setCustoMedio(0.0);
            return s;
        });

        Object anterior = cloneState(saldo);

        Double qtdAntiga = saldo.getQuantidade();
        Double custoAntigo = saldo.getCustoMedio();

        // Calculate unit cost for this entry (including freight and taxes)
        Double custoEntradaUnitario = (valorUnitario * quantidadeCompra + (frete != null ? frete : 0.0) + (impostosRateados != null ? impostosRateados : 0.0)) / quantidadeConsumo;

        Double novoCustoMedio = custoEntradaUnitario;
        if (qtdAntiga > 0) {
            novoCustoMedio = ((qtdAntiga * custoAntigo) + (quantidadeConsumo * custoEntradaUnitario)) / (qtdAntiga + quantidadeConsumo);
        }

        saldo.setQuantidade(qtdAntiga + quantidadeConsumo);
        saldo.setCustoMedio(novoCustoMedio);
        saldoRepository.save(saldo);

        // Record stock movement
        MovimentacaoEstoque mov = new MovimentacaoEstoque();
        mov.setTipo("ENTRADA");
        mov.setSubTipo(subTipo);
        mov.setProduto(produto);
        mov.setLote(lote);
        mov.setLocalizacao(localizacao);
        mov.setQuantidade(quantidadeConsumo);
        mov.setValorUnitario(valorUnitario);
        mov.setFrete(frete);
        mov.setImpostosRateados(impostosRateados);
        mov.setDataMovimentacao(LocalDateTime.now());
        mov.setUsuario(usuario);
        mov.setCentroCustoSafra(centroCustoSafra != null ? centroCustoSafra : "PADRAO");
        mov.setChaveNfe(chaveNfe);
        
        MovimentacaoEstoque salva = movimentacaoRepository.save(mov);

        auditLogService.log(usuario, ip, "CRIAR", "tb_movimentacao_estoque", salva.getId(), null, salva);
        auditLogService.log(usuario, ip, "ATUALIZAR", "tb_saldo_estoque", saldo.getId(), anterior, saldo);

        return salva;
    }

    // RF009 – Saída de Estoque
    @Transactional
    public void registrarSaida(
            Long produtoId, Long localizacaoId, Double quantidadeSaidaConsumo,
            String subTipo, String usuario, String ip, String centroCustoSafra) {

        if (quantidadeSaidaConsumo == null || quantidadeSaidaConsumo <= 0) {
            throw new IllegalArgumentException("A quantidade de saída deve ser maior que zero.");
        }
        if (usuario == null || usuario.trim().isEmpty() || centroCustoSafra == null || centroCustoSafra.trim().isEmpty()) {
            throw new IllegalArgumentException("Usuário e Centro de Custo/Safra são obrigatórios."); // RN012
        }

        Produto produto = produtoRepository.findById(produtoId)
            .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado."));
        Localizacao localizacao = localizacaoRepository.findById(localizacaoId)
            .orElseThrow(() -> new IllegalArgumentException("Localização não encontrada."));

        // RN014 (Bloqueio de Movimentação por Inventário)
        if (Boolean.TRUE.equals(localizacao.getBloqueadoParaInventario())) {
            throw new IllegalStateException("OPERACÃO BLOQUEADA: A localização física está sob contagem de inventário.");
        }

        // Gather all available active stock balances for this product in this location
        List<SaldoEstoque> saldos = saldoRepository.findByLocalizacaoId(localizacaoId).stream()
            .filter(s -> s.getLote().getProduto().getId().equals(produtoId))
            .filter(s -> s.getQuantidade() > 0)
            .collect(Collectors.toList());

        Double totalDisponivel = saldos.stream().mapToDouble(SaldoEstoque::getQuantidade).sum();

        // RN011 (Proibição de Saldo Negativo)
        if (quantidadeSaidaConsumo > totalDisponivel) {
            throw new IllegalStateException("OPERACÃO BLOQUEADA: Saldo insuficiente. Requisitado: " 
                + quantidadeSaidaConsumo + " " + produto.getUnidadeConsumo() + ", Disponível: " + totalDisponivel);
        }

        // RN010 (Regras de Escoamento FEFO/FIFO)
        boolean usarFEFO = Boolean.TRUE.equals(produto.getCategoria().getValidadeObrigatoria());

        if (usarFEFO) {
            // Sort by Expiry Date (FEFO)
            saldos.sort(Comparator.comparing((SaldoEstoque s) -> s.getLote().getDataValidade()));
        } else {
            // Sort by entry order/Lote ID (FIFO)
            saldos.sort(Comparator.comparing((SaldoEstoque s) -> s.getLote().getId()));
        }

        Double faltante = quantidadeSaidaConsumo;

        for (SaldoEstoque saldo : saldos) {
            if (faltante <= 0) break;

            // RN006: Exclude blocked batches (expired) except if this is a loss/disposal operation
            if ("BLOQUEADO".equalsIgnoreCase(saldo.getLote().getStatus()) && !"PERDA_DESCARTE".equalsIgnoreCase(subTipo)) {
                continue; 
            }

            Double quantDisponivelLote = saldo.getQuantidade();
            Double quantDeduzir = Math.min(quantDisponivelLote, faltante);

            Object anterior = cloneState(saldo);

            saldo.setQuantidade(quantDisponivelLote - quantDeduzir);
            saldoRepository.save(saldo);

            faltante -= quantDeduzir;

            // Record movement
            MovimentacaoEstoque mov = new MovimentacaoEstoque();
            mov.setTipo("SAIDA");
            mov.setSubTipo(subTipo);
            mov.setProduto(produto);
            mov.setLote(saldo.getLote());
            mov.setLocalizacao(localizacao);
            mov.setQuantidade(quantDeduzir);
            mov.setValorUnitario(saldo.getCustoMedio()); // Valued at average cost
            mov.setDataMovimentacao(LocalDateTime.now());
            mov.setUsuario(usuario);
            mov.setCentroCustoSafra(centroCustoSafra);
            
            MovimentacaoEstoque salva = movimentacaoRepository.save(mov);

            auditLogService.log(usuario, ip, "CRIAR", "tb_movimentacao_estoque", salva.getId(), null, salva);
            auditLogService.log(usuario, ip, "ATUALIZAR", "tb_saldo_estoque", saldo.getId(), anterior, saldo);
        }

        // If even after FEFO/FIFO scan, we have remaining amount (because of blocked batches being skipped)
        if (faltante > 0) {
            throw new IllegalStateException("OPERACÃO BLOQUEADA: Saldo disponível está vencido/bloqueado e não pode ser dispensado.");
        }
    }

    private SaldoEstoque cloneState(SaldoEstoque original) {
        SaldoEstoque clone = new SaldoEstoque();
        clone.setId(original.getId());
        clone.setLote(original.getLote());
        clone.setLocalizacao(original.getLocalizacao());
        clone.setQuantidade(original.getQuantidade());
        clone.setCustoMedio(original.getCustoMedio());
        return clone;
    }
}
