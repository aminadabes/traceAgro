package com.controledeestoque.backend.repository;

import com.controledeestoque.backend.model.AplicacaoAgricola;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AplicacaoAgricolaRepository extends JpaRepository<AplicacaoAgricola, Long> {
}
