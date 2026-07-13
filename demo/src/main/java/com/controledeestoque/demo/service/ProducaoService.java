package com.controledeestoque.demo.service;

import com.controledeestoque.demo.model.*;
import com.controledeestoque.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class ProducaoService {

    @Autowired
    private FichaTecnicaRepository fichaTecnicaRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private MovimentacaoService movimentacaoService;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional
    public void produzirProdutoAcabado(
            Long produtoAcabadoId, Double quantidadeProduzir,
            Long localizacaoInsumosId, Long localizacaoDestinoId,
            String numeroLoteNovo, LocalDate validadeNova,
            String usuario, String ip, String centroCustoSafra) {

        Produto acabado = produtoRepository.findById(produtoAcabadoId)
            .orElseThrow(() -> new IllegalArgumentException("Produto acabado não encontrado."));

        List<FichaTecnica> receitas = fichaTecnicaRepository.findByProdutoAcabadoId(produtoAcabadoId);
        if (receitas.isEmpty()) {
            throw new IllegalArgumentException("Nenhuma Ficha Técnica cadastrada para o produto: " + acabado.getDescricao());
        }

        // 1. RN017: Explosão de Materiais - Deduct each insumo in proportion
        for (FichaTecnica ft : receitas) {
            Double qtdNecessaria = ft.getQuantidadeProporcional() * quantidadeProduzir;
            
            // Deduct the insumo from the inputs location
            movimentacaoService.registrarSaida(
                ft.getInsumo().getId(),
                localizacaoInsumosId,
                qtdNecessaria,
                "CONSUMO_INTERNO",
                usuario, ip,
                centroCustoSafra
            );
        }

        // 2. Generate entry for the finished product
        // Fator de conversão divides quantities into purchase units, so divide by conversion factor when creating entries
        Double quantidadeCompra = quantidadeProduzir / acabado.getFatorConversao();

        // Calculate a dummy unit production cost based on default price
        Double valorMockUnitario = acabado.getPesoLiquido() != null ? acabado.getPesoLiquido() : 10.0;

        movimentacaoService.registrarEntrada(
            produtoAcabadoId,
            localizacaoDestinoId,
            numeroLoteNovo,
            LocalDate.now(), // fabrication date
            validadeNova,
            quantidadeCompra,
            valorMockUnitario,
            0.0, 0.0,
            "PRODUCAO_PROPRIA",
            usuario, ip,
            centroCustoSafra,
            null, // no invoice
            "PRODUCAO_INTERNA"
        );

        auditLogService.log(usuario, ip, "PRODUZIR", "tb_produto", acabado.getId(), null, acabado);
    }
}
