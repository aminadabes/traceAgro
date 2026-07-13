package com.controledeestoque.demo.controller;

import com.controledeestoque.demo.model.*;
import com.controledeestoque.demo.service.LookupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/lookup")
public class LookupController {

    @Autowired
    private LookupService lookupService;

    @GetMapping("/categorias")
    public ResponseEntity<List<Categoria>> obterCategorias() {
        return ResponseEntity.ok(lookupService.listarCategorias());
    }

    @GetMapping("/localizacoes")
    public ResponseEntity<List<Localizacao>> obterLocalizacoes() {
        return ResponseEntity.ok(lookupService.listarLocalizacoes());
    }

    @GetMapping("/lotes")
    public ResponseEntity<List<Lote>> obterLotes() {
        return ResponseEntity.ok(lookupService.listarLotes());
    }

    @GetMapping("/saldos")
    public ResponseEntity<List<SaldoEstoque>> obterSaldos() {
        return ResponseEntity.ok(lookupService.listarSaldos());
    }

    @GetMapping("/transferencias")
    public ResponseEntity<List<Transferencia>> obterTransferencias() {
        return ResponseEntity.ok(lookupService.listarTransferencias());
    }

    @GetMapping("/inventarios")
    public ResponseEntity<List<Inventario>> obterInventarios() {
        return ResponseEntity.ok(lookupService.listarInventarios());
    }

    @GetMapping("/perdas")
    public ResponseEntity<List<PerdaEstoque>> obterPerdas() {
        return ResponseEntity.ok(lookupService.listarPerdas());
    }

    @GetMapping("/movimentacoes")
    public ResponseEntity<List<MovimentacaoEstoque>> obterMovimentacoes() {
        return ResponseEntity.ok(lookupService.listarMovimentacoes());
    }
}
