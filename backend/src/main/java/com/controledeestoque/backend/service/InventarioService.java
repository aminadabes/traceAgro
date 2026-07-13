package com.controledeestoque.backend.service;

import com.controledeestoque.backend.model.*;
import com.controledeestoque.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class InventarioService {

    @Autowired
    private InventarioRepository inventarioRepository;

    @Autowired
    private ItemInventarioRepository itemInventarioRepository;

    @Autowired
    private LocalizacaoRepository localizacaoRepository;

    @Autowired
    private SaldoEstoqueRepository saldoRepository;

    @Autowired
    private MovimentacaoService movimentacaoService;

    @Autowired
    private AuditLogService auditLogService;

    public static class ContagemItem {
        public Long produtoId;
        public Long loteId;
        public Double quantidadeFisica;

        public ContagemItem() {}
        public ContagemItem(Long produtoId, Long loteId, Double quantidadeFisica) {
            this.produtoId = produtoId;
            this.loteId = loteId;
            this.quantidadeFisica = quantidadeFisica;
        }
    }

    @Transactional
    public Inventario abrirInventario(Long localizacaoId, String responsavel, String usuario, String ip) {
        Localizacao loc = localizacaoRepository.findById(localizacaoId)
            .orElseThrow(() -> new IllegalArgumentException("Localização não encontrada."));

        if (Boolean.TRUE.equals(loc.getBloqueadoParaInventario())) {
            throw new IllegalStateException("Esta localização já está sob inventário.");
        }

        // RN014: Lock the location
        loc.setBloqueadoParaInventario(true);
        localizacaoRepository.save(loc);

        Inventario inv = new Inventario();
        inv.setLocalizacao(loc);
        inv.setDataAbertura(LocalDateTime.now());
        inv.setStatus("ABERTO");
        inv.setResponsavel(responsavel);
        Inventario salvo = inventarioRepository.save(inv);

        // Snapshot current stock balances
        List<SaldoEstoque> saldos = saldoRepository.findByLocalizacaoId(localizacaoId);
        for (SaldoEstoque saldo : saldos) {
            if (saldo.getQuantidade() > 0) {
                ItemInventario item = new ItemInventario();
                item.setInventario(salvo);
                item.setProduto(saldo.getLote().getProduto());
                item.setLote(saldo.getLote());
                item.setQuantidadeLogistica(saldo.getQuantidade());
                item.setQuantidadeFisica(0.0); // Will be updated on counting
                itemInventarioRepository.save(item);
            }
        }

        auditLogService.log(usuario, ip, "CRIAR", "tb_inventario", salvo.getId(), null, salvo);
        return salvo;
    }

    @Transactional
    public Inventario concluirInventario(Long inventarioId, List<ContagemItem> contagens, String usuario, String ip) {
        Inventario inv = inventarioRepository.findById(inventarioId)
            .orElseThrow(() -> new IllegalArgumentException("Inventário não encontrado."));

        if (!"ABERTO".equals(inv.getStatus())) {
            throw new IllegalStateException("Este inventário já foi fechado.");
        }

        Localizacao loc = inv.getLocalizacao();
        Object anteriorInv = cloneState(inv);

        // Fetch snapshot items
        List<ItemInventario> itens = itemInventarioRepository.findByInventarioId(inventarioId);
        Map<String, ItemInventario> itemMap = itens.stream()
            .collect(Collectors.toMap(
                i -> i.getProduto().getId() + "_" + i.getLote().getId(),
                i -> i
            ));

        // Process counting results
        for (ContagemItem cont : contagens) {
            String key = cont.produtoId + "_" + cont.loteId;
            ItemInventario item = itemMap.get(key);

            if (item != null) {
                item.setQuantidadeFisica(cont.quantidadeFisica);
                itemInventarioRepository.save(item);

                Double diff = cont.quantidadeFisica - item.getQuantidadeLogistica();
                adjustStock(loc, item.getProduto(), item.getLote(), diff, usuario, ip);
            } else {
                // New batch/item found physically that wasn't in system snapshot
                SaldoEstoque se = saldoRepository.findByLoteIdAndLocalizacaoId(cont.loteId, loc.getId()).orElse(null);
                Double logistica = se != null ? se.getQuantidade() : 0.0;

                ItemInventario novoItem = new ItemInventario();
                novoItem.setInventario(inv);
                
                SaldoEstoque dummySaldo = saldoRepository.findByLoteIdAndLocalizacaoId(cont.loteId, loc.getId()).orElse(null);
                if (dummySaldo == null) {
                    throw new IllegalArgumentException("Lote/Produto de contagem avulsa inválido.");
                }
                
                novoItem.setProduto(dummySaldo.getLote().getProduto());
                novoItem.setLote(dummySaldo.getLote());
                novoItem.setQuantidadeLogistica(logistica);
                novoItem.setQuantidadeFisica(cont.quantidadeFisica);
                itemInventarioRepository.save(novoItem);

                Double diff = cont.quantidadeFisica - logistica;
                adjustStock(loc, dummySaldo.getLote().getProduto(), dummySaldo.getLote(), diff, usuario, ip);
            }
        }

        // Complete inventory and unlock location
        inv.setStatus("CONCLUIDO");
        inv.setDataFechamento(LocalDateTime.now());
        inventarioRepository.save(inv);

        loc.setBloqueadoParaInventario(false);
        localizacaoRepository.save(loc);

        auditLogService.log(usuario, ip, "ATUALIZAR", "tb_inventario", inv.getId(), anteriorInv, inv);
        return inv;
    }

    private void adjustStock(Localizacao loc, Produto prod, Lote lote, Double diff, String usuario, String ip) {
        if (diff == 0) return;

        if (diff > 0) {
            // Surplus: Register adjustment entry
            movimentacaoService.registrarEntrada(
                prod.getId(),
                loc.getId(),
                lote.getNumeroLote(),
                lote.getDataFabricacao(),
                lote.getDataValidade(),
                diff / prod.getFatorConversao(),
                prod.getPesoLiquido() != null ? prod.getPesoLiquido() : 1.0, // default unit cost
                0.0, 0.0,
                "AJUSTE_INVENTARIO",
                usuario, ip,
                "AJUSTE_INVENTARIO",
                null,
                lote.getFornecedor()
            );
        } else {
            // Deficit: Register adjustment exit (passed as absolute quantity)
            movimentacaoService.registrarSaida(
                prod.getId(),
                loc.getId(),
                Math.abs(diff),
                "AJUSTE_INVENTARIO",
                usuario, ip,
                "AJUSTE_INVENTARIO"
            );
        }
    }

    private Inventario cloneState(Inventario original) {
        Inventario clone = new Inventario();
        clone.setId(original.getId());
        clone.setStatus(original.getStatus());
        clone.setDataFechamento(original.getDataFechamento());
        return clone;
    }
}
