package com.controledeestoque.demo.repository;

import com.controledeestoque.demo.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    Optional<Produto> findByCodigoInterno(String codigoInterno);
    Optional<Produto> findByEan(String ean);
    Optional<Produto> findByRegistroMapa(String registroMapa);
}
