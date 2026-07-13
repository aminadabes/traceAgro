package com.controledeestoque.backend.service;

import com.controledeestoque.backend.model.SaldoEstoque;
import com.controledeestoque.backend.repository.SaldoEstoqueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CompraService {

    @Autowired
    private SaldoEstoqueRepository saldoRepository;

    // RN018 (Variáveis de Reposição - Sugestão de Compra Inteligente)
    public Double calcularSugestaoReposicao(
            Long produtoId, Double pontoRessuprimentoMinimo,
            Double consumoMedioDiario, int leadTimeFornecedorDias,
            Double pedidosEmAbertoNaoEntregues) {

        // Find total physical quantity in stock for this product across all locations
        List<SaldoEstoque> saldos = saldoRepository.findByLoteProdutoId(produtoId);
        Double estoqueFisicoAtual = saldos.stream()
            .mapToDouble(SaldoEstoque::getQuantidade)
            .sum();

        // Calculate safety buffer / demand during lead time
        Double consumoDuranteLeadTime = consumoMedioDiario * leadTimeFornecedorDias;

        // Formula: Target Stock = Point of Replenishment + Lead Time Consumption
        Double estoqueMeta = pontoRessuprimentoMinimo + consumoDuranteLeadTime;

        // Net Inventory = Physical Stock + On Order
        Double inventarioNet = estoqueFisicoAtual + pedidosEmAbertoNaoEntregues;

        Double sugestao = estoqueMeta - inventarioNet;

        return sugestao > 0 ? sugestao : 0.0;
    }
}
