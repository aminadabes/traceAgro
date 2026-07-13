package com.controledeestoque.demo.repository;

import com.controledeestoque.demo.model.SaldoEstoque;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SaldoEstoqueRepository extends JpaRepository<SaldoEstoque, Long> {
    Optional<SaldoEstoque> findByLoteIdAndLocalizacaoId(Long loteId, Long localizacaoId);
    List<SaldoEstoque> findByLocalizacaoId(Long localizacaoId);
    List<SaldoEstoque> findByLoteProdutoId(Long produtoId);
}
