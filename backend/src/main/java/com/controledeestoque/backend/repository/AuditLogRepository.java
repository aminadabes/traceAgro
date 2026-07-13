package com.controledeestoque.backend.repository;

import com.controledeestoque.backend.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByEntidadeAndEntidadeId(String entidade, Long entidadeId);
}
