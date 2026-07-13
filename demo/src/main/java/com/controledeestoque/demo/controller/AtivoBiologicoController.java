package com.controledeestoque.demo.controller;

import com.controledeestoque.demo.model.AtivoBiologico;
import com.controledeestoque.demo.model.HistoricoPeso;
import com.controledeestoque.demo.service.AtivoBiologicoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ativos-biologicos")
public class AtivoBiologicoController {

    @Autowired
    private AtivoBiologicoService ativoBiologicoService;

    @PostMapping
    public ResponseEntity<AtivoBiologico> cadastrar(
            @RequestBody AtivoBiologico animal,
            @RequestHeader(value = "X-User", defaultValue = "VETERINARIO") String usuario,
            @RequestHeader(value = "X-IP", defaultValue = "127.0.0.1") String ip) {
        AtivoBiologico salvo = ativoBiologicoService.cadastrarAnimal(animal, usuario, ip);
        return new ResponseEntity<>(salvo, HttpStatus.CREATED);
    }

    @PostMapping("/{identificador}/pesagem")
    public ResponseEntity<Void> registrarPesagem(
            @PathVariable String identificador,
            @RequestParam Double peso,
            @RequestHeader(value = "X-User", defaultValue = "OPERADOR") String usuario,
            @RequestHeader(value = "X-IP", defaultValue = "127.0.0.1") String ip) {
        ativoBiologicoService.registrarPesagem(identificador, peso, usuario, ip);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{identificador}/aplicar-medicamento")
    public ResponseEntity<Void> aplicarMedicamento(
            @PathVariable String identificador,
            @RequestParam int diasCarencia,
            @RequestHeader(value = "X-User", defaultValue = "VETERINARIO") String usuario,
            @RequestHeader(value = "X-IP", defaultValue = "127.0.0.1") String ip) {
        ativoBiologicoService.aplicarMedicamento(identificador, diasCarencia, usuario, ip);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{identificador}/emitir-gta")
    public ResponseEntity<String> emitirGta(@PathVariable String identificador) {
        try {
            ativoBiologicoService.emitirGuiaTransporteOuVenda(identificador);
            return ResponseEntity.ok("GTA emitida com sucesso para o animal " + identificador);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @GetMapping("/{identificador}/historico-peso")
    public ResponseEntity<List<HistoricoPeso>> obterHistoricoPeso(@PathVariable String identificador) {
        return ResponseEntity.ok(ativoBiologicoService.obterHistoricoPeso(identificador));
    }

    @GetMapping
    public ResponseEntity<List<AtivoBiologico>> listar() {
        return ResponseEntity.ok(ativoBiologicoService.listarTodos());
    }
}

