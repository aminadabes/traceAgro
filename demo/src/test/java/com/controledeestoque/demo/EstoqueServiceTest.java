package com.controledeestoque.demo;

import com.controledeestoque.demo.model.*;
import com.controledeestoque.demo.service.*;
import com.controledeestoque.demo.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class EstoqueServiceTest {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private LocalizacaoRepository localizacaoRepository;

    @Autowired
    private LoteRepository loteRepository;

    @Autowired
    private SaldoEstoqueRepository saldoRepository;

    @Autowired
    private FichaTecnicaRepository fichaTecnicaRepository;

    @Autowired
    private ProdutoService produtoService;

    @Autowired
    private AtivoBiologicoService ativoBiologicoService;

    @Autowired
    private MovimentacaoService movimentacaoService;

    @Autowired
    private TransferenciaService transferenciaService;

    @Autowired
    private InventarioService inventarioService;

    @Autowired
    private PerdaService perdaService;

    @Autowired
    private AplicacaoAgricolaService aplicacaoAgricolaService;

    @Autowired
    private ProducaoService producaoService;

    @Autowired
    private CompraService compraService;

    @Autowired
    private RecallService recallService;

    private Categoria catGraos;
    private Categoria catMedicamentos;
    private Categoria catDefensivos;
    
    private Produto prodMilho;
    private Produto prodSoja;
    private Produto prodRacao;
    private Produto prodVacina;
    private Produto prodDefensivo;

    private Localizacao locSiloA;
    private Localizacao locCurral;
    private Localizacao locTalhao;

    @BeforeEach
    public void setUp() {
        // Clear old database records if any
        fichaTecnicaRepository.deleteAll();
        saldoRepository.deleteAll();
        loteRepository.deleteAll();
        produtoRepository.deleteAll();
        categoriaRepository.deleteAll();
        localizacaoRepository.deleteAll();

        // 1. Create categories
        catGraos = new Categoria();
        catGraos.setNome("Grãos e Insumos");
        catGraos.setLoteObrigatorio(true);
        catGraos.setValidadeObrigatoria(false);
        catGraos.setDiasAlertaVencimento(90);
        catGraos = categoriaRepository.save(catGraos);

        catMedicamentos = new Categoria();
        catMedicamentos.setNome("Medicamentos");
        catMedicamentos.setLoteObrigatorio(true);
        catMedicamentos.setValidadeObrigatoria(true);
        catMedicamentos.setDiasAlertaVencimento(180);
        catMedicamentos = categoriaRepository.save(catMedicamentos);

        catDefensivos = new Categoria();
        catDefensivos.setNome("Defensivos Agrícolas");
        catDefensivos.setLoteObrigatorio(true);
        catDefensivos.setValidadeObrigatoria(true);
        catDefensivos.setDiasAlertaVencimento(180);
        catDefensivos = categoriaRepository.save(catDefensivos);

        // 2. Create products
        prodMilho = new Produto();
        prodMilho.setCodigoInterno("MILHO-01");
        prodMilho.setDescricao("Milho Moído");
        prodMilho.setCategoria(catGraos);
        prodMilho.setUnidadeCompra("Saco 50kg");
        prodMilho.setUnidadeConsumo("kg");
        prodMilho.setFatorConversao(50.0);
        prodMilho.setDestinacao("Consumivel");
        prodMilho = produtoRepository.save(prodMilho);

        prodSoja = new Produto();
        prodSoja.setCodigoInterno("SOJA-01");
        prodSoja.setDescricao("Farelo de Soja");
        prodSoja.setCategoria(catGraos);
        prodSoja.setUnidadeCompra("Saco 60kg");
        prodSoja.setUnidadeConsumo("kg");
        prodSoja.setFatorConversao(60.0);
        prodSoja.setDestinacao("Consumivel");
        prodSoja = produtoRepository.save(prodSoja);

        prodRacao = new Produto();
        prodRacao.setCodigoInterno("RACAO-FT");
        prodRacao.setDescricao("Ração Produzida");
        prodRacao.setCategoria(catGraos);
        prodRacao.setUnidadeCompra("Ton");
        prodRacao.setUnidadeConsumo("kg");
        prodRacao.setFatorConversao(1000.0);
        prodRacao.setDestinacao("Producao Própria");
        prodRacao = produtoRepository.save(prodRacao);

        prodVacina = new Produto();
        prodVacina.setCodigoInterno("VAC-01");
        prodVacina.setDescricao("Vacina Contra Aftosa");
        prodVacina.setCategoria(catMedicamentos);
        prodVacina.setUnidadeCompra("Frasco 100ml");
        prodVacina.setUnidadeConsumo("ml");
        prodVacina.setFatorConversao(100.0);
        prodVacina.setDestinacao("Uso Veterinario");
        prodVacina = produtoRepository.save(prodVacina);

        prodDefensivo = new Produto();
        prodDefensivo.setCodigoInterno("DEF-01");
        prodDefensivo.setDescricao("Defensivo de Alta Toxicidade");
        prodDefensivo.setCategoria(catDefensivos);
        prodDefensivo.setUnidadeCompra("Galao 20L");
        prodDefensivo.setUnidadeConsumo("ml");
        prodDefensivo.setFatorConversao(20000.0);
        prodDefensivo.setDestinacao("Uso Agricola");
        prodDefensivo.setClasseToxicologica("CLASSE-I-EXTREMAMENTE-TOXICO");
        prodDefensivo = produtoRepository.save(prodDefensivo);

        // 3. Create locations
        locSiloA = new Localizacao();
        locSiloA.setFazenda("Fazenda Central");
        locSiloA.setArmazemGalpao("Silo A");
        locSiloA.setAreaCritica(false);
        locSiloA = localizacaoRepository.save(locSiloA);

        locCurral = new Localizacao();
        locCurral.setFazenda("Fazenda Central");
        locCurral.setArmazemGalpao("Curral de Manejo");
        locCurral.setAreaCritica(false);
        locCurral = localizacaoRepository.save(locCurral);

        // Toxic defensive must be placed in a critical/safety location
        locTalhao = new Localizacao();
        locTalhao.setFazenda("Fazenda Norte");
        locTalhao.setSiloCurralTalhao("Talhão 5");
        locTalhao.setAreaCritica(true); // isolated for toxicity
        locTalhao = localizacaoRepository.save(locTalhao);
    }

    // --- TEST RF001 & RN001: Uniqueness Checks ---
    @Test
    public void testCadastrarProdutoRepetido() {
        Produto p2 = new Produto();
        p2.setCodigoInterno("MILHO-01"); // Duplicate Internal Code
        p2.setDescricao("Outro Milho");
        p2.setCategoria(catGraos);
        p2.setUnidadeCompra("KG");
        p2.setUnidadeConsumo("KG");
        p2.setFatorConversao(1.0);
        p2.setDestinacao("Consumivel");

        assertThrows(IllegalArgumentException.class, () -> {
            produtoService.cadastrarProduto(p2, "TEST", "127.0.0.1");
        });
    }

    // --- TEST RF002 & RN003: Weight history and age categorization ---
    @Test
    public void testAtivoBiologicoIdadeEPesagem() {
        AtivoBiologico animal = new AtivoBiologico();
        animal.setIdentificadorUnico("BRINCO-888");
        animal.setEspecie("Bovino");
        animal.setSexo("M");
        animal.setDataNascimento(LocalDate.now().minusMonths(18)); // 18 months = Garrote
        animal.setPesoAtual(280.0);
        animal.setLocalizacaoAtual(locCurral);

        AtivoBiologico salvo = ativoBiologicoService.cadastrarAnimal(animal, "TEST", "127.0.0.1");
        assertEquals("Garrote", salvo.getCategoriaIdade());

        // Register a new weight
        ativoBiologicoService.registrarPesagem("BRINCO-888", 320.0, "TEST", "127.0.0.1");
        
        List<HistoricoPeso> historico = ativoBiologicoService.obterHistoricoPeso("BRINCO-888");
        assertEquals(2, historico.size());
        assertEquals(320.0, historico.get(0).getPeso());
    }

    // --- TEST RF006 & RN007: Quarantine Safety Lock ---
    @Test
    public void testAtivoBiologicoCarenciaBloqueioGTA() {
        AtivoBiologico animal = new AtivoBiologico();
        animal.setIdentificadorUnico("BRINCO-777");
        animal.setEspecie("Bovino");
        animal.setSexo("F");
        animal.setDataNascimento(LocalDate.now().minusMonths(30)); // Vaca
        animal.setPesoAtual(450.0);
        animal.setLocalizacaoAtual(locCurral);

        ativoBiologicoService.cadastrarAnimal(animal, "TEST", "127.0.0.1");

        // 1. Should succeed since no medicine was applied yet
        assertDoesNotThrow(() -> {
            ativoBiologicoService.emitirGuiaTransporteOuVenda("BRINCO-777");
        });

        // 2. Apply medicine with 10 days of quarantine
        ativoBiologicoService.aplicarMedicamento("BRINCO-777", 10, "TEST", "127.0.0.1");

        // 3. Should fail due to active Safety Lock
        assertThrows(IllegalStateException.class, () -> {
            ativoBiologicoService.emitirGuiaTransporteOuVenda("BRINCO-777");
        });
    }

    // --- TEST RF008 & RN009: Entry, Conversion, and average cost math ---
    @Test
    public void testMovimentacaoEntradaCustoMedio() {
        // Buy 10 bags of milho (at R$ 60 each, zero freight)
        // 10 bags * 50 = 500 kg
        // Unit cost: 60.00 / 50 = 1.20 per kg
        movimentacaoService.registrarEntrada(
            prodMilho.getId(), locSiloA.getId(), "LOTE-M1", LocalDate.now(), LocalDate.now().plusDays(365),
            10.0, 60.0, 0.0, 0.0, "COMPRA", "TEST", "127.0.0.1", "SAFRA-2026", null, "VENDEDOR A"
        );

        Lote lote = loteRepository.findByNumeroLoteAndProdutoId("LOTE-M1", prodMilho.getId()).orElse(null);
        assertNotNull(lote);

        SaldoEstoque saldo = saldoRepository.findByLoteIdAndLocalizacaoId(lote.getId(), locSiloA.getId()).orElse(null);
        assertNotNull(saldo);
        assertEquals(500.0, saldo.getQuantidade()); // conversion applied
        assertEquals(1.20, saldo.getCustoMedio());

        // Buy another 10 bags of same batch (at R$ 90 each)
        // 500 kg * 1.80 per kg
        // New balance: 1000 kg. Cost average: ((500 * 1.20) + (500 * 1.80)) / 1000 = 1.50 per kg
        movimentacaoService.registrarEntrada(
            prodMilho.getId(), locSiloA.getId(), "LOTE-M1", LocalDate.now(), LocalDate.now().plusDays(365),
            10.0, 90.0, 0.0, 0.0, "COMPRA", "TEST", "127.0.0.1", "SAFRA-2026", null, "VENDEDOR A"
        );

        saldo = saldoRepository.findByLoteIdAndLocalizacaoId(lote.getId(), locSiloA.getId()).orElse(null);
        assertEquals(1000.0, saldo.getQuantidade());
        assertEquals(1.50, saldo.getCustoMedio());
    }

    // --- TEST RF009 & RN010/RN011: FEFO/FIFO/Negative prevention ---
    @Test
    public void testMovimentacaoSaidaFEFO() {
        // Expiry date category: Medications require FEFO
        // Register batch A: expires in 10 days
        movimentacaoService.registrarEntrada(
            prodVacina.getId(), locCurral.getId(), "LOTE-V1", LocalDate.now(), LocalDate.now().plusDays(10),
            1.0, 100.0, 0.0, 0.0, "COMPRA", "TEST", "127.0.0.1", "TEST", null, "FORN"
        );

        // Register batch B: expires in 30 days
        movimentacaoService.registrarEntrada(
            prodVacina.getId(), locCurral.getId(), "LOTE-V2", LocalDate.now(), LocalDate.now().plusDays(30),
            1.0, 120.0, 0.0, 0.0, "COMPRA", "TEST", "127.0.0.1", "TEST", null, "FORN"
        );

        // We have 100ml of V1 (expires first) and 100ml of V2.
        // If we request 50ml output, it MUST consume V1 (FEFO)
        movimentacaoService.registrarSaida(
            prodVacina.getId(), locCurral.getId(), 50.0, "USO_VETERINARIO", "TEST", "127.0.0.1", "TEST"
        );

        Lote loteV1 = loteRepository.findByNumeroLoteAndProdutoId("LOTE-V1", prodVacina.getId()).orElse(null);
        SaldoEstoque saldoV1 = saldoRepository.findByLoteIdAndLocalizacaoId(loteV1.getId(), locCurral.getId()).orElse(null);
        assertEquals(50.0, saldoV1.getQuantidade()); // Consumed 50

        Lote loteV2 = loteRepository.findByNumeroLoteAndProdutoId("LOTE-V2", prodVacina.getId()).orElse(null);
        SaldoEstoque saldoV2 = saldoRepository.findByLoteIdAndLocalizacaoId(loteV2.getId(), locCurral.getId()).orElse(null);
        assertEquals(100.0, saldoV2.getQuantidade()); // Untouched
    }

    // --- TEST RF010: Stock in Transit Dispatch/Receive ---
    @Test
    public void testTransferenciaDuasEtapas() {
        // Put stock in Origin (Silo A)
        movimentacaoService.registrarEntrada(
            prodMilho.getId(), locSiloA.getId(), "LOTE-T1", LocalDate.now(), null,
            2.0, 100.0, 0.0, 0.0, "COMPRA", "TEST", "127.0.0.1", "TEST", null, "FORN"
        );
        // We have 100 kg of Milho in Silo A

        Lote lote = loteRepository.findByNumeroLoteAndProdutoId("LOTE-T1", prodMilho.getId()).orElse(null);

        // 1. Dispatch 100 kg to Talhão 5
        Transferencia t = transferenciaService.despacharTransferencia(
            prodMilho.getId(), lote.getId(), 100.0, locSiloA.getId(), locTalhao.getId(),
            "Transportador Rapido", "TEST", "127.0.0.1", "TEST"
        );

        assertEquals("EM_TRANSITO", t.getStatus());
        // Origin stock is zero
        SaldoEstoque sOrigem = saldoRepository.findByLoteIdAndLocalizacaoId(lote.getId(), locSiloA.getId()).orElse(null);
        assertEquals(0.0, sOrigem.getQuantidade());

        // 2. Receive with discrepancy (received only 90kg, 10kg lost)
        Transferencia tConcluida = transferenciaService.receberTransferencia(
            t.getId(), 90.0, "Vazou no caminho", "TEST", "127.0.0.1", "TEST"
        );

        // Destination has 90 kg
        SaldoEstoque sDestino = saldoRepository.findByLoteIdAndLocalizacaoId(lote.getId(), locTalhao.getId()).orElse(null);
        assertEquals(90.0, sDestino.getQuantidade());

        // Status should be CONCLUIDO_COM_PERDAS
        assertEquals("CONCLUIDO_COM_PERDAS", tConcluida.getStatus());
    }

    // --- TEST RF011 & RN014: Inventory Block ---
    @Test
    public void testBloqueioLocalizacaoPorInventario() {
        // Open physical inventory on Silo A
        Inventario inv = inventarioService.abrirInventario(locSiloA.getId(), "ALMOXARIFE JOAO", "TEST", "127.0.0.1");

        // Try to perform entry movement to Silo A -> Should fail
        assertThrows(IllegalStateException.class, () -> {
            movimentacaoService.registrarEntrada(
                prodMilho.getId(), locSiloA.getId(), "LOTE-INV", LocalDate.now(), null,
                1.0, 50.0, 0.0, 0.0, "COMPRA", "TEST", "127.0.0.1", "TEST", null, "FORN"
            );
        });

        // Close inventory
        List<InventarioService.ContagemItem> contagens = new ArrayList<>();
        inventarioService.concluirInventario(inv.getId(), contagens, "TEST", "127.0.0.1");

        // Now entries should be allowed
        assertDoesNotThrow(() -> {
            movimentacaoService.registrarEntrada(
                prodMilho.getId(), locSiloA.getId(), "LOTE-INV", LocalDate.now(), null,
                1.0, 50.0, 0.0, 0.0, "COMPRA", "TEST", "127.0.0.1", "TEST", null, "FORN"
            );
        });
    }

    // --- TEST RF012 & RN015: Loss Financial Limits & Approvals ---
    @Test
    public void testPerdaAlcadaAprovacao() {
        // Put stock (10 bags = 500kg of Milho, total cost value R$ 1000.0, or R$ 2.0 per kg)
        movimentacaoService.registrarEntrada(
            prodMilho.getId(), locSiloA.getId(), "LOTE-P1", LocalDate.now(), null,
            10.0, 100.0, 0.0, 0.0, "COMPRA", "TEST", "127.0.0.1", "TEST", null, "FORN"
        );

        Lote lote = loteRepository.findByNumeroLoteAndProdutoId("LOTE-P1", prodMilho.getId()).orElse(null);

        // Configure limit to R$ 500.0
        perdaService.setLimiteAlcadaPerda(500.0);

        // 1. Loss of 100 kg (value = 100 * 2.0 = R$ 200.0). Within limits -> auto approved
        PerdaEstoque p1 = perdaService.registrarPerda(
            prodMilho.getId(), lote.getId(), locSiloA.getId(), 100.0, 
            "ROUBO", "Roubaram sacos", "TEST", "127.0.0.1"
        );
        assertEquals("APROVADO", p1.getStatus());

        // 2. Loss of 200 kg (value = 200 * 2.0 = R$ 400.0, wait, current avg is updated or remaining is checked).
        // Let's request a loss that exceeds limits: 300 kg (value = 300 * 2.0 = R$ 600.0 > R$ 500.0 threshold)
        PerdaEstoque p2 = perdaService.registrarPerda(
            prodMilho.getId(), lote.getId(), locSiloA.getId(), 300.0, 
            "MOFO", "Mofou tudo", "TEST", "127.0.0.1"
        );
        assertEquals("PENDENTE_APROVACAO", p2.getStatus());

        // Try to approve with incorrect role -> should fail
        assertThrows(IllegalStateException.class, () -> {
            perdaService.aprovarPerda(p2.getId(), "JOAO", "OPERADOR", "TEST", "127.0.0.1");
        });

        // Approve with GERENTE role -> succeeds
        assertDoesNotThrow(() -> {
            perdaService.aprovarPerda(p2.getId(), "MARIA_GERENTE", "GERENTE", "TEST", "127.0.0.1");
        });
    }

    // --- TEST RF014 & RN017: BOM Recipe Explosion ---
    @Test
    public void testProducaoExplosaoMateriais() {
        // Register raw materials
        // 1000 kg Milho in Silo A
        movimentacaoService.registrarEntrada(
            prodMilho.getId(), locSiloA.getId(), "LOTE-RAW1", LocalDate.now(), null,
            20.0, 50.0, 0.0, 0.0, "COMPRA", "TEST", "127.0.0.1", "TEST", null, "FORN"
        );
        // 600 kg Soja in Silo A
        movimentacaoService.registrarEntrada(
            prodSoja.getId(), locSiloA.getId(), "LOTE-RAW2", LocalDate.now(), null,
            10.0, 120.0, 0.0, 0.0, "COMPRA", "TEST", "127.0.0.1", "TEST", null, "FORN"
        );

        // Recipe: 1 kg of Racao requires 0.6 kg of Milho and 0.4 kg of Soja
        FichaTecnica ft1 = new FichaTecnica();
        ft1.setProdutoAcabado(prodRacao);
        ft1.setInsumo(prodMilho);
        ft1.setQuantidadeProporcional(0.6);
        fichaTecnicaRepository.save(ft1);

        FichaTecnica ft2 = new FichaTecnica();
        ft2.setProdutoAcabado(prodRacao);
        ft2.setInsumo(prodSoja);
        ft2.setQuantidadeProporcional(0.4);
        fichaTecnicaRepository.save(ft2);

        // Produce 1000 kg of Ração.
        // It should consume: 600 kg of Milho, 400 kg of Soja.
        producaoService.produzirProdutoAcabado(
            prodRacao.getId(), 1000.0, locSiloA.getId(), locCurral.getId(),
            "LOTE-RACAO-PROD", LocalDate.now().plusDays(90), "TEST", "127.0.0.1", "TEST"
        );

        // Check raw material deductions
        Lote raw1 = loteRepository.findByNumeroLoteAndProdutoId("LOTE-RAW1", prodMilho.getId()).orElse(null);
        SaldoEstoque sMilho = saldoRepository.findByLoteIdAndLocalizacaoId(raw1.getId(), locSiloA.getId()).orElse(null);
        assertEquals(400.0, sMilho.getQuantidade()); // 1000 - 600

        Lote raw2 = loteRepository.findByNumeroLoteAndProdutoId("LOTE-RAW2", prodSoja.getId()).orElse(null);
        SaldoEstoque sSoja = saldoRepository.findByLoteIdAndLocalizacaoId(raw2.getId(), locSiloA.getId()).orElse(null);
        assertEquals(200.0, sSoja.getQuantidade()); // 600 - 400

        // Check finished product entry
        Lote racaoLote = loteRepository.findByNumeroLoteAndProdutoId("LOTE-RACAO-PROD", prodRacao.getId()).orElse(null);
        assertNotNull(racaoLote);
        SaldoEstoque sRacao = saldoRepository.findByLoteIdAndLocalizacaoId(racaoLote.getId(), locCurral.getId()).orElse(null);
        assertEquals(1000.0, sRacao.getQuantidade());
    }

    // --- TEST RF015 & RN018: Smart Procurement Orders ---
    @Test
    public void testSugestaoCompraInteligente() {
        // Stock: 100kg of Milho in Silo
        movimentacaoService.registrarEntrada(
            prodMilho.getId(), locSiloA.getId(), "LOTE-C1", LocalDate.now(), null,
            2.0, 50.0, 0.0, 0.0, "COMPRA", "TEST", "127.0.0.1", "TEST", null, "FORN"
        );

        // Point of replenishment: 500kg
        // Consumption rate: 50kg/day
        // Lead Time: 5 days (need 5 * 50 = 250kg during delivery window)
        // Target stock buffer: 500kg + 250kg = 750kg.
        // Current: 100kg. Open orders: 200kg.
        // Suggestion = 750 - (100 + 200) = 450kg
        Double sug = compraService.calcularSugestaoReposicao(
            prodMilho.getId(), 500.0, 50.0, 5, 200.0
        );
        assertEquals(450.0, sug);
    }
}
