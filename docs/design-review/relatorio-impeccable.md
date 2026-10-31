# Relatório de Crítica e Auditoria de Design (`impeccable: critique + audit`) — Center Gráfica

> **Alvo avaliado:** `index.html`, `css/design-system.css`, `css/layout.css`, `css/components.css`, `css/main.css` e `js/logo-3d.js` / `js/app.bundle.js` + capturas renderizadas em `docs/design-review/shots/` (Desktop 1440px Claro/Escuro e Celular 390px Claro).  
> **Diretrizes preservadas:** Ticker vermelho vertical, sublinhado manuscrito em *"todo o Brasil."*, símbolo 3D na coluna direita da Hero (`js/logo-3d.js`), símbolo oficial no cabeçalho/rodapé e menu sem barra sólida com botão WhatsApp em contorno.  
> **Itens já mapeados na fila (não contabilizados entre os achados abaixo):** linha de estatísticas (`+3.800` marcas pendente de confirmação) e dois cards translúcidos de acabamento na Hero; correção do `overflow-x: hidden` no `body`/`html` que hoje impede o `position: sticky` do cabeçalho ao rolar.

---

## 1. Resumo de 5 linhas: o que mais atrapalha a conversão hoje

1. Na seção `#orcamento`, existem dois botões primários concorrentes (um verde no formulário que trava se o nome estiver vazio e outro vermelho no card de resumo que ignora toda a validação), gerando dúvida sobre qual clicar e permitindo envios sem Cidade/UF.
2. No celular (`390px`), o palco `#logo-3d-stage` reserva um quadrado em branco de ~358×358px quando o WebGL/CDN atrasa ou não renderiza a tempo, criando um buraco visual enorme logo abaixo dos CTAs da Hero.
3. As fontes carregadas no `<head>` (`Bricolage Grotesque`, `Plus Jakarta Sans`, `JetBrains Mono`) não batem com os tokens do `css/design-system.css` (`Archivo`, `IBM Plex`), fazendo o site inteiro cair em `Arial`/fontes do sistema enquanto baixa ~120KB de fontes inutilizadas.
4. No mobile, a barra superior empilhada em 3 linhas somada ao botão vermelho sólido do cabeçalho ocupa ~155px antes da Hero e compete diretamente com o CTA primário `"Simular Orçamento Agora"`.
5. O catálogo (`#catalogo`) apresenta 8 cards puramente textuais sem nenhuma amostra visual de material ou acabamento, obrigando o comprador B2B a decidir às cegas antes de clicar em `"Orçar este item"`.

---

## Síntese de Pontuação (`impeccable: critique + audit`)

- **Modo da superfície:** `Persuade` (Landing page B2B com configurador de orçamento técnico para conversão em WhatsApp `(86) 98854-5141`).
- **Design Health Score (Heurísticas de Nielsen):** **23/32 (72% — Bom, com gargalos na conversão)** *(Heurísticas 7 e 10 marcadas como `n/a` conforme regra para superfícies Persuade)*.
  - *Destaques positivos:* Linguagem alinhada ao comprador B2B sem jargões de folha de máquina (H2: 4/4); excelente uso de divulgação progressiva no acordeão de pré-impressão (H8: 3/4); recomendação dinâmica de processo Offset vs. Digital conforme a tiragem (H6: 3/4).
  - *Principais quedas:* Prevenção de erros e consistência no envio duplo do `#orcamento` (H4: 2/4, H5: 2/4) e falta de fallback imediato visível no palco 3D mobile (H1: 2/4).
- **Audit Health Score (Qualidade Técnica):** **13/20 (Aceitável — requer correções de P0/P1)**
  - **Acessibilidade (2/4):** Elemento de ação aninhado dentro de `<button role="tab">`, `aria-live="polite"` disparando a cada 2,5s no ticker e animações contínuas ativas em `prefers-reduced-motion: reduce`.
  - **Performance (3/4):** Carregamento de 3 famílias do Google Fonts não utilizadas nos tokens CSS e importação de Three.js via CDN sem imagem estática inicial no HTML.
  - **Theming (2/4):** Modo `"Auto"` (`data-theme="system"`) não possui suporte a `@media (prefers-color-scheme: dark)`, forçando sempre o tema claro.
  - **Responsividade (3/4):** Layout fluido sem scroll horizontal, mas com palco 3D gerando espaço vazio excessivo no mobile (`390px`) e inversão da ordem lógica entre formulário e resumo no celular.
  - **Integridade de Implementação (3/4):** Presença de ~200 linhas de CSS/JS órfãos da antiga mesa de amostras e divergência entre os tokens de cor/tipografia e o `DESIGN.md`.

---

## 2. Achados Priorizados (Máximo de 15 achados)

### P0 — Atrapalha conversão ou acessibilidade

#### Achado 01 — Duplicidade de CTAs de envio com regras de validação conflitantes no Orçamento
- **Onde:** Seção `#orcamento` (`#quote-builder-form button[type="submit"].btn-whatsapp` vs. `.preview-actions #whatsapp-direct-preview-link` em `index.html` e `js/app.bundle.js`).
- **Problema:** O simulador apresenta dois botões de envio para o WhatsApp lado a lado com cores e comportamentos opostos. O botão verde da coluna esquerda valida o formulário e bloqueia o envio se o campo `"Seu nome ou empresa"` estiver vazio (que sequer tem asterisco ou indicação visual de obrigatório). Já o botão vermelho `"Abrir direto no WhatsApp"` na coluna direita é um link `<a>` sempre ativo que ignora toda a validação, permitindo abrir o WhatsApp com `"Sua Empresa"` e sem informar Cidade/UF mesmo quando `"Envio para outra Cidade / Estado"` está selecionado.
- **Por que importa:** No momento decisivo da conversão, o usuário hesita entre dois botões de cores diferentes para a mesma ação, ou sofre erro inesperado no botão verde por causa de um campo sem marcação visual de obrigatoriedade, ou envia um orçamento incompleto pelo botão vermelho sem a cidade para cálculo de frete.
- **Recomendação concreta:** Unificar o comportamento de envio: tornar `"Seu nome ou empresa"` opcional para não travar leads rápidos (usando fallback `"Cliente pelo Site"` quando vazio), manter obrigatórios apenas `Quantidade > 0` e `Cidade/UF` (quando `envio-nacional` estiver ativo, com rótulo marcado como obrigatório), e interceptar também o clique em `#whatsapp-direct-preview-link` com a mesma validação, transformando os botões do card de resumo em ações auxiliares (`"Copiar texto"` e `"Enviar este resumo no WhatsApp"`) subordinadas ao mesmo fluxo.
- **Esforço:** Pequeno.

#### Achado 02 — Palco 3D da Hero gera bloco vazio de ~358×358px no celular quando o canvas atrasa ou não inicializa
- **Onde:** Seção Hero (`.hero-section`, `.hf-showcase-scene` e `#logo-3d-stage` em `index.html`, `css/main.css` e `js/logo-3d.js`).
- **Problema:** Nas capturas mobile (`celular-390-claro-hero.png` e `celular-390-claro-pagina-inteira.png`), o container `#logo-3d-stage` fica completamente vazio no HTML inicial e reserva `aspect-ratio: 1 / 1` com `max-width: 440px`. Enquanto os módulos ES do Three.js são baixados do CDN ou quando o contexto WebGL não renderiza a tempo, o visitante no celular vê um buraco em branco de quase 360px de altura entre os selos de confiança e a faixa preta de especialidades.
- **Por que importa:** A maior parte do tráfego comercial vindo do Instagram e WhatsApp acessa pelo celular. Um espaço vazio equivalente a metade da tela logo abaixo da primeira dobra passa a impressão de página quebrada e reduz o impulso de rolar até o simulador.
- **Recomendação concreta:** Inserir a imagem `<img src="assets/images/simbolo-center.svg" alt="" />` diretamente dentro de `#logo-3d-stage` no `index.html` como estado inicial instantâneo (removendo-a ou ocultando-a via JS somente após o primeiro `renderer.render` do Three.js) e reduzir o tamanho do palco no mobile (`@media (max-width: 767px)`) de `max-width: 440px` para `max-width: 240px` com margem vertical compacta (`1rem`).
- **Esforço:** Pequeno.

#### Achado 03 — Divergência entre fontes carregadas no HTML e tokens do CSS força fallback para Arial/Sistema
- **Onde:** `<head>` em `index.html` vs. variáveis `--font-display`, `--font-sans` e `--font-mono` em `css/design-system.css`.
- **Problema:** O `index.html` importa `Bricolage Grotesque`, `Plus Jakarta Sans` e `JetBrains Mono` do Google Fonts (conforme seção 3 do `DESIGN.md`), mas o `css/design-system.css` declara `--font-display: 'Archivo', 'Helvetica Neue', Arial, sans-serif`, `--font-sans: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif` e `--font-mono: 'IBM Plex Mono', 'Consolas', monospace`. Como essas três fontes não são carregadas em lugar nenhum, toda a página é renderizada em `Arial`, fonte padrão do sistema e `Consolas`.
- **Por que importa:** Desperdiça ~120KB de rede baixando fontes que nunca aparecem na tela e compromete severamente a hierarquia tipográfica da Hero, dos títulos de seção e dos dados técnicos tabulares do orçamento.
- **Recomendação concreta:** Atualizar `css/design-system.css` para apontar para as fontes já carregadas e definidas no `DESIGN.md`: `--font-display: 'Bricolage Grotesque', sans-serif`, `--font-sans: 'Plus Jakarta Sans', sans-serif` e `--font-mono: 'JetBrains Mono', monospace`.
- **Esforço:** Pequeno.

#### Achado 04 — Ação `"Orçar esta linha →"` aninhada dentro de `<button role="tab">` impede acesso via teclado e leitores de tela
- **Onde:** Seção `#trabalhos` (`.vtabs-item` e `.vtabs-cta-link[data-select-product]` em `index.html` e `css/components.css`).
- **Problema:** Cada aba vertical `.vtabs-item` é um elemento `<button>`, e dentro dele há um `<span class="vtabs-cta-link" data-select-product="...">Orçar esta linha →</span>`. Na especificação HTML e de acessibilidade (WCAG 4.1.2 / 2.1.1), elementos interativos dentro de `<button>` não recebem foco próprio de teclado; além disso, pressionar `Enter` ou `Espaço` sobre a aba já ativa é ignorado por `goToSlide()` (`if (nextIndex === activeIndex) return`), tornando impossível acionar `"Orçar esta linha →"` pelo teclado. A altura de toque do link também é de apenas ~22px (`padding: 0.2rem 0`).
- **Por que importa:** Bloqueia a conversão a partir da seção de portfólio para usuários de teclado/tecnologias assistivas e dificulta o toque preciso em telas mobile (abaixo do mínimo WCAG 2.5.8 de 24×24px e do ideal de 44×44px).
- **Recomendação concreta:** Reestruturar cada item de `.vtabs-list` em um container `<div class="vtabs-entry">` contendo um `<button role="tab">` apenas para o cabeçalho (`/01 Sacolas & Embalagens Offset`) e um bloco irmão para o conteúdo expandido com um `<button type="button" class="vtabs-cta-link">` real, com área mínima de toque de `40px` de altura (`padding: 0.5rem 0.75rem`).
- **Esforço:** Médio.

#### Achado 05 — Ticker da Hero dispara `aria-live="polite"` a cada 2,5s e animações contínuas não param em `prefers-reduced-motion`
- **Onde:** Seção Hero (`.hf-ticker-slot` em `index.html`, `initVerticalSpringTicker` em `js/app.bundle.js`) e faixa `.hf-marquee-track` em `css/main.css`.
- **Problema:** O container `.hf-ticker-slot` possui `aria-live="polite"` e é alterado a cada 2,5 segundos via `setInterval`, inclusive quando `prefers-reduced-motion: reduce` está ativo (onde ele continua trocando os itens com fade de opacidade). Da mesma forma, `.hf-marquee-track` apenas aumenta a duração de `80s` para `160s` em movimento reduzido, sem parar a animação.
- **Por que importa:** Para usuários de leitor de tela, `aria-live="polite"` trocando a cada 2,5 segundos interrompe continuamente a leitura do formulário de orçamento. Para usuários com sensibilidade vestibular (`prefers-reduced-motion: reduce`), manter o loop do ticker e do marquee viola a diretriz WCAG 2.2.2 e o critério de acessibilidade de movimento do `impeccable audit`.
- **Recomendação concreta:** Remover `aria-live="polite"` de `.hf-ticker-slot` (definindo um texto estático acessível ou `aria-label` completo no `<h1>`), encerrar o `setInterval` de `initVerticalSpringTicker()` quando `window.matchMedia('(prefers-reduced-motion: reduce)').matches` for verdadeiro, e aplicar `animation: none` em `.hf-marquee-track` sob `@media (prefers-reduced-motion: reduce)`.
- **Esforço:** Pequeno.

---

### P1 — Qualidade visual importante

#### Achado 06 — Sobrecarga no topo mobile: barra de informações em 3 linhas e botão vermelho do header competindo com a Hero
- **Onde:** `.top-info-bar` e `.site-header` (`index.html` e `css/layout.css`).
- **Problema:** No celular (`celular-390-claro-hero.png`), a `.top-info-bar` quebra em 3 linhas centralizadas (status + endereço + 2 telefones) e, logo abaixo, o `.site-header` exibe o botão `"Orçar"` com fundo vermelho sólido (`.btn-primary`), pois a regra de contorno transparente só foi aplicada a partir de `min-width: 768px`. Com isso, o topo consome ~155px antes do título da Hero, repete o endereço e o envio nacional que já aparecem na Hero e coloca dois botões vermelhos sólidos na mesma tela.
- **Por que importa:** Dilui a hierarquia visual do primeiro impacto no celular e contraria a decisão de design de ter o menu limpo apenas com o botão de WhatsApp em contorno, roubando protagonismo do CTA `"Simular Orçamento Agora"`.
- **Recomendação concreta:** No mobile (`max-width: 767px`), ocultar `.top-info-bar__contacts` na barra superior (mantendo apenas 1 linha compacta: `"Vendemos para todo o Brasil • Produção em Teresina-PI"`) e aplicar o estilo de contorno (`background: transparent; color: var(--ink-primary); border: 1px solid var(--border-mid)`) ao `.header-wa-btn` também abaixo de `768px`, reservando o preenchimento vermelho sólido exclusivamente para o CTA da Hero.
- **Esforço:** Pequeno.

#### Achado 07 — Opção `"Auto"` do seletor de tema falha no modo escuro do sistema e sobrecarrega o cabeçalho desktop
- **Onde:** `.theme-switcher` (`index.html`, `js/app.bundle.js` e `css/design-system.css`).
- **Problema:** Clicar em `"Auto"` define `data-theme="system"` na tag `<html>`, mas `css/design-system.css` só estiliza `:root` (claro) e `html[data-theme="dark"]`. Não existe regra `@media (prefers-color-scheme: dark)` para `data-theme="system"` nem resolução via `matchMedia` no JavaScript, fazendo com que `"Auto"` force sempre o tema claro. Além disso, os 3 botões (`Claro | Escuro | Auto`) ocupam ~165px no cabeçalho desktop, comprimindo a navegação e forçando a remoção do número de telefone do botão principal abaixo de `1440px`.
- **Por que importa:** Quebra a promessa funcional do botão `"Auto"` para visitantes com sistema operacional em modo escuro e adiciona poluição visual no cabeçalho que deveria conter apenas a navegação limpa e o botão de WhatsApp com contorno (`DESIGN.md` seção 5.1).
- **Recomendação concreta:** No `js/app.bundle.js`, resolver o modo `"system"` consultando `window.matchMedia('(prefers-color-scheme: dark)').matches` (e ouvindo mudanças do sistema), e no desktop substituir o grupo de 3 botões de texto por um botão único discreto de ícone (sol/lua de `36×36px`) ou movê-lo para o rodapé, liberando espaço no `.site-header` para manter o número `(86) 98854-5141` visível a partir de `1280px`.
- **Esforço:** Pequeno.

#### Achado 08 — Ordem invertida entre envio e resumo no mobile e falta de `sticky` no preview do Orçamento no desktop
- **Onde:** Seção `#orcamento` (`.quote-workspace`, `.quote-card` e `.whatsapp-preview-card` em `css/layout.css` e `css/components.css`).
- **Problema:** No celular (`celular-390-claro-pagina-inteira.png`), o usuário preenche o card `"1. Dados do seu impresso"`, encontra o botão final `"Enviar Pedido de Orçamento no WhatsApp"` e só **depois** dele vê o card `"2. Resumo da mensagem"` e o acordeão `"Já tem a arte pronta? Confira 4 dicas rápidas"`. No desktop, a coluna direita não possui `position: sticky`, ficando para trás quando o formulário se expande.
- **Por que importa:** O usuário mobile nunca vê o resumo em tempo real nem as dicas de pré-impressão antes de clicar no botão de envio do formulário, perdendo o efeito de confiança e transparência do preview da mensagem.
- **Recomendação concreta:** No desktop (`min-width: 1024px`), aplicar `position: sticky; top: 1.5rem` ao container da coluna direita de `.quote-workspace`. No mobile (`max-width: 1023px`), exibir o bloco de preview `.whatsapp-message-box` e o acordeão `.prepress-accordion` antes do botão final de submissão (ou unificar o botão de envio na base do resumo), garantindo a sequência lógica: *Preencher → Conferir Resumo → Enviar no WhatsApp*.
- **Esforço:** Médio.

#### Achado 09 — Dissonância cromática entre Vermelho Marca (`--brand-red`) e Verde WhatsApp (`--whatsapp-green`) na seção de conversão
- **Onde:** Seção `#orcamento` (`.btn-whatsapp` vs. `.btn-primary` em `css/components.css` e tokens em `css/design-system.css`).
- **Problema:** A seção 4.1 do `DESIGN.md` define que o vermelho Center atua como acento exclusivo para CTAs e conversão. No entanto, dentro de `#orcamento`, o botão do formulário é verde (`.btn-whatsapp`, `#0D743F`) enquanto o botão do card ao lado é vermelho (`.btn-primary`, `#D41924`). Há também divergência nos códigos de vermelho: `--brand-red` é `#D41924` no tema claro, mas `meta[name="theme-color"]` usa `#E31E24` e `.vtabs-slide-client` usa `rgba(227, 30, 36, 0.92)` hardcoded.
- **Por que importa:** Dois botões de cores fortes diferentes lado a lado na mesma seção quebram a unidade cromática do sistema e geram dúvida sobre qual é a ação primária recomendada pela página.
- **Recomendação concreta:** Padronizar uma única cor para o CTA primário de fechamento na seção `#orcamento` (preferencialmente `var(--brand-red)` para respeitar o `DESIGN.md` seção 4.1, mantendo `var(--whatsapp-green)` apenas nos indicadores de status online `.whatsapp-preview-card__status` e alertas `.is-success`), e substituir os vermelhos hardcoded em `css/components.css` por `var(--brand-red)`.
- **Esforço:** Pequeno.

#### Achado 10 — Chips de tiragem (`#quantity-presets`) pequenos no desktop e sem sinalização visual do ganho de escala em Offset
- **Onde:** Seção `#orcamento` (`.quantity-presets`, `.qty-chip` e `.process-recommendation` em `css/components.css` e `js/app.bundle.js`).
- **Problema:** Os chips rápidos de quantidade (`250 un.`, `500 un.`, `1000 un.`, `3000 un.`) têm apenas ~29px de altura no desktop (`padding: 0.32rem 0.45rem`, `font-size: 0.76rem`) e aparência neutra idêntica. O usuário só descobre que a partir de `500 un.` o processo muda para **Impressão Offset Industrial (Melhor custo unitário)** se clicar no chip e ler o parágrafo abaixo.
- **Por que importa:** Guiar o cliente B2B para tiragens de melhor aproveitamento de folha (500+ ou 1000+ unidades) aumenta o ticket médio e reduz orçamentos inviáveis no atendimento comercial.
- **Recomendação concreta:** Aumentar a altura mínima de `.qty-chip` para `36px` no desktop (`padding: 0.45rem 0.65rem`, `font-size: 0.8rem`), adicionar uma borda lateral de destaque (`border-left: 3px solid var(--brand-red)`) na caixa `.process-recommendation` para dar peso de consultoria técnica, e destacar nos chips a partir de `500 un.` / `1000 un.` um indicador sutil de escala (ex.: `1000 un. • Offset`).
- **Esforço:** Pequeno.

#### Achado 11 — Grade de Catálogo (`#catalogo`) puramente textual, sem amostras visuais dos produtos ou acabamentos
- **Onde:** Seção `#catalogo` (`.catalog-grid`, `.product-card` em `index.html`, `css/components.css` e `js/app.bundle.js`).
- **Problema:** Os 8 cards do catálogo exibem apenas texto, chips cinzas e um ícone vetorial genérico de `40×40px`, sem nenhuma fotografia de produto ou amostra visual de acabamento (Verniz UV, Laminação Fosca, Kraft, Hot Stamping), contrariando as diretrizes 4.2 (*"O produto físico é o único elemento denso e em foco na página"*) e 4.5 (*"Amostras Táteis de Acabamentos"*) do `DESIGN.md`.
- **Por que importa:** Faz o catálogo parecer uma lista de recursos de software em vez de um mostruário gráfico industrial, exigindo que o cliente leia 8 blocos de texto parecidos para encontrar o seu material.
- **Recomendação concreta:** Incluir uma miniatura visual ou faixa de amostra de material no cabeçalho de cada `.product-card` (`height: 120px` ou `aspect-ratio: 16 / 9`, `border-radius: 4px`, `object-fit: cover`) ou estilizar os `.finish-chip` com indicadores cromáticos/táteis distintos (ex.: brilho especular sutil nos chips de *Verniz UV* e *Hot Stamping*, tom fibra `#E5DEC9` no chip *Kraft*), facilitando o reconhecimento visual imediato.
- **Esforço:** Médio.

#### Achado 12 — Contraste abaixo do mínimo WCAG AA (4.5:1) em metadados secundários e numeração das abas
- **Onde:** `css/design-system.css` (`--ink-muted`), `css/components.css` (`.vtabs-num`, `.product-card__badge`) e `css/layout.css` (`.footer-bottom`).
- **Problema:** No tema claro, `--ink-muted` (`#656B76`) sobre superfícies `--bg-recessed` (`#E7E1D3`) entrega razão de contraste de **~3.85:1**, abaixo dos `4.5:1` exigidos pela WCAG AA para textos de `11px–12px`. Na seção `#trabalhos`, `.vtabs-num` (`/01` a `/04`) aplica `opacity: 0.55` sobre `color: var(--ink-muted)`, derrubando o contraste para **~2.1:1** (quase ilegível tanto no tema claro quanto no escuro).
- **Por que importa:** Dificulta a leitura da numeração técnica, tiragens mínimas e selos de categoria em telas de menor brilho ou sob luz solar no celular, falhando no critério de acessibilidade WCAG 1.4.3.
- **Recomendação concreta:** Ajustar `--ink-muted` para `#505660` no tema claro (elevando o contraste sobre `--bg-recessed` para `> 4.7:1`) e para `#949BA8` no tema escuro; em `.vtabs-num`, remover `opacity: 0.55` e usar diretamente `color: var(--ink-muted)` (e `color: var(--brand-red)` quando `.vtabs-item.is-active`).
- **Esforço:** Pequeno.

---

### P2 — Polimento

#### Achado 13 — Raios de borda exagerados (`36px` e `999px`) no palco `#trabalhos` destoam da geometria de faca gráfica (`4px–6px`)
- **Onde:** Seção `#trabalhos` (`.vtabs-stage`, `.vtabs-slide-client` e `.vtabs-nav-btn` em `css/components.css`).
- **Problema:** Enquanto toda a linguagem da página e a seção 4.3 do `DESIGN.md` especificam cantos técnicos precisos entre `4px` e `6px` (*"evitando pílulas arredondadas genéricas para transmitir precisão milimétrica de corte e guilhotina"*), o palco de imagens `#vtabs-stage` aplica `border-radius: 2.25rem` (`36px`) no desktop (`1.75rem` / `28px` no mobile) e `.vtabs-slide-client` usa `border-radius: 999px`.
- **Por que importa:** Quebra a coesão geométrica entre o portfólio e as seções vizinhas (Catálogo e Orçamento, que usam `border-radius: 4px`), dando à seção `#trabalhos` um aspecto de componente colado de outro template.
- **Recomendação concreta:** Reduzir o `border-radius` de `.vtabs-stage` para `8px` (`0.5rem`) ou `6px`, e o de `.vtabs-slide-client` para `var(--radius-sm)` (`3px`), harmonizando o palco de fotos com a estética de corte reto do restante do site.
- **Esforço:** Pequeno.

#### Achado 14 — Aba `/04` (*"Acabamentos Especiais & Verniz UV"*) pré-seleciona `"Cadernos e Agendas"` sem aplicar acabamento UV no simulador
- **Onde:** Seção `#trabalhos` (`index.html` linha 504: `.vtabs-item[data-vtab-index="3"] .vtabs-cta-link` e `js/app.bundle.js`).
- **Problema:** Tanto a aba `/03` (*"Cadernos & Agendas Corporativas"*) quanto a aba `/04` (*"Acabamentos Especiais & Verniz UV"*) possuem o mesmo atributo `data-select-product="cadernos-agendas-corporativas"`. Ao clicar em `"Orçar esta linha →"` na aba `/04`, o usuário é levado ao orçamento com `"Cadernos e Agendas Personalizadas"` selecionado, sem qualquer diferenciação para o acabamento em Verniz UV / Hot Stamping prometido na aba.
- **Por que importa:** Gera estranhamento para o comprador que clicou em *"Acabamentos Especiais & Verniz UV"* pensando em cartões, pastas ou embalagens, ou que esperava ver o acabamento nobre já selecionado no formulário.
- **Recomendação concreta:** Adicionar suporte a um atributo opcional `data-select-finish` no listener de `[data-select-product]` em `js/app.bundle.js`, para que o clique na aba `/04` já selecione automaticamente a opção de acabamento com *Verniz UV / Hot Stamping* correspondente e dê foco visual ao seletor de acabamento no formulário.
- **Esforço:** Pequeno.

#### Achado 15 — CSS e JavaScript órfãos da antiga "Mesa de Amostras" e regras globais `img[src*="..."] !important`
- **Onde:** `css/main.css` (linhas 241–245 e 268–466) e `js/app.bundle.js` (`renderPortfolio` e `initHeroSpecimenStage`).
- **Problema:** Cerca de 200 linhas de `css/main.css` (`.specimen-stage`, `.specimen-backdrop`, `.specimen-viewport`, `.specimen-slide`, `.specimen-pill`) e duas funções completas em `js/app.bundle.js` permanecem no código procurando os IDs inexistentes `#hero-specimen-stage` e `#portfolio-grid`. Nesse bloco antigo, quatro regras globais `img[src*="sacolas"]`, `img[src*="frotas"]`, `img[src*="agendas"]` e `img[src*="terrasco"]` usam `object-position: ... !important`, forçando o recorte de qualquer imagem do site cujo caminho contenha essas palavras.
- **Por que importa:** Aumenta o peso e a complexidade de manutenção das folhas de estilo e aplica `!important` global em imagens fora do escopo original.
- **Recomendação concreta:** Remover os seletores `.specimen-*` de `css/main.css` e as funções órfãs `renderPortfolio()` / `initHeroSpecimenStage()` de `js/app.bundle.js`, restringindo os ajustes de `object-position` exclusivamente a `.vtabs-slide img[src*="..."]` sem uso de `!important`.
- **Esforço:** Pequeno.
