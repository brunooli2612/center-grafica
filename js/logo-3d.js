import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Cores e medidas de assets/images/simbolo-center.svg (viewBox 100x100)
const COLORS = {
  ciano: '#00AEEF',
  verde: '#00A651',
  amarelo: '#FCD125',
  vermelho: '#E0333F',
  magenta: '#D12A99',
  marinho: '#2E3A94',
  sombra: '#212228',
  filete: '#FFFFFF'
};

const SVG_CENTER = 50;
const MAX_TILT = 0.35;
const REST_POSE = { x: -0.18, y: 0.28 };
const KAPPA = 0.5523; // aproximação de arco circular por Bézier cúbica

const FALLBACK_HTML = '<img src="assets/images/simbolo-center.svg" alt="" style="width:100%;height:100%" />';

// Converte coordenada do SVG (Y para baixo) para Three.js (Y para cima)
function toScene(x, y) {
  return [x - SVG_CENTER, SVG_CENTER - y];
}

// Traça um contorno a partir de comandos em coordenadas do SVG:
// ['M', x, y], ['L', x, y], ['Q', cx, cy, x, y], ['C', c1x, c1y, c2x, c2y, x, y]
function tracePath(path, commands) {
  for (const [cmd, ...v] of commands) {
    if (cmd === 'M') path.moveTo(...toScene(v[0], v[1]));
    if (cmd === 'L') path.lineTo(...toScene(v[0], v[1]));
    if (cmd === 'Q') path.quadraticCurveTo(...toScene(v[0], v[1]), ...toScene(v[2], v[3]));
    if (cmd === 'C') path.bezierCurveTo(...toScene(v[0], v[1]), ...toScene(v[2], v[3]), ...toScene(v[4], v[5]));
  }
  return path;
}

// Retângulo arredondado com cantos circulares (equivalente ao rect rx do SVG)
function roundedRect(x, y, w, h, r) {
  const k = r * KAPPA;
  const right = x + w;
  const bottom = y + h;
  return [
    ['M', x + r, y],
    ['L', right - r, y],
    ['C', right - r + k, y, right, y + r - k, right, y + r],
    ['L', right, bottom - r],
    ['C', right, bottom - r + k, right - r + k, bottom, right - r, bottom],
    ['L', x + r, bottom],
    ['C', x + r - k, bottom, x, bottom - r + k, x, bottom - r],
    ['L', x, y + r],
    ['C', x, y + r - k, x + r - k, y, x + r, y]
  ];
}

function shapeFrom(commands, holes = []) {
  const shape = tracePath(new THREE.Shape(), commands);
  holes.forEach((hole) => shape.holes.push(tracePath(new THREE.Path(), hole)));
  return shape;
}

// Furo central (centro vazado)
const FURO = roundedRect(32, 29.5, 58, 60, 9);

// Peças do símbolo, de trás para frente
const PIECES = {
  // Placa base ciano com o furo
  base: () => shapeFrom(roundedRect(0, 0, 100, 100, 16), [FURO]),
  // Amarelo: lado esquerdo embaixo, com o canto inferior arredondado da placa
  amarelo: () => shapeFrom([
    ['M', 0, 30], ['L', 32, 30], ['L', 32, 100], ['L', 16, 100],
    ['C', 16 - 16 * KAPPA, 100, 0, 84 + 16 * KAPPA, 0, 84], ['L', 0, 30]
  ]),
  // Verde: lado esquerdo em cima, borda inferior em curva
  verde: () => shapeFrom([
    ['M', 0, 20.6], ['L', 32, 20.6], ['L', 32, 67.3],
    ['C', 24, 66.5, 17, 61, 13.3, 52], ['C', 10, 44, 6, 35, 0, 30], ['L', 0, 20.6]
  ]),
  // Moldura interna, parte de cima (azul-marinho)
  marinho: () => shapeFrom([
    ['M', 31.5, 38.5], ['L', 31.5, 24], ['Q', 31.5, 12, 43.5, 12], ['L', 99.5, 12], ['Q', 100, 12, 100, 16],
    ['L', 100, 39], ['L', 90, 39], ['L', 90, 34], ['Q', 90, 29.5, 86, 29.5], ['Q', 86, 21, 76, 21], ['L', 42, 21],
    ['Q', 32, 21, 32, 31], ['L', 32, 38.5], ['L', 31.5, 38.5]
  ]),
  // Moldura interna, parte de baixo (vermelho virando magenta)
  vermelhoMagenta: () => shapeFrom([
    ['M', 31.5, 39], ['L', 31.5, 100], ['L', 84, 100],
    ['C', 84 + 16 * KAPPA, 100, 100, 84 + 16 * KAPPA, 100, 84], ['L', 100, 39], ['L', 90, 39],
    ['L', 90, 80.5], ['Q', 90, 89.5, 81, 89.5], ['L', 41, 89.5], ['Q', 32, 89.5, 32, 80.5],
    ['L', 32, 39], ['L', 31.5, 39]
  ]),
  // Sombra escura: faixa visível acima do furo
  sombra: () => shapeFrom([
    ['M', 32, 38.5], ['L', 32, 31], ['Q', 32, 21, 42, 21], ['L', 76, 21], ['Q', 86, 21, 86, 29.5],
    ['L', 41, 29.5], ['Q', 32, 29.5, 32, 38.5]
  ]),
  // Filete claro em volta do furo
  filete: () => shapeFrom(roundedRect(31.2, 28.7, 59.6, 61.6, 9.8), [FURO])
};

// Degradê vermelho -> magenta do SVG (#sc-red-magenta), mapeado na caixa da moldura
function createRedMagentaTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0.35 * size, size, size, 0.45 * size);
  gradient.addColorStop(0, COLORS.vermelho);
  gradient.addColorStop(0.55, COLORS.vermelho);
  gradient.addColorStop(0.8, COLORS.magenta);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // UV das tampas da extrusão = coordenadas da cena; caixa da moldura no SVG: x 32..100, y 12..100
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.repeat.set(1 / 68, 1 / 88);
  texture.offset.set((SVG_CENTER - 32) / 68, (100 - SVG_CENTER) / 88);
  return texture;
}

function createPhysicalMaterial(options) {
  return new THREE.MeshPhysicalMaterial({
    roughness: 0.4,
    metalness: 0.05,
    clearcoat: 0.6,
    clearcoatRoughness: 0.12,
    envMapIntensity: 0.55,
    ...options
  });
}

function addPiece(group, shape, extrude, material, z) {
  const geometry = new THREE.ExtrudeGeometry(shape, { curveSegments: 24, bevelEnabled: false, ...extrude });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = z;
  group.add(mesh);
  return mesh;
}

function buildSymbol() {
  const group = new THREE.Group();

  // Placa base ciano
  const baseDepth = 7;
  const baseBevel = 1.2;
  addPiece(group, PIECES.base(),
    { depth: baseDepth, bevelEnabled: true, bevelThickness: baseBevel, bevelSize: 1, bevelSegments: 6 },
    createPhysicalMaterial({ color: COLORS.ciano }), 0);
  const baseFront = baseDepth + baseBevel;

  // Amarelo e verde: lâminas finas sobre a face da placa
  addPiece(group, PIECES.amarelo(), { depth: 0.6 }, createPhysicalMaterial({ color: COLORS.amarelo }), baseFront - 0.3);
  addPiece(group, PIECES.verde(), { depth: 0.6 }, createPhysicalMaterial({ color: COLORS.verde }), baseFront - 0.2);

  // Moldura interna em relevo: a "fita" que fica por cima
  const ribbon = { depth: 3, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.4, bevelSegments: 4 };
  addPiece(group, PIECES.marinho(), ribbon, createPhysicalMaterial({ color: COLORS.marinho }), baseFront);
  addPiece(group, PIECES.vermelhoMagenta(), ribbon,
    createPhysicalMaterial({ color: COLORS.filete, map: createRedMagentaTexture() }), baseFront);

  // Sombra mais baixa que a moldura: degrau descendo para o furo
  addPiece(group, PIECES.sombra(), { depth: 1.2 }, createPhysicalMaterial({ color: COLORS.sombra, roughness: 0.5 }), baseFront);

  // Filete claro forrando a borda do furo
  addPiece(group, PIECES.filete(), { depth: baseFront + 3.6 },
    createPhysicalMaterial({ color: COLORS.filete, transparent: true, opacity: 0.5 }), 0);

  // Centraliza em Z e normaliza a escala (100 unidades do SVG = 2 unidades da cena)
  const box = new THREE.Box3().setFromObject(group);
  const offsetZ = (box.max.z + box.min.z) / 2;
  group.children.forEach((mesh) => { mesh.position.z -= offsetZ; });

  const pivot = new THREE.Group();
  pivot.add(group);
  pivot.scale.setScalar(1 / 50);
  return pivot;
}

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch {
    return false;
  }
}

function renderFallback(container) {
  container.innerHTML = FALLBACK_HTML;
}

function initLogo3D(container) {
  if (!hasWebGL()) {
    renderFallback(container);
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    renderFallback(container);
    return;
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0, 5.4);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
  keyLight.position.set(-3, 4, 5);
  scene.add(keyLight);

  const symbol = buildSymbol();
  scene.add(symbol);

  // Ponteiro normalizado em [-1, 1]
  const pointer = { x: 0, y: 0 };
  const rotation = { x: 0, y: 0 };

  window.addEventListener('pointermove', (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
  });

  function resize() {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  new ResizeObserver(resize).observe(container);
  resize();

  const clock = new THREE.Clock();

  renderer.setAnimationLoop(() => {
    if (reducedMotion.matches) {
      // Pose estática levemente angulada
      symbol.position.y = 0;
      symbol.rotation.set(REST_POSE.x, REST_POSE.y, 0);
    } else {
      const time = clock.getElapsedTime();
      const targetX = THREE.MathUtils.clamp(pointer.y * MAX_TILT, -MAX_TILT, MAX_TILT);
      const targetY = THREE.MathUtils.clamp(pointer.x * MAX_TILT, -MAX_TILT, MAX_TILT);

      rotation.x = THREE.MathUtils.lerp(rotation.x, targetX, 0.06);
      rotation.y = THREE.MathUtils.lerp(rotation.y, targetY, 0.06);

      symbol.position.y = Math.sin(time * 1.2) * 0.06;
      symbol.rotation.x = rotation.x + Math.sin(time * 0.8) * 0.03;
      symbol.rotation.y = rotation.y + Math.sin(time * 0.6) * 0.04;
      symbol.rotation.z = Math.sin(time * 0.5) * 0.015;
    }

    renderer.render(scene, camera);
  });
}

const stage = document.getElementById('logo-3d-stage');

if (stage) {
  initLogo3D(stage);
}
