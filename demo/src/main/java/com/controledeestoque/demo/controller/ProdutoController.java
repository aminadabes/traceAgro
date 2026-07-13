package com.controledeestoque.demo.controller;

import com.controledeestoque.demo.model.Produto;
import com.controledeestoque.demo.service.ProdutoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    @Autowired
    private ProdutoService produtoService;

    @PostMapping
    public ResponseEntity<Produto> cadastrar(
            @RequestBody Produto produto,
            @RequestHeader(value = "X-User", defaultValue = "ALMOXARIFE") String usuario,
            @RequestHeader(value = "X-IP", defaultValue = "127.0.0.1") String ip) {
        Produto salvo = produtoService.cadastrarProduto(produto, usuario, ip);
        return new ResponseEntity<>(salvo, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Produto>> listar() {
        return ResponseEntity.ok(produtoService.listarTodos());
    }
}
