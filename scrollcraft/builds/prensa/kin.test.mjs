import test from 'node:test';
import assert from 'node:assert/strict';
import {
  P,
  CYL,
  ROLLERS,
  angleOf,
  oscZ,
  ductor,
  sheet,
  gripper,
  readouts,
} from './kin.js';

const d2r = Math.PI / 180;
const dist = (p1, p2) => Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);

// Lookup helpers for cylinders and rollers
const getBody = (id) => {
  const c = CYL.find?.((b) => b.id === id) || CYL[id];
  if (c) return c;
  const r = ROLLERS.find?.((b) => b.id === id) || ROLLERS[id];
  if (r) return r;
  throw new Error(`Unknown body id: ${id}`);
};

test('1. Every pair in contact centre distance equals r1+r2 within 0.01 mm', () => {
  const contactPairs = [
    ['IMP', 'BLA'],
    ['BLA', 'CHA'],
    ['CHA', 'MF'],
    ['MF', 'MB'],
    ['CHA', 'T1'],
    ['CHA', 'T2'],
    ['T1', 'DI'],
    ['T2', 'DI'],
  ];

  for (const [idA, idB] of contactPairs) {
    const a = getBody(idA);
    const b = getBody(idB);
    const d = dist(a.c, b.c);
    const target = a.r + b.r;
    assert(
      Math.abs(d - target) <= 0.01,
      `Contact pair ${idA}<->${idB} distance ${d} != expected ${target}`
    );
  }

  // DU at pos 1 touches DI exactly
  const dDI = ductor(360); // In DI dwell (pos 1)
  assert.equal(dDI.pos, 1);
  assert.equal(dDI.contact, 'DI');
  const di = getBody('DI');
  const duR = P.duR || P.duD / 2;
  const distToDI = dist(dDI.c, di.c);
  assert(
    Math.abs(distToDI - (di.r + duR)) <= 0.01,
    `DU at pos 1 distance to DI ${distToDI} != expected ${di.r + duR}`
  );

  // DU at pos 0 touches TT exactly
  const dTT = ductor(0); // In TT dwell (pos 0)
  assert.equal(dTT.pos, 0);
  assert.equal(dTT.contact, 'TT');
  const tt = getBody('TT');
  const distToTT = dist(dTT.c, tt.c);
  assert(
    Math.abs(distToTT - (tt.r + duR)) <= 0.01,
    `DU at pos 0 distance to TT ${distToTT} != expected ${tt.r + duR}`
  );
});

test('2. The 3 cylinders centre distance equals 150 mm', () => {
  const imp = getBody('IMP');
  const bla = getBody('BLA');
  const cha = getBody('CHA');

  const dImpBla = dist(imp.c, bla.c);
  const dBlaCha = dist(bla.c, cha.c);

  assert(
    Math.abs(dImpBla - 150) <= 0.01,
    `IMP<->BLA distance ${dImpBla} != 150`
  );
  assert(
    Math.abs(dBlaCha - 150) <= 0.01,
    `BLA<->CHA distance ${dBlaCha} != 150`
  );
});

test('3. No non-contact pair overlaps (distance >= r1+r2 - 0.01 mm)', () => {
  const staticBodies = [
    getBody('IMP'),
    getBody('BLA'),
    getBody('CHA'),
    getBody('MF'),
    getBody('MB'),
    getBody('T1'),
    getBody('T2'),
    getBody('DI'),
    getBody('TT'),
  ];

  const contactSet = new Set([
    'IMP:BLA', 'BLA:IMP',
    'BLA:CHA', 'CHA:BLA',
    'CHA:MF', 'MF:CHA',
    'MF:MB', 'MB:MF',
    'CHA:T1', 'T1:CHA',
    'CHA:T2', 'T2:CHA',
    'T1:DI', 'DI:T1',
    'T2:DI', 'DI:T2',
  ]);

  // Check static bodies pairs
  for (let i = 0; i < staticBodies.length; i++) {
    for (let j = i + 1; j < staticBodies.length; j++) {
      const a = staticBodies[i];
      const b = staticBodies[j];
      const key = `${a.id}:${b.id}`;
      if (contactSet.has(key)) continue;

      const d = dist(a.c, b.c);
      const minAllowed = a.r + b.r;
      assert(
        d >= minAllowed - 0.01,
        `Overlap between non-contact pair ${a.id} and ${b.id}: dist ${d} < min ${minAllowed}`
      );
    }
  }

  // Check DU across entire travel range against CHA, IMP, BLA, MF, MB, T1, T2
  const duR = P.duR || P.duD / 2;
  for (let th = 0; th < 720; th += 5) {
    const dState = ductor(th);
    for (const b of staticBodies) {
      if (b.id === 'DI' || b.id === 'TT') continue; // Handled separately
      const d = dist(dState.c, b.c);
      const minAllowed = duR + b.r;
      assert(
        d >= minAllowed - 0.01,
        `DU at th=${th} overlaps ${b.id}: dist ${d} < min ${minAllowed}`
      );
    }
  }
});

test('4. DU never touches TT and DI simultaneously; at pos 0/1 touches exactly one', () => {
  const di = getBody('DI');
  const tt = getBody('TT');
  const duR = P.duR || P.duD / 2;

  let sawPos0 = false;
  let sawPos1 = false;

  for (let th = 0; th < 720; th += 1) {
    const dState = ductor(th);
    const dDI = dist(dState.c, di.c);
    const dTT = dist(dState.c, tt.c);
    const touchDI = Math.abs(dDI - (di.r + duR)) <= 1e-5;
    const touchTT = Math.abs(dTT - (tt.r + duR)) <= 1e-5;

    // Never both at the same time
    assert(
      !(touchDI && touchTT),
      `DU touches both DI and TT at th=${th}`
    );

    if (dState.pos === 0) {
      sawPos0 = true;
      assert.equal(dState.contact, 'TT');
      assert(touchTT, `At pos 0, DU should touch TT`);
      assert(!touchDI, `At pos 0, DU should not touch DI`);
      assert(dDI >= di.r + duR + P.ductorStroke - 1e-5);
    } else if (dState.pos === 1) {
      sawPos1 = true;
      assert.equal(dState.contact, 'DI');
      assert(touchDI, `At pos 1, DU should touch DI`);
      assert(!touchTT, `At pos 1, DU should not touch TT`);
      assert(dTT >= tt.r + duR + P.ductorStroke - 1e-5);
    } else {
      assert.equal(dState.contact, null);
      assert(dDI > di.r + duR, `Between dwells, DU distance to DI should be > sum of radii`);
      assert(dTT > tt.r + duR, `Between dwells, DU distance to TT should be > sum of radii`);
    }
  }

  assert(sawPos0, 'Should have encountered pos 0 during 720° cycle');
  assert(sawPos1, 'Should have encountered pos 1 during 720° cycle');
});

test('5. Equal surface speed at each rigid contact', () => {
  const rigidContacts = [
    ['CHA', 'BLA'],
    ['BLA', 'IMP'],
    ['CHA', 'MF'],
    ['CHA', 'T1'],
    ['CHA', 'T2'],
    ['T1', 'DI'],
    ['T2', 'DI'],
  ];

  for (const [idA, idB] of rigidContacts) {
    const a = getBody(idA);
    const b = getBody(idB);
    const speedA = Math.abs(a.ratio * a.r);
    const speedB = Math.abs(b.ratio * b.r);
    assert(
      Math.abs(speedA - speedB) <= 0.001,
      `Surface speed mismatch between ${idA} (${speedA}) and ${idB} (${speedB})`
    );
  }
});

test('6. 8000 sph <-> 133.33 rpm <-> 1.047 m/s (±0.001)', () => {
  const roFromSph = readouts(0, 8000);
  assert.equal(roFromSph.sph, 8000);
  assert(
    Math.abs(roFromSph.rpm - 133.333) <= 0.01,
    `RPM ${roFromSph.rpm} not within 0.01 of 133.33`
  );
  const surf = roFromSph.surface ?? roFromSph['surface m/s'] ?? roFromSph.surfaceSpeed;
  assert(
    Math.abs(surf - 1.047) <= 0.001,
    `Surface speed ${surf} m/s not within 0.001 of 1.047`
  );

  const roFromRpm = readouts(0, 133.33333333333334);
  assert(Math.abs(roFromRpm.sph - 8000) <= 0.1);
  const surf2 = roFromRpm.surface ?? roFromRpm['surface m/s'] ?? roFromRpm.surfaceSpeed;
  assert(Math.abs(surf2 - 1.047) <= 0.001);
});

test('7. Alternating directions at every contact', () => {
  const contacts = [
    ['IMP', 'BLA'],
    ['BLA', 'CHA'],
    ['CHA', 'MF'],
    ['MF', 'MB'],
    ['CHA', 'T1'],
    ['CHA', 'T2'],
    ['T1', 'DI'],
    ['T2', 'DI'],
  ];

  for (const [idA, idB] of contacts) {
    const a = getBody(idA);
    const b = getBody(idB);
    assert.equal(
      a.dir * b.dir,
      -1,
      `Contact ${idA} and ${idB} should have alternating directions (got ${a.dir} and ${b.dir})`
    );
  }

  // DU at DI has dir opposite to DI (+1 -> -1)
  const di = getBody('DI');
  const du = getBody('DU');
  assert.equal(di.dir * du.dir, -1);

  // TT is +1, DU is -1
  const tt = getBody('TT');
  assert.equal(tt.dir * du.dir, -1);
});

test('8. Sheet s continuous within revolution (step 0.1°, max jump < 1 mm); index increments per 360°', () => {
  let prevS = null;
  for (let th = 0; th < 360; th = +(th + 0.1).toFixed(1)) {
    const sh = sheet(th);
    assert.equal(sh.index, 0);
    assert(typeof sh.s === 'number');
    assert(sh.phase === 'entrada' || sh.phase === 'enrolada' || sh.phase === 'saida');
    if (prevS !== null) {
      const delta = sh.s - prevS;
      assert(delta >= 0, `Sheet s should be non-decreasing (th=${th}, delta=${delta})`);
      assert(delta < 1.0, `Sheet s jump ${delta} mm exceeds 1 mm at th=${th}`);
    }
    prevS = sh.s;
  }

  // Check index increments once per 360°
  assert.equal(sheet(0).index, 0);
  assert.equal(sheet(359.9).index, 0);
  assert.equal(sheet(360).index, 1);
  assert.equal(sheet(719.9).index, 1);
  assert.equal(sheet(720).index, 2);
});

test('9. Printed is monotonic within a revolution', () => {
  let prevPrinted = -1;
  for (let th = 0; th < 360; th = +(th + 0.1).toFixed(1)) {
    const sh = sheet(th);
    assert(typeof sh.printed === 'number');
    assert(sh.printed >= 0 && sh.printed <= 1, `printed ${sh.printed} out of [0, 1] range`);
    assert(
      sh.printed >= prevPrinted - 1e-9,
      `printed should be monotonic at th=${th}: ${sh.printed} < ${prevPrinted}`
    );
    prevPrinted = sh.printed;
  }
});

test('10. angleOf(th + 360*k) consistent for cylinders', () => {
  const cylIds = ['IMP', 'BLA', 'CHA'];
  const testAngles = [0, 45, 90, 180, 270, 315];
  const testK = [1, 2, 5, 10];

  for (const id of cylIds) {
    for (const th of testAngles) {
      const baseAngle = angleOf(id, th);
      for (const k of testK) {
        const steppedAngle = angleOf(id, th + 360 * k);
        const diff = Math.abs((steppedAngle - baseAngle) % 360);
        const normDiff = Math.min(diff, 360 - diff);
        assert(
          normDiff <= 1e-5,
          `angleOf(${id}, ${th} + 360*${k}) not consistent: base ${baseAngle}, stepped ${steppedAngle}`
        );
      }
    }
  }
});

// --- added in review (Claude) ---
import {IMAGE, GRIPPER_A0, worldAngle, gripper as grip, sheet as sh, P as PP} from './kin.js';
const near = (a, b, tol = 0.01) => Math.abs(((a - b + 540) % 360) - 180) < tol;

test('11. Image in register: plate→blanket nip and blanket→impression nip', () => {
  const tc = IMAGE.thAtChaNip, ti = IMAGE.thAtImpNip;
  assert.ok(near(worldAngle('CHA', IMAGE.CHA, tc), IMAGE.NIP.BLA_CHA.CHA), 'plate image at plate nip');
  assert.ok(near(worldAngle('BLA', IMAGE.BLA, tc), IMAGE.NIP.BLA_CHA.BLA), 'blanket image at plate nip');
  assert.ok(near(worldAngle('BLA', IMAGE.BLA, ti), IMAGE.NIP.IMP_BLA.BLA), 'blanket image at imp nip');
  assert.ok(near(worldAngle('IMP', IMAGE.IMP, ti), IMAGE.NIP.IMP_BLA.IMP), 'imp image at imp nip');
  for (const k of [1, 7]) assert.ok(near(worldAngle('CHA', IMAGE.CHA, tc + 360 * k), IMAGE.NIP.BLA_CHA.CHA), 'periodic');
});

test('12. Sheet image starts printing exactly when its image edge reaches the nip', () => {
  const s0 = sh(IMAGE.thAtImpNip - 0.5), s1 = sh(IMAGE.thAtImpNip + 5);
  assert.ok(s1.printed > 0, 'printing after nip');
  // sheet point at the nip = leading edge minus gripper margin
  const lead = sh(IMAGE.thAtImpNip);
  const a = Math.atan2(lead.point[1], lead.point[0]) * 180 / Math.PI;
  const marginDeg = PP.gripperMargin / PP.cylR * 180 / Math.PI;
  assert.ok(near(a - marginDeg, PP.blaAngleDeg, 0.05), `lead edge ${a}`);
});

test('13. Gripper closed exactly while the sheet is wrapped, and rides at the grab point on arrival', () => {
  assert.ok(near(worldAngle('IMP', GRIPPER_A0, PP.entradaDeg), PP.infeedAngleDeg));
  assert.ok(near(worldAngle('IMP', GRIPPER_A0, PP.entradaDeg + PP.wrapDeg), PP.infeedAngleDeg + PP.wrapDeg));
  for (let d = PP.entradaDeg + 1; d < PP.entradaDeg + PP.wrapDeg; d += 1) {
    assert.equal(grip(d), 0, `closed at ${d}`);
    assert.equal(sh(d).phase, 'enrolada');
  }
});

test('14. Sheet leaves on the left side (x < 0) and away from the feeder', () => {
  const r = sh(PP.entradaDeg + PP.wrapDeg + 30);
  assert.equal(r.phase, 'saida');
  assert.ok(r.point[0] < 0, `exit x ${r.point[0]}`);
  const e = sh(10);
  assert.ok(e.point[0] > 0, 'infeed from the right');
});
