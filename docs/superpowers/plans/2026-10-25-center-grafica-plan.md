# Center Gráfica Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o site completo e de alta conversão da Center Gráfica (Teresina-PI / Envio Brasil) com catálogo interativo, portfólio real extraído do Instagram, verificador de arquivos gráficos e gerador de orçamentos técnicos integrado ao WhatsApp `(86) 98854-5141`.

**Architecture:** Aplicação web modular, rápida e zero-dependências de runtime, estruturada com CSS Design System (`design-system.css`, `layout.css`, `components.css`, `main.css`), suporte a temas (`Light`/`Dark`/`System`), e lógica de negócios desacoplada em ES Modules (`js/catalog-data.js`, `js/quote-engine.js`, `js/theme-manager.js`, `js/main.js`) testada com TDD (`node --test`).

**Tech Stack:** HTML5 Semântico, CSS3 Custom Properties (Grid/Flexbox), JavaScript ES2022 Modules, Node.js Test Runner (`node:test`), PowerShell `System.Drawing` para recorte de assets reais do print do Instagram.

**Spec:** `docs/superpowers/specs/2026-10-25-center-grafica-design.md`

## Global Constraints

- WhatsApp Principal obrigatório: `(86) 98854-5141` (`https://wa.me/5586988545141`)
- Contatos adicionais no rodapé/contato: Fixo `(86) 3229-5141`, WhatsApp Vendas `(86) 99510-5888`, Instagram `@centergrafica`
- Endereço físico exato: `Av. Walter Alencar, 1700 - Macaúba, Teresina - PI`
- Abrangência destacada: `Teresina - PI` e `Enviamos para todo o Brasil`
- Theme Toggle obrigatório (`light`, `dark`, `system`) com atributos ARIA (`role="radiogroup"`) conforme `agency-ux-architect`
- Copywriting limpa de vícios de IA conforme `humanizer` (sem travessões em excesso, sem estruturas "Não é apenas X, é Y")

## Review Focus

- **Quantidade abaixo da tiragem mínima ou vazia:** O motor de orçamento deve sinalizar ou ajustar valores inválidos (como quantidade 0, negativa ou texto vazio) e recomendar a modalidade ideal (Offset vs. Digital) conforme a tiragem.
- **Entrega fora de Teresina sem informar Cidade/UF:** Quando o cliente escolhe `"Envio para outra Cidade/Estado"`, a validação deve exigir o preenchimento da Cidade/UF para cálculo de frete.
- **Codificação de caracteres especiais na URL do WhatsApp:** Quebras de linha, acentos e símbolos na mensagem de orçamento devem ser codificados com `encodeURIComponent` sem quebrar o link `https://wa.me/5586988545141?text=...`.
- **Ambiente com `localStorage` bloqueado:** O `ThemeManager` não pode lançar erro se o navegador restringir acesso ao `localStorage`.
- **Filtro de catálogo com busca textual e categoria combinados:** O filtro deve tratar acentuação (ex: `"cartao"` encontrando `"Cartão de Visita"`) e categorias inexistentes retornando lista segura.

---

### Task 1: Extração de Assets Reais do Instagram e Estrutura do Projeto

**Files:**
- Create: `package.json`
- Create: `scripts/extract-assets.ps1`
- Create: `assets/images/mascot-rocket.png`
- Create: `assets/images/portfolio-sacolas.png`
- Create: `assets/images/portfolio-frotas.png`
- Create: `assets/images/portfolio-agendas.png`
- Create: `assets/images/portfolio-terrasco.png`

- [ ] **Step 1: Criar `package.json` com `"type": "module"` e script `"test": "node --test tests/*.test.js"`**
- [ ] **Step 2: Criar e executar `scripts/extract-assets.ps1` para recortar o mascote e os 4 posts reais do print `Captura de tela 2026-10-25 152651.png`**
- [ ] **Step 3: Verificar se os 5 arquivos PNG existem e possuem tamanho > 0 bytes**

---

### Task 2: Catálogo de Produtos e Motor de Orçamento / Pré-Impressão (TDD)

**Files:**
- Create: `tests/quote-engine.test.js`
- Create: `js/catalog-data.js`
- Create: `js/quote-engine.js`

**Interfaces:**
- Produces:
  - `CATALOG_PRODUCTS` (array de produtos com `id`, `name`, `category`, `process`, `minQty`, `suggestedQuantities`, `specs`, `finishes`, `badge`, `leadTime`)
  - `PORTFOLIO_ITEMS` (array de cases reais da Center Gráfica)
  - `filterProducts({ category, query }) -> Array`
  - `recommendPrintProcess(productId, quantity) -> { process: string, note: string }`
  - `validateQuoteRequest(payload) -> { valid: boolean, errors: string[] }`
  - `buildWhatsAppMessage(payload) -> string`
  - `buildWhatsAppUrl(payload, phone) -> string`
  - `evaluatePrepressChecklist(checks) -> { ready: boolean, score: number, total: number, missingLabels: string[], recommendation: string }`

- [ ] **Step 1: Escrever os testes unitários em `tests/quote-engine.test.js` cobrindo todas as funções e os 5 casos do Review Focus**
- [ ] **Step 2: Executar `node --test tests/quote-engine.test.js` e confirmar falha (RED)**
- [ ] **Step 3: Implementar `js/catalog-data.js` e `js/quote-engine.js` com dados reais da Center Gráfica**
- [ ] **Step 4: Executar `node --test tests/quote-engine.test.js` e confirmar 100% de aprovação (GREEN)**

---

### Task 3: Design System CSS, Layout Responsivo e Componentes UI (`agency-ux-architect` & `agency-ui-designer`)

**Files:**
- Create: `css/design-system.css`
- Create: `css/layout.css`
- Create: `css/components.css`
- Create: `css/main.css`

- [ ] **Step 1: Implementar `css/design-system.css` com variáveis de cores da marca (Royal Blue, CMYK Magenta, Cyan, Yellow), suporte Light/Dark/System, tipografia e escala de espaçamento**
- [ ] **Step 2: Implementar `css/layout.css` com containers responsivos, grids adaptáveis, header sticky e seções**
- [ ] **Step 3: Implementar `css/components.css` e `css/main.css` com cards de produtos, vitrine "Feito na Center", simulador de orçamento com preview de WhatsApp em tempo real, checklist de arquivo e botão flutuante**

---

### Task 4: Estrutura HTML5 Semântica, SEO Local/Nacional e Interatividade Frontend

**Files:**
- Create: `js/theme-manager.js`
- Create: `js/main.js`
- Create: `index.html`
- Create: `tests/dom-integrity.test.js`

- [ ] **Step 1: Escrever teste de integridade do HTML/SEO/Acessibilidade em `tests/dom-integrity.test.js` (verificando presença do número `5586988545141`, endereço `Av. Walter Alencar, 1700`, JSON-LD Schema, Theme Toggle ARIA, todas as seções e links de assets)**
- [ ] **Step 2: Rodar `node --test` e verificar que `tests/dom-integrity.test.js` falha antes de `index.html` existir (RED)**
- [ ] **Step 3: Implementar `js/theme-manager.js`, `js/main.js` e `index.html` completo com copy revisada (`humanizer`)**
- [ ] **Step 4: Rodar `node --test` e verificar que toda a suíte passa (GREEN)**

---

### Task 5: Verificação Real e Reality Check (`agency-reality-checker` & `verification-before-completion`)

- [ ] **Step 1: Subir servidor HTTP local e testar resposta HTTP 200 de `index.html`, CSS, JS e imagens**
- [ ] **Step 2: Executar suíte completa de testes automatizados (`node --test`) e validar zero erros**
