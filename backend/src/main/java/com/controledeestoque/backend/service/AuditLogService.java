package com.controledeestoque.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.controledeestoque.backend.model.AuditLog;
import com.controledeestoque.backend.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String usuario, String ip, String operacao, String entidade, Long entidadeId, Object estadoAnterior, Object estadoPosterior) {
        try {
            AuditLog log = new AuditLog();
            log.setUsuario(usuario != null ? usuario : "SISTEMA");
            log.setIp(ip != null ? ip : "127.0.0.1");
            log.setDataHora(LocalDateTime.now());
            log.setOperacao(operacao);
            log.setEntidade(entidade);
            log.setEntidadeId(entidadeId);

            if (estadoAnterior != null) {
                log.setEstadoAnterior(objectMapper.writeValueAsString(estadoAnterior));
            }
            if (estadoPosterior != null) {
                log.setEstadoPosterior(objectMapper.writeValueAsString(estadoPosterior));
            }

            auditLogRepository.save(log);
        } catch (Exception e) {
            // Log to console if audit logging fails, but do not block the transaction
            System.err.println("Erro ao gravar log de auditoria: " + e.getMessage());
        }
    }
}
