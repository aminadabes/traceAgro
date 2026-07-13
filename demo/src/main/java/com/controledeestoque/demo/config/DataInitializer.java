package com.controledeestoque.demo.config;

import com.controledeestoque.demo.model.Categoria;
import com.controledeestoque.demo.model.Localizacao;
import com.controledeestoque.demo.repository.CategoriaRepository;
import com.controledeestoque.demo.repository.LocalizacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private LocalizacaoRepository localizacaoRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only seed if empty
        if (categoriaRepository.count() == 0) {
            System.out.println("=== Bootstrapping Default System Data (Seeding) ===");

            // 1. Categories
            Categoria catGraos = new Categoria();
            catGraos.setNome("Grãos e Insumos");
            catGraos.setLoteObrigatorio(true);
            catGraos.setValidadeObrigatoria(false);
            catGraos.setDiasAlertaVencimento(90);
            categoriaRepository.save(catGraos); // Will get ID 1

            Categoria catMedicamentos = new Categoria();
            catMedicamentos.setNome("Medicamentos");
            catMedicamentos.setLoteObrigatorio(true);
            catMedicamentos.setValidadeObrigatoria(true);
            catMedicamentos.setDiasAlertaVencimento(180);
            categoriaRepository.save(catMedicamentos); // Will get ID 2

            Categoria catDefensivos = new Categoria();
            catDefensivos.setNome("Defensivos Agrícolas");
            catDefensivos.setLoteObrigatorio(true);
            catDefensivos.setValidadeObrigatoria(true);
            catDefensivos.setDiasAlertaVencimento(180);
            categoriaRepository.save(catDefensivos); // Will get ID 3

            // 2. Physical Locations
            Localizacao locSiloA = new Localizacao();
            locSiloA.setFazenda("Fazenda Central");
            locSiloA.setArmazemGalpao("Silo A");
            locSiloA.setAreaCritica(false);
            localizacaoRepository.save(locSiloA); // Will get ID 1

            Localizacao locCurral = new Localizacao();
            locCurral.setFazenda("Fazenda Central");
            locCurral.setArmazemGalpao("Curral de Manejo");
            locCurral.setAreaCritica(false);
            localizacaoRepository.save(locCurral); // Will get ID 2

            Localizacao locTalhao = new Localizacao();
            locTalhao.setFazenda("Fazenda Norte");
            locTalhao.setSiloCurralTalhao("Talhão 5");
            locTalhao.setAreaCritica(true); // isolated critical area
            localizacaoRepository.save(locTalhao); // Will get ID 3

            System.out.println("=== Seeding completed: Default categories (1, 2, 3) and locations (1, 2, 3) ready ===");
        }
    }
}
