package com.controledeestoque.demo.repository;

import com.controledeestoque.demo.model.HistoricoPeso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HistoricoPesoRepository extends JpaRepository<HistoricoPeso, Long> {
    List<HistoricoPeso> findByAtivoBiologicoIdOrderByDataPesagemDesc(Long id);
}
