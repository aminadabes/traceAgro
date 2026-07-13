package com.controledeestoque.demo.service;

import com.controledeestoque.demo.model.*;
import com.controledeestoque.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class AplicacaoAgricolaService {

    @Autowired
    private AplicacaoAgricolaRepository aplicacaoRepository;

    @Autowired
    private LocalizacaoRepository localizacaoRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private MovimentacaoService movimentacaoService;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional
    public AplicacaoAgricola registrarAplicacao(
            Long talhaoId, String cultura, String safra, Double areaTratadaHa,
            Long produtoId, Double quantidadeConsumida, String operador, String maquina,
            String engenheiro, String receituario, boolean engenheiroAssinaturaAtiva,
            Double temperatura, Double umidade, Double velocidadeVento,
            int diasCarenciaDefensivo, String usuario, String ip) {

        // RN016 (Vínculo Legal)
        if (!engenheiroAssinaturaAtiva) {
            throw new IllegalArgumentException("OPERACÃO BLOQUEADA: Engenheiro Agrônomo não possui assinatura eletrônica ativa.");
        }

        Localizacao talhao = localizacaoRepository.findById(talhaoId)
            .orElseThrow(() -> new IllegalArgumentException("Talhão não encontrado."));

        Produto produto = produtoRepository.findById(produtoId)
            .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado."));

        // Deduct from stock (RN016: Baixa Automatizada)
        movimentacaoService.registrarSaida(
            produtoId, talhaoId, quantidadeConsumida, 
            "PLANTIO_APLICACAO", usuario, ip, safra
        );

        // RN007 (Safety Lock - Carência Sanitária do Talhão)
        LocalDateTime dataFimCarencia = LocalDateTime.now().plusDays(diasCarenciaDefensivo);
        talhao.setDataFimCarenciaTalhao(dataFimCarencia);
        localizacaoRepository.save(talhao);

        // Record agricultural application
        AplicacaoAgricola aplicacao = new AplicacaoAgricola();
        aplicacao.setTalhao(talhao);
        aplicacao.setCultura(cultura);
        aplicacao.setSafraVinculada(safra);
        aplicacao.setAreaTratadaHa(areaTratadaHa);
        aplicacao.setProduto(produto);
        aplicacao.setQuantidadeConsumida(quantidadeConsumida);
        aplicacao.setOperador(operador);
        aplicacao.setMaquina(maquina);
        aplicacao.setEngenheiroResponsavel(engenheiro);
        aplicacao.setReceituarioAgronomico(receituario);
        aplicacao.setDataHora(LocalDateTime.now());
        aplicacao.setTemperatura(temperatura);
        aplicacao.setUmidade(umidade);
        aplicacao.setVelocidadeVento(velocidadeVento);

        AplicacaoAgricola salva = aplicacaoRepository.save(aplicacao);
        auditLogService.log(usuario, ip, "CRIAR", "tb_aplicacao_agricola", salva.getId(), null, salva);

        return salva;
    }

    // Active lock check for harvesting or selling from this field
    public void validarColheitaOuVendaTalhao(Long talhaoId) {
        Localizacao talhao = localizacaoRepository.findById(talhaoId)
            .orElseThrow(() -> new IllegalArgumentException("Talhão não encontrado."));

        if (talhao.getDataFimCarenciaTalhao() != null && talhao.getDataFimCarenciaTalhao().isAfter(LocalDateTime.now())) {
            throw new IllegalStateException("OPERACÃO BLOQUEADA: O talhão está sob carência sanitária (defensivos aplicados) até " 
                + talhao.getDataFimCarenciaTalhao() + ". Colheita ou venda bloqueadas!");
        }
    }
}
