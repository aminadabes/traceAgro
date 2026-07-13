package com.controledeestoque.demo.service;

import com.controledeestoque.demo.model.Lote;
import com.controledeestoque.demo.model.MovimentacaoEstoque;
import com.controledeestoque.demo.repository.LoteRepository;
import com.controledeestoque.demo.repository.MovimentacaoEstoqueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecallService {

    @Autowired
    private LoteRepository loteRepository;

    @Autowired
    private MovimentacaoEstoqueRepository movimentacaoRepository;

    public static class InsumoConsumido {
        public String produto;
        public String lote;
        public String fornecedorOriginal;

        public InsumoConsumido() {}
        public InsumoConsumido(String produto, String lote, String fornecedorOriginal) {
            this.produto = produto;
            this.lote = lote;
            this.fornecedorOriginal = fornecedorOriginal;
        }
    }

    public static class Destinatario {
        public String usuario;
        public String centroCustoSafra;
        public Double quantidade;
        public LocalDateTime data;

        public Destinatario() {}
        public Destinatario(String usuario, String centroCustoSafra, Double quantidade, LocalDateTime data) {
            this.usuario = usuario;
            this.centroCustoSafra = centroCustoSafra;
            this.quantidade = quantidade;
            this.data = data;
        }
    }

    public static class RecallResult {
        public String loteFinal;
        public LocalDate dataFabricacao;
        public String fornecedorFinal;
        public List<InsumoConsumido> insumos = new ArrayList<>();
        public List<Destinatario> destinatarios = new ArrayList<>();
    }

    // RN019 (Rastreabilidade Reversa de Segurança)
    public RecallResult obterRastreabilidadeReversa(String numeroLote, Long produtoId) {
        Lote lote = loteRepository.findByNumeroLoteAndProdutoId(numeroLote, produtoId)
            .orElseThrow(() -> new IllegalArgumentException("Lote de produto acabado não encontrado."));

        RecallResult result = new RecallResult();
        result.loteFinal = lote.getNumeroLote();
        result.dataFabricacao = lote.getDataFabricacao();
        result.fornecedorFinal = lote.getFornecedor();

        // 1. Gather all movements involving this batch
        List<MovimentacaoEstoque> movs = movimentacaoRepository.findByLoteId(lote.getId());

        // 2. Identify customers who bought this specific batch
        List<MovimentacaoEstoque> saidas = movs.stream()
            .filter(m -> "SAIDA".equalsIgnoreCase(m.getTipo()))
            .collect(Collectors.toList());

        for (MovimentacaoEstoque s : saidas) {
            result.destinatarios.add(new Destinatario(
                s.getUsuario(),
                s.getCentroCustoSafra(),
                s.getQuantidade(),
                s.getDataMovimentacao()
            ));
        }

        // 3. Identify production inputs (consumos)
        // Find the date of the production entry movement
        MovimentacaoEstoque prodMov = movs.stream()
            .filter(m -> "ENTRADA".equalsIgnoreCase(m.getTipo()) && "PRODUCAO_PROPRIA".equalsIgnoreCase(m.getSubTipo()))
            .findFirst()
            .orElse(null);

        if (prodMov != null) {
            // Find consumption movements (CONSUMO_INTERNO) recorded around the production time (e.g. ±10 minutes)
            LocalDateTime prodTime = prodMov.getDataMovimentacao();
            List<MovimentacaoEstoque> insumosConsumidos = movimentacaoRepository.findAll().stream()
                .filter(m -> "SAIDA".equalsIgnoreCase(m.getTipo()) && "CONSUMO_INTERNO".equalsIgnoreCase(m.getSubTipo()))
                .filter(m -> m.getDataMovimentacao().isAfter(prodTime.minusMinutes(10)) && m.getDataMovimentacao().isBefore(prodTime.plusMinutes(10)))
                .collect(Collectors.toList());

            for (MovimentacaoEstoque inputMov : insumosConsumidos) {
                result.insumos.add(new InsumoConsumido(
                    inputMov.getProduto().getDescricao(),
                    inputMov.getLote().getNumeroLote(),
                    inputMov.getLote().getFornecedor()
                ));
            }
        }

        return result;
    }
}
