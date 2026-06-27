import { GW, GH, SKINS, SKIN_MENU_ORDER } from "../constants.js";
import { spawnSpriteBurst } from "../effects.js";

const CREDITS = [
  { label: "Un juego de:", value: "Grupo 4 · 5ºB" },
  { label: "Jugadores:", value: "Toda la banda de Palitos" },
  { label: "Temática:", value: "El desmonte del monte cordobés" },
  { label: "Escuela:", value: "Domingo F. Sarmiento · Villa Los Aromos" },
  { label: "Evento:", value: "Feria de Ciencias 2026" },
  { label: "", value: "" },
  { label: "🌳", value: "¡El monte vive gracias a vos!" },
  { label: "🌿", value: "Protejamos el monte nativo cordobés" },
];

export default class WinScene extends Phaser.Scene {
  constructor() {
    super("WinScene");
    this.treeSize = 0;
    this.maxTreeSize = 5;
  }

  create() {
    this.cameras.main.fadeIn(800);

    // Beautiful sky background
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x2a6aaa, 0x2a6aaa, 0x87ceeb, 0x87ceeb, 1);
    sky.fillRect(0, 0, GW, GH);

    // Stars
    const stars = this.add.graphics();
    stars.fillStyle(0xffffff, 0.7);
    for (let i = 0; i < 60; i++) {
      stars.fillCircle(
        Math.random() * GW,
        Math.random() * GH * 0.6,
        Math.random() * 1.8 + 0.3,
      );
    }

    // Ground
    const gnd = this.add.graphics();
    gnd.fillStyle(0x2d5016, 1);
    gnd.fillRect(0, GH - 60, GW, 60);
    gnd.fillStyle(0x4e8a2a, 1);
    gnd.fillRect(0, GH - 64, GW, 8);

    // Surrounding trees (from side)
    for (let i = 1; i <= 5; i++) {
      const tkey = `tree_${Math.min(i, 5)}`;
      this.add
        .image(i * 60 - 20, GH - 60, tkey)
        .setOrigin(0.5, 1)
        .setAlpha(0.7);
      this.add
        .image(GW - i * 60 + 20, GH - 60, tkey)
        .setOrigin(0.5, 1)
        .setAlpha(0.7);
    }

    // THE GREAT TREE - animated growth
    this.treeSize = 0;
    this.treeGfx = this.add.graphics().setDepth(10);
    this.drawGreatTree(0);

    this.treeSparkles = this.time.addEvent({
      delay: 150,
      callback: () =>
        spawnSpriteBurst(this, GW / 2, GH - 100, "star", {
          count: 2,
          speed: 80,
          duration: 1200,
          depth: 15,
          angleMin: -150,
          angleMax: -30,
          scaleMin: 0.45,
          scaleMax: 1,
          tints: [0x88ff44, 0xffff44, 0x44ff88, 0xffee88],
        }),
      loop: true,
    });

    // Condor flying!
    this.condor = this.add
      .sprite(100, 80, "condor_glide1")
      .setDepth(20)
      .setScale(1.5);
    this.play && this.condor.play("condor_glide");

    // Grow the tree over time
    this.time.addEvent({
      delay: 400,
      callback: this.growTree,
      callbackScope: this,
      repeat: this.maxTreeSize - 1,
    });

    // Animals appearing
    this.time.delayedCall(1500, () => this.spawnAnimals());
    this.time.delayedCall(1900, () => this.spawnPalitoDance());

    // Title text
    this.time.delayedCall(600, () => {
      const titleShadow = this.add
        .text(GW / 2 + 3, GH / 2 - 130 + 3, "🌳 ¡EL MONTE RENACIÓ! 🌳", {
          fontSize: "30px",
          fontFamily: "'Fredoka One', 'Comic Sans MS', cursive",
          fill: "#1A3A0A",
        })
        .setOrigin(0.5)
        .setDepth(25)
        .setAlpha(0.5);

      const title = this.add
        .text(GW / 2, GH / 2 - 130, "🌳 ¡EL MONTE RENACIÓ! 🌳", {
          fontSize: "30px",
          fontFamily: "'Fredoka One', 'Comic Sans MS', cursive",
          fill: "#88FF44",
          stroke: "#1A4A0A",
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(25)
        .setAlpha(0);

      this.tweens.add({
        targets: [title, titleShadow],
        alpha: { from: 0, to: 1 },
        y: "-=10",
        duration: 800,
        ease: "Back.easeOut",
      });

      this.tweens.add({
        targets: title,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        delay: 800,
      });
    });

    // Subtitle
    this.time.delayedCall(1200, () => {
      this.add
        .text(
          GW / 2,
          GH / 2 - 90,
          "¡Gracias a Palito, el bosque volvió a crecer!",
          {
            fontSize: "14px",
            fontFamily: "'Fredoka One', 'Comic Sans MS', cursive",
            fill: "#CCFF88",
            stroke: "#1A4A0A",
            strokeThickness: 2,
          },
        )
        .setOrigin(0.5)
        .setDepth(25);
    });

    // Credits panel
    this.time.delayedCall(2800, () => this.showCredits());

    // Play again button
    this.time.delayedCall(4000, () => this.showPlayAgain());

    // Condor wanders across screen
    this.tweens.add({
      targets: this.condor,
      x: GW - 80,
      y: 110,
      duration: 8000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  // Gran Quebracho Blanco — copa redondeada e irregular, autóctono del monte cordobés
  drawGreatTree(size) {
    this.treeGfx.clear();
    if (size <= 0) return;

    const cx = GW / 2;
    const base = GH - 62;
    const h = size * 55;
    const trunkH = h * 0.38;
    const trunkW = size * 14;

    // Tronco robusto con corteza texturada (quebracho = madera muy dura)
    this.treeGfx.fillStyle(0x7a5230, 1);
    this.treeGfx.fillRect(cx - trunkW / 2, base - trunkH, trunkW, trunkH);

    // Corteza — rayas diagonales características del quebracho
    this.treeGfx.lineStyle(2, 0x5a3818, 0.6);
    for (let ly = base - trunkH + 6; ly < base - 4; ly += 10) {
      this.treeGfx.lineBetween(
        cx - trunkW / 2 + 3,
        ly,
        cx + trunkW / 2 - 3,
        ly + 7,
      );
    }

    // Copa: círculos irregulares apilados — forma de quebracho blanco/algarrobo
    // (nada de triángulos, eso son pinos europeos)
    const crowns = [
      // [offsetX, offsetY desde base del tronco, radio, color]
      { ox: 0, oy: trunkH + h * 0.1, r: h * 0.28, c: 0x2d5016 },
      { ox: -h * 0.12, oy: trunkH + h * 0.22, r: h * 0.22, c: 0x2d5016 },
      { ox: h * 0.13, oy: trunkH + h * 0.2, r: h * 0.21, c: 0x3d6b24 },
      { ox: -h * 0.07, oy: trunkH + h * 0.36, r: h * 0.18, c: 0x3d7020 },
      { ox: h * 0.1, oy: trunkH + h * 0.38, r: h * 0.16, c: 0x4e8a2a },
    ];

    for (const crown of crowns.slice(0, size)) {
      const cy = base - crown.oy;
      this.treeGfx.fillStyle(crown.c, 1);
      this.treeGfx.fillCircle(cx + crown.ox, cy, crown.r);
    }

    // Highlights — luz solar en la parte superior de la copa
    if (size >= 2) {
      this.treeGfx.fillStyle(0x5d9e34, 0.7);
      this.treeGfx.fillCircle(
        cx - h * 0.05,
        base - trunkH - h * 0.18,
        h * 0.14,
      );
    }
    if (size >= 3) {
      this.treeGfx.fillStyle(0x6ec040, 0.5);
      this.treeGfx.fillCircle(cx + h * 0.06, base - trunkH - h * 0.28, h * 0.1);
    }

    // Ramas visibles que asoman de la copa (característica del quebracho)
    if (size >= 3) {
      this.treeGfx.lineStyle(size * 2.5, 0x6b4226, 1);
      this.treeGfx.lineBetween(
        cx,
        base - trunkH,
        cx - h * 0.18,
        base - trunkH - h * 0.15,
      );
      this.treeGfx.lineBetween(
        cx,
        base - trunkH,
        cx + h * 0.15,
        base - trunkH - h * 0.12,
      );
    }

    // Resplandor mágico cuando está completamente crecido
    if (size >= this.maxTreeSize) {
      const topY = base - trunkH - h * 0.42;
      this.treeGfx.fillStyle(0xffff88, 0.18);
      this.treeGfx.fillCircle(cx, topY, h * 0.36);
      this.treeGfx.fillStyle(0xaaff44, 0.25);
      this.treeGfx.fillCircle(cx, topY, h * 0.22);
    }
  }

  growTree() {
    this.treeSize = Math.min(this.treeSize + 1, this.maxTreeSize);
    this.drawGreatTree(this.treeSize);

    // Shake camera
    this.cameras.main.shake(200, 0.008);

    spawnSpriteBurst(this, GW / 2, GH - 200, "star", {
      count: 10,
      speed: 160,
      duration: 700,
      depth: 20,
      angleMin: -180,
      angleMax: 0,
      scaleMin: 0.55,
      scaleMax: 1,
      tints: [0x88ff44, 0xffff44, 0xffee00],
    });
  }

  spawnAnimals() {
    const types = ["vizcacha", "lizard", "bird", "fox"];
    const positions = [80, 180, GW - 100, GW - 200, GW / 2 - 100, GW / 2 + 80];

    types.forEach((type, i) => {
      const x = positions[i % positions.length];
      const isFlying = type === "bird";
      const y = isFlying ? GH - 180 - Math.random() * 80 : GH - 65;

      const a = this.add
        .sprite(
          x,
          y,
          `${type}_idle` in this.textures.list
            ? `${type}_idle`
            : `${type}_fly1`,
        )
        .setDepth(18)
        .setScale(1.2);

      const animKey =
        type === "vizcacha"
          ? "vizcacha_hop"
          : type === "bird"
            ? "bird_fly"
            : type === "lizard"
              ? "lizard_walk"
              : "fox_walk";

      a.play(animKey, true);
      a.setAlpha(0);

      this.tweens.add({
        targets: a,
        alpha: 1,
        delay: i * 300,
        duration: 400,
      });
    });

    // Condor passes over
    this.add
      .sprite(-60, 80, "condor_glide1")
      .setDepth(20)
      .setScale(1.5)
      .play("condor_glide");
  }

  spawnPalitoDance() {
    const skins = SKIN_MENU_ORDER.map((id) => SKINS[id]).filter(
      (skin) => skin?.enabled,
    );
    const cols = 8;
    const startX = 48;
    const gapX = (GW - startX * 2) / (cols - 1);
    const rowsY = [GH - 118, GH - 70];

    skins.forEach((skin, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * gapX;
      const y = rowsY[row] ?? rowsY[rowsY.length - 1];

      const dancer = this.add.container(x, y).setDepth(34 + row);
      const body = this.add
        .sprite(0, 0, "palito_idle")
        .setScale(0.82)
        .play("palito_walk");
      const cover = this.add.circle(0, -20, 9, 0xffdba4, 1);
      const face = this.add
        .image(0, -20, `skin_${String(skin.id).padStart(2, "0")}`)
        .setScale(0.15);
      const name = this.add
        .text(0, 26, skin.name, {
          fontSize: "9px",
          fontFamily: "'Fredoka', 'Comic Sans MS', cursive",
          fill: "#FFFFFF",
          stroke: "#174A0A",
          strokeThickness: 2,
        })
        .setOrigin(0.5);

      dancer.add([body, cover, face, name]);
      dancer.setAlpha(0);

      this.tweens.add({
        targets: dancer,
        alpha: 1,
        y: y - 12,
        duration: 450,
        delay: i * 70,
        ease: "Back.easeOut",
      });

      this.tweens.add({
        targets: dancer,
        y: y - 24,
        angle: col % 2 === 0 ? -7 : 7,
        duration: 360,
        yoyo: true,
        repeat: -1,
        delay: i * 45,
        ease: "Sine.easeInOut",
      });

      this.tweens.add({
        targets: dancer,
        scaleX: col % 2 === 0 ? 1.08 : 0.92,
        duration: 360,
        yoyo: true,
        repeat: -1,
        delay: i * 45,
        ease: "Sine.easeInOut",
      });
    });

    this.time.addEvent({
      delay: 700,
      callback: () => {
        const x = Phaser.Math.Between(40, GW - 40);
        const y = Phaser.Math.Between(GH - 150, GH - 55);
        spawnSpriteBurst(this, x, y, "star", {
          count: 5,
          speed: 110,
          duration: 650,
          depth: 38,
          scaleMin: 0.45,
          scaleMax: 0.85,
          tints: [0xffff44, 0x88ff44, 0xff88ee, 0x44ffff],
        });
      },
      loop: true,
    });
  }

  showCredits() {
    const panel = this.add.graphics().setDepth(28);
    panel.fillStyle(0x0a1a0a, 0.88);
    panel.fillRoundedRect(GW / 2 - 230, GH - 230, 460, 175, 10);
    panel.lineStyle(2, 0x4e8a2a, 1);
    panel.strokeRoundedRect(GW / 2 - 230, GH - 230, 460, 175, 10);

    this.add
      .text(GW / 2, GH - 215, "── CRÉDITOS ──", {
        fontSize: "13px",
        fontFamily: "'Fredoka', 'Courier New', monospace",
        fill: "#4E8A2A",
      })
      .setOrigin(0.5)
      .setDepth(29);

    let row = 0;
    for (const credit of CREDITS) {
      if (!credit.label && !credit.value) {
        row++;
        continue;
      }
      const y = GH - 196 + row * 18;

      if (credit.label) {
        this.add
          .text(GW / 2 - 115, y, credit.label, {
            fontSize: "12px",
            fontFamily: "'Fredoka', 'Courier New', monospace",
            fill: "#88AA44",
          })
          .setOrigin(0, 0.5)
          .setDepth(29);
      }

      this.add
        .text(GW / 2 + 10, y, credit.value, {
          fontSize: "12px",
          fontFamily: "'Fredoka One', 'Comic Sans MS', cursive",
          fill: "#CCFF88",
        })
        .setOrigin(0, 0.5)
        .setDepth(29);

      row++;
    }
  }

  showPlayAgain() {
    const btnBg = this.add.graphics().setDepth(30);
    btnBg.fillStyle(0x3d9e2a, 1);
    btnBg.fillRoundedRect(GW / 2 - 100, 20, 200, 44, 10);
    btnBg.lineStyle(2, 0xffffff, 1);
    btnBg.strokeRoundedRect(GW / 2 - 100, 20, 200, 44, 10);

    const btnText = this.add
      .text(GW / 2, 43, "▶ Jugar de nuevo", {
        fontSize: "16px",
        fontFamily: "'Fredoka One', 'Comic Sans MS', cursive",
        fill: "#FFFFFF",
      })
      .setOrigin(0.5)
      .setDepth(31);

    const zone = this.add
      .zone(GW / 2, 43, 200, 44)
      .setInteractive()
      .setDepth(32);

    zone.on("pointerover", () => {
      btnBg.clear();
      btnBg.fillStyle(0x56be3a, 1);
      btnBg.fillRoundedRect(GW / 2 - 100, 20, 200, 44, 10);
      btnBg.lineStyle(2, 0xffff00, 1);
      btnBg.strokeRoundedRect(GW / 2 - 100, 20, 200, 44, 10);
      this.input.setDefaultCursor("pointer");
    });

    zone.on("pointerout", () => {
      btnBg.clear();
      btnBg.fillStyle(0x3d9e2a, 1);
      btnBg.fillRoundedRect(GW / 2 - 100, 20, 200, 44, 10);
      btnBg.lineStyle(2, 0xffffff, 1);
      btnBg.strokeRoundedRect(GW / 2 - 100, 20, 200, 44, 10);
      this.input.setDefaultCursor("default");
    });

    zone.on("pointerdown", () => {
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("MenuScene");
      });
    });

    // Bounce animation on button
    this.tweens.add({
      targets: [btnBg, btnText],
      y: "+=3",
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  update() {
    // Condor flap
    if (this.condor) {
      this.condor.play("condor_glide", true);
    }
  }
}
