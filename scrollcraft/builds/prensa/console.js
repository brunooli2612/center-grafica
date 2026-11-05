// Heidelberg GTO 52 print unit console: fixed 1600x900 CSS overlay, panels, readouts,
// subsystem isolation, camera presets, toggles, leader lines and operator pointer.
import {
  P,
  CYL,
  ROLLERS,
  ductor,
  oscZ,
  sheet,
  gripper,
  readouts,
} from './kin.js';

export const C = {
  ink: '#111111',
  mute: '#6b6f75',
  line: '#e3e1dc',
  panel: 'rgba(250,249,246,.94)',
  red: '#E31E24',
};

export const CAMS_LIST = [
  {id: 'hero', label: 'Máquina'},
  {id: 'lado', label: 'Corte'},
  {id: 'tinta', label: 'Tinta'},
  {id: 'molha', label: 'Molha'},
  {id: 'folha', label: 'Folha'},
];

export const SUBSYSTEMS = [
  {id: 'tinta', label: 'Tinta', cam: 'tinta'},
  {id: 'molha', label: 'Molha', cam: 'molha'},
  {id: 'chapa', label: 'Chapa', cam: 'cilindros'},
  {id: 'blanqueta', label: 'Blanqueta', cam: 'cilindros'},
  {id: 'impressao', label: 'Impressão', cam: 'folha'},
  {id: 'folha', label: 'Folha', cam: 'folha'},
];

export const TOGGLES = [
  {id: 'corte', label: 'Corte'},
  {id: 'setas', label: 'Setas'},
  {id: 'legendas', label: 'Legendas'},
];

const CSS = `
#app {
  font-family: "Plus Jakarta Sans", system-ui, sans-serif;
  color: ${C.ink};
  -webkit-font-smoothing: antialiased;
  font-variant-numeric: tabular-nums;
  position: absolute;
  inset: 0;
  width: 1600px;
  height: 900px;
  overflow: hidden;
  user-select: none;
}
.ui-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.panel {
  position: absolute;
  background: ${C.panel};
  border: 1px solid ${C.line};
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(17,17,17,0.05);
  pointer-events: auto;
  box-sizing: border-box;
}
.btn {
  font-family: "Plus Jakarta Sans", system-ui, sans-serif;
  font-size: 20px;
  font-weight: 600;
  border: 1px solid ${C.line};
  background: #ffffff;
  color: ${C.ink};
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  box-sizing: border-box;
}
.btn:hover {
  filter: brightness(0.97);
}
.btn:active {
  transform: scale(0.98);
}
.btn.active-sub {
  background: ${C.red} !important;
  color: #ffffff !important;
  border-color: ${C.red} !important;
}
.btn.active-toggle {
  background: ${C.ink} !important;
  color: #ffffff !important;
  border-color: ${C.ink} !important;
}
.text-mute {
  color: ${C.mute};
}
.cur {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 99;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.35));
  pointer-events: none;
  transform-origin: 4px 3px;
  transition: transform 0.08s ease;
}
.ring {
  position: absolute;
  width: 44px;
  height: 44px;
  margin: -22px 0 0 -22px;
  border-radius: 50%;
  border: 2px solid ${C.red};
  opacity: 0;
  z-index: 98;
  pointer-events: none;
  transform-origin: center center;
}
.tourchip {
  position: absolute;
  left: 800px;
  top: 45px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 20px;
  border: 1px solid ${C.line};
  border-radius: 22px;
  background: rgba(250,249,246,0.96);
  color: ${C.ink};
  font-size: 20px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 4px 14px rgba(17,17,17,0.06);
}
.tourchip i {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${C.red};
}
.tourchip.on i {
  animation: pulse-dot 1.2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.4; }
  100% { transform: scale(1); opacity: 1; }
}
.callout-box {
  position: absolute;
  font-size: 20px;
  font-weight: 700;
  color: ${C.ink};
  background: rgba(250,249,246,0.95);
  border: 1px solid ${C.line};
  border-radius: 6px;
  padding: 6px 14px;
  box-shadow: 0 3px 10px rgba(17,17,17,0.06);
  pointer-events: none;
  white-space: nowrap;
}
.callout-box.active-callout {
  color: ${C.red} !important;
  border-color: ${C.red} !important;
}
.mini-track {
  width: 100%;
  height: 14px;
  background: #e6e7e9;
  border-radius: 7px;
  position: relative;
  overflow: hidden;
  border: 1px solid ${C.line};
}
.mini-fill {
  height: 100%;
  background: ${C.red};
  border-radius: 7px;
  width: 0%;
}
.slider-input {
  width: 100%;
  height: 28px;
  accent-color: ${C.ink};
  cursor: pointer;
}
`;

export function createConsole(app) {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.className = 'ui-layer';
  app.appendChild(root);

  const el = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html.trim();
    return div.firstElementChild;
  };

  const btnCam = {};
  const btnSub = {};
  const btnToggle = {};
  const btn = {};

  // ------------------------------------------------------------ 1. Top-Left Panel (Title & Speed)
  const pnlTitle = el(`
    <div class="panel" style="left: 45px; top: 45px; width: 440px; padding: 22px 24px;">
      <div style="font-size: 26px; font-weight: 800; letter-spacing: -0.3px; color: ${C.ink}; line-height: 1.2;">
        Por dentro de uma offset
      </div>
      <div style="font-size: 20px; font-weight: 500; color: ${C.mute}; margin-top: 4px; line-height: 1.3;">
        Castelo de impressão · Heidelberg GTO 52
      </div>
      <div style="height: 1px; background: ${C.line}; margin: 16px 0 14px 0;"></div>
      <div id="readout-sph" style="font-size: 44px; white-space: nowrap; font-weight: 800; letter-spacing: -1.5px; color: ${C.ink}; line-height: 1;">
        8.000 folhas/h
      </div>
      <div id="readout-rpm-surface" style="font-size: 20px; font-weight: 500; color: ${C.mute}; margin-top: 10px; line-height: 1.3;">
        133 rpm · 1,05 m/s na superfície
      </div>
      <div id="readout-sheets" style="font-size: 20px; font-weight: 500; color: ${C.mute}; margin-top: 6px; line-height: 1.3;">
        Folhas impressas: 0
      </div>
    </div>
  `);
  root.appendChild(pnlTitle);

  const readoutSph = pnlTitle.querySelector('#readout-sph');
  const readoutRpmSurface = pnlTitle.querySelector('#readout-rpm-surface');
  const readoutSheets = pnlTitle.querySelector('#readout-sheets');

  // ------------------------------------------------------------ 2. Transport Panel (Pause & Speed slider)
  const pnlTransport = el(`
    <div class="panel" style="left: 45px; top: 300px; width: 440px; padding: 18px 24px;">
      <button class="btn" id="btn-pause" style="width: 100%; height: 48px; font-size: 20px; font-weight: 700;">
        Pausar
      </button>
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 16px;">
        <span style="font-size: 20px; font-weight: 600; color: ${C.ink};">Velocidade</span>
        <span id="speed-label" style="font-size: 20px; font-weight: 600; color: ${C.ink};">6.000 folhas/h</span>
      </div>
      <div style="margin-top: 8px;">
        <input type="range" class="slider-input" id="slider-speed" min="${P.speedMinSph}" max="${P.speedMaxSph}" step="100" value="6000">
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: 500; color: ${C.mute}; margin-top: 4px;">
        <span>3.000</span>
        <span>8.000</span>
      </div>
    </div>
  `);
  root.appendChild(pnlTransport);

  btn.pause = pnlTransport.querySelector('#btn-pause');
  const sliderSpeed = pnlTransport.querySelector('#slider-speed');
  const speedLabel = pnlTransport.querySelector('#speed-label');

  // ------------------------------------------------------------ 3. Top-Right Panel (Views & Toggles)
  const pnlRight = el(`
    <div class="panel" style="right: 45px; top: 45px; width: 400px; padding: 18px 20px;">
      <div style="font-size: 20px; font-weight: 700; color: ${C.mute}; margin-bottom: 8px;">Vistas</div>
      <div style="display: flex; gap: 8px;">
        ${CAMS_LIST.map((c) => `<button class="btn" data-cam="${c.id}" style="flex: 1; height: 44px; padding: 0 4px;">${c.label}</button>`).join('')}
      </div>
      <div style="height: 1px; background: ${C.line}; margin: 14px 0 12px 0;"></div>
      <div style="font-size: 20px; font-weight: 700; color: ${C.mute}; margin-bottom: 8px;">Opções</div>
      <div style="display: flex; gap: 10px;">
        ${TOGGLES.map((tg) => `<button class="btn" data-toggle="${tg.id}" style="flex: 1; height: 44px;">${tg.label}</button>`).join('')}
      </div>
    </div>
  `);
  root.appendChild(pnlRight);

  pnlRight.querySelectorAll('[data-cam]').forEach((b) => {
    btnCam[b.dataset.cam] = b;
    btn['cam_' + b.dataset.cam] = b;
  });
  pnlRight.querySelectorAll('[data-toggle]').forEach((b) => {
    btnToggle[b.dataset.toggle] = b;
    btn[b.dataset.toggle] = b;
  });

  // ------------------------------------------------------------ 4. Subsystem Details Side Panel
  const pnlSubDetail = el(`
    <div class="panel" style="right: 45px; top: 250px; width: 400px; padding: 22px 24px;">
      <div id="sub-title" style="font-size: 24px; font-weight: 800; color: ${C.ink}; line-height: 1.2;">
        Subsistema
      </div>
      <div style="height: 1px; background: ${C.line}; margin: 14px 0 16px 0;"></div>
      <div id="sub-lines" style="display: flex; flex-direction: column; gap: 10px; font-size: 20px; line-height: 1.4;">
      </div>
      <div id="sub-live" style="margin-top: 18px; border-top: 1px solid ${C.line}; padding-top: 16px;">
      </div>
    </div>
  `);
  root.appendChild(pnlSubDetail);

  const subTitle = pnlSubDetail.querySelector('#sub-title');
  const subLines = pnlSubDetail.querySelector('#sub-lines');
  const subLive = pnlSubDetail.querySelector('#sub-live');

  // ------------------------------------------------------------ 5. Subsystem Buttons Row (Bottom)
  const pnlSubsystems = el(`
    <div class="panel" style="left: 50%; bottom: 45px; transform: translateX(-50%); display: flex; gap: 12px; padding: 10px 14px; border-radius: 10px;">
      ${SUBSYSTEMS.map((s) => `<button class="btn" data-sub="${s.id}" style="min-width: 140px; height: 50px; padding: 0 16px;">${s.label}</button>`).join('')}
    </div>
  `);
  root.appendChild(pnlSubsystems);

  pnlSubsystems.querySelectorAll('[data-sub]').forEach((b) => {
    btnSub[b.dataset.sub] = b;
    btn[b.dataset.sub] = b;
  });

  // ------------------------------------------------------------ 6. Auto Tour Chip
  const tourChip = el(`
    <div class="tourchip on">
      <i></i>
      <span>Tour automático · clique para assumir</span>
    </div>
  `);
  root.appendChild(tourChip);
  btn.tourChip = tourChip;

  // ------------------------------------------------------------ 7. SVG Overlays (Leader lines, Arrows)
  const svgOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgOverlay.setAttribute('style', 'position: absolute; inset: 0; width: 1600px; height: 900px; pointer-events: none; overflow: visible;');
  root.appendChild(svgOverlay);

  const calloutsGroup = document.createElement('div');
  calloutsGroup.style.position = 'absolute';
  calloutsGroup.style.inset = '0';
  calloutsGroup.style.pointerEvents = 'none';
  root.appendChild(calloutsGroup);

  // ------------------------------------------------------------ 8. Pointer & Click Ring
  const curRing = el(`<div class="ring"></div>`);
  root.appendChild(curRing);

  const curPtr = el(`
    <div class="cur">
      <svg width="30" height="30" viewBox="0 0 34 34">
        <path d="M4 3 L30 13.5 L17.5 17.5 L13.5 30 Z" fill="${C.ink}" stroke="#ffffff" stroke-width="2.2" stroke-linejoin="round"/>
      </svg>
    </div>
  `);
  root.appendChild(curPtr);

  // Button spots for cursor aiming
  const spots = {};
  const updateSpots = () => {
    const appRect = app.getBoundingClientRect();
    const scale = appRect.width / 1600 || 1;
    const register = (map, prefix = '') => {
      for (const [k, b] of Object.entries(map)) {
        if (!b) continue;
        const r = b.getBoundingClientRect();
        spots[prefix + k] = [
          (r.left - appRect.left) / scale + r.width / (2 * scale),
          (r.top - appRect.top) / scale + r.height / (2 * scale),
        ];
      }
    };
    register(btnCam, 'cam_');
    register(btnCam, '');
    register(btnSub, '');
    register(btnToggle, '');
    if (btn.pause) {
      const r = btn.pause.getBoundingClientRect();
      spots.pause = [(r.left - appRect.left) / scale + r.width / (2 * scale), (r.top - appRect.top) / scale + r.height / (2 * scale)];
    }
  };
  requestAnimationFrame(updateSpots);

  const pointer = (c) => {
    if (!c || c.x < 0) {
      curPtr.style.display = 'none';
      return;
    }
    curPtr.style.display = 'block';
    curPtr.style.transform = `translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px) scale(${c.press ? 0.88 : 1})`;
    curRing.style.left = `${c.ringX ?? c.x}px`;
    curRing.style.top = `${c.ringY ?? c.y}px`;
    curRing.style.opacity = String((c.ring ?? 0) * 0.9);
    curRing.style.transform = `scale(${(0.35 + 0.9 * (1 - (c.ring ?? 0))).toFixed(3)})`;
  };

  // Fixed callout label anchor coordinates on screen (safe perimeter, never covering parts)
  const CALLOUT_LAYOUT = {
    chapa: {name: 'Chapa', subId: 'chapa', lx: 680, ly: 110, w: 120},
    blanqueta: {name: 'Blanqueta', subId: 'blanqueta', lx: 510, ly: 500, w: 140},
    impressao: {name: 'Cilindro de impressão', subId: 'impressao', lx: 510, ly: 710, w: 250},
    tinteiro: {name: 'Tinteiro', subId: 'tinta', lx: 510, ly: 170, w: 130},
    molha: {name: 'Molha', subId: 'molha', lx: 980, ly: 140, w: 120},
    folha: {name: 'Folha', subId: 'folha', lx: 980, ly: 680, w: 120},
  };

  // Subsystem info lines (Portuguese EXACTLY per SPEC §6 / §2, sourced from P/readouts)
  const SUB_CONTENT = {
    tinta: {
      title: 'Tinta',
      lines: [
        '16 rolos no sistema real, 4 dadores',
        'Reserva de tinta 1:6,5',
        'Tinteiro com 16 zonas',
        `Tomador: 1 batida a cada ${P.ductorRevs} voltas`,
        `Distribuidor oscila ±${P.oscAmp} mm`,
      ],
    },
    molha: {
      title: 'Molha',
      lines: [
        'Água chega na chapa antes da tinta',
        `Dador da molha: ${P.mfD} mm`,
        'Filme contínuo, sem álcool',
        `Rolo da bandeja a ${Math.round(P.mbSurfaceRatio * 100)}% da velocidade`,
      ],
    },
    chapa: {
      title: 'Chapa',
      lines: [
        'Chapa 400 × 510 mm',
        'Imagem legível',
        'Cilindro cromado',
        `Undercut ${P.undercutChapa.toFixed(2).replace('.', ',')} mm`,
      ],
    },
    blanqueta: {
      title: 'Blanqueta',
      lines: [
        'A mesma imagem, espelhada',
        `Borracha de ${P.blanquetaThickness.toFixed(1).replace('.', ',')} mm`,
        `Undercut ${P.undercutBlanqueta.toFixed(1).replace('.', ',')} mm`,
        `Aperto de ${P.squeezeMin.toFixed(2).replace('.', ',')} a ${P.squeezeMax.toFixed(2).replace('.', ',')} mm`,
      ],
    },
    impressao: {
      title: 'Impressão',
      lines: [
        'Cilindro anodizado',
        `Pinça segura a folha por ${P.wrapDeg}°`,
        '1 folha por volta',
      ],
    },
    folha: {
      title: 'Folha',
      lines: [
        `Formato máximo ${P.sheetMax[0]} × ${P.sheetMax[1]} mm`,
        `Área de impressão ${P.printAreaMax[0]} × ${P.printAreaMax[1]} mm`,
      ],
    },
  };

  let activeSub = null;

  return {
    root,
    btn,
    btnCam,
    btnSub,
    btnToggle,
    spots,
    updateSpots,
    sliderSpeed,
    pointer,
    setSubsystem(subId) {
      activeSub = subId;
    },
    update(s) {
      const th = s.th ?? 0;
      const sph = s.sph ?? 6000;
      const rds = readouts(th, sph);

      // Top-left readouts
      readoutSph.textContent = `${Math.round(rds.sph).toLocaleString('pt-BR')} folhas/h`;
      readoutRpmSurface.textContent = `${Math.round(rds.rpm)} rpm · ${rds.surface.toFixed(2).replace('.', ',')} m/s na superfície`;
      readoutSheets.textContent = `Folhas impressas: ${rds.sheetsCounted}`;

      // Transport state
      btn.pause.textContent = s.paused ? 'Continuar' : 'Pausar';
      speedLabel.textContent = `${Math.round(sph).toLocaleString('pt-BR')} folhas/h`;
      if (document.activeElement !== sliderSpeed) {
        sliderSpeed.value = String(Math.round(sph));
      }

      // View buttons state (active: ink / white, NOT red)
      for (const c of CAMS_LIST) {
        const on = s.cam === c.id;
        const b = btnCam[c.id];
        if (b) {
          b.classList.toggle('active-toggle', on);
        }
      }

      // Toggles buttons state (active: ink / white, NOT red)
      if (btnToggle.corte) btnToggle.corte.classList.toggle('active-toggle', !!s.corte);
      if (btnToggle.setas) btnToggle.setas.classList.toggle('active-toggle', !!s.setas);
      if (btnToggle.legendas) btnToggle.legendas.classList.toggle('active-toggle', !!s.legendas);

      // Subsystem buttons state (active: ONE accent #E31E24)
      activeSub = s.subsystem ?? null;
      for (const sub of SUBSYSTEMS) {
        const on = activeSub === sub.id;
        const b = btnSub[sub.id];
        if (b) {
          b.classList.toggle('active-sub', on);
        }
      }

      // Side panel content
      if (activeSub && SUB_CONTENT[activeSub]) {
        const info = SUB_CONTENT[activeSub];
        subTitle.textContent = info.title;
        subLines.innerHTML = info.lines
          .map((ln) => `<div style="display: flex; gap: 10px; align-items: baseline;"><span style="color: ${C.mute};">•</span><span>${ln}</span></div>`)
          .join('');

        // Live values and mini-bars (values styled in #E31E24 per spec)
        if (activeSub === 'tinta') {
          const duc = ductor(th);
          const osc = oscZ(th);
          const ducPercent = Math.round(duc.pos * 100);
          const oscPercent = Math.round(((osc + P.oscAmp) / (2 * P.oscAmp)) * 100);
          subLive.innerHTML = `
            <div style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">
              Tomador: <span style="color: ${C.red}; font-weight: 700;">${duc.contact ? 'Contato ' + duc.contact : 'Trânsito'}</span>
            </div>
            <div class="mini-track">
              <div class="mini-fill" style="width: ${ducPercent}%;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 18px; color: ${C.mute}; margin-top: 2px;">
              <span>TT</span><span>DI</span>
            </div>
            <div style="font-size: 20px; font-weight: 600; margin-top: 12px; margin-bottom: 8px;">
              Distribuidor: <span style="color: ${C.red}; font-weight: 700;">${osc >= 0 ? '+' : ''}${osc.toFixed(1).replace('.', ',')} mm</span>
            </div>
            <div class="mini-track">
              <div class="mini-fill" style="width: ${oscPercent}%;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 18px; color: ${C.mute}; margin-top: 2px;">
              <span>-8 mm</span><span>0</span><span>+8 mm</span>
            </div>
          `;
        } else if (activeSub === 'impressao') {
          const grp = gripper(th);
          const isOpen = grp > 0.05;
          subLive.innerHTML = `
            <div style="font-size: 22px; font-weight: 700;">
              Pinça: <span style="color: ${C.red};">${isOpen ? 'aberta' : 'fechada'}</span>
            </div>
          `;
        } else if (activeSub === 'folha') {
          const sh = sheet(th);
          const printedPct = Math.round(sh.printed * 100);
          subLive.innerHTML = `
            <div style="font-size: 22px; font-weight: 700;">
              Impresso: <span style="color: ${C.red};">${printedPct}%</span>
            </div>
          `;
        } else {
          subLive.innerHTML = '';
        }
      } else {
        subTitle.textContent = 'Castelo de impressão';
        subLines.innerHTML = `
          <div style="color: ${C.mute}; font-size: 20px; line-height: 1.5;">
            Escolha uma parte embaixo para ver como ela trabalha.
          </div>
        `;
        subLive.innerHTML = '';
      }

      // Rotation arrows ("Setas")
      let svgHtml = '';
      if (s.setas && s.project) {
        const cylArrows = [
          {id: 'CHA', c: CYL.CHA.c, dir: 'CCW'},
          {id: 'BLA', c: CYL.BLA.c, dir: 'CW'},
          {id: 'IMP', c: CYL.IMP.c, dir: 'CCW'},
        ];
        for (const cyl of cylArrows) {
          const pt = s.project(cyl.c[0] * 0.001, cyl.c[1] * 0.001, 0.28);
          if (pt) {
            const [cx, cy] = pt;
            const r = 38;
            if (cyl.dir === 'CCW') {
              // Arc CCW: top goes to the left (-x)
              svgHtml += `
                <g stroke="${C.ink}" fill="none" stroke-width="2.5">
                  <path d="M ${cx + r * 0.7} ${cy - r * 0.7} A ${r} ${r} 0 0 0 ${cx - r * 0.7} ${cy - r * 0.7}"/>
                  <polygon points="${cx - r * 0.7 - 7},${cy - r * 0.7 + 4} ${cx - r * 0.7 + 2},${cy - r * 0.7 - 7} ${cx - r * 0.7 + 6},${cy - r * 0.7 + 3}" fill="${C.ink}"/>
                </g>
              `;
            } else {
              // Arc CW: top goes to the right (+x)
              svgHtml += `
                <g stroke="${C.ink}" fill="none" stroke-width="2.5">
                  <path d="M ${cx - r * 0.7} ${cy - r * 0.7} A ${r} ${r} 0 0 1 ${cx + r * 0.7} ${cy - r * 0.7}"/>
                  <polygon points="${cx + r * 0.7 + 7},${cy - r * 0.7 + 4} ${cx + r * 0.7 - 2},${cy - r * 0.7 - 7} ${cx + r * 0.7 - 6},${cy - r * 0.7 + 3}" fill="${C.ink}"/>
                </g>
              `;
            }
          }
        }
      }

      // Callouts & Leader lines ("Legendas")
      let calloutsHtml = '';
      if (s.legendas && s.project) {
        const targets = [
          {id: 'chapa', x: CYL.CHA.c[0] * 0.001, y: CYL.CHA.c[1] * 0.001, z: 0.20},
          {id: 'blanqueta', x: CYL.BLA.c[0] * 0.001, y: CYL.BLA.c[1] * 0.001, z: 0.20},
          {id: 'impressao', x: CYL.IMP.c[0] * 0.001, y: CYL.IMP.c[1] * 0.001, z: 0.20},
          {id: 'tinteiro', x: ROLLERS.TT.c[0] * 0.001, y: (ROLLERS.TT.c[1] + 35) * 0.001, z: 0.20},
          {id: 'molha', x: ROLLERS.MF.c[0] * 0.001, y: ROLLERS.MF.c[1] * 0.001, z: 0.20},
          {id: 'folha', x: 0.16, y: 0.08, z: 0.20},
        ];

        for (const tg of targets) {
          const pt = s.project(tg.x, tg.y, tg.z);
          const layout = CALLOUT_LAYOUT[tg.id];
          if (!pt || !layout) continue;

          const [ax, ay] = pt;
          const {name, subId, lx, ly, w} = layout;
          const isCalloutActive = activeSub === subId;
          const strokeCol = isCalloutActive ? C.red : C.mute;
          const strokeWidth = isCalloutActive ? 2.2 : 1.2;

          // Polyline leader line from 3D anchor to label edge
          const endX = lx < ax ? lx + w : lx;
          const midY = ly + 18;
          svgHtml += `
            <circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="3.5" fill="${strokeCol}"/>
            <polyline points="${ax.toFixed(1)},${ay.toFixed(1)} ${endX.toFixed(1)},${midY.toFixed(1)} ${(lx < ax ? lx : lx + w).toFixed(1)},${midY.toFixed(1)}" fill="none" stroke="${strokeCol}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
          `;

          calloutsHtml += `
            <div class="callout-box ${isCalloutActive ? 'active-callout' : ''}" style="left: ${lx}px; top: ${ly}px;">
              ${name}
            </div>
          `;
        }
      }

      svgOverlay.innerHTML = svgHtml;
      calloutsGroup.innerHTML = calloutsHtml;

      // Pointer update
      if (s.cursor) {
        pointer(s.cursor);
      }
    },
  };
}
