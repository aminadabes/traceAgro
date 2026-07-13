# 🌾 TraceAgro - Sistema de Controle de Estoque Agropecuário Corporativo

[![Java Version](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=openjdk)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.1-brightgreen?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

**TraceAgro** é uma solução de software corporativa de padrão Enterprise desenvolvida para gerenciar de forma centralizada, auditável e altamente rastreável toda a movimentação de materiais, insumos, produtos acabados e ativos biológicos em atividades agropecuárias multifazendas. 

O sistema garante rastreabilidade de ponta a ponta ("do fornecedor ao cliente"), segurança sanitária, controle preciso de custos e acuracidade de inventário físico em tempo real.

---

## 🏗️ Divisão de Módulos (Contextos Delimitados)

O sistema foi arquitetado em 4 macro-módulos lógicos de baixo acoplamento para garantir alta escalabilidade:

### 1. 📦 CORE-ESTOQUE
Gestão de saldos, custos ponderados, lotes, datas de validade e inteligência para critérios de escoamento físico.
* **Sugestão de Saída Inteligente**: Algoritmos automáticos baseados em **FEFO** (First Expire, First Out) para itens perecíveis/sensíveis e **FIFO** (First In, First Out) para ferramentas e peças de reposição.
* **Proibição de Saldo Negativo**: Bloqueio rigoroso de saídas sem disponibilidade física real na localização selecionada.
* **Custo Médio Ponderado**: Recálculo automático de custos unitários em tempo real a cada nova entrada de compra.

### 2. 🗺️ WMS-AGRO (Warehouse Management System)
Endereçamento físico estruturado e adaptado às necessidades do campo.
* **Estrutura Posicional Complexa**: Rastreamento em níveis hierárquicos: `Fazenda ➔ Filial ➔ Armazém/Galpão ➔ Silo/Curral/Talhão ➔ Rua ➔ Bloco ➔ Prateleira`.
* **Segregação de Área Crítica**: Exigência de depósitos específicos e isolamentos de segurança para defensivos agrícolas de alta toxicidade.
* **Estoque em Trânsito**: Processo de transferência interfazendas em duas etapas (Despacho e Recebimento com conferência física e tratamento de perdas no trajeto).

### 3. 🚜 OPER-AGRO (Operações de Campo)
Integração direta com o manejo de solo e processos produtivos industriais.
* **Consumo de Insumos nos Talhões**: Registro detalhado de aplicações agrícolas associando talhão, engenheiro agrônomo responsável, receituário e condições climáticas de aplicação (umidade, vento, temperatura).
* **Fábrica de Ração (Transformação Industrial)**: Consumo proporcional automatizado de matérias-primas (milho, soja, núcleos) a partir de uma Ficha Técnica (explosão de receitas) para entrada do lote final de ração produzida.

### 4. 🐂 ZOOTECNIA (Ativos Biológicos)
Gestão detalhada e evolutiva de itens vivos (animais).
* **Identificação Individual**: Rastreamento por identificador único (RFID, brinco ou tatuagem) associado a lotes de manejo.
* **Evolução de Peso e Idade**: Histórico de pesagens e transição automática de categorias etárias (ex: Bezerro ➔ Garrote ➔ Boi).
* **Bloqueio por Carência Sanitária (Safety Lock)**: Período de segurança calculado com base na bula do medicamento aplicado. Bloqueia automaticamente a emissão de GTA, guias de abate e notas fiscais de venda até o vencimento do prazo.

---

## 🛠️ Tecnologias Utilizadas

### Backend (`/backend`)
* **Java 17** com **Spring Boot 3.3.1**
* **Spring Data JPA** & **Hibernate** (Camada de Persistência)
* **H2 Database** (Banco de dados em memória pré-configurado para desenvolvimento)
* **Lombok** (Produtividade de código boilerplate)
* **JUnit 5 & Spring Boot Test** (Testes de integração e unidade abrangentes)
* **CryptoConverter (Conformidade LGPD)**: Criptografia automática de dados pessoais no banco de dados.
* **Trilha de Auditoria (Append-Only)**: Registro inviolável (`insert-only`) de logs contendo usuário, IP, timestamp, operação e snapshots do estado anterior e posterior de cada registro afetado.

### Frontend (`/frontend`)
* **React 18** + **TypeScript**
* **Vite** (Build tool rápida)
* **CSS Customizado** com design moderno e responsivo (Dark mode, micro-animações)

---

## 🚦 Como Executar o Projeto Localmente

### Pré-requisitos
* **JDK 17** ou superior instalado.
* **Node.js** (v18+) e **npm** instalados.
* **Maven** (v3.9+) configurado (opcional, o projeto inclui o wrapper `./mvnw`).

### 1. Executando o Backend
Abra o terminal na pasta `/backend` e siga os passos abaixo:

```bash
# Definir JAVA_HOME (caso possua múltiplos JDKs e a versão padrão não seja 17)
# No Windows:
$env:JAVA_HOME="C:\caminho\para\seu\jdk-17"

# Executar a aplicação
./mvnw spring-boot:run
```
O backend iniciará em `http://localhost:8080`.

### 2. Executando o Frontend
Abra outro terminal na pasta `/frontend` e siga os passos abaixo:

```bash
# Instalar as dependências do Node
npm install

# Iniciar o servidor de desenvolvimento do Vite
npm run dev
```
O frontend iniciará por padrão em `http://localhost:5173`.

---

## 🧪 Rodando os Testes Automatizados

O backend conta com uma suíte de testes de integração robusta que valida todas as regras críticas de negócio (como proibição de saldo negativo, recálculo de custo médio ponderado, bloqueios sanitários de carência e validação de alçadas de aprovação para perdas).

Para rodar os testes, acesse a pasta `/backend` e execute:
```bash
./mvnw clean test
```

---

## 👥 Perfis de Acesso Configurados
* **Administrador**: Parametrização global e controle total.
* **Gerente**: Aprovação eletrônica de alçadas de perdas que ultrapassam limites monetários.
* **Almoxarife**: Gestão de inventários, contagens e recebimento físico de trânsito.
* **Agrônomo / Veterinário**: Emissão de receitas agronômicas e registro de ordens de tratamento/carência.
* **Operador**: Lançamento de consumo de campo offline, pesagens e movimentações físicas básicas.
