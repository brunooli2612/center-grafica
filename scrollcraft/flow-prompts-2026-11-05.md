# Prompts do Google Flow: bancada vazia e dobra vertical (05/11/2026)

Referências (copiadas do vídeo atual, 1890×1080):
- `ref-folha-bancada.png` = quadro 0 de `assets/prensa/dobra.mp4`
- `ref-sacola-pronta.png` = último quadro

Pasta: `C:\Users\Bruno\AppData\Local\Temp\claude\475c8a938213a569\9e15cfe4-86dc-4b7a-a646-22ab462c96f9\scratchpad\flow-refs\`

Prompts em inglês (os modelos seguem melhor). Confirmar o custo na tela antes de gerar.

---

## (1) Bancada vazia — Nano Banana Pro, 16:9, x1

Referência: `ref-folha-bancada.png`.

```
Edit this exact image. Remove ONLY the large printed paper sheet and the two red rope cords from the workbench.
Keep EXACTLY unchanged, strict adherence to the reference:
1. camera position, angle, lens, framing and image size (pixel-aligned with the original)
2. the wooden workbench: outline, legs, square dog holes, wood grain, scratches and wear
3. the cream wall and the window-light shadows on it
4. the warm soft morning light and the color grading
Where the sheet and cords were, show bare wood tabletop that continues the existing grain, plank seams and rows of square dog holes naturally, with soft, even shading.
Do NOT add paper, objects, text, new shadows or reflections. Do NOT crop, zoom or re-light. Photorealistic.
```

Conferir: a bancada precisa casar com o original (o site sobrepõe a imagem). Me manda o arquivo que eu comparo pixel a pixel e já encaixo no pouso.

---

## (2) Dobra vertical 9:16 — 3 passos

A folha é larga (2,3:1). Num quadro em pé ela fica pequena, então ela vai deitada no sentido do comprimento, apontando para o fundo, com a câmera um pouco mais alta. Em perspectiva, ela cabe no 9:16.

### 2a. Primeiro quadro — Nano Banana Pro, 9:16, x1

Referência: `ref-folha-bancada.png`.

```
Vertical 9:16 photo, same scene as the reference image: the same wooden workbench with square dog holes, cream wall, warm soft morning window light with window shadows on the wall, same color grading. The same printed flat paper-bag dieline sheet (identical print: red, orange and cream rounded shapes, white margins, crop marks and color bars) lies flat on the bench, rotated so its long side runs away from the camera into the depth of the frame. Keep the print design, colors and proportions of the sheet EXACTLY as the reference; do not redesign it. The sheet is long and narrow: its real length is 2.3 times its width (520 x 226 mm), exactly like in the reference. Do NOT shorten, squash or crop the sheet: it fits the vertical frame only through natural perspective foreshortening. The two red rope cords lie beside it. Camera low, about 35 degrees above the tabletop, 35mm lens, looking along the length of the sheet so it recedes into the distance; the whole sheet visible in the lower two thirds of the frame, wall in the upper third. Photorealistic product photo, no people, no text added.
```

### 2b. Último quadro — Nano Banana Pro, 9:16, x1

Referências: o resultado aprovado do 2a (1) e `ref-sacola-pronta.png` (2).

```
Vertical 9:16 photo. Keep exactly the scene, camera angle, lens, framing and light of image 1. The paper sheet and cords are gone; in their place, standing upright in the center of the bench, is the finished paper shopping bag from image 2, with the identical print (red, orange and cream rounded shapes) and the two red rope handles through the metal eyelets, facing the camera at a slight three-quarter angle. Keep the bag's print design, colors, proportions and materials EXACTLY as image 2; do not redesign it. Soft contact shadow under the bag. Photorealistic product photo, no people, no text.
```

### 2c. Vídeo — Veo 3.1 Fast, primeiro e último quadro, 9:16, 8 s (~20 créditos)

Primeiro quadro: 2a. Último quadro: 2b.

```
Locked-off static camera, no camera movement. On a wooden workbench, the printed flat paper-bag sheet folds itself into a finished shopping bag: it creases along the fold lines, the panels rise into a tube, the side gussets tuck in, the bottom folds closed, the bag stands upright, and the two red rope handles slide in through the eyelets. One smooth, continuous, satisfying motion, paper behaves like real paper. No hands, no people. Warm soft morning window light, cream wall, photorealistic product video. Sound: crisp paper creases and folds, quiet room.
```

Câmera parada é de propósito: o site controla o vídeo pela rolagem, e mover a câmera atrapalha o encaixe da folha.

Se a dobra sair torta ou mágica demais: gerar de novo com a mesma seed mudando só a ação, ou testar 6 s.

---

## Depois que gerar
Manda os arquivos (pode largar em `flow-refs\`). Eu confiro, recomprimo o vídeo com keyframe a cada 4–8 quadros, troco o `dobra-m.mp4` e recalculo os cantos da folha para o pouso no celular.
