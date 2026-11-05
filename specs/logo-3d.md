# Especificação Técnica — Símbolo Escultural 3D (`logo-3d`)

Referências de contexto:
- `DESIGN.md` — Seção 5, item 4 (*Elemento Escultural 3D*).
- `assets/images/simbolo-center.svg` (`viewBox="0 0 100 100"`): símbolo redesenhado a partir de `assets/simbolo-referencia-whatsapp.jpg`, aprovado pelo Bruno em 31/10/2026. É aproximação, não o vetor original da gráfica.
- `assets/images/logo-center.svg` **não** é a marca oficial (placeholder simplificado). Não usar.

---

## 1. Alvo

Primeira entrega isolada (sem integração na Hero Section de `index.html` nesta etapa):
- `logo-3d.html`: página de demonstração com o palco do canvas e import map de `three@0.160.0` (jsdelivr).
- `js/logo-3d.js`: módulo ES com cena, geometria, luz, animação e fallback.

---

## 2. Mudança

### Geometria (coordenadas de `simbolo-center.svg`, 100 unidades do SVG = 2 unidades da cena)
Peças extrudadas, de trás para frente:
1. **Placa base ciano** `#00AEEF`: `rect 0,0 100x100 rx=16`, chanfrada, com o furo central.
2. **Amarelo** `#FCD125` e **verde** `#00A651`: lâminas finas sobre a placa, lado esquerdo (`x 0..32`), com a curva do SVG entre elas.
3. **Moldura interna em relevo** (a "fita" de cima): azul-marinho `#2E3A94` em cima (`y < 39`) e vermelho `#E0333F` → magenta `#D12A99` embaixo e à direita (mesmo degradê do SVG, via textura de canvas).
4. **Sombra** `#212228`: faixa acima do furo, num degrau mais baixo que a moldura.
5. **Furo** `rect 32,29.5 58x60 rx=9`: vazado em todas as peças, com filete claro translúcido na borda.

### Materiais e luz
- `MeshPhysicalMaterial` com clearcoat moderado (`0.6`) e `envMapIntensity` reduzido para não desbotar as cores.
- `RoomEnvironment` via `PMREMGenerator` + uma `DirectionalLight`.
- Sem tone mapping (`NoToneMapping`), para manter as cores da marca.

### Movimento
- Flutuação senoidal suave e rotação seguindo o ponteiro com `lerp`, limitada a `±0.35 rad`.
- `pixelRatio` máximo `2`.

---

## 3. Restrições

- Só o símbolo, sem o texto "CENTER gráfica".
- Cores exatas da seção 2.
- Sem WebGL: fallback para `<img src="assets/images/simbolo-center.svg">`.
- `prefers-reduced-motion: reduce`: pose estática levemente angulada, sem flutuação nem parallax.
- Não modificar `index.html`, `css/` nem outros arquivos de `js/`.

---

## 4. Ownership

- `logo-3d.html`
- `js/logo-3d.js`

---

## 5. Aceitação

1. `node server.js` com `PORT=3100`: `http://localhost:3100/logo-3d.html` renderiza o símbolo sem erros do módulo no console (o 404 de `/favicon.ico` é do servidor, não do módulo).
2. Screenshots com e sem `prefers-reduced-motion`: peças, cores e furo conferem com `simbolo-center.svg`.

## Pendências

- ~~Integração na hero~~: feita em 31/10/2026 (`#logo-3d-stage` em `index.html`, coluna direita, no lugar do carrossel). As restrições das seções acima valiam para a primeira entrega isolada.
- Fallback sem WebGL não testado no navegador.
- Trocar pelo vetor original da gráfica se a Simone ou o Itamar tiverem o arquivo.
