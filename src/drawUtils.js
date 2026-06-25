import { C } from './constants.js';

// ─── helpers ──────────────────────────────────────────────────────────────────

function g(scene) {
  return scene.make.graphics({ x: 0, y: 0, add: false });
}

// ─── PALITO (stick figure 32×56) ─────────────────────────────────────────────
// poses: idle | walk1 | walk2 | jump | attack1 | attack2
export function makePalito(scene) {
  const W = 32, H = 56;
  const poses = ['idle', 'walk1', 'walk2', 'jump', 'attack1', 'attack2'];

  for (const pose of poses) {
    const gr = g(scene);
    const cx = W / 2;

    // HEAD
    gr.fillStyle(C.SKIN, 1);
    gr.fillCircle(cx, 9, 8);
    gr.lineStyle(2, C.DARK, 1);
    gr.strokeCircle(cx, 9, 8);

    // Eyes
    gr.fillStyle(C.EYE, 1);
    gr.fillRect(cx - 4, 7, 3, 3);
    gr.fillRect(cx + 2, 7, 3, 3);

    // Smile
    gr.lineStyle(1.5, C.EYE, 1);
    gr.beginPath();
    gr.arc(cx, 11, 4, 0.1, Math.PI - 0.1, false);
    gr.strokePath();

    // Hair tuft
    gr.lineStyle(2.5, C.HAIR, 1);
    gr.lineBetween(cx - 2, 1, cx - 4, -3);
    gr.lineBetween(cx + 1, 1, cx + 3, -3);

    // BODY
    gr.lineStyle(3, C.DARK, 1);
    const bodyTop = 17, bodyBot = 37;
    gr.lineBetween(cx, bodyTop, cx, bodyBot);

    // ARM / LEG angles by pose
    let lax, lay, rax, ray; // left/right arm end
    let llx, lly, rlx, rly; // left/right leg end
    let stickEnd = null;     // tip of stick

    const sY = bodyTop + 8; // shoulder y
    const hY = bodyBot;      // hip y

    switch (pose) {
      case 'idle':
        lax = cx - 10; lay = sY + 12;
        rax = cx + 12; ray = sY + 10;
        stickEnd = { x: rax + 10, y: ray + 14 };
        llx = cx - 8;  lly = H;
        rlx = cx + 8;  rly = H;
        break;
      case 'walk1':
        lax = cx - 12; lay = sY + 8;
        rax = cx + 10; ray = sY + 14;
        stickEnd = { x: rax + 9, y: ray + 13 };
        llx = cx - 12; lly = H - 2;
        rlx = cx + 5;  rly = H;
        break;
      case 'walk2':
        lax = cx - 9;  lay = sY + 13;
        rax = cx + 13; ray = sY + 7;
        stickEnd = { x: rax + 10, y: ray + 12 };
        llx = cx - 5;  lly = H;
        rlx = cx + 12; rly = H - 2;
        break;
      case 'jump':
        lax = cx - 12; lay = sY + 5;
        rax = cx + 13; ray = sY + 5;
        stickEnd = { x: rax + 12, y: ray + 8 };
        llx = cx - 12; lly = H - 6;
        rlx = cx + 12; rly = H - 6;
        break;
      case 'attack1':
        // Stick raised and swinging
        lax = cx - 10; lay = sY + 14;
        rax = cx + 10; ray = sY - 2;
        stickEnd = { x: rax + 18, y: ray - 16 };
        llx = cx - 7;  lly = H;
        rlx = cx + 8;  rly = H;
        break;
      case 'attack2':
        lax = cx - 10; lay = sY + 14;
        rax = cx + 14; ray = sY + 4;
        stickEnd = { x: rax + 16, y: ray + 6 };
        llx = cx - 8;  lly = H;
        rlx = cx + 8;  rly = H;
        break;
    }

    // Draw arms
    gr.lineStyle(2.5, C.DARK, 1);
    gr.lineBetween(cx, sY, lax, lay);
    gr.lineBetween(cx, sY, rax, ray);

    // Stick in right hand
    if (stickEnd) {
      gr.lineStyle(3.5, C.STICK, 1);
      gr.lineBetween(rax, ray, stickEnd.x, stickEnd.y);
    }

    // Legs
    gr.lineStyle(3, C.DARK, 1);
    gr.lineBetween(cx, hY, llx, lly);
    gr.lineBetween(cx, hY, rlx, rly);

    // Shoes (small thick lines at feet)
    gr.lineStyle(4, C.SHOES, 1);
    gr.lineBetween(llx - 3, lly, llx + 4, lly);
    gr.lineBetween(rlx - 3, rly, rlx + 4, rly);

    gr.generateTexture(`palito_${pose}`, W, H);
    gr.destroy();
  }
}

// ─── EXCAVATOR (80×56) ────────────────────────────────────────────────────────
export function makeExcavator(scene) {
  const W = 80, H = 56;

  for (const phase of ['idle', 'move1', 'move2', 'hit']) {
    const gr = g(scene);
    const tint = phase === 'hit' ? 0xFF6666 : C.MACH_Y;

    // Tracks
    gr.fillStyle(C.MACH_G, 1);
    gr.fillRoundedRect(4, 38, 72, 16, 6);
    gr.fillStyle(C.MACH_D, 1);
    gr.fillRect(6, 40, 68, 4); // track top

    // Wheels
    gr.fillStyle(C.MACH_D, 1);
    for (let wx of [10, 28, 46, 64]) {
      gr.fillCircle(wx, 48, 6);
    }
    gr.fillStyle(C.MACH_G, 1);
    for (let wx of [10, 28, 46, 64]) {
      gr.fillCircle(wx, 48, 3);
    }

    // Body
    gr.fillStyle(tint, 1);
    gr.fillRoundedRect(6, 18, 60, 24, 4);
    gr.lineStyle(2, C.MACH_O, 1);
    gr.strokeRoundedRect(6, 18, 60, 24, 4);

    // Black hazard stripes on body
    gr.lineStyle(3, C.MACH_STRIPE, 0.4);
    for (let sx = 8; sx < 64; sx += 10) {
      gr.lineBetween(sx, 18, sx - 8, 42);
    }

    // Cab
    gr.fillStyle(tint, 1);
    gr.fillRoundedRect(14, 4, 36, 18, 3);
    gr.lineStyle(1.5, C.MACH_O, 1);
    gr.strokeRoundedRect(14, 4, 36, 18, 3);

    // Cab window
    gr.fillStyle(0xADD8E6, 0.8);
    gr.fillRoundedRect(18, 7, 28, 12, 2);
    gr.lineStyle(1.5, C.MACH_D, 1);
    gr.strokeRoundedRect(18, 7, 28, 12, 2);

    // Arm (excavator) - position varies by phase
    const armAngle = phase === 'move1' ? 0.2 : (phase === 'move2' ? -0.15 : 0);
    const armBaseX = 64, armBaseY = 20;
    const armLen = 22;
    const armEndX = armBaseX + armLen * Math.cos(armAngle);
    const armEndY = armBaseY + armLen * Math.sin(armAngle + 0.3);

    gr.lineStyle(5, C.MACH_O, 1);
    gr.lineBetween(armBaseX, armBaseY, armEndX, armEndY);

    // Bucket at end of arm
    gr.fillStyle(C.MACH_G, 1);
    gr.fillTriangle(
      armEndX - 6, armEndY,
      armEndX + 8, armEndY,
      armEndX + 2, armEndY + 10
    );
    gr.lineStyle(2, C.MACH_D, 1);
    gr.strokeTriangle(
      armEndX - 6, armEndY,
      armEndX + 8, armEndY,
      armEndX + 2, armEndY + 10
    );

    // Exhaust pipe
    gr.fillStyle(C.MACH_D, 1);
    gr.fillRect(12, 2, 5, 8);
    if (phase !== 'idle') {
      // smoke puff
      gr.fillStyle(0x999999, 0.5);
      gr.fillCircle(14, -1, 4);
      gr.fillCircle(17, -4, 3);
    }

    gr.generateTexture(`excavator_${phase}`, W, H);
    gr.destroy();
  }
}

// ─── BULLDOZER (80×52) ────────────────────────────────────────────────────────
export function makeBulldozer(scene) {
  const W = 84, H = 52;

  for (const phase of ['idle', 'move1', 'move2', 'hit']) {
    const gr = g(scene);
    const tint = phase === 'hit' ? 0xFF6666 : C.MACH_Y;

    // Blade (front, left side)
    const bladeX = phase === 'move1' ? 1 : (phase === 'move2' ? 0 : 2);
    gr.fillStyle(C.MACH_G, 1);
    gr.fillRect(bladeX, 14, 10, 26);
    gr.lineStyle(2.5, C.MACH_D, 1);
    gr.strokeRect(bladeX, 14, 10, 26);
    // blade teeth
    gr.lineStyle(2, C.MACH_D, 1);
    for (let ty = 17; ty < 38; ty += 7) {
      gr.lineBetween(bladeX, ty, bladeX - 3, ty + 3);
    }

    // Tracks
    gr.fillStyle(C.MACH_G, 1);
    gr.fillRoundedRect(10, 34, 70, 16, 6);
    gr.fillStyle(C.MACH_D, 1);
    gr.fillRect(12, 36, 66, 4);

    // Wheels
    gr.fillStyle(C.MACH_D, 1);
    for (let wx of [16, 32, 48, 64, 72]) {
      gr.fillCircle(wx, 44, 6);
    }
    gr.fillStyle(C.MACH_G, 1);
    for (let wx of [16, 32, 48, 64, 72]) {
      gr.fillCircle(wx, 44, 3);
    }

    // Body
    gr.fillStyle(tint, 1);
    gr.fillRoundedRect(12, 16, 64, 22, 4);
    gr.lineStyle(2, C.MACH_O, 1);
    gr.strokeRoundedRect(12, 16, 64, 22, 4);

    // Hazard stripes
    gr.lineStyle(3, C.MACH_STRIPE, 0.35);
    for (let sx = 14; sx < 74; sx += 10) {
      gr.lineBetween(sx, 16, sx - 8, 38);
    }

    // Cab
    gr.fillStyle(tint, 1);
    gr.fillRoundedRect(30, 2, 38, 18, 3);
    gr.lineStyle(1.5, C.MACH_O, 1);
    gr.strokeRoundedRect(30, 2, 38, 18, 3);

    // Window
    gr.fillStyle(0xADD8E6, 0.8);
    gr.fillRoundedRect(34, 5, 30, 12, 2);
    gr.lineStyle(1.5, C.MACH_D, 1);
    gr.strokeRoundedRect(34, 5, 30, 12, 2);

    // Exhaust
    gr.fillStyle(C.MACH_D, 1);
    gr.fillRect(66, 0, 5, 8);
    if (phase !== 'idle') {
      gr.fillStyle(0x888888, 0.5);
      gr.fillCircle(68, -2, 4);
    }

    gr.generateTexture(`bulldozer_${phase}`, W, H);
    gr.destroy();
  }
}

// ─── PLANTS ───────────────────────────────────────────────────────────────────
export function makePlants(scene) {
  // Quebracho blanco del monte serrano: copa irregular, abierta y baja.
  for (const state of ['full', 'wilted', 'stump']) {
    const gr = g(scene);
    const alpha = state === 'wilted' ? 0.5 : 1;

    gr.fillStyle(C.QUEBRACHO_T, 1);
    gr.fillRoundedRect(23, state === 'stump' ? 58 : 40, 10, 40, 3);

    if (state === 'stump') {
      gr.lineStyle(2, C.MACH_D, 1);
      gr.strokeRect(20, 56, 16, 24);
    } else {
      gr.lineStyle(3, C.QUEBRACHO_T, 1);
      gr.lineBetween(28, 48, 14, 30);
      gr.lineBetween(28, 46, 42, 28);
      gr.lineBetween(28, 42, 28, 18);

      gr.fillStyle(C.QUEBRACHO_L, alpha);
      gr.fillEllipse(28, 24, 46, 32);
      gr.fillEllipse(13, 34, 26, 24);
      gr.fillEllipse(43, 34, 26, 24);
      gr.fillStyle(C.QUEBRACHO_L2, alpha);
      gr.fillEllipse(20, 18, 24, 18);
      gr.fillEllipse(37, 18, 24, 18);
      gr.fillEllipse(28, 38, 34, 18);

      if (state === 'wilted') {
        gr.fillStyle(0x9B8B40, 0.7);
        gr.fillEllipse(28, 34, 42, 22);
      }
    }
    gr.generateTexture(`quebracho_${state}`, 56, 80);
    gr.destroy();
  }

  // Algarrobo: copa ancha y sombra de árbol del monte, no conífera.
  for (const state of ['full', 'wilted', 'stump']) {
    const gr = g(scene);
    gr.fillStyle(C.ALGARROBO_T, 1);
    gr.fillRoundedRect(19, state === 'stump' ? 52 : 36, 10, 34, 3);

    if (state !== 'stump') {
      const alpha = state === 'wilted' ? 0.5 : 1;
      gr.lineStyle(2.5, C.ALGARROBO_T, 1);
      gr.lineBetween(24, 42, 10, 30);
      gr.lineBetween(24, 40, 38, 28);
      gr.lineBetween(24, 38, 24, 18);

      gr.fillStyle(C.ALGARROBO_L, alpha);
      gr.fillEllipse(24, 27, 42, 28);
      gr.fillEllipse(10, 35, 20, 18);
      gr.fillEllipse(38, 35, 20, 18);
      gr.fillEllipse(24, 40, 30, 16);
      gr.fillStyle(0x6FA83A, alpha);
      gr.fillEllipse(17, 23, 18, 12);
      gr.fillEllipse(34, 24, 18, 12);
      if (state === 'wilted') {
        gr.fillStyle(0x9B8840, 0.6);
        gr.fillEllipse(24, 34, 34, 18);
      }
    } else {
      gr.lineStyle(2, C.MACH_D, 1);
      gr.strokeRect(16, 50, 16, 20);
    }
    gr.generateTexture(`algarrobo_${state}`, 48, 70);
    gr.destroy();
  }

  // Jarilla 30×40
  for (const state of ['full', 'wilted']) {
    const gr = g(scene);
    const alpha = state === 'wilted' ? 0.5 : 1;
    gr.fillStyle(C.JARILLA, alpha);
    gr.fillCircle(15, 16, 14);
    gr.fillCircle(7, 24, 9);
    gr.fillCircle(23, 24, 9);
    gr.fillStyle(C.ALGARROBO_T, 1);
    gr.fillRect(13, 28, 4, 12);
    if (state === 'wilted') {
      gr.fillStyle(0xA08030, 0.6);
      gr.fillCircle(15, 20, 10);
    }
    gr.generateTexture(`jarilla_${state}`, 30, 40);
    gr.destroy();
  }

  // Cactus 24×52
  for (const state of ['full', 'wilted']) {
    const gr = g(scene);
    const alpha = state === 'wilted' ? 0.6 : 1;
    gr.fillStyle(C.CACTUS, alpha);
    // Main trunk
    gr.fillRoundedRect(8, 16, 8, 36, 4);
    // Arms
    gr.fillRoundedRect(0, 24, 8, 6, 3);
    gr.fillRoundedRect(16, 30, 8, 6, 3);
    gr.fillRoundedRect(1, 18, 6, 12, 3);
    gr.fillRoundedRect(17, 24, 6, 12, 3);
    // Spines
    gr.lineStyle(1, 0xFFFFAA, 1);
    for (let sy = 18; sy < 48; sy += 8) {
      gr.lineBetween(8, sy, 4, sy - 3);
      gr.lineBetween(16, sy, 20, sy - 3);
    }
    // Top flower
    gr.fillStyle(0xFF8888, alpha);
    gr.fillCircle(12, 14, 6);
    gr.fillStyle(0xFFEE44, alpha);
    gr.fillCircle(12, 14, 3);
    if (state === 'wilted') {
      gr.fillStyle(0x907020, 0.5);
      gr.fillRoundedRect(9, 10, 6, 40, 3);
    }
    gr.generateTexture(`cactus_${state}`, 24, 52);
    gr.destroy();
  }
}

// ─── ANIMALS ──────────────────────────────────────────────────────────────────
export function makeAnimals(scene) {
  // Vizcacha 32×22
  for (const pose of ['idle', 'hop']) {
    const gr = g(scene);
    gr.fillStyle(0xB8965A, 1);
    // Body
    gr.fillEllipse(16, 14, 28, 16);
    // Head
    gr.fillEllipse(28, 10, 14, 12);
    // Ear (long!)
    gr.fillStyle(0xD4A870, 1);
    gr.fillRect(30, 0, 5, pose === 'hop' ? 10 : 14);
    gr.fillRect(26, 1, 4, pose === 'hop' ? 8 : 12);
    // Eye
    gr.fillStyle(C.EYE, 1);
    gr.fillCircle(31, 9, 2);
    // Tail
    gr.fillStyle(0x888888, 1);
    gr.fillEllipse(3, 13, 8, 6);
    // Legs
    gr.fillStyle(0xC09060, 1);
    const legY = pose === 'hop' ? 18 : 20;
    gr.fillRect(8, legY, 5, pose === 'hop' ? 6 : 4);
    gr.fillRect(15, legY, 5, pose === 'hop' ? 6 : 4);
    gr.fillRect(22, legY, 5, pose === 'hop' ? 6 : 4);
    gr.generateTexture(`vizcacha_${pose}`, 32, 22);
    gr.destroy();
  }

  // Bird 24×18
  for (const pose of ['fly1', 'fly2']) {
    const gr = g(scene);
    gr.fillStyle(0xFF6B35, 1);
    gr.fillEllipse(12, 10, 16, 10);
    gr.fillStyle(0x222222, 1);
    gr.fillEllipse(20, 8, 8, 7);
    gr.fillStyle(0xFFCC00, 1);
    gr.fillTriangle(22, 8, 26, 7, 22, 10);
    gr.fillStyle(C.EYE, 1);
    gr.fillCircle(21, 7, 1.5);
    // Wings
    gr.fillStyle(0xFF8C55, 1);
    if (pose === 'fly1') {
      gr.fillEllipse(12, 4, 20, 8);
    } else {
      gr.fillEllipse(12, 14, 20, 8);
    }
    gr.generateTexture(`bird_${pose}`, 28, 18);
    gr.destroy();
  }

  // Lizard 28×14
  for (const pose of ['idle', 'walk']) {
    const gr = g(scene);
    gr.fillStyle(0x4E7A3E, 1);
    gr.fillEllipse(14, 8, 22, 10);
    // Head
    gr.fillStyle(0x3D6130, 1);
    gr.fillEllipse(24, 7, 10, 8);
    gr.fillStyle(0xFFCC00, 1);
    gr.fillCircle(26, 6, 2);
    gr.fillStyle(C.EYE, 1);
    gr.fillCircle(26, 6, 1);
    // Tail
    gr.fillStyle(0x4E7A3E, 1);
    gr.fillTriangle(3, 8, 10, 5, 10, 11);
    // Legs
    gr.fillStyle(0x3D6130, 1);
    const lx = pose === 'walk' ? 1 : 0;
    gr.fillRect(8 + lx, 11, 4, 4);
    gr.fillRect(16 - lx, 11, 4, 4);
    gr.fillRect(10 + lx, 12, 3, 4);
    gr.fillRect(18 - lx, 12, 3, 4);
    gr.generateTexture(`lizard_${pose}`, 28, 16);
    gr.destroy();
  }

  // Fox 36×26
  for (const pose of ['idle', 'walk']) {
    const gr = g(scene);
    gr.fillStyle(0xD4601A, 1);
    gr.fillEllipse(16, 16, 28, 18);
    // Head
    gr.fillEllipse(30, 12, 16, 14);
    // Snout
    gr.fillStyle(0xF5C285, 1);
    gr.fillEllipse(35, 14, 8, 6);
    gr.fillStyle(C.EYE, 1);
    gr.fillCircle(32, 10, 2);
    gr.fillStyle(0x111111, 1);
    gr.fillCircle(35, 14, 1.5);
    // Ears
    gr.fillStyle(0xD4601A, 1);
    gr.fillTriangle(27, 4, 30, 6, 25, 8);
    gr.fillTriangle(33, 3, 36, 6, 31, 7);
    gr.fillStyle(0xFF8844, 1);
    gr.fillTriangle(28, 5, 30, 6, 26, 8);
    // Tail
    gr.fillStyle(0xE87030, 1);
    gr.fillEllipse(3, 14, 12, 8);
    gr.fillStyle(0xFFFFFF, 1);
    gr.fillCircle(2, 15, 4);
    // Legs
    gr.fillStyle(0xAA4400, 1);
    const lx = pose === 'walk' ? 2 : 0;
    gr.fillRect(8 + lx, 22, 5, 5);
    gr.fillRect(14 - lx, 22, 5, 5);
    gr.fillRect(20 + lx, 22, 5, 5);
    gr.generateTexture(`fox_${pose}`, 40, 28);
    gr.destroy();
  }

  // Condor 48×28 - majestic!
  for (const pose of ['glide1', 'glide2']) {
    const gr = g(scene);
    // Body
    gr.fillStyle(0x111111, 1);
    gr.fillEllipse(24, 16, 24, 14);
    // White collar
    gr.fillStyle(0xEEEEEE, 1);
    gr.fillEllipse(24, 10, 12, 8);
    // Head (red!)
    gr.fillStyle(0xCC3322, 1);
    gr.fillCircle(32, 8, 6);
    gr.fillStyle(0xEE4433, 1);
    gr.fillCircle(30, 7, 4);
    gr.fillStyle(0xFFBB44, 1);
    gr.fillTriangle(36, 8, 40, 7, 36, 10);
    gr.fillStyle(C.EYE, 1);
    gr.fillCircle(32, 7, 1.5);
    // Wings
    gr.fillStyle(0x222222, 1);
    if (pose === 'glide1') {
      gr.fillEllipse(24, 6, 48, 12);
      // Wing tips
      gr.fillStyle(0x333333, 1);
      gr.fillTriangle(0, 8, 8, 4, 4, 14);
      gr.fillTriangle(48, 8, 40, 4, 44, 14);
    } else {
      gr.fillEllipse(24, 20, 48, 10);
      gr.fillStyle(0x333333, 1);
      gr.fillTriangle(0, 18, 8, 22, 4, 14);
      gr.fillTriangle(48, 18, 40, 22, 44, 14);
    }
    gr.generateTexture(`condor_${pose}`, 48, 28);
    gr.destroy();
  }
}

// ─── UI ELEMENTS ──────────────────────────────────────────────────────────────
export function makeUI(scene) {
  // Heart full 20×18
  const hf = g(scene);
  hf.fillStyle(C.HEART, 1);
  hf.fillCircle(6, 6, 6);
  hf.fillCircle(14, 6, 6);
  hf.fillTriangle(0, 8, 20, 8, 10, 18);
  hf.lineStyle(1.5, 0xCC0000, 1);
  hf.strokeCircle(6, 6, 6);
  hf.strokeCircle(14, 6, 6);
  hf.generateTexture('heart_full', 20, 20);
  hf.destroy();

  // Heart empty
  const he = g(scene);
  he.lineStyle(2, C.HEART_E, 1);
  he.strokeCircle(6, 6, 6);
  he.strokeCircle(14, 6, 6);
  he.strokeTriangle(0, 8, 20, 8, 10, 18);
  he.generateTexture('heart_empty', 20, 20);
  he.destroy();

  // Seed (glowing) 24×24
  const sd = g(scene);
  sd.fillStyle(0xFFFF88, 0.3);
  sd.fillCircle(12, 12, 12);
  sd.fillStyle(C.SEED2, 1);
  sd.fillCircle(12, 12, 8);
  sd.fillStyle(C.SEED, 1);
  sd.fillCircle(12, 12, 5);
  sd.lineStyle(2, 0xAAFF44, 1);
  sd.strokeCircle(12, 12, 8);
  // leaf detail
  sd.fillStyle(0xAAFF44, 1);
  sd.fillEllipse(12, 6, 6, 4);
  sd.generateTexture('seed', 24, 24);
  sd.destroy();

  // Star particle 8×8
  const st = g(scene);
  st.fillStyle(0xFFFF44, 1);
  // Draw a simple diamond/star shape with triangles
  st.fillTriangle(4, 0, 2, 4, 6, 4);  // top
  st.fillTriangle(4, 8, 2, 4, 6, 4);  // bottom
  st.fillTriangle(0, 4, 4, 2, 4, 6);  // left
  st.fillTriangle(8, 4, 4, 2, 4, 6);  // right
  st.generateTexture('star', 8, 8);
  st.destroy();

  // Dust/explosion particle 6×6
  const dp = g(scene);
  dp.fillStyle(0xF0A500, 1);
  dp.fillCircle(3, 3, 3);
  dp.generateTexture('dust', 6, 6);
  dp.destroy();

  // Árboles nativos del monte cordobés para WinScene (copa redondeada, estilo quebracho/algarrobo)
  for (let size = 1; size <= 5; size++) {
    const tw = size * 22, th = size * 30;
    const cx = tw / 2;
    const tr = g(scene);

    // Tronco (quebracho: tronco robusto y corto)
    const trunkW = size * 4;
    const trunkH = size * 9;
    tr.fillStyle(0x7A5230, 1);
    tr.fillRect(cx - trunkW / 2, th - trunkH, trunkW, trunkH);

    // Copa principal - círculo grande (algarrobo/quebracho tienen copa redondeada)
    const crownR = size * 8;
    const crownY = th - trunkH - crownR * 0.7;
    tr.fillStyle(0x2D5016, 1);
    tr.fillCircle(cx, crownY, crownR);

    // Copa secundaria - círculos irregulares para textura
    tr.fillStyle(0x3D7020, 1);
    tr.fillCircle(cx - size * 4, crownY + size * 2, crownR * 0.65);
    tr.fillCircle(cx + size * 5, crownY + size * 1, crownR * 0.6);
    tr.fillCircle(cx - size * 2, crownY - size * 4, crownR * 0.55);
    tr.fillCircle(cx + size * 3, crownY - size * 3, crownR * 0.5);

    // Highlight - copa más clara arriba
    tr.fillStyle(0x4E8A2A, 1);
    tr.fillCircle(cx - size, crownY - size * 2, crownR * 0.45);

    tr.generateTexture(`tree_${size}`, tw, th);
    tr.destroy();
  }
}

// ─── BACKGROUND ELEMENTS ─────────────────────────────────────────────────────
export function makeBackground(scene) {
  // Mountain shapes
  for (const [key, w, h, col1, col2] of [
    ['mountain_far', 200, 100, C.MOUNTAIN_FAR, 0xC0D8C0],
    ['mountain_mid', 160, 80, C.MOUNTAIN_MID, 0x9AC09A],
  ]) {
    const gr = g(scene);
    gr.fillStyle(col1, 1);
    gr.fillTriangle(w / 2, 0, 0, h, w, h);
    gr.fillStyle(col2, 0.4);
    gr.fillTriangle(w / 2 + 20, 10, w / 2 - 20, 10, w / 2, 0);
    gr.generateTexture(key, w, h);
    gr.destroy();
  }

  // Ground tile 32×16
  const gnd = g(scene);
  gnd.fillStyle(C.GROUND, 1);
  gnd.fillRect(0, 4, 32, 12);
  gnd.fillStyle(C.GROUND_TOP, 1);
  gnd.fillRect(0, 0, 32, 6);
  // grass blades
  gnd.lineStyle(2, C.GRASS_BLADE, 1);
  for (let bx = 3; bx < 30; bx += 7) {
    gnd.lineBetween(bx, 4, bx - 2, -1);
    gnd.lineBetween(bx + 3, 4, bx + 5, -2);
  }
  gnd.generateTexture('ground_tile', 32, 16);
  gnd.destroy();

  // Platform tile 32×18
  const plt = g(scene);
  plt.fillStyle(C.PLATFORM, 1);
  plt.fillRect(0, 0, 32, 18);
  plt.fillStyle(C.GROUND_TOP, 1);
  plt.fillRect(0, 0, 32, 5);
  plt.lineStyle(1, 0x7A4E2A, 0.5);
  plt.lineBetween(0, 10, 32, 10);
  plt.generateTexture('platform_tile', 32, 18);
  plt.destroy();

  // Sky gradient 800×450 (we'll draw it in scene directly)
}
