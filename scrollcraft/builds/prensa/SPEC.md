# Prensa: castelo de impressão da Heidelberg GTO 52 (spec)

Teardown de uma unidade de impressão. Uma entrada (ângulo do cilindro de chapa), tudo o mais sai dela.
Sem vídeo, sem som nesta fase. Máx. 2 rodadas de revisão visual.

Legenda de origem dos números: **[D]** dado de folheto/fornecedor, **[E]** estimativa minha (trocar se aparecer dado).

## 1. Fontes
- Corte numerado: folheto Heidelberg Printmaster GTO 52, pág. 4 (`print-machines.net/pdf/Heidelberg_Printmaster_GTO52_series_ENG.pdf`). Unidade da direita (1ª cor) é a referência de layout.
- Rolos: Rosmini Graphics, GTO 52 Conventional.
- Undercut, chapa, blanqueta: ficha GTO52-1 (1983) via busca; fórum PrintPlanet (squeeze).

## 2. Números
| Grandeza | Valor | Origem |
|---|---|---|
| Folha máx. / mín. | 360 × 520 / 105 × 180 mm | [D] |
| Área máx. de impressão | 340 × 505 mm | [D] |
| Velocidade | 3.000 a 8.000 folhas/h | [D] |
| Chapa | 400 × 510 mm, até 0,15 mm, início de impressão a 35 mm da borda | [D] |
| Blanqueta | 445 × 520 mm, 1,9 mm | [D] |
| Undercut chapa / blanqueta | 0,03 / 3,0 mm | [D] |
| Squeeze chapa↔blanqueta | 0,10 a 0,15 mm | [D] fórum |
| Bearer contra bearer (chapa↔blanqueta) | sim | [D] |
| Cilindro de impressão anodizado; chapa cromado; blanqueta anticorrosão | sim | [D] |
| Diâmetro dos 3 cilindros (nominal, bearer) | **150 mm** (circ. 471 mm) | [E] cabe chapa 400 + pinça; no corte os 3 têm o mesmo tamanho |
| Tintagem | 16 rolos, 4 dadores (49/45/47/51 mm), 16 zonas, reserva 1:6,5 | [D] |
| Molha | 6 rolos, dador 55 mm, filme contínuo sem álcool | [D] |
| Rolo de bandeja da molha | 71 mm | [D] Rosmini (Alcolor pan) |
| Comprimento de face dos rolos | 513 a 519 mm | [D] Rosmini |
| Distribuidor oscilante | 70 mm, curso axial ±8 mm, 1 ciclo a cada 4 voltas do cilindro | [E] |
| Rolo tinteiro | 60 mm, gira a 1/20 da superfície (passo lento) | [E] |
| Tomador (ductor) | 40 mm, 1 batida a cada 2 voltas | [E] |
| Largura do cilindro | 520 mm de face + bearers de 15 mm cada lado | [E] |

Uma folha por volta do cilindro. 8.000 folhas/h → 133,3 rpm → superfície 1,05 m/s. Conferir à mão no teste.

## 3. Escopo da geometria (7 rolos + 3 cilindros + folha)
Espaço em mm. Eixo dos cilindros = z (face do operador = +z). y para cima. x para o alimentador (+x = direita, de onde a folha vem).

Cilindros, todos D = 150, distância entre centros = D (bearer contra bearer):
- **Impressão (IMP):** centro (0, 0).
- **Blanqueta (BLA):** IMP + 150·(cos 117°, sin 117°).
- **Chapa (CHA):** BLA + 150·(cos 70°, sin 70°).
(ângulos medidos no corte da pág. 4; pequena correção é livre se algo colidir, sempre pelo número.)

Sentidos (vista de +z): IMP anti-horário (topo vai para −x, puxando a folha que vem da direita), BLA horário, CHA anti-horário. Na CHA, depois do contato com a blanqueta a superfície passa primeiro pela molha (lado direito), depois pela tinta (topo). Bate com o corte.

Rolos, posicionados por tangência (a `kin.js` calcula; nenhum centro digitado à mão):
| id | Nome na tela | D | Encosta em | Ângulo de contato |
|---|---|---|---|---|
| MF | Rolo dador da molha | 55 | CHA | 15° no centro da CHA |
| MB | Rolo da bandeja | 71 | MF | −25° no centro do MF; meio mergulhado na bandeja |
| T1 | 1º dador de tinta | 49 | CHA | 62° |
| T2 | 2º dador de tinta | 45 | CHA | 100° |
| DI | Distribuidor oscilante | 70 | T1 e T2 | interseção de círculos, lado de fora |
| TT | Rolo tinteiro | 60 | (fixo, sob a lâmina do tinteiro) | centro = DI + 111·(cos 125°, sin 125°): R_DI + R_TT + 2·R_DU + 6 mm de curso |
| DU | Tomador (ductor) | 40 | alterna TT ↔ DI | anda na reta entre os centros (6 mm de curso), braço com pino acima da reta só visual |

Rotação: cada rolo de contato gira com velocidade de superfície igual ao vizinho que o move, sentido oposto. ω_rolo = ω_CHA · R_CHA / R_rolo (MB e TT não: MB anda a 40 % da superfície da CHA [E], TT no passo lento). DU: quando encostado no DI gira com ele; no TT gira lento com o TT; no trajeto, desacelera linearmente.

Extras de geometria (baratos, dão leitura):
- Bearers como anéis escuros nas pontas de CHA e BLA, encostando.
- Gap (canal da pinça) em cada cilindro: 30° de rasgo raso [E]. As pinças do IMP abrem/fecham.
- Chapa: casca fina sobre a CHA com a imagem (textura de canvas, texto "CENTER GRÁFICA" + bloco de retícula) **legível**. Blanqueta: a mesma imagem **espelhada**. Folha: imagem **legível** aparecendo só na parte que já passou do contato BLA↔IMP.
- Tinteiro: cunha com 16 parafusos de zona [D] em cima do TT. Bandeja da molha: calha embaixo do MB com plano de água.
- Laterais da máquina: duas chapas grossas cinza com furos nos eixos. Modo corte = lateral do operador some.
- Mesa de entrada (direita, inclinada como no corte) e mesa de saída (esquerda, plana).

Folha: 360 (sentido de rolagem) × 520 (largura), espessura visual 0,5 mm. Entra pela mesa da direita, a pinça do IMP pega a 75° (topo), ela enrola 105° no IMP passando pelo contato com a BLA (117°) e solta a 180° (lado esquerdo), descendo para a entrega (corrente de pinças simplificada a uma guia). Margem de pinça 10 mm [E]. Fase da imagem em chapa/blanqueta/folha sai de `IMAGE` na kin.js (registro testado). Posição da folha s(θ) = R_IMP · θ (rad) a partir da pega; trecho reto antes/depois, enrolado no meio (curva por amostras, não malha deformada a mão). Uma folha nova a cada volta.

## 4. kin.js (matemática pura, sem three.js)
Entrada: `th` = ângulo acumulado da CHA em graus (pode passar de 360; contagem de folhas sai dele).
Exporta no mínimo:
- `P` (bloco de parâmetros acima, um lugar só), `CYL`, `ROLLERS` (centros calculados por tangência, raio, sentido, razão).
- `angleOf(id, th)` → ângulo de cada cilindro/rolo.
- `oscZ(th)` → deslocamento axial do DI.
- `ductor(th)` → {pos 0..1 entre TT e DI, contato: 'TT'|'DI'|null, ângulo do braço}.
- `sheet(th)` → {índice da folha, s em mm, fase: 'entrada'|'enrolada'|'saida', impresso 0..1}.
- `gripper(th)` → abertura 0..1 da pinça do IMP.
- `readouts(th, rpm)` → folhas/h, superfície m/s, rpm de cada rolo, folhas contadas, squeeze.
Testes (`kin.test.mjs`, `node --test`): distâncias de centro = soma dos raios (±0,01 mm) para todo par em contato; nenhum par fora de contato se sobrepõe; superfícies iguais em cada contato; 133,33 rpm ↔ 8.000 folhas/h ↔ 1,047 m/s; sentidos alternados; DU nunca toca TT e DI ao mesmo tempo; `sheet` contínua (sem salto de s dentro de uma volta).

## 5. Câmeras (5 vistas)
| id | Nome | O que mostra |
|---|---|---|
| hero | Máquina | 3/4 do lado do operador, yaw 28°, pitch 14°, castelo ocupa 65 % |
| lado | Corte | De frente para o eixo (+z), como o folheto. Lateral some. Melhor vista para entender o caminho |
| tinta | Tinta | Perto do tinteiro → DI → T1/T2 → chapa, 3/4 alto |
| molha | Molha | Perto da bandeja → MB → MF → chapa |
| folha | Folha | Baixo, no contato BLA↔IMP, a imagem saindo na folha |

## 6. Botões (o que abre em cada um)
Um botão por subsistema. Ao clicar: o subsistema fica em cor e acende o vermelho; o resto vira vidro (opacidade 0,15); a câmera vai para a vista do subsistema; o painel mostra os números dele.
| Botão | Isola | Câmera | Painel |
|---|---|---|---|
| Tinta | TT, DU, DI, T1, T2, tinteiro | tinta | 16 zonas (barras), reserva 1:6,5, batida do tomador, oscilação ±8 mm |
| Molha | bandeja, MB, MF | molha | dador 55 mm, filme contínuo, sem álcool, MB a 40 % |
| Chapa | CHA + chapa | lado | 400 × 510 mm, imagem legível, undercut 0,03 mm, cromada |
| Blanqueta | BLA + blanqueta | lado | imagem espelhada, 1,9 mm, undercut 3,0 mm, squeeze 0,10–0,15 mm |
| Impressão | IMP + pinças | folha | anodizado, pinça abre/fecha, 1 folha/volta |
| Folha | folha + mesas | folha | posição s, folhas contadas, formato 360 × 520 |

Também: corte (lateral on/off), setas de rotação, legendas com linha guia, slider de velocidade 3.000–8.000 folhas/h, pausa.

## 7. Visual
- Estúdio claro: fundo papel `oklch(98.5% 0.004 85)` / `#FAF9F6`, tinta `#111111`.
- **Acento único `#E31E24`** (DESIGN.md §3): só no que está trabalhando agora (subsistema ativo; no tour, a tinta que passa pela chapa → blanqueta → folha).
- Metais: cromo da CHA roughness 0,45, envMapIntensity 0,5; blanqueta borracha azul-escura fosca; IMP anodizado cinza-azulado; rolos de tinta borracha escura com filme de tinta (preto); rolos cromados (DI) claros com contorno.
- Rótulos em português, ≥ 34 px a 1080. Fonte: Plus Jakarta Sans se embutir couber no limite de 1 MB; senão system-ui.
- Bloom baixo (emissivo < 1). Quality tiers do exemplo mantidos.
- Teste no Windows do Bruno: shim de teste para `prefers-reduced-motion` só na página de teste, `?reduzir` restaura. Nunca em produção.

## 8. Tour automático (~42 s, laço)
| t (s) | Ação |
|---|---|
| 0 | hero, rodando a 6.000 folhas/h, quadro 0 já mostra a máquina inteira |
| 4 | lado: lateral some, setas de rotação |
| 9 | Molha: água chega na chapa primeiro |
| 15 | Tinta: tomador bate, distribuidor oscila, dadores entintam |
| 22 | Chapa: imagem legível |
| 27 | Blanqueta: a mesma imagem espelhada |
| 32 | Folha: imagem sai legível na folha |
| 38 | hero com tudo, legendas |
| 42 | volta ao 0 |
Qualquer clique/arrasto/rolagem/tecla entrega o controle; 25 s parado devolve.

## 9. Saída
- Pasta: `scrollcraft/builds/prensa/` (`main.js`, `kin.js`, `press.js`, `stage.js`, `console.js`, `film.js`, `live.js`, `kin.test.mjs`).
- Build: `node "$SKILL_DIR/sims/build.mjs" ./scrollcraft/builds/prensa` → HTML offline < 1 MB.
- **Não integrar ao site sem aprovação do Bruno.**

## 10. Divisão
- Claude: esta spec, revisão visual por prints vs pág. 4, tour, textos finais.
- agy (flash): `kin.js` + teste → `press.js` (padrão `sims/v8-shared`) → `console.js`. Claude roda os testes e o build ele mesmo.
