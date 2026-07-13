package com.controledeestoque.demo.service;

import com.controledeestoque.demo.model.AtivoBiologico;
import com.controledeestoque.demo.model.HistoricoPeso;
import com.controledeestoque.demo.repository.AtivoBiologicoRepository;
import com.controledeestoque.demo.repository.HistoricoPesoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AtivoBiologicoService {

    @Autowired
    private AtivoBiologicoRepository ativoBiologicoRepository;

    @Autowired
    private HistoricoPesoRepository historicoPesoRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional
    public AtivoBiologico cadastrarAnimal(AtivoBiologico animal, String usuario, String ip) {
        if (ativoBiologicoRepository.findByIdentificadorUnico(animal.getIdentificadorUnico()).isPresent()) {
            throw new IllegalArgumentException("Identificador Único (Brinco/RFID) já cadastrado: " + animal.getIdentificadorUnico());
        }

        AtivoBiologico salvo = ativoBiologicoRepository.save(animal);
        
        // Save initial weight to history if present
        if (animal.getPesoAtual() != null && animal.getPesoAtual() > 0) {
            HistoricoPeso hp = new HistoricoPeso();
            hp.setAtivoBiologico(salvo);
            hp.setDataPesagem(LocalDateTime.now());
            hp.setPeso(animal.getPesoAtual());
            historicoPesoRepository.save(hp);
        }

        auditLogService.log(usuario, ip, "CRIAR", "tb_ativo_biologico", salvo.getId(), null, salvo);
        return salvo;
    }

    @Transactional
    public void registrarPesagem(String identificadorUnico, Double peso, String usuario, String ip) {
        if (peso == null || peso <= 0) {
            throw new IllegalArgumentException("Peso deve ser maior que zero.");
        }

        AtivoBiologico animal = ativoBiologicoRepository.findByIdentificadorUnico(identificadorUnico)
            .orElseThrow(() -> new IllegalArgumentException("Animal não encontrado com identificador: " + identificadorUnico));

        Object anterior = cloneState(animal);

        animal.setPesoAtual(peso);
        ativoBiologicoRepository.save(animal);

        HistoricoPeso hp = new HistoricoPeso();
        hp.setAtivoBiologico(animal);
        hp.setDataPesagem(LocalDateTime.now());
        hp.setPeso(peso);
        historicoPesoRepository.save(hp);

        auditLogService.log(usuario, ip, "ATUALIZAR", "tb_ativo_biologico", animal.getId(), anterior, animal);
    }

    @Transactional
    public void aplicarMedicamento(String identificadorUnico, int diasCarencia, String usuario, String ip) {
        AtivoBiologico animal = ativoBiologicoRepository.findByIdentificadorUnico(identificadorUnico)
            .orElseThrow(() -> new IllegalArgumentException("Animal não encontrado com identificador: " + identificadorUnico));

        Object anterior = cloneState(animal);

        LocalDateTime dataFim = LocalDateTime.now().plusDays(diasCarencia);
        animal.setDataFimCarencia(dataFim);
        animal.setStatusSaude("QUARENTENA");
        ativoBiologicoRepository.save(animal);

        auditLogService.log(usuario, ip, "ATUALIZAR", "tb_ativo_biologico", animal.getId(), anterior, animal);
    }

    public boolean estaEmCarencia(AtivoBiologico animal) {
        return animal.getDataFimCarencia() != null && animal.getDataFimCarencia().isAfter(LocalDateTime.now());
    }

    // RN007 (Safety Lock - Bloqueio Ativo)
    public void emitirGuiaTransporteOuVenda(String identificadorUnico) {
        AtivoBiologico animal = ativoBiologicoRepository.findByIdentificadorUnico(identificadorUnico)
            .orElseThrow(() -> new IllegalArgumentException("Animal não encontrado com identificador: " + identificadorUnico));

        if (estaEmCarencia(animal)) {
            throw new IllegalStateException("OPERACÃO BLOQUEADA: O animal " + identificadorUnico 
                + " está em período de carência sanitária até " + animal.getDataFimCarencia() 
                + ". Emissão de GTA, venda ou abate bloqueados!");
        }
    }

    public List<HistoricoPeso> obterHistoricoPeso(String identificadorUnico) {
        AtivoBiologico animal = ativoBiologicoRepository.findByIdentificadorUnico(identificadorUnico)
            .orElseThrow(() -> new IllegalArgumentException("Animal não encontrado com identificador: " + identificadorUnico));
        return historicoPesoRepository.findByAtivoBiologicoIdOrderByDataPesagemDesc(animal.getId());
    }

    public List<AtivoBiologico> listarTodos() {
        return ativoBiologicoRepository.findAll();
    }

    private AtivoBiologico cloneState(AtivoBiologico original) {
        AtivoBiologico clone = new AtivoBiologico();
        clone.setId(original.getId());
        clone.setIdentificadorUnico(original.getIdentificadorUnico());
        clone.setPesoAtual(original.getPesoAtual());
        clone.setStatusSaude(original.getStatusSaude());
        clone.setDataFimCarencia(original.getDataFimCarencia());
        clone.setLocalizacaoAtual(original.getLocalizacaoAtual());
        return clone;
    }
}

