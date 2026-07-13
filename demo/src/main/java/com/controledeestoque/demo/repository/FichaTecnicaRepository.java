package com.controledeestoque.demo.repository;

import com.controledeestoque.demo.model.FichaTecnica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FichaTecnicaRepository extends JpaRepository<FichaTecnica, Long> {
    List<FichaTecnica> findByProdutoAcabadoId(Long produtoAcabadoId);
}
