package com.controledeestoque.backend.repository;

import com.controledeestoque.backend.model.PerdaEstoque;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PerdaEstoqueRepository extends JpaRepository<PerdaEstoque, Long> {
    List<PerdaEstoque> findByStatus(String status);
}
