package com.controledeestoque.backend.controller;

import com.controledeestoque.backend.model.MovimentacaoEstoque;
import com.controledeestoque.backend.service.MovimentacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/movimentacoes")
public class MovimentacaoController {

    @Autowired
    private MovimentacaoService movimentacaoService;

    public static class EntradaRequest {
        public Long produtoId;
        public Long localizacaoId;
        public String numeroLote;
        public LocalDate dataFabricacao;
        public LocalDate dataValidade;
        public Double quantidadeCompra;
        public Double valorUnitario;
        public Double frete;
        public Double impostosRateados;
        public String subTipo;
        public String centroCustoSafra;
        public String chaveNfe;
        public String fornecedorLote;
    }

    public static class SaidaRequest {
        public Long produtoId;
        public Long localizacaoId;
        public Double quantidadeSaidaConsumo;
        public String subTipo;
        public String centroCustoSafra;
    }

    @PostMapping("/entrada")
    public ResponseEntity<MovimentacaoEstoque> registrarEntrada(
            @RequestBody EntradaRequest req,
            @RequestHeader(value = "X-User", defaultValue = "ALMOXARIFE") String usuario,
            @RequestHeader(value = "X-IP", defaultValue = "127.0.0.1") String ip) {
        
        MovimentacaoEstoque salvo = movimentacaoService.registrarEntrada(
            req.produtoId, req.localizacaoId, req.numeroLote, req.dataFabricacao, req.dataValidade,
            req.quantidadeCompra, req.valorUnitario, req.frete, req.impostosRateados, req.subTipo,
            usuario, ip, req.centroCustoSafra, req.chaveNfe, req.fornecedorLote
        );
        return new ResponseEntity<>(salvo, HttpStatus.CREATED);
    }

    @PostMapping("/saida")
    public ResponseEntity<Void> registrarSaida(
            @RequestBody SaidaRequest req,
            @RequestHeader(value = "X-User", defaultValue = "ALMOXARIFE") String usuario,
            @RequestHeader(value = "X-IP", defaultValue = "127.0.0.1") String ip) {
        
        movimentacaoService.registrarSaida(
            req.produtoId, req.localizacaoId, req.quantidadeSaidaConsumo,
            req.subTipo, usuario, ip, req.centroCustoSafra
        );
        return ResponseEntity.ok().build();
    }
}
