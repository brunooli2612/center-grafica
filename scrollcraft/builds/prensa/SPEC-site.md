# Prensa no site v2: bloco "Como fazemos" + a folha que vira o orçamento

Branch `brunooli2612/logo-3d` apenas. Sem commit até o Bruno ver.

## Ideia
Entre `#como-funciona` e `#orcamento`. A pessoa rola, a câmera percorre a prensa (molha → tinta → chapa → blanqueta → folha). No fim, a folha impressa sai da máquina, vira para a câmera e cresce até cobrir a tela. O papel tem a cor do fundo do site, então a seção `#orcamento` aparece "impressa" nele.

## Arquitetura
- **iframe** com a prensa, carregado só quando o bloco chega a 1 tela de distância (`IntersectionObserver`, `rootMargin: 100% 0px`). Antes disso, um poster estático (`assets/prensa/poster.webp`, gerado por `capture.mjs`).
- Motivo: o site usa three 0.160 via CDN (logo) e o kit usa three 0.186 embutido. O iframe isola os dois. 800 KB só baixam perto do bloco.
- A página do iframe é um build próprio: pasta `scrollcraft/builds/prensa-site/` com `main.js` + `site.js`, que importam `../prensa/kin.js`, `press.js`, `stage.js`. O build é `node "$SKILL_DIR/sims/build.mjs" ./scrollcraft/builds/prensa-site`, e o resultado copiado para `assets/prensa/prensa-site.html`.

## Protocolo pai → iframe (`postMessage`, mesma origem)
- `{type: 'prensa:progress', p}`: p de 0 a 1, o progresso da rolagem do trilho preso.
- `{type: 'prensa:theme', bg, ink, accent}`: as cores lidas de `getComputedStyle(document.documentElement)` (`--bg-canvas`, `--ink-primary`, `--brand-red`), enviadas ao carregar e sempre que o tema mudar (observar o atributo/classe que o `theme-manager.js` altera).
- `{type: 'prensa:visible', on}`: liga/desliga o loop de render.
- iframe → pai: `{type: 'prensa:ready'}` depois do primeiro quadro.

## Trilho preso (pai)
- `<section id="como-fazemos">` com `height: 400vh` (celular: 320vh) e filho `position: sticky; top: 0; height: 100vh` contendo o iframe (100% × 100%, sem borda, `title="Prensa offset por dentro"`), mais uma camada de texto HTML por cima (legenda de cada etapa, ver Textos).
- p = progresso do scroll dentro do trilho (0 no topo do trilho no topo da tela, 1 quando o fim do trilho chega no fim da tela). Calculado com o ScrollTrigger já carregado (`window.ScrollTrigger`) ou com um listener passivo de scroll + rAF se ele faltar.
- `#orcamento` fica logo depois. Na faixa p 0,90 → 1,00 o conteúdo do `#orcamento` não se mexe; o que muda é a folha, que já cobre a tela. Depois de 1,00 a rolagem normal leva o `#orcamento` para cima por cima do papel, que tem a mesma cor do fundo, e a emenda não aparece.

## Roteiro por p (no iframe; as câmeras saem do `CAMS` de stage.js, interpoladas com ease 0.65,0,0.35,1)
| p | Câmera | Isolado | Legenda (camada HTML do pai) |
|---|---|---|---|
| 0,00–0,10 | hero | — | etapa 0 |
| 0,10–0,24 | lado | — | etapa 1 |
| 0,24–0,38 | molha | molha | etapa 2 |
| 0,38–0,52 | tinta | tinta | etapa 3 |
| 0,52–0,62 | cilindros | chapa | etapa 4 |
| 0,62–0,72 | cilindros | blanqueta | etapa 5 |
| 0,72–0,84 | folha | folha | etapa 6 |
| 0,84–1,00 | folha → final | — | some (fade) |
O isolamento usa `press.setGhost`. As transições de câmera ocupam os 30 % iniciais de cada faixa.
A máquina gira no tempo (6.000 folhas/h, `th` integrado por dt), não pela rolagem: ela fica viva mesmo parada. A câmera e o isolamento dependem só de p.

## A folha final (0,84 → 1,00)
- É uma malha **separada** da folha da kin (as folhas reais continuam saindo atrás dela). Ela nasce na pose de saída da folha (ponto e tangente de `sheet()` no início da fase `saida`), já impressa com a mesma textura da folha.
- 0,84–0,92: se solta da guia, vira a face impressa para a câmera e sobe até o centro da tela (curva com ease de entrada 0.16,1,0.3,1). A impressão da face vai dando lugar ao papel liso (fade da textura em 0,88–0,94).
- 0,92–1,00: cresce até cobrir 100 % da tela, com margem de segurança de 10 %. A cor vai para o `bg` recebido do pai (no tema claro `#F3EFE6`, no escuro o fundo escuro). Em p ≥ 0,97 o iframe desenha só a cor de fundo (garantido, sem sombra nem bloom), para a emenda com o `#orcamento` ser perfeita.
- O resto da cena escurece levemente (vinheta de 0 → 0,15) enquanto a folha cresce, para dar foco.

## Celular / qualidade / acessibilidade
- Celular (`pointer: coarse` ou largura < 700): tier mais baixo, pixel ratio ≤ 1,5, sem GTAO, sombra 512. Câmeras com distância ×1,25 em tela retrato, para a máquina caber de pé.
- Limite de 30 fps, nada é desenhado com `visible` false, `watchPerf` cai um nível abaixo de 26 fps. No tier mais baixo e ainda abaixo de 20 fps: o iframe avisa o pai (`{type:'prensa:fallback'}`) e o pai troca o iframe pelo poster.
- `prefers-reduced-motion`: o pai **não carrega o iframe**, mostra o poster e as 7 legendas como lista estática; o trilho vira altura normal (sem sticky). Sem shim de teste aqui: no site vale a preferência do sistema.
- O iframe tem `aria-hidden="true"` e `tabindex="-1"`; o conteúdo útil (as legendas) fica no HTML do pai, legível por leitor de tela.

## Textos (finais, não inventar)
Título da seção (h2, visível no topo do trilho): **"Como a sua arte vira papel"**
Lead: "Na offset, a imagem passa por três cilindros antes de chegar na folha. Role para ver por dentro."
Etapas (uma por vez, canto inferior esquerdo no computador, faixa inferior no celular):
0. "Esta é uma impressora offset por dentro. A sua arte passa por aqui."
1. "Três cilindros giram juntos: chapa, blanqueta e impressão."
2. "Primeiro, água. Ela molha a chapa onde não pode ter tinta."
3. "Depois, a tinta. Os rolos espalham uma camada fina e por igual."
4. "A chapa leva a sua arte gravada, legível."
5. "A blanqueta, de borracha, recebe a imagem espelhada…"
6. "…e imprime no papel do jeito certo. Uma folha por volta."
Texto impresso na folha (canvas): "CENTER GRÁFICA" + "Impressão offset · Teresina" (substitui "OFFSET LITHOGRAPHY · HEIDELBERG GTO 52").

## Arquivos
- Novos: `scrollcraft/builds/prensa-site/{main.js,site.js}`, `css/prensa.css`, `js/prensa-embed.js` (script comum `defer`, fora do bundle), `assets/prensa/prensa-site.html`, `assets/prensa/poster.webp`.
- Editados: `index.html` (a seção + o link do css + o script), `scrollcraft/builds/prensa/press.js` (só o texto da folha).
- Testes: `npm test` continua passando; acrescentar em `tests/` um teste de DOM: a seção `#como-fazemos` existe entre `#como-funciona` e `#orcamento`, o iframe não tem `src` no HTML (é lazy), tem `title`, e as 7 legendas estão no HTML.
