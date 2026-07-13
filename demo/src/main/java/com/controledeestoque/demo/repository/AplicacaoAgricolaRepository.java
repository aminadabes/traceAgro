package com.controledeestoque.demo.repository;

import com.controledeestoque.demo.model.AplicacaoAgricola;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AplicacaoAgricolaRepository extends JpaRepository<AplicacaoAgricola, Long> {
}
