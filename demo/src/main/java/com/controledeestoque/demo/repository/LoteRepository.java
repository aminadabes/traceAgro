package com.controledeestoque.demo.repository;

import com.controledeestoque.demo.model.Lote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Long> {
    Optional<Lote> findByNumeroLoteAndProdutoId(String numeroLote, Long produtoId);
    List<Lote> findByStatus(String status);
}
