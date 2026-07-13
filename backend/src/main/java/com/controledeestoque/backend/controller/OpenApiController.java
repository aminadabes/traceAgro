package com.controledeestoque.backend.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OpenApiController {

    @GetMapping(value = "/swagger-ui.html", produces = MediaType.TEXT_HTML_VALUE)
    public String getSwaggerUi() {
        return "<!DOCTYPE html>\n" +
               "<html lang=\"en\">\n" +
               "  <head>\n" +
               "    <meta charset=\"utf-8\" />\n" +
               "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n" +
               "    <title>Estoque Agropecuário - Swagger UI</title>\n" +
               "    <link rel=\"stylesheet\" href=\"https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css\" />\n" +
               "  </head>\n" +
               "  <body>\n" +
               "    <div id=\"swagger-ui\"></div>\n" +
               "    <script src=\"https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js\" charset=\"UTF-8\"></script>\n" +
               "    <script src=\"https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js\" charset=\"UTF-8\"></script>\n" +
               "    <script>\n" +
               "      window.onload = () => {\n" +
               "        window.ui = SwaggerUIBundle({\n" +
               "          url: '/v3/api-docs',\n" +
               "          dom_id: '#swagger-ui',\n" +
               "          presets: [\n" +
               "            SwaggerUIBundle.presets.apis,\n" +
               "            SwaggerUIStandalonePreset\n" +
               "          ],\n" +
               "          layout: \"BaseLayout\"\n" +
               "        });\n" +
               "      };\n" +
               "    </script>\n" +
               "  </body>\n" +
               "</html>";
    }

    @GetMapping(value = "/v3/api-docs", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getOpenApiDocs() {
        String openapiJson = "{\n" +
                "  \"openapi\": \"3.0.3\",\n" +
                "  \"info\": {\n" +
                "    \"title\": \"Sistema de Controle de Estoque Agropecuário - API\",\n" +
                "    \"description\": \"API Corporativa do TJMG para rastreabilidade de ponta a ponta, controle sanitário e custos zootécnicos/agrícolas.\",\n" +
                "    \"version\": \"2.0.0\"\n" +
                "  },\n" +
                "  \"servers\": [\n" +
                "    {\n" +
                "      \"url\": \"http://localhost:8080\",\n" +
                "      \"description\": \"Servidor Local de Desenvolvimento\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"paths\": {\n" +
                "    \"/api/produtos\": {\n" +
                "      \"post\": {\n" +
                "        \"summary\": \"Cadastrar produto (insumos, peças e acabados)\",\n" +
                "        \"description\": \"Registra um novo produto não vivo garantindo unicidade do código interno, EAN e Registro MAPA.\",\n" +
                "        \"requestBody\": {\n" +
                "          \"required\": true,\n" +
                "          \"content\": {\n" +
                "            \"application/json\": {\n" +
                "              \"schema\": {\n" +
                "                \"$ref\": \"#/components/schemas/Produto\"\n" +
                "              }\n" +
                "            }\n" +
                "          }\n" +
                "        },\n" +
                "        \"responses\": {\n" +
                "          \"201\": {\n" +
                "            \"description\": \"Produto cadastrado com sucesso\"\n" +
                "          }\n" +
                "        }\n" +
                "      },\n" +
                "      \"get\": {\n" +
                "        \"summary\": \"Listar todos os produtos\",\n" +
                "        \"responses\": {\n" +
                "          \"200\": {\n" +
                "            \"description\": \"Lista de produtos cadastrados\"\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    },\n" +
                "    \"/api/ativos-biologicos\": {\n" +
                "      \"post\": {\n" +
                "        \"summary\": \"Cadastrar ativo biológico (animal)\",\n" +
                "        \"requestBody\": {\n" +
                "          \"required\": true,\n" +
                "          \"content\": {\n" +
                "            \"application/json\": {\n" +
                "              \"schema\": {\n" +
                "                \"$ref\": \"#/components/schemas/AtivoBiologico\"\n" +
                "              }\n" +
                "            }\n" +
                "          }\n" +
                "        },\n" +
                "        \"responses\": {\n" +
                "          \"201\": {\n" +
                "            \"description\": \"Animal cadastrado com sucesso\"\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    },\n" +
                "    \"/api/ativos-biologicos/{identificador}/pesagem\": {\n" +
                "      \"post\": {\n" +
                "        \"summary\": \"Registrar evolução de peso do animal\",\n" +
                "        \"parameters\": [\n" +
                "          { \"name\": \"identificador\", \"in\": \"path\", \"required\": true, \"schema\": { \"type\": \"string\" } },\n" +
                "          { \"name\": \"peso\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"number\" } }\n" +
                "        ],\n" +
                "        \"responses\": {\n" +
                "          \"200\": {\n" +
                "            \"description\": \"Pesagem registrada\"\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    },\n" +
                "    \"/api/ativos-biologicos/{identificador}/aplicar-medicamento\": {\n" +
                "      \"post\": {\n" +
                "        \"summary\": \"Registrar aplicação de medicamento e carência sanitária\",\n" +
                "        \"parameters\": [\n" +
                "          { \"name\": \"identificador\", \"in\": \"path\", \"required\": true, \"schema\": { \"type\": \"string\" } },\n" +
                "          { \"name\": \"diasCarencia\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"integer\" } }\n" +
                "        ],\n" +
                "        \"responses\": {\n" +
                "          \"200\": {\n" +
                "            \"description\": \"Medicamento registrado e animal colocado em carência sanitária\"\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    },\n" +
                "    \"/api/ativos-biologicos/{identificador}/emitir-gta\": {\n" +
                "      \"get\": {\n" +
                "        \"summary\": \"Validar e emitir GTA (Guia de Transporte Animal) ou Abate\",\n" +
                "        \"description\": \"RN007 - Safety Lock: Impede a movimentação de venda/abate se o animal estiver em carência.\",\n" +
                "        \"parameters\": [\n" +
                "          { \"name\": \"identificador\", \"in\": \"path\", \"required\": true, \"schema\": { \"type\": \"string\" } }\n" +
                "        ],\n" +
                "        \"responses\": {\n" +
                "          \"200\": {\n" +
                "            \"description\": \"GTA autorizada e emitida\"\n" +
                "          },\n" +
                "          \"403\": {\n" +
                "            \"description\": \"Operação bloqueada por carência sanitária ativa\"\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    },\n" +
                "    \"/api/movimentacoes/entrada\": {\n" +
                "      \"post\": {\n" +
                "        \"summary\": \"Registrar entrada de estoque por compra/produção\",\n" +
                "        \"description\": \"Calcula custo médio ponderado, valida lote e áreas críticas de toxicidade.\",\n" +
                "        \"requestBody\": {\n" +
                "          \"required\": true,\n" +
                "          \"content\": {\n" +
                "            \"application/json\": {\n" +
                "              \"schema\": {\n" +
                "                \"$ref\": \"#/components/schemas/EntradaRequest\"\n" +
                "              }\n" +
                "            }\n" +
                "          }\n" +
                "        },\n" +
                "        \"responses\": {\n" +
                "          \"201\": {\n" +
                "            \"description\": \"Entrada registrada com sucesso\"\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    },\n" +
                "    \"/api/movimentacoes/saida\": {\n" +
                "      \"post\": {\n" +
                "        \"summary\": \"Registrar saída de estoque (Consumo/Venda)\",\n" +
                "        \"description\": \"RN010/RN011: Aplica FEFO/FIFO, impede saldo negativo e exige usuário autenticado.\",\n" +
                "        \"requestBody\": {\n" +
                "          \"required\": true,\n" +
                "          \"content\": {\n" +
                "            \"application/json\": {\n" +
                "              \"schema\": {\n" +
                "                \"$ref\": \"#/components/schemas/SaidaRequest\"\n" +
                "              }\n" +
                "            }\n" +
                "          }\n" +
                "        },\n" +
                "        \"responses\": {\n" +
                "          \"200\": {\n" +
                "            \"description\": \"Saída registrada com sucesso\"\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    },\n" +
                "    \"/api/operacoes/transferencias/despacho\": {\n" +
                "      \"post\": {\n" +
                "        \"summary\": \"Etapa 1 - Despachar transferência interfazendas\",\n" +
                "        \"parameters\": [\n" +
                "          { \"name\": \"produtoId\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"integer\" } },\n" +
                "          { \"name\": \"loteId\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"integer\" } },\n" +
                "          { \"name\": \"quantidade\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"number\" } },\n" +
                "          { \"name\": \"localizacaoOrigemId\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"integer\" } },\n" +
                "          { \"name\": \"localizacaoDestinoId\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"integer\" } },\n" +
                "          { \"name\": \"transportador\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"string\" } },\n" +
                "          { \"name\": \"centroCustoSafra\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"string\" } }\n" +
                "        ],\n" +
                "        \"responses\": {\n" +
                "          \"201\": {\n" +
                "            \"description\": \"Despacho concluído, saldo alocado em trânsito\"\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    },\n" +
                "    \"/api/operacoes/transferencias/{id}/recebimento\": {\n" +
                "      \"post\": {\n" +
                "        \"summary\": \"Etapa 2 - Receber transferência e conciliar trânsito\",\n" +
                "        \"parameters\": [\n" +
                "          { \"name\": \"id\", \"in\": \"path\", \"required\": true, \"schema\": { \"type\": \"integer\" } },\n" +
                "          { \"name\": \"quantidadeRecebida\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"number\" } },\n" +
                "          { \"name\": \"justificativaDivergencia\", \"in\": \"query\", \"required\": false, \"schema\": { \"type\": \"string\" } },\n" +
                "          { \"name\": \"centroCustoSafra\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"string\" } }\n" +
                "        ],\n" +
                "        \"responses\": {\n" +
                "          \"200\": {\n" +
                "            \"description\": \"Recebimento confirmado e estoque consolidado no destino\"\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    },\n" +
                "    \"/api/operacoes/inventarios/abrir\": {\n" +
                "      \"post\": {\n" +
                "        \"summary\": \"Abrir ordem de inventário físico\",\n" +
                "        \"description\": \"RN014 - Congela e bloqueia qualquer entrada/saída física na localização até o encerramento.\",\n" +
                "        \"parameters\": [\n" +
                "          { \"name\": \"localizacaoId\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"integer\" } },\n" +
                "          { \"name\": \"responsavel\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"string\" } }\n" +
                "        ],\n" +
                "        \"responses\": {\n" +
                "          \"201\": {\n" +
                "            \"description\": \"Inventário aberto e localização bloqueada\"\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    },\n" +
                "    \"/api/operacoes/inventarios/{id}/concluir\": {\n" +
                "      \"post\": {\n" +
                "        \"summary\": \"Concluir inventário e aplicar correções físicas\",\n" +
                "        \"parameters\": [\n" +
                "          { \"name\": \"id\", \"in\": \"path\", \"required\": true, \"schema\": { \"type\": \"integer\" } }\n" +
                "        ],\n" +
                "        \"requestBody\": {\n" +
                "          \"required\": true,\n" +
                "          \"content\": {\n" +
                "            \"application/json\": {\n" +
                "              \"schema\": {\n" +
                "                \"type\": \"array\",\n" +
                "                \"items\": {\n" +
                "                  \"$ref\": \"#/components/schemas/ContagemItem\"\n" +
                "                }\n" +
                "              }\n" +
                "            }\n" +
                "          }\n" +
                "        },\n" +
                "        \"responses\": {\n" +
                "          \"200\": {\n" +
                "            \"description\": \"Inventário concluído e saldos ajustados\"\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    },\n" +
                "    \"/api/operacoes/perdas\": {\n" +
                "      \"post\": {\n" +
                "        \"summary\": \"Registrar perda de estoque\",\n" +
                "        \"description\": \"RN015 - Perdas acima do limite entram em estado PENDENTE_APROVACAO aguardando gerência.\",\n" +
                "        \"parameters\": [\n" +
                "          { \"name\": \"produtoId\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"integer\" } },\n" +
                "          { \"name\": \"loteId\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"integer\" } },\n" +
                "          { \"name\": \"localizacaoId\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"integer\" } },\n" +
                "          { \"name\": \"quantidade\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"number\" } },\n" +
                "          { \"name\": \"motivo\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"string\" } },\n" +
                "          { \"name\": \"justificativa\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"string\" } }\n" +
                "        ],\n" +
                "        \"responses\": {\n" +
                "          \"201\": {\n" +
                "            \"description\": \"Perda registrada com sucesso\"\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    },\n" +
                "    \"/api/operacoes/perdas/{id}/aprovar\": {\n" +
                "      \"post\": {\n" +
                "        \"summary\": \"Aprovar perda de estoque pendente (perfil Gerente/Diretor)\",\n" +
                "        \"parameters\": [\n" +
                "          { \"name\": \"id\", \"in\": \"path\", \"required\": true, \"schema\": { \"type\": \"integer\" } },\n" +
                "          { \"name\": \"usuarioAprovador\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"string\" } },\n" +
                "          { \"name\": \"roleAprovador\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"string\" } }\n" +
                "        ],\n" +
                "        \"responses\": {\n" +
                "          \"200\": {\n" +
                "            \"description\": \"Perda aprovada e saldo reduzido\"\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    },\n" +
                "    \"/api/operacoes/aplicacoes-agricolas\": {\n" +
                "      \"post\": {\n" +
                "        \"summary\": \"Registrar aplicação agrícola de insumos no talhão\",\n" +
                "        \"parameters\": [\n" +
                "          { \"name\": \"talhaoId\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"integer\" } },\n" +
                "          { \"name\": \"cultura\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"string\" } },\n" +
                "          { \"name\": \"safra\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"string\" } },\n" +
                "          { \"name\": \"areaTratadaHa\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"number\" } },\n" +
                "          { \"name\": \"produtoId\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"integer\" } },\n" +
                "          { \"name\": \"quantidadeConsumida\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"number\" } },\n" +
                "          { \"name\": \"operador\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"string\" } },\n" +
                "          { \"name\": \"maquina\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"string\" } },\n" +
                "          { \"name\": \"engenheiro\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"string\" } },\n" +
                "          { \"name\": \"receituario\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"string\" } },\n" +
                "          { \"name\": \"engenheiroAssinaturaAtiva\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"boolean\" } },\n" +
                "          { \"name\": \"temperatura\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"number\" } },\n" +
                "          { \"name\": \"umidade\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"number\" } },\n" +
                "          { \"name\": \"velocidadeVento\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"number\" } },\n" +
                "          { \"name\": \"diasCarenciaDefensivo\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"integer\" } }\n" +
                "        ],\n" +
                "        \"responses\": {\n" +
                "          \"201\": {\n" +
                "            \"description\": \"Aplicação agrícola registrada, insumos baixados e talhão em carência\"\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    },\n" +
                "    \"/api/operacoes/producao\": {\n" +
                "      \"post\": {\n" +
                "        \"summary\": \"Registrar ordem de industrialização/produção\",\n" +
                "        \"description\": \"RN017 - Explosão de Materiais: consome as matérias-primas da receita de forma proporcional.\",\n" +
                "        \"parameters\": [\n" +
                "          { \"name\": \"produtoAcabadoId\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"integer\" } },\n" +
                "          { \"name\": \"quantidadeProduzir\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"number\" } },\n" +
                "          { \"name\": \"localizacaoInsumosId\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"integer\" } },\n" +
                "          { \"name\": \"localizacaoDestinoId\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"integer\" } },\n" +
                "          { \"name\": \"numeroLoteNovo\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"string\" } },\n" +
                "          { \"name\": \"validadeNova\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"string\", \"format\": \"date\" } },\n" +
                "          { \"name\": \"centroCustoSafra\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"string\" } }\n" +
                "        ],\n" +
                "        \"responses\": {\n" +
                "          \"200\": {\n" +
                "            \"description\": \"Industrialização concluída e novos saldos criados\"\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    },\n" +
                "    \"/api/operacoes/compras/sugestao\": {\n" +
                "      \"get\": {\n" +
                "        \"summary\": \"Sugestão de reposição inteligente de estoque\",\n" +
                "        \"description\": \"RN018 - Avalia estoque mínimo, consumo médio, lead time de fornecedores e ordens abertas.\",\n" +
                "        \"parameters\": [\n" +
                "          { \"name\": \"produtoId\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"integer\" } },\n" +
                "          { \"name\": \"pontoRessuprimentoMinimo\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"number\" } },\n" +
                "          { \"name\": \"consumoMedioDiario\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"number\" } },\n" +
                "          { \"name\": \"leadTimeFornecedorDias\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"integer\" } },\n" +
                "          { \"name\": \"pedidosEmAbertoNaoEntregues\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"number\" } }\n" +
                "        ],\n" +
                "        \"responses\": {\n" +
                "          \"200\": {\n" +
                "            \"description\": \"Volume sugerido para compra\",\n" +
                "            \"content\": {\n" +
                "              \"application/json\": {\n" +
                "                \"schema\": { \"type\": \"number\" }\n" +
                "              }\n" +
                "            }\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    },\n" +
                "    \"/api/operacoes/recall/rastreabilidade-reversa\": {\n" +
                "      \"get\": {\n" +
                "        \"summary\": \"Rastreabilidade reversa End-to-End (Recall)\",\n" +
                "        \"description\": \"RN019 - Mapeia lote vendido até os lotes de matérias-primas, fornecedores originais e outros clientes impactados.\",\n" +
                "        \"parameters\": [\n" +
                "          { \"name\": \"numeroLote\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"string\" } },\n" +
                "          { \"name\": \"produtoId\", \"in\": \"query\", \"required\": true, \"schema\": { \"type\": \"integer\" } }\n" +
                "        ],\n" +
                "        \"responses\": {\n" +
                "          \"200\": {\n" +
                "            \"description\": \"Resultados da rastreabilidade para Recall\"\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    }\n" +
                "  },\n" +
                "  \"components\": {\n" +
                "    \"schemas\": {\n" +
                "      \"Produto\": {\n" +
                "        \"type\": \"object\",\n" +
                "        \"required\": [\"codigoInterno\", \"descricao\", \"unidadeCompra\", \"unidadeConsumo\", \"fatorConversao\", \"destinacao\"],\n" +
                "        \"properties\": {\n" +
                "          \"codigoInterno\": { \"type\": \"string\" },\n" +
                "          \"ean\": { \"type\": \"string\" },\n" +
                "          \"qrCode\": { \"type\": \"string\" },\n" +
                "          \"descricao\": { \"type\": \"string\" },\n" +
                "          \"subcategoria\": { \"type\": \"string\" },\n" +
                "          \"marcaFabricante\": { \"type\": \"string\" },\n" +
                "          \"fornecedorPrincipal\": { \"type\": \"string\" },\n" +
                "          \"unidadeCompra\": { \"type\": \"string\" },\n" +
                "          \"unidadeConsumo\": { \"type\": \"string\" },\n" +
                "          \"fatorConversao\": { \"type\": \"number\" },\n" +
                "          \"destinacao\": { \"type\": \"string\" },\n" +
                "          \"registroMapa\": { \"type\": \"string\" }\n" +
                "        }\n" +
                "      },\n" +
                "      \"AtivoBiologico\": {\n" +
                "        \"type\": \"object\",\n" +
                "        \"required\": [\"identificadorUnico\", \"especie\", \"dataNascimento\", \"pesoAtual\"],\n" +
                "        \"properties\": {\n" +
                "          \"identificadorUnico\": { \"type\": \"string\" },\n" +
                "          \"loteManejo\": { \"type\": \"string\" },\n" +
                "          \"especie\": { \"type\": \"string\" },\n" +
                "          \"raca\": { \"type\": \"string\" },\n" +
                "          \"sexo\": { \"type\": \"string\" },\n" +
                "          \"dataNascimento\": { \"type\": \"string\", \"format\": \"date\" },\n" +
                "          \"pesoAtual\": { \"type\": \"number\" }\n" +
                "        }\n" +
                "      },\n" +
                "      \"EntradaRequest\": {\n" +
                "        \"type\": \"object\",\n" +
                "        \"required\": [\"produtoId\", \"localizacaoId\", \"quantidadeCompra\", \"valorUnitario\", \"subTipo\"],\n" +
                "        \"properties\": {\n" +
                "          \"produtoId\": { \"type\": \"integer\" },\n" +
                "          \"localizacaoId\": { \"type\": \"integer\" },\n" +
                "          \"numeroLote\": { \"type\": \"string\" },\n" +
                "          \"dataFabricacao\": { \"type\": \"string\", \"format\": \"date\" },\n" +
                "          \"dataValidade\": { \"type\": \"string\", \"format\": \"date\" },\n" +
                "          \"quantidadeCompra\": { \"type\": \"number\" },\n" +
                "          \"valorUnitario\": { \"type\": \"number\" },\n" +
                "          \"frete\": { \"type\": \"number\" },\n" +
                "          \"impostosRateados\": { \"type\": \"number\" },\n" +
                "          \"subTipo\": { \"type\": \"string\" },\n" +
                "          \"centroCustoSafra\": { \"type\": \"string\" },\n" +
                "          \"chaveNfe\": { \"type\": \"string\" },\n" +
                "          \"fornecedorLote\": { \"type\": \"string\" }\n" +
                "        }\n" +
                "      },\n" +
                "      \"SaidaRequest\": {\n" +
                "        \"type\": \"object\",\n" +
                "        \"required\": [\"produtoId\", \"localizacaoId\", \"quantidadeSaidaConsumo\", \"subTipo\", \"centroCustoSafra\"],\n" +
                "        \"properties\": {\n" +
                "          \"produtoId\": { \"type\": \"integer\" },\n" +
                "          \"localizacaoId\": { \"type\": \"integer\" },\n" +
                "          \"quantidadeSaidaConsumo\": { \"type\": \"number\" },\n" +
                "          \"subTipo\": { \"type\": \"string\" },\n" +
                "          \"centroCustoSafra\": { \"type\": \"string\" }\n" +
                "        }\n" +
                "      },\n" +
                "      \"ContagemItem\": {\n" +
                "        \"type\": \"object\",\n" +
                "        \"required\": [\"produtoId\", \"loteId\", \"quantidadeFisica\"],\n" +
                "        \"properties\": {\n" +
                "          \"produtoId\": { \"type\": \"integer\" },\n" +
                "          \"loteId\": { \"type\": \"integer\" },\n" +
                "          \"quantidadeFisica\": { \"type\": \"number\" }\n" +
                "        }\n" +
                "      }\n" +
                "    }\n" +
                "  }\n" +
                "}";

        return ResponseEntity.ok(openapiJson);
    }
}
