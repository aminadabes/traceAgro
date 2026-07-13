package com.controledeestoque.demo.service;

import com.controledeestoque.demo.model.Categoria;
import com.controledeestoque.demo.model.Produto;
import com.controledeestoque.demo.repository.CategoriaRepository;
import com.controledeestoque.demo.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Arrays;
import java.util.List;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private AuditLogService auditLogService;

    private static final List<String> DESTINACOES_VALIDAS = Arrays.asList(
        "Consumivel", "Revenda", "Producao Própria", "Imobilizado", "Uso Veterinario", "Uso Agricola", "Uso Administrativo"
    );

    @Transactional
    public Produto cadastrarProduto(Produto produto, String usuario, String ip) {
        if (produto.getCategoria() == null || produto.getCategoria().getId() == null) {
            throw new IllegalArgumentException("Categoria é obrigatória e o ID deve ser fornecido.");
        }
        Categoria cat = categoriaRepository.findById(produto.getCategoria().getId())
            .orElseThrow(() -> new IllegalArgumentException("Categoria informada não existe com o ID: " + produto.getCategoria().getId()));
        produto.setCategoria(cat);
        // RN001 (Unicidade)
        if (produtoRepository.findByCodigoInterno(produto.getCodigoInterno()).isPresent()) {
            throw new IllegalArgumentException("Código Interno já cadastrado: " + produto.getCodigoInterno());
        }
        if (produto.getEan() != null && !produto.getEan().isEmpty() &&
            produtoRepository.findByEan(produto.getEan()).isPresent()) {
            throw new IllegalArgumentException("Código de Barras (EAN) já cadastrado: " + produto.getEan());
        }
        if (produto.getRegistroMapa() != null && !produto.getRegistroMapa().isEmpty() &&
            produtoRepository.findByRegistroMapa(produto.getRegistroMapa()).isPresent()) {
            throw new IllegalArgumentException("Registro MAPA já cadastrado: " + produto.getRegistroMapa());
        }

        // RN002 (Destinação)
        if (!DESTINACOES_VALIDAS.contains(produto.getDestinacao())) {
            throw new IllegalArgumentException("Destinação inválida. Valores aceitos: " + DESTINACOES_VALIDAS);
        }

        if (produto.getFatorConversao() == null || produto.getFatorConversao() <= 0) {
            throw new IllegalArgumentException("O fator de conversão de unidades deve ser maior que zero.");
        }

        Produto salvo = produtoRepository.save(produto);
        auditLogService.log(usuario, ip, "CRIAR", "tb_produto", salvo.getId(), null, salvo);
        return salvo;
    }

    public List<Produto> listarTodos() {
        return produtoRepository.findAll();
    }
}
