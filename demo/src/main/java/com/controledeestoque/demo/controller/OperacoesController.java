package com.controledeestoque.demo.controller;

import com.controledeestoque.demo.model.*;
import com.controledeestoque.demo.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/operacoes")
public class OperacoesController {

    @Autowired
    private TransferenciaService transferenciaService;

    @Autowired
    private InventarioService inventarioService;

    @Autowired
    private PerdaService perdaService;

    @Autowired
    private AplicacaoAgricolaService aplicacaoAgricolaService;

    @Autowired
    private ProducaoService producaoService;

    @Autowired
    private CompraService compraService;

    @Autowired
    private RecallService recallService;

    // --- TRANSFERENCIA ---
    @PostMapping("/transferencias/despacho")
    public ResponseEntity<Transferencia> despachar(
            @RequestParam Long produtoId, @RequestParam Long loteId, @RequestParam Double quantidade,
            @RequestParam Long localizacaoOrigemId, @RequestParam Long localizacaoDestinoId,
            @RequestParam String transportador,
            @RequestHeader(value = "X-User", defaultValue = "ALMOXARIFE") String usuario,
            @RequestHeader(value = "X-IP", defaultValue = "127.0.0.1") String ip,
            @RequestParam String centroCustoSafra) {
        
        Transferencia t = transferenciaService.despacharTransferencia(
            produtoId, loteId, quantidade, localizacaoOrigemId, localizacaoDestinoId,
            transportador, usuario, ip, centroCustoSafra
        );
        return new ResponseEntity<>(t, HttpStatus.CREATED);
    }

    @PostMapping("/transferencias/{id}/recebimento")
    public ResponseEntity<Transferencia> receber(
            @PathVariable Long id,
            @RequestParam Double quantidadeRecebida,
            @RequestParam(required = false) String justificativaDivergencia,
            @RequestHeader(value = "X-User", defaultValue = "ALMOXARIFE") String usuario,
            @RequestHeader(value = "X-IP", defaultValue = "127.0.0.1") String ip,
            @RequestParam String centroCustoSafra) {
        
        Transferencia t = transferenciaService.receberTransferencia(
            id, quantidadeRecebida, justificativaDivergencia, usuario, ip, centroCustoSafra
        );
        return ResponseEntity.ok(t);
    }

    // --- INVENTARIO ---
    @PostMapping("/inventarios/abrir")
    public ResponseEntity<Inventario> abrirInventario(
            @RequestParam Long localizacaoId, @RequestParam String responsavel,
            @RequestHeader(value = "X-User", defaultValue = "ALMOXARIFE") String usuario,
            @RequestHeader(value = "X-IP", defaultValue = "127.0.0.1") String ip) {
        
        Inventario i = inventarioService.abrirInventario(localizacaoId, responsavel, usuario, ip);
        return new ResponseEntity<>(i, HttpStatus.CREATED);
    }

    @PostMapping("/inventarios/{id}/concluir")
    public ResponseEntity<Inventario> concluirInventario(
            @PathVariable Long id,
            @RequestBody List<InventarioService.ContagemItem> contagens,
            @RequestHeader(value = "X-User", defaultValue = "ALMOXARIFE") String usuario,
            @RequestHeader(value = "X-IP", defaultValue = "127.0.0.1") String ip) {
        
        Inventario i = inventarioService.concluirInventario(id, contagens, usuario, ip);
        return ResponseEntity.ok(i);
    }

    // --- PERDAS ---
    @PostMapping("/perdas")
    public ResponseEntity<PerdaEstoque> registrarPerda(
            @RequestParam Long produtoId, @RequestParam Long loteId, @RequestParam Long localizacaoId,
            @RequestParam Double quantidade, @RequestParam String motivo, @RequestParam String justificativa,
            @RequestHeader(value = "X-User", defaultValue = "ALMOXARIFE") String usuario,
            @RequestHeader(value = "X-IP", defaultValue = "127.0.0.1") String ip) {
        
        PerdaEstoque p = perdaService.registrarPerda(produtoId, loteId, localizacaoId, quantidade, motivo, justificativa, usuario, ip);
        return new ResponseEntity<>(p, HttpStatus.CREATED);
    }

    @PostMapping("/perdas/{id}/aprovar")
    public ResponseEntity<Void> aprovarPerda(
            @PathVariable Long id,
            @RequestParam String usuarioAprovador,
            @RequestParam String roleAprovador,
            @RequestHeader(value = "X-User", defaultValue = "GERENTE") String usuario,
            @RequestHeader(value = "X-IP", defaultValue = "127.0.0.1") String ip) {
        
        perdaService.aprovarPerda(id, usuarioAprovador, roleAprovador, usuario, ip);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/perdas/{id}/rejeitar")
    public ResponseEntity<Void> rejeitarPerda(
            @PathVariable Long id,
            @RequestParam String usuarioAprovador,
            @RequestParam String roleAprovador,
            @RequestHeader(value = "X-User", defaultValue = "GERENTE") String usuario,
            @RequestHeader(value = "X-IP", defaultValue = "127.0.0.1") String ip) {
        
        perdaService.rejeitarPerda(id, usuarioAprovador, roleAprovador, usuario, ip);
        return ResponseEntity.ok().build();
    }

    // --- APLICACAO AGRICOLA ---
    @PostMapping("/aplicacoes-agricolas")
    public ResponseEntity<AplicacaoAgricola> aplicar(
            @RequestParam Long talhaoId, @RequestParam String cultura, @RequestParam String safra, @RequestParam Double areaTratadaHa,
            @RequestParam Long produtoId, @RequestParam Double quantidadeConsumida, @RequestParam String operador, @RequestParam String maquina,
            @RequestParam String engenheiro, @RequestParam String receituario, @RequestParam boolean engenheiroAssinaturaAtiva,
            @RequestParam Double temperatura, @RequestParam Double umidade, @RequestParam Double velocidadeVento,
            @RequestParam int diasCarenciaDefensivo,
            @RequestHeader(value = "X-User", defaultValue = "AGRONOMO") String usuario,
            @RequestHeader(value = "X-IP", defaultValue = "127.0.0.1") String ip) {
        
        AplicacaoAgricola a = aplicacaoAgricolaService.registrarAplicacao(
            talhaoId, cultura, safra, areaTratadaHa, produtoId, quantidadeConsumida, operador, maquina,
            engenheiro, receituario, engenheiroAssinaturaAtiva, temperatura, umidade, velocidadeVento,
            diasCarenciaDefensivo, usuario, ip
        );
        return new ResponseEntity<>(a, HttpStatus.CREATED);
    }

    // --- PRODUCAO INDUSTRIAL ---
    @PostMapping("/producao")
    public ResponseEntity<Void> produzir(
            @RequestParam Long produtoAcabadoId, @RequestParam Double quantidadeProduzir,
            @RequestParam Long localizacaoInsumosId, @RequestParam Long localizacaoDestinoId,
            @RequestParam String numeroLoteNovo,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate validadeNova,
            @RequestHeader(value = "X-User", defaultValue = "OPERADOR") String usuario,
            @RequestHeader(value = "X-IP", defaultValue = "127.0.0.1") String ip,
            @RequestParam String centroCustoSafra) {
        
        producaoService.produzirProdutoAcabado(
            produtoAcabadoId, quantidadeProduzir, localizacaoInsumosId, localizacaoDestinoId,
            numeroLoteNovo, validadeNova, usuario, ip, centroCustoSafra
        );
        return ResponseEntity.ok().build();
    }

    // --- COMPRAS ---
    @GetMapping("/compras/sugestao")
    public ResponseEntity<Double> obterSugestaoCompra(
            @RequestParam Long produtoId, @RequestParam Double pontoRessuprimentoMinimo,
            @RequestParam Double consumoMedioDiario, @RequestParam int leadTimeFornecedorDias,
            @RequestParam Double pedidosEmAbertoNaoEntregues) {
        
        Double sugestao = compraService.calcularSugestaoReposicao(
            produtoId, pontoRessuprimentoMinimo, consumoMedioDiario, leadTimeFornecedorDias, pedidosEmAbertoNaoEntregues
        );
        return ResponseEntity.ok(sugestao);
    }

    // --- RECALL ---
    @GetMapping("/recall/rastreabilidade-reversa")
    public ResponseEntity<RecallService.RecallResult> rastrearReverso(
            @RequestParam String numeroLote, @RequestParam Long produtoId) {
        return ResponseEntity.ok(recallService.obterRastreabilidadeReversa(numeroLote, produtoId));
    }
}
