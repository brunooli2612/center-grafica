# HANDOFF: Center Gráfica v2, teardown da GTO 52

Escrito em 04/11/2026 pela sessão anterior (que ficou grande). Leia inteiro antes de agir.

## Regras que não mudam
- **v1 = branch `main`** (checkout `C:\Users\Bruno\center-grafica`). Ela não pode ser tocada. Não faça merge nem PR para a main.
- **v2 = branch `brunooli2612/logo-3d`** (worktree `C:\Users\Bruno\orca\workspaces\center-grafica\logo-3d`, chamada "site-v2" no Orca). Todo o trabalho novo vai nela.
- Objetivo da v2: uma experiência visual incrível que **converta mais clientes**.
- Bruno usa o modo ultracave. Fale em português, de forma direta.
- O Windows do Bruno está com as animações desligadas, então os navegadores dele reportam `prefers-reduced-motion`. Em páginas de teste, use um shim de teste (`?reduzir` restaura o comportamento normal). Nunca coloque esse shim em produção.
- **Delegação ao agy (Gemini 3.8 Flash):** mande para ele só a parte volumosa e testável. Se a entrega vier errada e a ideia for refazer sozinho no Claude, **pare e avise o Bruno** com o que falhou e o custo extra estimado. Quem decide é ele. Nunca confie no "passou" do agy: rode os testes você mesmo.

## Tarefa atual: teardown do castelo de impressão da Heidelberg GTO 52
- Skill instalada em `~/.claude/skills/teardown` (repo elvarofficial/teardown, MIT). O `npm install` e o chromium do Playwright já estão feitos.
- O código foi revisado só lendo (arquivos fora dos exemplos): o `child_process` só chama o ffmpeg e não há chamadas de rede escondidas. Os mais de 30 JS dos exemplos não foram lidos linha por linha.
- O `postinstall` do esbuild **não rodou** (allowScripts do npm). Se o build reclamar do esbuild, rode `npm install-scripts approve esbuild && npm rebuild esbuild`.
- **Primeiro passo:** `cd ~/.claude/skills/teardown && node sims/build.mjs v8-live` para conferir que gera `teardown-out/dist/v8-live.html`. A sessão anterior foi bloqueada pelo modo automático justamente aqui. Confira também `which ffmpeg python`.
- **Por que a GTO 52:** é a offset que as gráficas pequenas e médias do Brasil costumam ter, e o Bruno não tem foto das máquinas dos tios.
- **Escopo enxuto:** só o castelo de impressão, ou seja, 3 cilindros (chapa, blanqueta, impressão) e cerca de 6 rolos de tinta e molha, mais a folha passando. **Sem vídeo e sem som por enquanto.** No máximo 2 rodadas de revisão visual.
- Orçamento estimado (estimativa, não medido): 150 a 300 mil tokens do Claude usando o agy.
- **Números reais** (folheto Heidelberg e Rosmini):
  - Sistema de tintagem com 16 rolos, 4 deles rolos dadores, com diâmetros de 49, 45, 47 e 51 mm.
  - Molha com 6 rolos; o rolo dador da molha tem 55 mm.
  - Chapa de 400×511 mm, blanqueta de 445×521 mm, tinteiro com 16 zonas, relação de armazenamento de tinta 1:6,5.
  - Chapa e blanqueta trabalham bearer contra bearer. O cilindro de impressão é anodizado.
  - Formato de folha de 52 cm (máx. 360×520 mm; confirme no PDF).
- **Referências:**
  - https://print-machines.net/pdf/Heidelberg_Printmaster_GTO52_series_ENG.pdf (corte numerado dos sistemas de tinta e molha)
  - https://bfs-pressroomsolutions.co.uk/product/heidelberg/heidelberg-gto52/ (esquema de rolos)
  - https://www.rosminigraphics.com/press-rollers/heidelberg-1/gto-52-conventional-detail (medidas de cada rolo)
  - https://www.printerspartsstore.com/rollersforheidelberggto52.aspx (diagrama)
- **Divisão de trabalho combinada:**
  - Claude escreve a especificação: medidas, câmera, o que abre em cada botão e a cor de destaque, que é o vermelho #E31E24 de `DESIGN.md` §3.
  - agy faz `kin.js` (matemática pura, com teste) e o rascunho da geometria `press.js` no padrão de `sims/v8-shared`, e depois `console.js`. Use `agy-delegate --tier flash --dir ~/.claude/skills/teardown`.
  - Claude faz a revisão visual comparando os prints com as referências, o tour e o texto final.
- **Saída:** a máquina vai numa pasta própria, por exemplo `scrollcraft/builds/prensa/` na worktree v2. O build sai com `node "$SKILL_DIR/sims/build.mjs" ./pasta`. **Não integrar ao site** sem o Bruno aprovar.
- **Uso pensado:** um bloco "Como fazemos" na v2, carregado só quando a pessoa chega nele, e o vídeo do tour para o Instagram e anúncios mais tarde.

## Outras pendências da v2 (não fazer agora sem pedir)
- Trocar o efeito CMY desencontrado de `scrollcraft/builds/center-registro/` por **retícula**: a foto começa em pontos de impressão e fica nítida com a rolagem, e o título vira "Ponto por ponto. / Uma sacola.". O Bruno achou o CMY parecido com "TV com problema". Ele ainda não aprovou a retícula explicitamente; estava agendada para 04/11 às 21h.
- Commitar o trabalho da v2 só na branch logo-3d: `css/layout.css`, as correções de docs (DESIGN.md, specs/logo-3d.md, a spec de 25/10), `.graphifyignore` e talvez `scrollcraft/`.
- Deploy na Vercel como projeto separado ligado à branch v2, com `.vercelignore` para `scrollcraft/`. A CLI é melhor (`npx vercel login`). Falta decidir com o Bruno: público ou com senha.
- Renomear a branch para `brunooli2612/site-v2` (local e remota). Foi perguntado e o Bruno não respondeu.
- Com os tios: confirmar o "+3.800 marcas" (número inventado) e pedir o vetor original da logo e fotos reais dos produtos.
- Créditos Higgsfield: estão na conta Composio `higgsfield_mcp_witchy-atule`, com saldo de cerca de 8,5.

## Progresso 04/11/2026 (2ª sessão)
- Passo 1 ok: build do v8-live funciona, esbuild ok, ffmpeg e python no PATH.
- Spec em `scrollcraft/builds/prensa/SPEC.md`. **Premissa [E]:** os cilindros têm 150 mm de diâmetro; não achei o dado real.
- `kin.js` + `kin.test.mjs` (agy, revisados pelo Claude): 14/14 testes. O Claude corrigiu o enrolamento da folha (pega a 75° e solta a 180°), a pinça, o `printed` e incluiu a fase da imagem (`IMAGE`), com teste de registro.
- `press.js`, `stage.js`, `main.js` (agy): build `prensa.html` com 791 KB. Na rodada 1 de revisão visual o Claude ajustou a lateral (calculada pela kin; a do operador virou vidro), os bearers de aço, a câmera `lado` (d 2.15), a câmera `folha` (agora do lado da entrega) e a guia de entrega (trilhos no verso da folha).
- Prints: `capture.mjs teardown-out/dist/prensa.html --config <json {"cam","th"}> --still 0`.
- Falta: `console.js` (agy), `live.js`/`film.js` com o tour da spec §8 e a rodada 2 de revisão. Pendência de texto: a folha diz "OFFSET LITHOGRAPHY · HEIDELBERG GTO 52"; trocar por texto em PT da Center.
- 05/11: `console.js`, `film.js`, `live.js` (agy) + rodada 2 do Claude: painéis mais estreitos, câmera nova `cilindros` para Chapa/Blanqueta, textos do agy trocados por PT ("Tour automático · clique para assumir", "Escolha uma parte embaixo…"). Build 803 KB, 14/14. `main.still.js` = harness antigo de prints. Shim de movimento: `testMotionShim()` em live.js (`?teste`); **remover antes de produção**.
- Rodadas de revisão esgotadas (2/2). Ainda abertos: o texto da folha ("OFFSET LITHOGRAPHY · HEIDELBERG GTO 52"), a imagem da chapa em still cai em ângulo aleatório (ao vivo gira), uma barra de travamento na frente da vista folha e o beat Impressão, que não está no tour.
- 05/11 desempenho (live.js): limite de 30 fps; nada é desenhado com a máquina pausada (medido: 0 draw calls em 2 s) nem com o canvas fora da tela; começa em qualidade máxima no computador (Bruno testou: ventoinha ok); cai um nível se ficar abaixo de 26 fps. A ventoinha do Bruno disparava com a versão anterior (60 fps, GTAO, 4x MSAA, nunca parava).
- 05/11, prensa no site (spec `scrollcraft/builds/prensa/SPEC-site.md`): o agy fez `prensa-site/` (site.js), `js/prensa-embed.js`, `css/prensa.css`, a seção `#como-fazemos` no index.html, `assets/prensa/{prensa-site.html 789 KB, poster.webp}` e `tests/prensa.test.js` (npm test 13/13). O Claude corrigiu a largura das legendas, o título atrás do menu (agora some em p 0,08–0,13), a textura nula da folha final (desenhava preto), o fallback por desempenho (agora só ignora pausas e precisa de 3 janelas ruins), a orientação da folha (vira no eixo x), o GTAO vazando sobre a folha e os textos em inglês na folha.
- Rebuild: `node "$SKILL_DIR/sims/build.mjs" ./scrollcraft/builds/prensa-site && cp teardown-out/dist/prensa-site.html assets/prensa/`. A pasta `teardown-out/` na raiz é saída do build: não commitar (pôr no .gitignore e no .vercelignore).
- Nada foi commitado.
- 05/11, final novo (ideia do Bruno): a prensa imprime a planificação da sacola, ela pousa na bancada e o vídeo dobra a sacola. Arte `assets/prensa/folha-sacola.webp`, retificada do 1º quadro de `center-registro/assets/00.mp4` com o cordão removido; cantos do quadro 0 (1890×1080): TL 340,406 · TR 1749,502 · BR 1808,947 · BL 71,808. Folha do job = 520 × 226 mm (`P.sheetLength` ajustado no site.js). `press.js` ganhou `opts.art` (chapa em tom de gravação, blanqueta espelhada colorida, folha). Orçamento de rolagem em `prensa-embed.js` e `site.js`: tour 0–0,66, voo 0,66–0,72, pouso em DOM com matrix3d 0,72–0,80, dobra 0,80–0,96. Vídeos copiados para `assets/prensa/dobra(-m).mp4` (4,1 MB / 1,6 MB, baixados como blob só perto do bloco). Legenda 7: "Depois vêm o corte, a dobra e a alça. Do papel à sacola." npm test 13/13.
- Aberto: no celular a bancada aparece cortada nas laterais (o vídeo usa object-fit cover). Entre 0,735 e 0,765 a folha passa sobre um fundo liso antes de a bancada aparecer. Pendente olhar o https://github.com/21st-dev/magic-mcp.
- 05/11: rolagem suavizada (embed: amortecimento de 0,14 s, saltos >0,2 vão direto; iframe a 60 fps enquanto rola). Medido: com a roda em passos de 100 px, o maior passo de p caiu de ~0,024 para 0,0064. Gancho de gravação `window.__prensaFrame(p, t)` + mensagem `prensa:clock`. Reels da Center 1080×1920: `scratchpad/reel-center.mp4` (17,6 s, 8,9 MB), gravado por `~/.claude/skills/teardown/_reel.tmp.mjs` (já apagado; o script está no histórico desta sessão). Falta: o corte do portfólio do Bruno (ele precisa mandar nome/@) e o ok dos tios para postar.
