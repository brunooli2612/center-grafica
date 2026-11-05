// Heidelberg GTO 52 print unit 3D geometry and kinematics rig.
// Built in millimetres like V8, scaled by 0.001 to metres.
import * as THREE from 'three';
import {
  P,
  CYL,
  ROLLERS,
  angleOf,
  oscZ,
  ductor,
  sheet,
  gripper,
  IMAGE,
  GRIPPER_A0,
} from './kin.js';

const D2R = Math.PI / 180;
const ACCENT = 0xe31e24;

// ------------------------------------------------------------ Canvas textures for plate, blanket, sheet
// A job's artwork (an image of the flat sheet, P.sheetWidth x P.sheetLength) drawn at physical scale: on the plate
// and blanket it fills the first P.sheetLength mm of the shell from the image's leading edge, on the sheet it fills
// the whole sheet. Plate: the image as an offset plate shows it (dark ink-receptive areas on aluminium); blanket: the
// same, mirrored, in colour (inked rubber); sheet: the print.
function createJobArtCanvas(mode, art) {
  const shellLen = P.cylR * (360 - P.gapDeg) * (Math.PI / 180);
  const W = 1024;
  const H = mode === 'sheet' ? Math.round((W * P.sheetLength) / P.sheetWidth) : Math.round((W * shellLen) / P.sheetWidth);
  const artH = mode === 'sheet' ? H : Math.round((W * P.sheetLength) / P.sheetWidth);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  ctx.fillStyle = mode === 'plate' ? '#b4bac1' : mode === 'blanket' ? '#222832' : '#faf9f6';
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  if (mode === 'blanket') {
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
  }
  if (mode === 'plate') {
    ctx.globalCompositeOperation = 'multiply';
    ctx.filter = 'grayscale(1) contrast(1.35) brightness(0.92)';
  } else if (mode === 'blanket') {
    ctx.globalAlpha = 0.82;
  }
  ctx.drawImage(art, 0, 0, W, artH);
  ctx.restore();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = false;
  tex.anisotropy = 8;
  return tex;
}

function createArtworkCanvas(mode, art) {
  if (art) return createJobArtCanvas(mode, art);
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext('2d');

  // Background per mode
  if (mode === 'plate') {
    ctx.fillStyle = '#b4bac1'; // Aluminium plate
    ctx.fillRect(0, 0, 1024, 1024);
  } else if (mode === 'blanket') {
    ctx.fillStyle = '#222832'; // Dark rubber blanket
    ctx.fillRect(0, 0, 1024, 1024);
  } else {
    ctx.fillStyle = '#faf9f6'; // Clean paper
    ctx.fillRect(0, 0, 1024, 1024);
  }

  ctx.save();
  if (mode === 'blanket') {
    // Blanket image is MIRRORED horizontally across cylinder axis (width / Z)
    ctx.translate(1024, 0);
    ctx.scale(-1, 1);
  }

  const ink = mode === 'blanket' ? '#0d1015' : '#111111';
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;

  // Margin registration border
  ctx.lineWidth = 3;
  ctx.strokeRect(60, 40, 904, 944);

  // Header: CENTER GRÁFICA
  ctx.font = 'bold 68px "JetBrains Mono", Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('CENTER GRÁFICA', 512, 90);

  ctx.font = '600 24px "JetBrains Mono", monospace';
  ctx.fillText('Impressão offset · Teresina', 512, 180);

  // Technical separator bar
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 230);
  ctx.lineTo(924, 230);
  ctx.stroke();

  // Halftone screen block (gradient dot density across 24x11 grid)
  const cols = 24;
  const rows = 11;
  const hx = 100;
  const hy = 260;
  const hw = 824;
  const hh = 360;

  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const u = col / (cols - 1);
      const dotR = 2.5 + u * 10.5; // Dot radius increases from 2.5px to 13px
      const px = hx + (col + 0.5) * (hw / cols);
      const py = hy + (r + 0.5) * (hh / rows);
      ctx.beginPath();
      ctx.arc(px, py, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Calibration density step wedge at bottom
  const steps = 8;
  const sx = 100;
  const sy = 660;
  const sw = 824;
  const sh = 40;
  for (let s = 0; s < steps; s++) {
    const frac = (s + 1) / steps;
    const val = Math.round(255 * (1 - frac * 0.9));
    ctx.fillStyle = mode === 'blanket' ? `rgb(${Math.round(val * 0.2)}, ${Math.round(val * 0.2)}, ${Math.round(val * 0.2)})` : `rgb(${val}, ${val}, ${val})`;
    ctx.fillRect(sx + s * (sw / steps), sy, sw / steps, sh);
    ctx.strokeRect(sx + s * (sw / steps), sy, sw / steps, sh);
  }

  // Fine print & registration crosshairs
  ctx.fillStyle = ink;
  ctx.font = '500 18px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('Escala de densidade · retícula 150 lpi', 100, 725);
  ctx.textAlign = 'right';
  ctx.fillText('Marcas de registro', 924, 725);

  // Registration crosshairs
  const cross = (cx, cy) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 28, cy);
    ctx.lineTo(cx + 28, cy);
    ctx.moveTo(cx, cy - 28);
    ctx.lineTo(cx, cy + 28);
    ctx.stroke();
  };
  cross(200, 840);
  cross(824, 840);

  ctx.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = false;
  return tex;
}

// ------------------------------------------------------------ Geometry helpers
function createShaftGeo(radius, length) {
  const g = new THREE.CylinderGeometry(radius, radius, length, 32);
  g.rotateX(Math.PI / 2);
  return g;
}

function createBearerGeo(radius, width, rIn = radius * 0.75) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, radius, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, rIn, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: true,
    bevelThickness: 1,
    bevelSize: 1,
    bevelSegments: 1,
    curveSegments: 48,
  });
  g.translate(0, 0, -width / 2);
  return g;
}

function createRollerGeo(radius, length) {
  const g = new THREE.CylinderGeometry(radius, radius, length, 48);
  g.rotateX(Math.PI / 2);
  return g;
}

/**
 * Cylindrical body with a shallow 30° gap channel along Z.
 * gapCenterDeg: local angle where the gap is centered.
 */
function createCylinderBodyWithGap(R, Rgap, gapCenterDeg, gapDeg, faceWidth) {
  const shape = new THREE.Shape();
  const halfGap = (gapDeg / 2) * D2R;
  const center = gapCenterDeg * D2R;
  const aStart = center + halfGap;
  const aEnd = center + 2 * Math.PI - halfGap;

  const segs = 64;
  for (let i = 0; i <= segs; i++) {
    const a = aStart + (i / segs) * (aEnd - aStart);
    const x = R * Math.cos(a);
    const y = R * Math.sin(a);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }

  // Inward step into the gap channel
  const xFloorEnd = Rgap * Math.cos(aEnd);
  const yFloorEnd = Rgap * Math.sin(aEnd);
  shape.lineTo(xFloorEnd, yFloorEnd);

  // Recessed floor chord / arc across the gap
  const floorSegs = 8;
  for (let i = floorSegs; i >= 0; i--) {
    const a = center - halfGap + (i / floorSegs) * (2 * halfGap);
    shape.lineTo(Rgap * Math.cos(a), Rgap * Math.sin(a));
  }

  shape.closePath();

  const g = new THREE.ExtrudeGeometry(shape, {
    depth: faceWidth,
    bevelEnabled: false,
    curveSegments: 32,
  });
  g.translate(0, 0, -faceWidth / 2);
  return g;
}

/**
 * Thin cylindrical shell ribbon for plate and blanket.
 * Wrapped around Z from angleStartRad through angleLengthRad, between zMin and zMax.
 */
function createCylinderShell(radius, angleStartRad, angleLengthRad, zMin, zMax, segsU = 64, segsV = 1) {
  const geo = new THREE.BufferGeometry();
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let j = 0; j <= segsV; j++) {
    const vNorm = j / segsV;
    const z = zMin + vNorm * (zMax - zMin);
    for (let i = 0; i <= segsU; i++) {
      const uNorm = i / segsU;
      const angle = angleStartRad + uNorm * angleLengthRad;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      positions.push(radius * cosA, radius * sinA, z);
      normals.push(cosA, sinA, 0);
      uvs.push(vNorm, uNorm);
    }
  }

  const stride = segsU + 1;
  for (let j = 0; j < segsV; j++) {
    for (let i = 0; i < segsU; i++) {
      const a = j * stride + i;
      const b = (j + 1) * stride + i;
      const c = (j + 1) * stride + (i + 1);
      const d = j * stride + (i + 1);
      indices.push(a, d, b);
      indices.push(d, c, b);
    }
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return geo;
}

/** Accent rim ring for isolation highlight */
function createRimHighlight(radius, zPos, width = 4) {
  const g = new THREE.CylinderGeometry(radius + 0.3, radius + 0.3, width, 48, 1, true);
  g.rotateX(Math.PI / 2);
  g.translate(0, 0, zPos);
  return g;
}

// ------------------------------------------------------------ Sheet path helper
const lIn = P.cylR * (P.entradaDeg * D2R);
const lWrap = P.cylR * (P.wrapDeg * D2R);
const inAngleRad = P.infeedAngleDeg * D2R;
const exitAngleRad = (P.infeedAngleDeg + P.wrapDeg) * D2R;
const pIn = [P.cylR * Math.cos(inAngleRad), P.cylR * Math.sin(inAngleRad)];
const tIn = [-Math.sin(inAngleRad), Math.cos(inAngleRad)];
const pOut = [P.cylR * Math.cos(exitAngleRad), P.cylR * Math.sin(exitAngleRad)];
const tOut = [-Math.sin(exitAngleRad), Math.cos(exitAngleRad)];

/**
 * Computes world [x, y] and outward normal [nx, ny] for any arc-length s on the sheet path.
 */
export function sheetPath(s) {
  if (s < lIn) {
    const rem = lIn - s;
    const x = pIn[0] - rem * tIn[0];
    const y = pIn[1] - rem * tIn[1];
    return {x, y, nx: -tIn[1], ny: tIn[0]};
  } else if (s <= lIn + lWrap) {
    const sArc = s - lIn;
    const alpha = inAngleRad + sArc / P.cylR;
    const cosA = Math.cos(alpha);
    const sinA = Math.sin(alpha);
    return {x: P.cylR * cosA, y: P.cylR * sinA, nx: cosA, ny: sinA};
  } else {
    const sOut = s - (lIn + lWrap);
    const x = pOut[0] + sOut * tOut[0];
    const y = pOut[1] + sOut * tOut[1];
    return {x, y, nx: -tOut[1], ny: tOut[0]};
  }
}

// ------------------------------------------------------------ Main buildPress
export function buildPress(opts = {}) {
  const group = new THREE.Group();
  group.name = 'pressRoot';

  // Subsystem isolation groups
  const parts = {
    tinta: new THREE.Group(),
    molha: new THREE.Group(),
    chapa: new THREE.Group(),
    blanqueta: new THREE.Group(),
    impressao: new THREE.Group(),
    folha: new THREE.Group(),
    frame: new THREE.Group(),
    frameFront: new THREE.Group(),
  };

  for (const p of Object.values(parts)) {
    group.add(p);
  }

  // Accent highlight set
  const accentMeshes = new Set();
  const originalMaterials = new Map();

  const addMesh = (parent, mesh, isAccent = false) => {
    parent.add(mesh);
    if (isAccent) {
      accentMeshes.add(mesh);
      mesh.visible = false;
    } else {
      originalMaterials.set(mesh, mesh.material);
    }
    return mesh;
  };

  // Materials
  const matShaft = new THREE.MeshStandardMaterial({color: '#7a818c', roughness: 0.45, metalness: 0.65});
  const matBearer = new THREE.MeshStandardMaterial({color: '#32363d', roughness: 0.4, metalness: 0.8});
  // cylinder bearers: ground steel rings, light so the cylinder ends do not read as tyres
  const matBearerSteel = new THREE.MeshStandardMaterial({color: '#b4b9bf', roughness: 0.45, metalness: 0.75, envMapIntensity: 0.5});
  const matCylBody = new THREE.MeshStandardMaterial({color: '#9aa0a8', roughness: 0.45, metalness: 0.55});
  const matImpBody = new THREE.MeshStandardMaterial({color: '#525a66', roughness: 0.45, metalness: 0.5}); // Anodised
  const matInkRubber = new THREE.MeshStandardMaterial({color: '#181a1d', roughness: 0.38, metalness: 0.2});
  const matChromeDI = new THREE.MeshStandardMaterial({color: '#d6dadf', roughness: 0.32, metalness: 0.82});
  const matMolhaRubber = new THREE.MeshStandardMaterial({color: '#567587', roughness: 0.48, metalness: 0.15}); // Grey-blue
  const matMolhaPanRoller = new THREE.MeshStandardMaterial({color: '#b0bcc7', roughness: 0.35, metalness: 0.6});
  const matWaterPan = new THREE.MeshStandardMaterial({color: '#949ea8', roughness: 0.4, metalness: 0.4});
  const matWaterPlane = new THREE.MeshStandardMaterial({color: '#70b2d4', roughness: 0.15, transparent: true, opacity: 0.6});
  const matInfeed = new THREE.MeshStandardMaterial({color: '#a4abb5', roughness: 0.42, metalness: 0.5});
  const matFrame = new THREE.MeshStandardMaterial({color: '#555a62', roughness: 0.58, metalness: 0.3});
  const matAccent = new THREE.MeshBasicMaterial({color: ACCENT});

  const plateTex = createArtworkCanvas('plate', opts.art);
  const blanketTex = createArtworkCanvas('blanket', opts.art);
  const sheetTex = createArtworkCanvas('sheet', opts.art);

  const matPlate = new THREE.MeshStandardMaterial({
    map: plateTex,
    roughness: 0.45,
    metalness: 0.45,
    side: THREE.DoubleSide,
  });

  const matBlanket = new THREE.MeshStandardMaterial({
    map: blanketTex,
    roughness: 0.55,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  // Sheet material with custom reveal shader
  const matSheet = new THREE.MeshStandardMaterial({
    map: sheetTex,
    roughness: 0.82,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  matSheet.userData.uPrinted = {value: 0.0};
  matSheet.onBeforeCompile = (shader) => {
    shader.uniforms.uPrinted = matSheet.userData.uPrinted;
    shader.fragmentShader = `uniform float uPrinted;\n` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      `
      #ifdef USE_MAP
        vec4 texelColor = texture2D( map, vMapUv );
        vec4 paperColor = vec4(0.98, 0.976, 0.965, 1.0);
        // Reveal printed ink only for u <= uPrinted along length (vMapUv.y)
        float printMask = clamp((uPrinted - vMapUv.y) * 100.0, 0.0, 1.0);
        diffuseColor *= mix(paperColor, texelColor, printMask);
      #endif
      `
    );
  };

  const ghostMaterial = new THREE.MeshStandardMaterial({
    color: '#d0d6de',
    transparent: true,
    opacity: 0.15,
    depthWrite: false,
    roughness: 0.28,
    metalness: 0.1,
  });

  // ------------------------------------------------------------ 1. CYLINDERS (IMP, BLA, CHA)
  const faceW = P.faceWidth; // 520
  const bearerW = P.bearerWidth; // 15
  const cylR = P.cylR; // 75
  const shaftR = 20;
  const shaftL = 720;
  const bearerZ1 = faceW / 2 + bearerW / 2; // 267.5
  const bearerZ2 = -bearerZ1; // -267.5

  // CHA
  const chaGroup = new THREE.Group();
  chaGroup.position.set(CYL.CHA.c[0], CYL.CHA.c[1], 0);
  parts.chapa.add(chaGroup);

  const chaShaft = new THREE.Mesh(createShaftGeo(shaftR, shaftL), matShaft);
  addMesh(chaGroup, chaShaft);

  const chaBearer1 = new THREE.Mesh(createBearerGeo(cylR, bearerW), matBearerSteel);
  chaBearer1.position.z = bearerZ1;
  const chaBearer2 = new THREE.Mesh(createBearerGeo(cylR, bearerW), matBearerSteel);
  chaBearer2.position.z = bearerZ2;
  addMesh(chaGroup, chaBearer1);
  addMesh(chaGroup, chaBearer2);

  const chaGapCenter = (IMAGE.CHA + P.gapDeg / 2) % 360;
  const chaBody = new THREE.Mesh(createCylinderBodyWithGap(cylR, cylR - 18, chaGapCenter, P.gapDeg, faceW), matCylBody);
  addMesh(chaGroup, chaBody);

  // Plate shell
  const plateShellGeo = createCylinderShell(
    cylR + 0.08,
    IMAGE.CHA * D2R,
    -(360 - P.gapDeg) * D2R,
    -faceW / 2,
    faceW / 2,
    64,
    1
  );
  const plateShell = new THREE.Mesh(plateShellGeo, matPlate);
  addMesh(chaGroup, plateShell);

  // CHA Accent rims
  addMesh(chaGroup, new THREE.Mesh(createRimHighlight(cylR, faceW / 2 + 1), matAccent), true);
  addMesh(chaGroup, new THREE.Mesh(createRimHighlight(cylR, -faceW / 2 - 1), matAccent), true);

  // BLA
  const blaGroup = new THREE.Group();
  blaGroup.position.set(CYL.BLA.c[0], CYL.BLA.c[1], 0);
  parts.blanqueta.add(blaGroup);

  const blaShaft = new THREE.Mesh(createShaftGeo(shaftR, shaftL), matShaft);
  addMesh(blaGroup, blaShaft);

  const blaBearer1 = new THREE.Mesh(createBearerGeo(cylR, bearerW), matBearerSteel);
  blaBearer1.position.z = bearerZ1;
  const blaBearer2 = new THREE.Mesh(createBearerGeo(cylR, bearerW), matBearerSteel);
  blaBearer2.position.z = bearerZ2;
  addMesh(blaGroup, blaBearer1);
  addMesh(blaGroup, blaBearer2);

  const blaGapCenter = ((IMAGE.BLA - P.gapDeg / 2) % 360 + 360) % 360;
  const blaBody = new THREE.Mesh(createCylinderBodyWithGap(cylR, cylR - 18, blaGapCenter, P.gapDeg, faceW), matCylBody);
  addMesh(blaGroup, blaBody);

  // Blanket shell (mirrored texture)
  const blanketShellGeo = createCylinderShell(
    cylR + 0.08,
    IMAGE.BLA * D2R,
    (360 - P.gapDeg) * D2R,
    -faceW / 2,
    faceW / 2,
    64,
    1
  );
  const blanketShell = new THREE.Mesh(blanketShellGeo, matBlanket);
  addMesh(blaGroup, blanketShell);

  // BLA Accent rims
  addMesh(blaGroup, new THREE.Mesh(createRimHighlight(cylR, faceW / 2 + 1), matAccent), true);
  addMesh(blaGroup, new THREE.Mesh(createRimHighlight(cylR, -faceW / 2 - 1), matAccent), true);

  // IMP
  const impGroup = new THREE.Group();
  impGroup.position.set(CYL.IMP.c[0], CYL.IMP.c[1], 0);
  parts.impressao.add(impGroup);

  const impShaft = new THREE.Mesh(createShaftGeo(shaftR, shaftL), matShaft);
  addMesh(impGroup, impShaft);

  const impBearer1 = new THREE.Mesh(createBearerGeo(cylR, bearerW), matBearerSteel);
  impBearer1.position.z = bearerZ1;
  const impBearer2 = new THREE.Mesh(createBearerGeo(cylR, bearerW), matBearerSteel);
  impBearer2.position.z = bearerZ2;
  addMesh(impGroup, impBearer1);
  addMesh(impGroup, impBearer2);

  const impGapCenter = GRIPPER_A0;
  const impBody = new THREE.Mesh(createCylinderBodyWithGap(cylR, cylR - 20, impGapCenter, P.gapDeg, faceW), matImpBody);
  addMesh(impGroup, impBody);

  // Gripper bar in IMP gap
  const gripperGroup = new THREE.Group();
  const gripBarAngle = (GRIPPER_A0 + 5) * D2R;
  const gripPivotR = cylR - 12;
  gripperGroup.position.set(gripPivotR * Math.cos(gripBarAngle), gripPivotR * Math.sin(gripBarAngle), 0);
  gripperGroup.rotation.z = gripBarAngle;

  const gripperShaft = new THREE.Mesh(createShaftGeo(5, faceW - 20), matShaft);
  addMesh(gripperGroup, gripperShaft);

  // Gripper fingers
  const fingersGroup = new THREE.Group();
  gripperGroup.add(fingersGroup);
  const fingerGeo = new THREE.BoxGeometry(14, 3, 10);
  fingerGeo.translate(7, 0, 0);
  const numFingers = 12;
  for (let f = 0; f < numFingers; f++) {
    const fz = -faceW / 2 + 25 + f * ((faceW - 50) / (numFingers - 1));
    const finger = new THREE.Mesh(fingerGeo, matBearer);
    finger.position.z = fz;
    addMesh(fingersGroup, finger);
  }
  impGroup.add(gripperGroup);

  // IMP Accent rims
  addMesh(impGroup, new THREE.Mesh(createRimHighlight(cylR, faceW / 2 + 1), matAccent), true);
  addMesh(impGroup, new THREE.Mesh(createRimHighlight(cylR, -faceW / 2 - 1), matAccent), true);

  // ------------------------------------------------------------ 2. ROLLERS
  const rollerL = 515;

  // MF (dampening form)
  const mfGroup = new THREE.Group();
  mfGroup.position.set(ROLLERS.MF.c[0], ROLLERS.MF.c[1], 0);
  const mfShaft = new THREE.Mesh(createShaftGeo(12, 680), matShaft);
  const mfMesh = new THREE.Mesh(createRollerGeo(ROLLERS.MF.r, rollerL), matMolhaRubber);
  addMesh(mfGroup, mfShaft);
  addMesh(mfGroup, mfMesh);
  addMesh(mfGroup, new THREE.Mesh(createRimHighlight(ROLLERS.MF.r, rollerL / 2 - 2), matAccent), true);
  parts.molha.add(mfGroup);

  // MB (water pan roller)
  const mbGroup = new THREE.Group();
  mbGroup.position.set(ROLLERS.MB.c[0], ROLLERS.MB.c[1], 0);
  const mbShaft = new THREE.Mesh(createShaftGeo(14, 680), matShaft);
  const mbMesh = new THREE.Mesh(createRollerGeo(ROLLERS.MB.r, rollerL), matMolhaPanRoller);
  addMesh(mbGroup, mbShaft);
  addMesh(mbGroup, mbMesh);
  parts.molha.add(mbGroup);

  // T1 & T2 (inking form rollers)
  const t1Group = new THREE.Group();
  t1Group.position.set(ROLLERS.T1.c[0], ROLLERS.T1.c[1], 0);
  const t1Shaft = new THREE.Mesh(createShaftGeo(12, 680), matShaft);
  const t1Mesh = new THREE.Mesh(createRollerGeo(ROLLERS.T1.r, rollerL), matInkRubber);
  addMesh(t1Group, t1Shaft);
  addMesh(t1Group, t1Mesh);
  parts.tinta.add(t1Group);

  const t2Group = new THREE.Group();
  t2Group.position.set(ROLLERS.T2.c[0], ROLLERS.T2.c[1], 0);
  const t2Shaft = new THREE.Mesh(createShaftGeo(12, 680), matShaft);
  const t2Mesh = new THREE.Mesh(createRollerGeo(ROLLERS.T2.r, rollerL), matInkRubber);
  addMesh(t2Group, t2Shaft);
  addMesh(t2Group, t2Mesh);
  parts.tinta.add(t2Group);

  // DI (oscillating distributor)
  const diGroup = new THREE.Group();
  diGroup.position.set(ROLLERS.DI.c[0], ROLLERS.DI.c[1], 0);
  const diShaft = new THREE.Mesh(createShaftGeo(16, 720), matShaft);
  const diBody = new THREE.Mesh(createRollerGeo(ROLLERS.DI.r, rollerL), matChromeDI);
  const diRim1 = new THREE.Mesh(createBearerGeo(ROLLERS.DI.r + 0.1, 4), matBearer);
  diRim1.position.z = rollerL / 2;
  const diRim2 = new THREE.Mesh(createBearerGeo(ROLLERS.DI.r + 0.1, 4), matBearer);
  diRim2.position.z = -rollerL / 2;
  addMesh(diGroup, diShaft);
  addMesh(diGroup, diBody);
  addMesh(diGroup, diRim1);
  addMesh(diGroup, diRim2);
  addMesh(diGroup, new THREE.Mesh(createRimHighlight(ROLLERS.DI.r, rollerL / 2 - 2), matAccent), true);
  parts.tinta.add(diGroup);

  // TT (ink fountain roller)
  const ttGroup = new THREE.Group();
  ttGroup.position.set(ROLLERS.TT.c[0], ROLLERS.TT.c[1], 0);
  const ttShaft = new THREE.Mesh(createShaftGeo(14, 680), matShaft);
  const ttMesh = new THREE.Mesh(createRollerGeo(ROLLERS.TT.r, rollerL), matInkRubber);
  addMesh(ttGroup, ttShaft);
  addMesh(ttGroup, ttMesh);
  parts.tinta.add(ttGroup);

  // DU (ductor roller)
  const duGroup = new THREE.Group();
  const duShaft = new THREE.Mesh(createShaftGeo(10, 600), matShaft);
  const duMesh = new THREE.Mesh(createRollerGeo(ROLLERS.DU.r, rollerL), matInkRubber);
  addMesh(duGroup, duShaft);
  addMesh(duGroup, duMesh);
  parts.tinta.add(duGroup);

  // Ductor rocker arm
  const duPivot = [3.4, 483.7]; // Visual pivot above DI-TT line
  const duArmGroup = new THREE.Group();
  duArmGroup.position.set(duPivot[0], duPivot[1], 0);
  const armL = 55;
  const armGeo = new THREE.BoxGeometry(armL, 10, 8);
  armGeo.translate(armL / 2, 0, 0);
  const armZ1 = rollerL / 2 + 10;
  const armMesh1 = new THREE.Mesh(armGeo, matBearer);
  armMesh1.position.z = armZ1;
  const armMesh2 = new THREE.Mesh(armGeo, matBearer);
  armMesh2.position.z = -armZ1;
  addMesh(duArmGroup, armMesh1);
  addMesh(duArmGroup, armMesh2);
  parts.tinta.add(duArmGroup);

  // ------------------------------------------------------------ 3. INK FOUNTAIN & WATER PAN
  // Ink fountain: wedge above TT with 16 zone screws
  const fttX = ROLLERS.TT.c[0];
  const fttY = ROLLERS.TT.c[1];
  const fsh = new THREE.Shape();
  fsh.moveTo(fttX - 25, fttY + 28);
  fsh.lineTo(fttX - 70, fttY + 70);
  fsh.lineTo(fttX - 40, fttY + 80);
  fsh.lineTo(fttX + 15, fttY + 32);
  fsh.closePath();
  const fountainGeo = new THREE.ExtrudeGeometry(fsh, {depth: 500, bevelEnabled: false});
  fountainGeo.translate(0, 0, -250);
  const fountainMesh = new THREE.Mesh(fountainGeo, matBearer);
  addMesh(parts.tinta, fountainMesh);

  // 16 zone screws along z
  const screwHeadGeo = new THREE.CylinderGeometry(4.5, 4.5, 14, 16);
  screwHeadGeo.rotateZ(Math.PI / 4);
  const matScrew = new THREE.MeshStandardMaterial({color: '#cbd0d6', roughness: 0.35, metalness: 0.7});
  for (let sc = 0; sc < 16; sc++) {
    const sz = -230 + sc * (460 / 15);
    const screw = new THREE.Mesh(screwHeadGeo, matScrew);
    screw.position.set(fttX - 60, fttY + 72, sz);
    addMesh(parts.tinta, screw);
  }

  // Water pan under MB
  const fmbX = ROLLERS.MB.c[0];
  const fmbY = ROLLERS.MB.c[1];
  const panSh = new THREE.Shape();
  panSh.moveTo(fmbX - 44, fmbY + 6);
  panSh.lineTo(fmbX - 44, fmbY - 45);
  panSh.lineTo(fmbX + 44, fmbY - 45);
  panSh.lineTo(fmbX + 44, fmbY + 6);
  panSh.lineTo(fmbX + 38, fmbY + 6);
  panSh.lineTo(fmbX + 38, fmbY - 39);
  panSh.lineTo(fmbX - 38, fmbY - 39);
  panSh.lineTo(fmbX - 38, fmbY + 6);
  panSh.closePath();
  const panGeo = new THREE.ExtrudeGeometry(panSh, {depth: 530, bevelEnabled: false});
  panGeo.translate(0, 0, -265);
  const panMesh = new THREE.Mesh(panGeo, matWaterPan);
  addMesh(parts.molha, panMesh);

  // Water plane (MB half immersed)
  const waterGeo = new THREE.PlaneGeometry(76, 520);
  waterGeo.rotateX(Math.PI / 2);
  const waterMesh = new THREE.Mesh(waterGeo, matWaterPlane);
  waterMesh.position.set(fmbX, fmbY, 0);
  addMesh(parts.molha, waterMesh);

  // ------------------------------------------------------------ 4. TABLES (INFEED & DELIVERY)
  // Infeed table on right
  const infeedGeo = new THREE.BoxGeometry(220, 6, 530);
  const infeedAngle = Math.atan2(tIn[1], tIn[0]);
  infeedGeo.rotateZ(infeedAngle);
  infeedGeo.translate(pIn[0] - 110 * tIn[0], pIn[1] - 110 * tIn[1] - 4, 0);
  const infeedMesh = new THREE.Mesh(infeedGeo, matInfeed);
  addMesh(parts.folha, infeedMesh);

  // Delivery guide on left
  // thin rails on the unprinted (back) side of the sheet, starting below the point where the IMP curves away
  const railTop = pOut[1] - 40;
  const railLen = 130;
  for (let k = 0; k < 5; k++) {
    const railGeo = new THREE.BoxGeometry(3, railLen, 14);
    railGeo.translate(pOut[0] + 6, railTop - railLen / 2, -220 + k * 110);
    addMesh(parts.folha, new THREE.Mesh(railGeo, matInfeed));
  }

  // ------------------------------------------------------------ 5. THE SHEET
  const sheetSegs = 80;
  const sheetGeo = new THREE.BufferGeometry();
  const sheetPos = new Float32Array((sheetSegs + 1) * 2 * 3);
  const sheetNorm = new Float32Array((sheetSegs + 1) * 2 * 3);
  const sheetUv = new Float32Array((sheetSegs + 1) * 2 * 2);
  const sheetIdx = [];

  for (let i = 0; i <= sheetSegs; i++) {
    const uNorm = i / sheetSegs;
    sheetUv[i * 4 + 0] = 0;
    sheetUv[i * 4 + 1] = uNorm;
    sheetUv[i * 4 + 2] = 1;
    sheetUv[i * 4 + 3] = uNorm;
  }

  for (let i = 0; i < sheetSegs; i++) {
    const a = i * 2;
    const b = (i + 1) * 2;
    const c = (i + 1) * 2 + 1;
    const d = i * 2 + 1;
    sheetIdx.push(a, b, d);
    sheetIdx.push(b, c, d);
  }

  sheetGeo.setAttribute('position', new THREE.BufferAttribute(sheetPos, 3));
  sheetGeo.setAttribute('normal', new THREE.BufferAttribute(sheetNorm, 3));
  sheetGeo.setAttribute('uv', new THREE.BufferAttribute(sheetUv, 2));
  sheetGeo.setIndex(sheetIdx);

  const sheetMesh = new THREE.Mesh(sheetGeo, matSheet);
  addMesh(parts.folha, sheetMesh);

  // ------------------------------------------------------------ 6. SIDE FRAMES
  const frameZ = faceW / 2 + bearerW + 25; // 300 mm
  const frameThick = 18;

  const frameShape = new THREE.Shape();
  // outline from the kin bounds, so the frame always encloses the train (fountain wedge reaches TT.x-70, TT.y+80)
  const allBodies = [...CYL, ...ROLLERS];
  const fL = Math.min(...allBodies.map((b) => b.c[0] - b.r), ROLLERS.TT.c[0] - 70) - 45;
  const fR = Math.max(...allBodies.map((b) => b.c[0] + b.r)) + 50;
  const fB = CYL.IMP.c[1] - CYL.IMP.r - 60;
  const fT = ROLLERS.TT.c[1] + 90;
  const fShoulder = ROLLERS.MB.c[1] + ROLLERS.MB.r + 30; // right side steps in above the water pan, like the GTO casting
  frameShape.moveTo(fL, fB);
  frameShape.lineTo(fR, fB);
  frameShape.lineTo(fR, fShoulder);
  frameShape.lineTo(ROLLERS.DI.c[0] + 60, fT);
  frameShape.lineTo(fL, fT);
  frameShape.closePath();

  // Holes at all cylinder and roller shafts
  const frameHoles = [
    [CYL.IMP.c[0], CYL.IMP.c[1], 23],
    [CYL.BLA.c[0], CYL.BLA.c[1], 23],
    [CYL.CHA.c[0], CYL.CHA.c[1], 23],
    [ROLLERS.MF.c[0], ROLLERS.MF.c[1], 15],
    [ROLLERS.MB.c[0], ROLLERS.MB.c[1], 17],
    [ROLLERS.T1.c[0], ROLLERS.T1.c[1], 15],
    [ROLLERS.T2.c[0], ROLLERS.T2.c[1], 15],
    [ROLLERS.DI.c[0], ROLLERS.DI.c[1], 19],
    [ROLLERS.TT.c[0], ROLLERS.TT.c[1], 17],
    [duPivot[0], duPivot[1], 9],
  ];

  for (const [hx, hy, hr] of frameHoles) {
    const hp = new THREE.Path();
    hp.absarc(hx, hy, hr, 0, Math.PI * 2, true);
    frameShape.holes.push(hp);
  }

  const frameGeo = new THREE.ExtrudeGeometry(frameShape, {
    depth: frameThick,
    bevelEnabled: true,
    bevelThickness: 1.5,
    bevelSize: 1.5,
    bevelSegments: 1,
    curveSegments: 24,
  });

  // Operator-side frame (+z, hideable in parts.frameFront)
  // operator side reads as glass so the train stays visible; the lado cutaway hides it entirely
  const matFrameFront = matFrame.clone();
  matFrameFront.transparent = true;
  matFrameFront.opacity = 0.14;
  matFrameFront.depthWrite = false;
  const frameFrontMesh = new THREE.Mesh(frameGeo, matFrameFront);
  frameFrontMesh.position.z = frameZ - frameThick / 2;
  addMesh(parts.frameFront, frameFrontMesh);

  // Drive-side frame (-z, permanent in parts.frame)
  const frameBackMesh = new THREE.Mesh(frameGeo, matFrame);
  frameBackMesh.position.z = -frameZ - frameThick / 2;
  addMesh(parts.frame, frameBackMesh);

  // Cross tie rods between frames (attached to frameFront so they hide in lado cutaway)
  const tiePositions = [
    [-130, -60],
    [180, -60],
    [180, 320],
    [-130, 520],
    [80, 520],
  ];
  for (const [tx, ty] of tiePositions) {
    const tie = new THREE.Mesh(createShaftGeo(10, frameZ * 2 + frameThick), matBearer);
    tie.position.set(tx, ty, 0);
    addMesh(parts.frameFront, tie);
  }

  // ------------------------------------------------------------ 7. setGhost(name)
  function setGhost(name) {
    if (!name || !parts[name]) {
      // Restore original materials
      for (const [mesh, origMat] of originalMaterials.entries()) {
        mesh.material = origMat;
      }
      for (const rim of accentMeshes) {
        rim.visible = false;
      }
      return;
    }

    for (const [partName, partGroup] of Object.entries(parts)) {
      const isTarget = partName === name;
      partGroup.traverse((child) => {
        if (child.isMesh) {
          if (accentMeshes.has(child)) {
            child.visible = isTarget;
          } else {
            child.material = isTarget ? originalMaterials.get(child) : ghostMaterial;
          }
        }
      });
    }
  }

  // ------------------------------------------------------------ 8. update(th)
  function update(th) {
    // Pose cylinders
    chaGroup.rotation.z = angleOf('CHA', th) * D2R;
    blaGroup.rotation.z = angleOf('BLA', th) * D2R;
    impGroup.rotation.z = angleOf('IMP', th) * D2R;

    // Pose rollers
    mfGroup.rotation.z = angleOf('MF', th) * D2R;
    mbGroup.rotation.z = angleOf('MB', th) * D2R;
    t1Group.rotation.z = angleOf('T1', th) * D2R;
    t2Group.rotation.z = angleOf('T2', th) * D2R;

    // DI: rotation + axial oscillation
    diGroup.rotation.z = angleOf('DI', th) * D2R;
    diGroup.position.z = oscZ(th);

    // TT
    ttGroup.rotation.z = angleOf('TT', th) * D2R;

    // DU: center from ductor(th).c and rotation
    const dState = ductor(th);
    duGroup.position.set(dState.c[0], dState.c[1], 0);
    duGroup.rotation.z = angleOf('DU', th) * D2R;

    // Ductor arm following DU center
    const ddx = dState.c[0] - duPivot[0];
    const ddy = dState.c[1] - duPivot[1];
    duArmGroup.rotation.z = Math.atan2(ddy, ddx);

    // IMP gripper opening
    fingersGroup.rotation.z = -gripper(th) * 0.45;

    // Posed sheet
    const shInfo = sheet(th);
    const sLead = shInfo.s;
    const posAttr = sheetGeo.attributes.position;
    const normAttr = sheetGeo.attributes.normal;
    const halfSheetW = P.sheetWidth / 2;

    for (let i = 0; i <= sheetSegs; i++) {
      const s_i = sLead - (i / sheetSegs) * P.sheetLength;
      const pt = sheetPath(s_i);

      // Offset along outward normal by half sheet thickness (0.25 mm)
      const px = pt.x + 0.25 * pt.nx;
      const py = pt.y + 0.25 * pt.ny;

      // Vertex 0 (-z)
      posAttr.setXYZ(i * 2 + 0, px, py, -halfSheetW);
      normAttr.setXYZ(i * 2 + 0, pt.nx, pt.ny, 0);

      // Vertex 1 (+z)
      posAttr.setXYZ(i * 2 + 1, px, py, halfSheetW);
      normAttr.setXYZ(i * 2 + 1, pt.nx, pt.ny, 0);
    }
    posAttr.needsUpdate = true;
    normAttr.needsUpdate = true;

    // Update printed reveal uniform
    matSheet.userData.uPrinted.value = shInfo.printed;
  }

  // Model is built in millimetres; scale by 0.001 to metres like V8
  group.scale.setScalar(0.001);

  // Initial pose at th = 0
  update(0);

  return {
    group,
    parts,
    update,
    setGhost,
  };
}
