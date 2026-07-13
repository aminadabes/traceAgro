package com.controledeestoque.demo.repository;

import com.controledeestoque.demo.model.Inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, Long> {
    List<Inventario> findByLocalizacaoIdAndStatus(Long localizacaoId, String status);
}
