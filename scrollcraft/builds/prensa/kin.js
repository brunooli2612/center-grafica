// Heidelberg GTO 52 print unit kinematics: cylinders, inking/dampening train, ductor, sheet path and readouts.
// Pure ES module in millimetres. Operator side = +z, y up, x right towards feeder.

// Parameter block holding all press dimensions, angles, ratios, and timings from SPEC §2/§3
export const P = {
  // Cylinders
  cylD: 150,
  cylR: 75,
  cylDist: 150,
  impCenter: [0, 0],
  blaAngleDeg: 117,
  chaAngleDeg: 70,
  gapDeg: 30,
  faceWidth: 520,
  bearerWidth: 15,
  chapaThickness: 0.15,
  chapaLeadMargin: 35,
  undercutChapa: 0.03,
  blanquetaThickness: 1.9,
  undercutBlanqueta: 3.0,
  squeezeMin: 0.10,
  squeezeMax: 0.15,

  // Rollers diameters & radii
  mfD: 55,
  mfR: 27.5,
  mbD: 71,
  mbR: 35.5,
  t1D: 49,
  t1R: 24.5,
  t2D: 45,
  t2R: 22.5,
  diD: 70,
  diR: 35,
  ttD: 60,
  ttR: 30,
  duD: 40,
  duR: 20,

  // Contact angles
  mfContactAngleDeg: 15,
  mbContactAngleDeg: -25,
  t1ContactAngleDeg: 62,
  t2ContactAngleDeg: 100,

  // Distributor DI & TT geometry
  ttDistFromDI: 111,
  ttAngleDeg: 125,

  // Ductor motion
  ductorStroke: 6,
  ductorRevs: 2,
  ductorCycleDeg: 720,
  ductorDwellTTDeg: 240,
  ductorTravelToDIDeg: 120,
  ductorDwellDIDeg: 240,
  ductorTravelToTTDeg: 120,

  // Oscillator DI
  oscAmp: 8,
  oscRevs: 4,
  oscPeriodDeg: 1440,

  // Speed ratios
  mbSurfaceRatio: 0.40,
  ttSurfaceRatio: 1 / 20,

  // Sheet & print specifications
  sheetLength: 360,
  sheetWidth: 520,
  sheetThickness: 0.5,
  sheetMin: [105, 180],
  sheetMax: [360, 520],
  printAreaMax: [340, 505],
  // grab at 75° (top), release at 180° (left side), then down to the delivery; entrada+wrap+saida = 360 so s = R·θ
  wrapDeg: 105,
  entradaDeg: 80,
  saidaDeg: 175,
  gripperMargin: 10, // [E] mm of sheet held by the gripper, unprinted
  infeedAngleDeg: 75,

  // Speeds
  speedMinSph: 3000,
  speedMaxSph: 8000,
  nominalSph: 8000,
  nominalRpm: 8000 / 60,

  // Gripper timing
  gripperTransitionDeg: 15,

  // Units, directions, normalization, and math constants
  dirCCW: 1,
  dirCW: -1,
  ratioUnity: 1,
  normalDeg: 90,
  revDeg: 360,
  speedThresholdRpmSph: 500,
  hoursToMinutes: 60,
  metersToMm: 1000,
  degToRad: Math.PI / 180,
  radToDeg: 180 / Math.PI,
  twoPi: 2 * Math.PI,
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
};

// Helper: cubic smoothstep using parameter constants
const smoothstep = (t) => t * t * (P.three - P.two * t);

// 3 Cylinders: IMP (0,0), BLA at 117° from IMP, CHA at 70° from BLA
const impC = [P.impCenter[0], P.impCenter[1]];
const blaC = [
  impC[0] + P.cylDist * Math.cos(P.blaAngleDeg * P.degToRad),
  impC[1] + P.cylDist * Math.sin(P.blaAngleDeg * P.degToRad),
];
const chaC = [
  blaC[0] + P.cylDist * Math.cos(P.chaAngleDeg * P.degToRad),
  blaC[1] + P.cylDist * Math.sin(P.chaAngleDeg * P.degToRad),
];

const IMP = { id: 'IMP', r: P.cylR, c: impC, dir: P.dirCCW, ratio: P.ratioUnity };
const BLA = { id: 'BLA', r: P.cylR, c: blaC, dir: P.dirCW, ratio: P.ratioUnity };
const CHA = { id: 'CHA', r: P.cylR, c: chaC, dir: P.dirCCW, ratio: P.ratioUnity };

export const CYL = [IMP, BLA, CHA];
CYL.IMP = IMP;
CYL.BLA = BLA;
CYL.CHA = CHA;

// Dampening train: MF tangent to CHA at 15°, MB tangent to MF at -25°
const mfC = [
  chaC[0] + (P.cylR + P.mfR) * Math.cos(P.mfContactAngleDeg * P.degToRad),
  chaC[1] + (P.cylR + P.mfR) * Math.sin(P.mfContactAngleDeg * P.degToRad),
];
const MF = { id: 'MF', r: P.mfR, c: mfC, dir: P.dirCW, ratio: P.cylD / P.mfD };

const mbC = [
  mfC[0] + (P.mfR + P.mbR) * Math.cos(P.mbContactAngleDeg * P.degToRad),
  mfC[1] + (P.mfR + P.mbR) * Math.sin(P.mbContactAngleDeg * P.degToRad),
];
const MB = { id: 'MB', r: P.mbR, c: mbC, dir: P.dirCCW, ratio: P.mbSurfaceRatio * (P.cylD / P.mbD) };

// Inking train: T1 at 62°, T2 at 100° from CHA center
const t1C = [
  chaC[0] + (P.cylR + P.t1R) * Math.cos(P.t1ContactAngleDeg * P.degToRad),
  chaC[1] + (P.cylR + P.t1R) * Math.sin(P.t1ContactAngleDeg * P.degToRad),
];
const T1 = { id: 'T1', r: P.t1R, c: t1C, dir: P.dirCW, ratio: P.cylD / P.t1D };

const t2C = [
  chaC[0] + (P.cylR + P.t2R) * Math.cos(P.t2ContactAngleDeg * P.degToRad),
  chaC[1] + (P.cylR + P.t2R) * Math.sin(P.t2ContactAngleDeg * P.degToRad),
];
const T2 = { id: 'T2', r: P.t2R, c: t2C, dir: P.dirCW, ratio: P.cylD / P.t2D };

// DI: circle intersection tangent to T1 and T2 on the outer side away from CHA
const r1 = P.t1R + P.diR;
const r2 = P.t2R + P.diR;
const dx = t2C[0] - t1C[0];
const dy = t2C[1] - t1C[1];
const d12 = Math.hypot(dx, dy);
const aTri = (r1 * r1 - r2 * r2 + d12 * d12) / (P.two * d12);
const hTri = Math.sqrt(Math.max(P.zero, r1 * r1 - aTri * aTri));
const xm = t1C[0] + (aTri * dx) / d12;
const ym = t1C[1] + (aTri * dy) / d12;
const diSol1 = [xm + (hTri * dy) / d12, ym - (hTri * dx) / d12];
const diSol2 = [xm - (hTri * dy) / d12, ym + (hTri * dx) / d12];
const distCHA1 = Math.hypot(diSol1[0] - chaC[0], diSol1[1] - chaC[1]);
const distCHA2 = Math.hypot(diSol2[0] - chaC[0], diSol2[1] - chaC[1]);
const diC = distCHA1 > distCHA2 ? diSol1 : diSol2;
const DI = { id: 'DI', r: P.diR, c: diC, dir: P.dirCCW, ratio: P.cylD / P.diD };

// Ink fountain roller TT
const ttC = [
  diC[0] + P.ttDistFromDI * Math.cos(P.ttAngleDeg * P.degToRad),
  diC[1] + P.ttDistFromDI * Math.sin(P.ttAngleDeg * P.degToRad),
];
const TT = { id: 'TT', r: P.ttR, c: ttC, dir: P.dirCCW, ratio: P.ttSurfaceRatio * (P.cylD / P.ttD) };

// Ductor DU: nominal center at DI contact (pos 1)
const duNominalC = [
  diC[0] + (P.diR + P.duR) * Math.cos(P.ttAngleDeg * P.degToRad),
  diC[1] + (P.diR + P.duR) * Math.sin(P.ttAngleDeg * P.degToRad),
];
const DU = { id: 'DU', r: P.duR, c: duNominalC, dir: P.dirCW, ratio: P.cylD / P.duD };

export const ROLLERS = [MF, MB, T1, T2, DI, TT, DU];
ROLLERS.MF = MF;
ROLLERS.MB = MB;
ROLLERS.T1 = T1;
ROLLERS.T2 = T2;
ROLLERS.DI = DI;
ROLLERS.TT = TT;
ROLLERS.DU = DU;

/** Angle of cylinder or roller in degrees, sign indicating direction */
export function angleOf(id, th) {
  const key = String(id).toUpperCase();
  const body = CYL[key] || ROLLERS[key] || CYL.find((b) => b.id === key) || ROLLERS.find((b) => b.id === key);
  if (!body) throw new Error(`Unknown body id: ${id}`);
  return body.dir * body.ratio * th;
}

/** Axial oscillating displacement of DI distributor in millimetres */
export function oscZ(th) {
  return P.oscAmp * Math.sin((th * P.twoPi) / P.oscPeriodDeg);
}

/** Ductor roller state: position 0 (at TT) to 1 (at DI), contact status and centre position */
export function ductor(th) {
  const phi = ((th % P.ductorCycleDeg) + P.ductorCycleDeg) % P.ductorCycleDeg;
  let pos = P.zero;
  let contact = null;

  const t1 = P.ductorDwellTTDeg;
  const t2 = t1 + P.ductorTravelToDIDeg;
  const t3 = t2 + P.ductorDwellDIDeg;

  if (phi <= t1) {
    pos = P.zero;
    contact = 'TT';
  } else if (phi < t2) {
    const t = (phi - t1) / P.ductorTravelToDIDeg;
    pos = smoothstep(t);
    contact = null;
  } else if (phi <= t3) {
    pos = P.one;
    contact = 'DI';
  } else {
    const t = (phi - t3) / P.ductorTravelToTTDeg;
    pos = P.one - smoothstep(t);
    contact = null;
  }

  const ux = Math.cos(P.ttAngleDeg * P.degToRad);
  const uy = Math.sin(P.ttAngleDeg * P.degToRad);
  const distFromDI = (P.diR + P.duR) + (P.one - pos) * P.ductorStroke;
  const c = [diC[0] + distFromDI * ux, diC[1] + distFromDI * uy];

  return { pos, contact, c };
}

/** Sheet state along feed, impression wrap and delivery path */
export function sheet(th) {
  const index = Math.floor(th / P.revDeg);
  const degInRev = ((th % P.revDeg) + P.revDeg) % P.revDeg;

  const lIn = P.cylR * (P.entradaDeg * P.degToRad);
  const lWrap = P.cylR * (P.wrapDeg * P.degToRad);
  const lOut = P.cylR * (P.saidaDeg * P.degToRad);
  const lTotal = lIn + lWrap + lOut;

  const s = degInRev * (lTotal / P.revDeg);

  let phase;
  if (s < lIn) {
    phase = 'entrada';
  } else if (s <= lIn + lWrap) {
    phase = 'enrolada';
  } else {
    phase = 'saida';
  }

  const inAngle = P.infeedAngleDeg;
  const pIn = [
    P.cylR * Math.cos(inAngle * P.degToRad),
    P.cylR * Math.sin(inAngle * P.degToRad),
  ];
  const tIn = [
    -Math.sin(inAngle * P.degToRad),
    Math.cos(inAngle * P.degToRad),
  ];

  let point;
  let tangent;

  if (phase === 'entrada') {
    const rem = lIn - s;
    point = [pIn[0] - rem * tIn[0], pIn[1] - rem * tIn[1]];
    tangent = inAngle + P.normalDeg;
  } else if (phase === 'enrolada') {
    const sArc = s - lIn;
    const alpha = inAngle + (sArc / P.cylR) * P.radToDeg;
    point = [
      P.cylR * Math.cos(alpha * P.degToRad),
      P.cylR * Math.sin(alpha * P.degToRad),
    ];
    tangent = alpha + P.normalDeg;
  } else {
    const exitAngle = inAngle + P.wrapDeg;
    const pOut = [
      P.cylR * Math.cos(exitAngle * P.degToRad),
      P.cylR * Math.sin(exitAngle * P.degToRad),
    ];
    const tOut = [
      -Math.sin(exitAngle * P.degToRad),
      Math.cos(exitAngle * P.degToRad),
    ];
    const sOut = s - (lIn + lWrap);
    point = [pOut[0] + sOut * tOut[0], pOut[1] + sOut * tOut[1]];
    tangent = (exitAngle + P.normalDeg) % P.revDeg;
  }

  const sNip = lIn + P.cylR * ((P.blaAngleDeg - inAngle) * P.degToRad);
  let printed = P.zero;
  if (s >= sNip) {
    printed = Math.min(P.one, (s - sNip) / P.sheetLength);
  }

  return {
    index,
    s,
    phase,
    printed,
    point,
    tangent,
  };
}

/** Impression cylinder gripper opening 0 (closed holding sheet) to 1 (open) */
export function gripper(th) {
  const deg = ((th % P.revDeg) + P.revDeg) % P.revDeg;
  const grab = P.entradaDeg;
  const release = P.entradaDeg + P.wrapDeg;
  const trans = P.gripperTransitionDeg;

  if (deg < grab - trans) {
    return P.one;
  } else if (deg <= grab) {
    const t = (deg - (grab - trans)) / trans;
    return P.one - smoothstep(t);
  } else if (deg <= release) {
    return P.zero;
  } else if (deg < release + trans) {
    const t = (deg - release) / trans;
    return smoothstep(t);
  } else {
    return P.one;
  }
}

/** Production and dynamic readouts from current press speed */
export function readouts(th, speed = P.nominalSph) {
  const sph = speed > P.speedThresholdRpmSph ? speed : speed * P.hoursToMinutes;
  const rpm = sph / P.hoursToMinutes;
  const surface = (rpm * Math.PI * (P.cylD / P.metersToMm)) / P.hoursToMinutes;
  const rollerRpm = {};
  for (const r of ROLLERS) {
    rollerRpm[r.id] = rpm * r.ratio;
  }
  const sheetsCounted = Math.floor(th / P.revDeg);
  const squeezeRange = [P.squeezeMin, P.squeezeMax];

  return {
    sph,
    rpm,
    surface,
    'surface m/s': surface,
    surfaceSpeed: surface,
    rollerRpm,
    sheetsCounted,
    'sheets counted': sheetsCounted,
    sheets: sheetsCounted,
    squeezeRange,
    'squeeze range': squeezeRange,
    squeeze: squeezeRange,
  };
}

// Image phase. A body point at local angle a0 sits at world angle a0 + angleOf(id, th). The sheet's leading edge
// reaches the BLA-IMP nip at a fixed rev phase; walking back along the surfaces (equal radii, equal surface speed)
// gives where the image's leading edge lives on each cylinder, so plate, blanket and sheet always meet in register.
const mod360 = (a) => ((a % P.revDeg) + P.revDeg) % P.revDeg;
const NIP = {
  IMP_BLA: {IMP: P.blaAngleDeg, BLA: P.blaAngleDeg + P.revDeg / P.two},
  BLA_CHA: {BLA: P.chaAngleDeg, CHA: P.chaAngleDeg + P.revDeg / P.two},
};
// rev phase (deg of CHA) when the image's leading edge is at the BLA-IMP nip
const marginDeg = (P.gripperMargin / P.cylR) * P.radToDeg;
const thAtImpNip = P.entradaDeg + (P.blaAngleDeg - P.infeedAngleDeg) + marginDeg;
// the blanket carries the point CW from the plate nip to the impression nip
const blaTravel = mod360(NIP.BLA_CHA.BLA - NIP.IMP_BLA.BLA);
const thAtChaNip = thAtImpNip - blaTravel;
/** local angle (at th = 0) of the image's leading edge on each cylinder, plus the phases where it crosses each nip */
export const IMAGE = {
  IMP: mod360(NIP.IMP_BLA.IMP - angleOf('IMP', thAtImpNip)),
  BLA: mod360(NIP.IMP_BLA.BLA - angleOf('BLA', thAtImpNip)),
  CHA: mod360(NIP.BLA_CHA.CHA - angleOf('CHA', thAtChaNip)),
  thAtImpNip,
  thAtChaNip,
  NIP,
};
/** local angle (at th = 0) of the IMP gripper bar: it sits at the grab point when the sheet arrives */
export const GRIPPER_A0 = mod360(P.infeedAngleDeg - angleOf('IMP', P.entradaDeg));
/** world angle of a body's local point a0 at th */
export const worldAngle = (id, a0, th) => mod360(a0 + angleOf(id, th));
