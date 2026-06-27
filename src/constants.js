export const GW = 800;
export const GH = 450;

export const PLAYER_SPEED = 190;
export const PLAYER_JUMP = -530;
export const PLAYER_HEALTH = 3;
export const INVULN_MS = 1400;
export const ATTACK_MS = 320;
export const ATTACK_COOLDOWN = 550;
export const SKIN_COUNT = 18;
export const SKIN_STORAGE_KEY = 'montePalitoSkin';
export const SKINS = Array.from({ length: SKIN_COUNT }, (_, id) => ({
  id,
  name: `Skin ${id}`,
  enabled: true,
}));
export const SKIN_MENU_ORDER = [0, 1, 4, 5, 6, 7, 9, 10, 12, 11, 8, 13, 14, 15, 16, 17];

SKINS[0].name = 'Martu';
SKINS[1].name = 'Luz';
SKINS[2].enabled = false;
SKINS[3].enabled = false;
SKINS[4].name = 'Wara';
SKINS[5].name = 'Mauri';
SKINS[6].name = 'Ema M.';
SKINS[7].name = 'Anto';
SKINS[8].name = 'Thiago';
SKINS[9].name = 'Alex';
SKINS[10].name = 'Rena';
SKINS[11].name = 'Ema G. L.';
SKINS[12].name = 'Oliver';
SKINS[13].name = 'Gael';
SKINS[14].name = 'Leon';
SKINS[15].name = 'Rodri';
SKINS[16].name = 'Lucio';
SKINS[17].name = 'Bauti';

// Palette
export const C = {
  SKY: [0x87CEEB, 0x5A9EC5, 0x2E6E9A],        // level 1, 2, 3
  MOUNTAIN_FAR: 0xA8C88A,
  MOUNTAIN_MID: 0x7AAF60,
  GROUND: 0x8B5E3C,
  GROUND_TOP: 0x4E8A2A,
  PLATFORM: 0x9A6E44,
  SKIN: 0xFFDBA4,
  EYE: 0x222222,
  HAIR: 0x3D2B1A,
  SHIRT: 0x3F72AF,
  SHORTS: 0x234EA0,
  SHOES: 0x1A1A1A,
  STICK: 0x8B5E3C,
  MACH_Y: 0xF0A500,
  MACH_O: 0xCC8000,
  MACH_G: 0x777777,
  MACH_D: 0x444444,
  MACH_R: 0xCC3300,
  MACH_STRIPE: 0x111111,
  QUEBRACHO_T: 0x6B4226,
  QUEBRACHO_L: 0x2D5016,
  QUEBRACHO_L2: 0x3D7020,
  ALGARROBO_T: 0x7A5230,
  ALGARROBO_L: 0x4E8A2A,
  JARILLA: 0x6A9E30,
  CACTUS: 0x3B7A27,
  GRASS_BLADE: 0x5DBF30,
  HEART: 0xFF3030,
  HEART_E: 0x662020,
  SEED: 0xFFFF44,
  SEED2: 0x88EE44,
  WHITE: 0xFFFFFF,
  BLACK: 0x000000,
  DARK: 0x111111,
};

export const LEVELS = [
  {
    name: 'El Bajo del Monte',
    subtitle: 'Nivel 1',
    bgIdx: 0,
    worldW: 3000,
    platforms: [
      // [x, y, w, h] - ground level
      { x: 0,    y: 400, w: 3000, h: 50 }, // main ground
      // floating platforms
      { x: 300,  y: 320, w: 140, h: 18 },
      { x: 580,  y: 280, w: 120, h: 18 },
      { x: 850,  y: 330, w: 160, h: 18 },
      { x: 1100, y: 260, w: 130, h: 18 },
      { x: 1380, y: 300, w: 150, h: 18 },
      { x: 1650, y: 260, w: 120, h: 18 },
      { x: 1900, y: 320, w: 140, h: 18 },
      { x: 2200, y: 270, w: 130, h: 18 },
      { x: 2500, y: 300, w: 160, h: 18 },
      { x: 2750, y: 250, w: 140, h: 18 },
    ],
    machines: [
      { type: 'excavator', x: 480,  y: 360 }, // primera - visible rápido
      { type: 'bulldozer', x: 1050, y: 360 },
      { type: 'excavator', x: 1700, y: 360 },
      { type: 'bulldozer', x: 2400, y: 360 },
    ],
    plants: [
      // [type, x, y]  type: 'quebracho'|'algarrobo'|'jarilla'|'cactus'
      { type: 'quebracho', x: 180,  y: 390 },
      { type: 'algarrobo', x: 420,  y: 390 },
      { type: 'jarilla',   x: 560,  y: 390 },
      { type: 'quebracho', x: 960,  y: 390 },
      { type: 'cactus',    x: 1080, y: 395 },
      { type: 'algarrobo', x: 1320, y: 390 },
      { type: 'jarilla',   x: 1450, y: 390 },
      { type: 'quebracho', x: 1850, y: 390 },
      { type: 'algarrobo', x: 2050, y: 390 },
      { type: 'cactus',    x: 2400, y: 395 },
      { type: 'quebracho', x: 2650, y: 390 },
      { type: 'jarilla',   x: 2800, y: 390 },
    ],
    animals: [
      { type: 'vizcacha', x: 250,  y: 390 },
      { type: 'bird',     x: 900,  y: 300 },
      { type: 'lizard',   x: 1500, y: 390 },
      { type: 'bird',     x: 2100, y: 310 },
    ],
  },
  {
    name: 'Las Quebradas',
    subtitle: 'Nivel 2',
    bgIdx: 1,
    worldW: 3200,
    platforms: [
      { x: 0,    y: 400, w: 520,  h: 50 },  // start ground
      { x: 560,  y: 385, w: 300,  h: 20 },  // first landing, no machine
      { x: 900,  y: 360, w: 210,  h: 18 },
      { x: 1160, y: 385, w: 400,  h: 20 },
      { x: 1180, y: 305, w: 160,  h: 18 },
      { x: 1620, y: 375, w: 340,  h: 20 },
      { x: 1420, y: 260, w: 130,  h: 18 },
      { x: 2040, y: 350, w: 260,  h: 18 },
      { x: 2380, y: 385, w: 300,  h: 20 },
      { x: 2200, y: 285, w: 150,  h: 18 },
      { x: 2740, y: 365, w: 280,  h: 18 },
      { x: 2860, y: 380, w: 340,  h: 20 },
    ],
    machines: [
      { type: 'bulldozer', x: 1000, y: 350 },
      { type: 'excavator', x: 1360, y: 375 },
      { type: 'bulldozer', x: 1780, y: 365 },
      { type: 'excavator', x: 2520, y: 375 },
    ],
    plants: [
      { type: 'quebracho', x: 150,  y: 390 },
      { type: 'algarrobo', x: 280,  y: 390 },
      { type: 'quebracho', x: 620,  y: 375 },
      { type: 'jarilla',   x: 820,  y: 375 },
      { type: 'quebracho', x: 1060, y: 350 },
      { type: 'cactus',    x: 1250, y: 300 },
      { type: 'algarrobo', x: 1440, y: 375 },
      { type: 'quebracho', x: 1700, y: 365 },
      { type: 'jarilla',   x: 1900, y: 365 },
      { type: 'quebracho', x: 2120, y: 340 },
      { type: 'algarrobo', x: 2280, y: 280 },
      { type: 'quebracho', x: 2560, y: 375 },
      { type: 'cactus',    x: 2820, y: 360 },
      { type: 'quebracho', x: 3050, y: 375 },
    ],
    animals: [
      { type: 'fox',      x: 200,  y: 390 },
      { type: 'bird',     x: 760,  y: 300 },
      { type: 'vizcacha', x: 1240, y: 300 },
      { type: 'lizard',   x: 1720, y: 365 },
      { type: 'bird',     x: 2100, y: 280 },
      { type: 'fox',      x: 2820, y: 360 },
    ],
  },
  {
    name: 'La Cumbre',
    subtitle: 'Nivel 3 · ¡El Final!',
    bgIdx: 2,
    worldW: 2400,
    platforms: [
      { x: 0,    y: 400, w: 360, h: 50 },
      { x: 400,  y: 370, w: 160, h: 18 },
      { x: 620,  y: 330, w: 140, h: 18 },
      { x: 820,  y: 290, w: 130, h: 18 },
      { x: 1010, y: 350, w: 150, h: 18 },
      { x: 1220, y: 300, w: 140, h: 18 },
      { x: 1420, y: 250, w: 120, h: 18 },
      { x: 1600, y: 300, w: 130, h: 18 },
      { x: 1790, y: 240, w: 140, h: 18 },
      { x: 1980, y: 180, w: 150, h: 18 },
      { x: 2180, y: 130, w: 140, h: 18 }, // near top - seed here
    ],
    machines: [
      { type: 'excavator', x: 500,  y: 370 },
      { type: 'bulldozer', x: 950,  y: 370 },
      { type: 'excavator', x: 1350, y: 370 },
      { type: 'bulldozer', x: 1660, y: 290 },
      { type: 'excavator', x: 2040, y: 170 },
    ],
    plants: [
      { type: 'quebracho', x: 120,  y: 390 },
      { type: 'cactus',    x: 240,  y: 390 },
      { type: 'jarilla',   x: 460,  y: 365 },
      { type: 'quebracho', x: 680,  y: 325 },
      { type: 'algarrobo', x: 880,  y: 285 },
      { type: 'jarilla',   x: 1080, y: 345 },
      { type: 'cactus',    x: 1280, y: 295 },
      { type: 'quebracho', x: 1480, y: 245 },
      { type: 'jarilla',   x: 1660, y: 295 },
    ],
    animals: [
      { type: 'condor',  x: 1000, y: 160 },
      { type: 'lizard',  x: 450,  y: 365 },
      { type: 'vizcacha',x: 900,  y: 285 },
    ],
    seedX: 2250,
    seedY: 105,
  },
];
