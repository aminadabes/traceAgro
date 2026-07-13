package com.controledeestoque.backend.service;

import com.controledeestoque.backend.model.*;
import com.controledeestoque.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class LookupService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private LocalizacaoRepository localizacaoRepository;

    @Autowired
    private LoteRepository loteRepository;

    @Autowired
    private SaldoEstoqueRepository saldoEstoqueRepository;

    @Autowired
    private TransferenciaRepository transferenciaRepository;

    @Autowired
    private InventarioRepository inventarioRepository;

    @Autowired
    private PerdaEstoqueRepository perdaEstoqueRepository;

    @Autowired
    private MovimentacaoEstoqueRepository movimentacaoEstoqueRepository;

    public List<Categoria> listarCategorias() {
        return categoriaRepository.findAll();
    }

    public List<Localizacao> listarLocalizacoes() {
        return localizacaoRepository.findAll();
    }

    public List<Lote> listarLotes() {
        return loteRepository.findAll();
    }

    public List<SaldoEstoque> listarSaldos() {
        return saldoEstoqueRepository.findAll();
    }

    public List<Transferencia> listarTransferencias() {
        return transferenciaRepository.findAll();
    }

    public List<Inventario> listarInventarios() {
        return inventarioRepository.findAll();
    }

    public List<PerdaEstoque> listarPerdas() {
        return perdaEstoqueRepository.findAll();
    }

    public List<MovimentacaoEstoque> listarMovimentacoes() {
        return movimentacaoEstoqueRepository.findAll();
    }
}
