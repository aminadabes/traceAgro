package com.controledeestoque.demo.repository;

import com.controledeestoque.demo.model.ItemInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ItemInventarioRepository extends JpaRepository<ItemInventario, Long> {
    List<ItemInventario> findByInventarioId(Long inventarioId);
}
