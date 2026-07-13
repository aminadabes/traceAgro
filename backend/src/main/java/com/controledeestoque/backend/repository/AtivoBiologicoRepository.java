package com.controledeestoque.backend.repository;

import com.controledeestoque.backend.model.AtivoBiologico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AtivoBiologicoRepository extends JpaRepository<AtivoBiologico, Long> {
    Optional<AtivoBiologico> findByIdentificadorUnico(String identificadorUnico);
}
