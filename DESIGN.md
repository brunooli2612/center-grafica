# Center Gráfica — DESIGN.md (Impeccable Distill/Quieter + OpenMontage HyperFrames)

## 0. Identidade Visual & Logomarca Oficial (Descoberta Real)
> **ATENÇÃO (Referência Canônica da Marca):** Os arquivos originais de referência da logomarca foram importados em `assets/logo-referencia-colorida.png` e `assets/logo-referencia-monocromatica.png`. O fundo azul das capturas NÃO faz parte da logo. A marca real é composta estritamente por:

1. **Símbolo / Ícone (Elemento Central da Hero Section 3D):**
   - **Forma:** Um quadrado de cantos fortemente arredondados (*squircle*) vazado no centro.
   - **Aplicações 3D na Hero:** Esse símbolo vazado (sem o texto) será o **ator principal da Hero Section**, renderizado em 3D interativo flutuando no lado direito. Ele reage ao cursor do mouse, possui profundidade tátil, chanfro suave (*bevel*) e reflete as cores gráficas em material acrílico/polimérico translúcido de alta precisão.
   - **Versão Colorida:** Gradiente / sobreposição representando as cores gráficas (ciano, verde, amarelo, magenta/roxo), remetendo à policromia/CMYK.
   - **Versão Negativa / Monocromática:** Branco sólido (ou preto) vazado no centro.
2. **Tipografia:**
   - **"CENTER":** Caixa alta (All Caps), tipografia display geométrica estilizada com cortes suaves e cantos arredondados (peso forte/black).
   - **"gráfica":** Caixa baixa, posicionada logo abaixo alinhada à direita sob a palavra "CENTER".

---

## 1. Direção Visual e Crítica (`impeccable: critique`, `distill`, `quieter`)
- **Problema Diagnosticado na Revisão:**
  - A versão anterior utilizava barras técnicas de folha de máquina (`REGISTRO CMYK: CALIBRANDO...`, `SANGRIA: 3.0mm`, `ESCALA 1:1`, `FOLHA DE PROVA #00`), régua milimetrada lateral (`0000mm`) e tabelas internas nos cards. Para o comprador final (lojistas, clínicas, empresas), esses rótulos pareciam texto de formatação vazado e geravam poluição visual.
  - A animação anterior rodava apenas 1 vez no carregamento (linha tracejada SVG), deixando a página com aspecto estático.
- **Solução Aplicada (`impeccable: distill` + `quieter`):**
  - Remoção total de jargões de telemetria de impressão (`REGISTRO CMYK`, `SANGRIA: 3.0mm`, `ESCALA 1:1`, `FOLHA DE PROVA`, códigos `[#IMP-01]`, tags `[OBRIGATÓRIO]`) e da régua lateral.
  - Redução da densidade dos cards de catálogo para **3 pontos de informação claros**: Título + breve descrição prática, até 3 chips de acabamento e tiragem mínima com botão direto (`Orçar este item`).
  - **Progressive Disclosure (`<details class="prepress-accordion">`):** O checklist técnico de pré-impressão foi recolhido dentro de um acordeão opcional abaixo do resumo do WhatsApp, limpando a área principal de orçamento.

## 2. Coreografia de Movimento OpenMontage (`hyperframes-animation`)
Implementado em `css/main.css` e `js/main.js` (`initOpenMontageMotion`) seguindo 5 receitas oficiais do OpenMontage:
1. **`vertical-spring-ticker` (`#hf-ticker-stack`):** Slot-machine vertical no título principal alternando entre *Sacolas Personalizadas*, *Envelopamento de Frotas*, *Agendas Corporativas*, *Caixas & Embalagens* e *Impressão Offset & Digital* com física elástica `back.out(1.7)`.
2. **`css-marker-patterns` (`#hf-scribble-path`):** Sublinhado manuscrito em SVG desenhado dinamicamente sob *"todo o Brasil"* (`stroke-dashoffset` animado com `power2.inOut`).
3. **`split-tilt-cards` + `sine-wave-loop` (`.hf-showcase-card`):** Grade 3D no Hero com entrada lateral oposta (`rotateY: ±7deg`) e flutuação contínua em contra-fase (`Math.sin(phase + i * Math.PI / 2)`), exibindo os 4 produtos reais da gráfica.
4. **`press-release-spring` (`triggerPressSpring`):** Compressão rápida (`scale: 0.92`, `0.12s`, `power1.in`) seguida de soltura elástica (`scale: 1`, `0.45s`, `back.out(2.0)`) e pulso de brilho radial (`#hero-cta-glow`).
5. **Faixa Contínua Marquee (`#hf-marquee-track`) & ScrollTrigger:** Movimento horizontal contínuo entre o Hero e o Portfólio e revelação escalonada dos cards na rolagem.

## 3. Tipografia e Paleta OKLCH
- **Display:** `Bricolage Grotesque` (700/800)
- **UI & Leitura:** `Plus Jakarta Sans` (400/500/600/700) — usada também em rótulos, legendas, botões de quantidade e metadados (`tabular-nums` para números).
- **Dados Numéricos:** `JetBrains Mono` (`font-variant-numeric: tabular-nums`) restrita apenas a números alinhados em coluna se necessário; nunca usada como "voz técnica" decorativa em micro-rótulos ou legendas.
- **Superfícies:** Papel Offset Alvo (`oklch(98.5% 0.004 85)`) no tema claro e Carbono Editorial (`oklch(15% 0.012 260)`) no tema escuro, com Vermelho Carmim Center (`#E31E24` / `oklch(54% 0.22 27)`).

## 4. Diretrizes Visuais & Backlog de Melhorias (Referência: Refero Styles)
Orientações de design curadas a partir de benchmarks industriais de alto padrão (Teenage Engineering, Vercel, Intercom):

1. **Piso de "Papel Quente" & Tinta Suave:**
   - Base de superfície em tom quente editorial (`#FAF9F6` / `Canvas Mist`) no tema claro.
   - Textos e ícones em Carbono/Ink (`#111111` ou `#0F0E12`) para evitar o contraste frio e artificial do preto puro `#000000`.
   - O vermelho Center (`#E31E24`) atua como acento cromático deliberado e exclusivo para CTAs e conversão.
   - Exceção decidida pelo Bruno (31/10/2026): o botão que envia o orçamento pelo WhatsApp fica verde (`--whatsapp-green`), porque é a cor que o cliente reconhece como WhatsApp. Na seção de orçamento ele é a única ação cheia; o link do resumo é secundário.

2. **Superfícies por Tom e Sem Sombras Decorativas:**
   - Divisores e bordas estruturais sutis (`1px solid var(--border-hairline)`), sem sombras suaves decorativas (`box-shadow`) nos cards nem `backdrop-filter` (vidro borrado). A separação entre blocos é feita por degrau de tom de fundo (`--bg-elevated` sobre `--bg-surface`, ou `--bg-surface` sobre `--bg-canvas`) e espaço.
   - O produto físico (sacolas kraft, caixas, adesivagem, impressos) é o único elemento denso e em foco na página; a interface atua como moldura de precisão.

3. **Geometria Arquitetural e Cantos Refinados:**
   - Manter `border-radius` entre `4px` e `6px` para botões, inputs, chips de filtro e cards (evitando pílulas arredondadas genéricas para transmitir precisão milimétrica de corte e guilhotina).

4. **Rótulos e Metadados em Fonte de Texto (Zero Tells de IA):**
   - Sem `.section-eyebrow` (rótulos pequenos em mono, caixa alta e tracking largo acima de títulos) e sem numeração decorativa (`/01`..`/04`). Quando a informação do rótulo é útil (ex.: "sem cadastro", "em Teresina"), ela entra na frase de apoio.
   - Rótulos, clientes, tiragens e metadados usam `Plus Jakarta Sans` em caixa normal (sentence case) e tamanho legível.
   - A seção `#diferenciais` usa composição em linhas editoriais (título à esquerda e descrição à direita), sem cards repetidos com ícone em quadradinho.

5. **Amostras Táteis de Acabamentos:**
   - Apresentação visual limpa dos acabamentos nobres (*Verniz Localizado*, *Hot Stamping*, *Soft Touch*, *Corte Especial*) em formato de galeria/amostras táteis diretas.

---

## 5. Arquitetura da Nova Hero Section & Motion (Referência: Strata AI / MotionSites / Não Codei)
*Decisões consolidadas na sessão de 28/10/2026 para execução com Gemini 4 Argon:*

1. **Header Minimalista (Sem Barra Sólida Feia):**
   - Eliminar qualquer barra de navegação sólida/pesada que pareça divisor artificial.
   - Header transparente flutuante sobre o canvas, apenas tipografia pura em tom suave (`#b9b8bb` / `#888888`), espaçada (~48px entre links), com transição suave de cor no hover.
   - Botão de ação isolado à direita: pill minimalista em contorno hairline/glass (`[ Orçamento WhatsApp ]`).

2. **Canvas Proporcional Fluid Scale (`--u` Canvas Unit):**
   - Implementar cálculo de viewport proporcional para manter a hierarquia exata e respiração em qualquer monitor desktop sem quebras de layout.

3. **Headline em Cascata (Web Animations API Nativa):**
   - 3 linhas de títulos editoriais imponentes subindo de suas próprias máscaras de corte (`clip-path` mask), 0.12s apart, sem bibliotecas pesadas de terceiros:
     - Linha 1: *"Impressão com autoridade."*
     - Linha 2: *"Embalagens que valorizam sua marca."*
     - Linha 3: *"Entregue em todo o Brasil."*
   - Subtítulo limpo e direto, seguido de 2 CTAs objetivos e linha de estatísticas de autoridade (**+3.800** marcas · **Offset & Digital** parque próprio · **Teresina-PI** envio nacional).

4. **Showcase Central de Produto Físico (Right Half Artwork):**
   - Substituir os blocos amontoados por um showcase flutuante e arejado dos produtos físicos reais da Center Gráfica (sacolas nobres, caixas rígidas, agendas e frotas) com leve inclinação 3D tátil e brilho sutil.
   - **Elemento Escultural 3D (Logo Center Gráfica Levitando):** A logo oficial (`logo-center.svg`) flutuando na direita com física de onda senoidal suave e reação Parallax ao cursor do mouse.
     - *Referência técnica:* `img2threejs/img2threejs` (geometria procedural Three.js leve) OU SVG CSS 3D com `perspective: 1000px` (zero dependências, 60fps até em celulares básicos).
   - Dois cards de apoio sobrepostos (`.glass-card`): superfície opaca um tom acima do fundo da hero (`--bg-elevated` sobre `--bg-surface`), sem `backdrop-filter` e sem sombra decorativa, mantendo o conteúdo de produção própria e balcão em Teresina / envio nacional.

5. **Eliminação Total da Poluição Visual:**
   - Manter zero jargões internos, zero tabelas técnicas estáticas visíveis no primeiro impacto e zero bordas pesadas. Menos é mais: produto físico em foco com moldura editorial de alta precisão.


