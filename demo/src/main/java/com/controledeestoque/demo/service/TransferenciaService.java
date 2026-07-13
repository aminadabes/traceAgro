package com.controledeestoque.demo.service;

import com.controledeestoque.demo.model.*;
import com.controledeestoque.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class TransferenciaService {

    @Autowired
    private TransferenciaRepository transferenciaRepository;

    @Autowired
    private LocalizacaoRepository localizacaoRepository;

    @Autowired
    private SaldoEstoqueRepository saldoRepository;

    @Autowired
    private MovimentacaoService movimentacaoService;

    @Autowired
    private PerdaEstoqueRepository perdaRepository;

    @Autowired
    private AuditLogService auditLogService;

    // Etapa 1: Despacho
    @Transactional
    public Transferencia despacharTransferencia(
            Long produtoId, Long loteId, Double quantidade,
            Long localizacaoOrigemId, Long localizacaoDestinoId,
            String transportador, String usuario, String ip, String centroCustoSafra) {

        Localizacao origem = localizacaoRepository.findById(localizacaoOrigemId)
            .orElseThrow(() -> new IllegalArgumentException("Origem não encontrada."));
        Localizacao destino = localizacaoRepository.findById(localizacaoDestinoId)
            .orElseThrow(() -> new IllegalArgumentException("Destino não encontrado."));

        SaldoEstoque saldoOrigem = saldoRepository.findByLoteIdAndLocalizacaoId(loteId, localizacaoOrigemId)
            .orElseThrow(() -> new IllegalArgumentException("Saldo não encontrado na origem para o lote especificado."));

        if (saldoOrigem.getQuantidade() < quantidade) {
            throw new IllegalArgumentException("Saldo insuficiente na origem para despacho. Disponível: " + saldoOrigem.getQuantidade());
        }

        // Deduct from origin (via standard outgoing movement)
        movimentacaoService.registrarSaida(produtoId, localizacaoOrigemId, quantidade, "TRANSFERENCIA_DESPACHO", usuario, ip, centroCustoSafra);

        Transferencia trans = new Transferencia();
        trans.setProduto(saldoOrigem.getLote().getProduto());
        trans.setLote(saldoOrigem.getLote());
        trans.setQuantidade(quantidade);
        trans.setLocalizacaoOrigem(origem);
        trans.setLocalizacaoDestino(destino);
        trans.setTransportador(transportador);
        trans.setStatus("EM_TRANSITO");
        trans.setDataDespacho(LocalDateTime.now());
        trans.setUsuarioDespacho(usuario);

        Transferencia salva = transferenciaRepository.save(trans);
        auditLogService.log(usuario, ip, "CRIAR", "tb_transferencia", salva.getId(), null, salva);

        return salva;
    }

    // Etapa 2: Recebimento
    @Transactional
    public Transferencia receberTransferencia(
            Long transferenciaId, Double quantidadeRecebida,
            String justificativaDivergencia, String usuario, String ip, String centroCustoSafra) {

        Transferencia trans = transferenciaRepository.findById(transferenciaId)
            .orElseThrow(() -> new IllegalArgumentException("Transferência não encontrada."));

        if (!"EM_TRANSITO".equals(trans.getStatus())) {
            throw new IllegalStateException("Esta transferência não está em trânsito (status atual: " + trans.getStatus() + ").");
        }

        Object anterior = cloneState(trans);

        Double diferenca = trans.getQuantidade() - quantidadeRecebida;
        if (diferenca < 0) {
            throw new IllegalArgumentException("A quantidade recebida não pode ser maior que a despachada.");
        }

        // Resolve original average cost from origin to maintain inventory cost valuation
        SaldoEstoque so = saldoRepository.findByLoteIdAndLocalizacaoId(trans.getLote().getId(), trans.getLocalizacaoOrigem().getId()).orElse(null);
        Double custoConsumoUnitario = so != null ? so.getCustoMedio() : 1.0;
        if (custoConsumoUnitario <= 0) {
            custoConsumoUnitario = 1.0;
        }
        Double custoCompraUnitario = custoConsumoUnitario * trans.getProduto().getFatorConversao();

        // Register entry at destination for the received quantity
        movimentacaoService.registrarEntrada(
            trans.getProduto().getId(),
            trans.getLocalizacaoDestino().getId(),
            trans.getLote().getNumeroLote(),
            trans.getLote().getDataFabricacao(),
            trans.getLote().getDataValidade(),
            quantidadeRecebida / trans.getProduto().getFatorConversao(), // Entrada expects buying units
            custoCompraUnitario, // Original unit cost in purchase units
            0.0, 0.0,
            "TRANSFERENCIA_RECEBIMENTO",
            usuario, ip,
            centroCustoSafra,
            null,
            trans.getLote().getFornecedor()
        );

        if (diferenca > 0) {
            if (justificativaDivergencia == null || justificativaDivergencia.trim().isEmpty()) {
                throw new IllegalArgumentException("Divergência detectada. É obrigatório informar justificativa de perda em trânsito.");
            }

            // Register loss
            PerdaEstoque perda = new PerdaEstoque();
            perda.setProduto(trans.getProduto());
            perda.setLote(trans.getLote());
            perda.setLocalizacao(trans.getLocalizacaoOrigem()); // recorded under origin/transit
            perda.setQuantidade(diferenca);
            perda.setMotivo("PERDA_TRANSITO");
            perda.setJustificativa("Perda em trânsito no transportador " + trans.getTransportador() + ": " + justificativaDivergencia);
            
            // Calculate mock loss monetary value
            so = saldoRepository.findByLoteIdAndLocalizacaoId(trans.getLote().getId(), trans.getLocalizacaoOrigem().getId()).orElse(null);
            Double custoUnitario = so != null ? so.getCustoMedio() : 0.0;
            perda.setValorMonetario(diferenca * custoUnitario);

            perda.setStatus("APROVADO"); // Losses under transit difference auto-approved to close transfer or flagged accordingly
            perda.setDataRegistro(LocalDateTime.now());
            perda.setUsuarioRegistro(usuario);

            perdaRepository.save(perda);
            trans.setStatus("CONCLUIDO_COM_PERDAS");
        } else {
            trans.setStatus("RECEBIDO");
        }

        trans.setDataRecebimento(LocalDateTime.now());
        trans.setUsuarioRecebimento(usuario);

        Transferencia salva = transferenciaRepository.save(trans);
        auditLogService.log(usuario, ip, "ATUALIZAR", "tb_transferencia", salva.getId(), anterior, salva);

        return salva;
    }

    private Transferencia cloneState(Transferencia original) {
        Transferencia clone = new Transferencia();
        clone.setId(original.getId());
        clone.setStatus(original.getStatus());
        clone.setDataRecebimento(original.getDataRecebimento());
        clone.setUsuarioRecebimento(original.getUsuarioRecebimento());
        return clone;
    }
}
