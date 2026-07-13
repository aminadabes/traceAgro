package com.controledeestoque.demo.repository;

import com.controledeestoque.demo.model.PerdaEstoque;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PerdaEstoqueRepository extends JpaRepository<PerdaEstoque, Long> {
    List<PerdaEstoque> findByStatus(String status);
}
