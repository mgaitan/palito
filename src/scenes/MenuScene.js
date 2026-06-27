import { GW, GH, C, SKINS, SKIN_STORAGE_KEY } from '../constants.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.selectedSkin = this.getSelectedSkin();
    this.drawBackground();
    this.drawAnimatedTrees();
    this.drawTitle();
    this.drawButtons();
    this.drawCreditsBox();

    // Animated walking Palito on menu
    this.palito = this.add.sprite(80, 380, 'palito_idle')
      .setDepth(10)
      .setScale(1.4);
    this.menuFace = this.add.image(80, 353, this.getSkinKey(this.selectedSkin))
      .setDepth(11)
      .setScale(0.19)
      .setVisible(this.selectedSkin !== null);
    this.palitoDir = 1;
    this.palitoX = 80;

    this.time.addEvent({
      delay: 3000,
      callback: () => {
        this.palitoDir *= -1;
        this.palito.setFlipX(this.palitoDir < 0);
      },
      loop: true,
    });

    // Machines rolling by in background
    this.machines = [];
    this.time.addEvent({
      delay: 4000,
      callback: this.spawnMenuMachine,
      callbackScope: this,
      loop: true,
    });
  }

  drawBackground() {
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xC8E8F0, 0xC8E8F0, 1);
    sky.fillRect(0, 0, GW, GH);

    // Mountains
    for (let i = 0; i < 6; i++) {
      this.add.image(i * 160 - 40, 310, 'mountain_far').setOrigin(0.5, 1).setAlpha(0.7);
    }
    for (let i = 0; i < 7; i++) {
      this.add.image(i * 130 - 20, 360, 'mountain_mid').setOrigin(0.5, 1).setAlpha(0.85);
    }

    // Ground
    const gnd = this.add.graphics();
    gnd.fillStyle(C.GROUND, 1);
    gnd.fillRect(0, 390, GW, 60);
    gnd.fillStyle(C.GROUND_TOP, 1);
    gnd.fillRect(0, 388, GW, 6);
    // Grass blades
    gnd.lineStyle(2, C.GRASS_BLADE, 1);
    for (let bx = 5; bx < GW; bx += 12) {
      gnd.lineBetween(bx, 390, bx - 3, 383);
      gnd.lineBetween(bx + 5, 390, bx + 8, 382);
    }
  }

  drawAnimatedTrees() {
    // Decorative background trees
    const treePositions = [60, 140, 240, 320, 480, 580, 660, 740];
    for (const tx of treePositions) {
      const key = tx % 3 === 0 ? 'quebracho_full' : tx % 3 === 1 ? 'algarrobo_full' : 'jarilla_full';
      this.add.sprite(tx, 390, key).setOrigin(0.5, 1).setAlpha(0.9);
    }
  }

  drawTitle() {
    // Shadow
    this.add.text(GW / 2 + 3, 70, 'EL MONTE DE PALITO', {
      fontSize: '44px',
      fontFamily: "'Bangers', 'Fredoka', 'Comic Sans MS', cursive",
      fill: '#1A4A0A',
    }).setOrigin(0.5).setAlpha(0.5);

    // Main title
    const title = this.add.text(GW / 2, 68, 'EL MONTE DE PALITO', {
      fontSize: '44px',
      fontFamily: "'Bangers', 'Fredoka', 'Comic Sans MS', cursive",
      fill: '#4E8A2A',
      stroke: '#FFFFFF',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(5);

    // Subtitle
    this.add.text(GW / 2, 112, 'Defende el monte cordobes paravachasca', {
      fontSize: '18px',
      fontFamily: "'Bangers', 'Fredoka', 'Comic Sans MS', cursive",
      fill: '#2D5016',
      stroke: '#FFFFFF',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(5);

    // Pulsing effect on title
    this.tweens.add({
      targets: title,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  drawButtons() {
    // JUGAR button
    const playBg = this.add.graphics().setDepth(5);
    playBg.fillStyle(0x3D9E2A, 1);
    playBg.fillRoundedRect(GW / 2 - 90, 155, 180, 52, 12);
    playBg.lineStyle(3, 0xFFFFFF, 1);
    playBg.strokeRoundedRect(GW / 2 - 90, 155, 180, 52, 12);

    const playText = this.add.text(GW / 2, 182, '▶  JUGAR', {
      fontSize: '26px',
      fontFamily: "'Bangers', 'Fredoka', 'Comic Sans MS', cursive",
      fill: '#FFFFFF',
      stroke: '#1A5A0A',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(6);

    const playZone = this.add.zone(GW / 2, 182, 180, 52).setInteractive();

    playZone.on('pointerover', () => {
      playBg.clear();
      playBg.fillStyle(0x56BE3A, 1);
      playBg.fillRoundedRect(GW / 2 - 90, 155, 180, 52, 12);
      playBg.lineStyle(3, 0xFFFF00, 1);
      playBg.strokeRoundedRect(GW / 2 - 90, 155, 180, 52, 12);
      this.input.setDefaultCursor('pointer');
    });

    playZone.on('pointerout', () => {
      playBg.clear();
      playBg.fillStyle(0x3D9E2A, 1);
      playBg.fillRoundedRect(GW / 2 - 90, 155, 180, 52, 12);
      playBg.lineStyle(3, 0xFFFFFF, 1);
      playBg.strokeRoundedRect(GW / 2 - 90, 155, 180, 52, 12);
      this.input.setDefaultCursor('default');
    });

    playZone.on('pointerdown', () => {
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('IntroScene');
      });
    });

    // SKIN button
    const skinX = GW / 2;
    const skinY = 228;
    const skinBg = this.add.graphics().setDepth(5);
    skinBg.fillStyle(0x2A6BA8, 1);
    skinBg.fillRoundedRect(skinX - 100, skinY - 22, 200, 44, 10);
    skinBg.lineStyle(3, 0xFFFFFF, 1);
    skinBg.strokeRoundedRect(skinX - 100, skinY - 22, 200, 44, 10);

    this.add.text(skinX, skinY, 'ELEGIR SKIN', {
      fontSize: '22px',
      fontFamily: "'Bangers', 'Fredoka', 'Comic Sans MS', cursive",
      fill: '#FFFFFF',
      stroke: '#103456',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(6);

    const skinZone = this.add.zone(skinX, skinY, 200, 44).setInteractive();
    skinZone.on('pointerover', () => {
      skinBg.clear();
      skinBg.fillStyle(0x3D85C6, 1);
      skinBg.fillRoundedRect(skinX - 100, skinY - 22, 200, 44, 10);
      skinBg.lineStyle(3, 0xFFFF00, 1);
      skinBg.strokeRoundedRect(skinX - 100, skinY - 22, 200, 44, 10);
      this.input.setDefaultCursor('pointer');
    });
    skinZone.on('pointerout', () => {
      skinBg.clear();
      skinBg.fillStyle(0x2A6BA8, 1);
      skinBg.fillRoundedRect(skinX - 100, skinY - 22, 200, 44, 10);
      skinBg.lineStyle(3, 0xFFFFFF, 1);
      skinBg.strokeRoundedRect(skinX - 100, skinY - 22, 200, 44, 10);
      this.input.setDefaultCursor('default');
    });
    skinZone.on('pointerdown', () => this.openSkinSelector());

    // Controls hint
    this.add.text(GW / 2, 268, '⬅ ➡ moverse  |  ↑ saltar  |  Z atacar', {
      fontSize: '12px',
      fontFamily: "'Fredoka', 'Comic Sans MS', cursive",
      fill: '#2D5016',
    }).setOrigin(0.5).setDepth(5);

    // School info
    this.add.text(GW / 2, 292, 'feria de ciencias 2026', {
      fontSize: '17px',
      fontFamily: "'Bangers', 'Fredoka', 'Comic Sans MS', cursive",
      fill: '#234A16',
      stroke: '#FFFFFF',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(5);

    this.add.text(GW / 2, 313, 'Escuela Domingo F. Sarmiento - Los Aromos - Cordoba', {
      fontSize: '12px',
      fontFamily: "'Fredoka', 'Comic Sans MS', cursive",
      fill: '#3D6020',
    }).setOrigin(0.5).setDepth(5);
  }

  getSkinKey(index) {
    return `skin_${String(index ?? 0).padStart(2, '0')}`;
  }

  getSelectedSkin() {
    const raw = localStorage.getItem(SKIN_STORAGE_KEY);
    const index = Number.parseInt(raw ?? '-1', 10);
    return SKINS.some(skin => skin.id === index && skin.enabled) ? index : null;
  }

  setSelectedSkin(index) {
    this.selectedSkin = index;
    localStorage.setItem(SKIN_STORAGE_KEY, String(index));
    this.menuFace
      ?.setTexture(this.getSkinKey(index))
      .setVisible(true);
  }

  openSkinSelector() {
    if (this.skinPanel) return;

    const items = [];
    const bg = this.add.graphics().setDepth(80);
    bg.fillStyle(0x061806, 0.9);
    bg.fillRect(0, 0, GW, GH);
    items.push(bg);

    const panel = this.add.graphics().setDepth(81);
    panel.fillStyle(0xEAF8DE, 1);
    panel.fillRoundedRect(116, 48, 568, 354, 10);
    panel.lineStyle(4, 0x2D6A20, 1);
    panel.strokeRoundedRect(116, 48, 568, 354, 10);
    items.push(panel);

    items.push(this.add.text(GW / 2, 82, 'Elegí tu cara', {
      fontSize: '30px',
      fontFamily: "'Bangers', 'Fredoka', 'Comic Sans MS', cursive",
      fill: '#2D6A20',
      stroke: '#FFFFFF',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(82));

    const enabledSkins = SKINS.filter(skin => skin.enabled);
    for (let i = 0; i < enabledSkins.length; i++) {
      const skin = enabledSkins[i];
      const col = i % 6;
      const row = Math.floor(i / 6);
      const x = 182 + col * 86;
      const y = 128 + row * 88;
      const selected = skin.id === this.selectedSkin;

      const ring = this.add.circle(x, y, 34, selected ? 0xFFDD44 : 0xFFFFFF, selected ? 0.9 : 0.35)
        .setDepth(82);
      ring.setStrokeStyle(selected ? 4 : 2, selected ? 0x2D6A20 : 0x89A875, 1);
      items.push(ring);

      const face = this.add.image(x, y, this.getSkinKey(skin.id))
        .setDepth(83)
        .setScale(0.48)
        .setInteractive({ useHandCursor: true });
      face.on('pointerdown', () => {
        this.setSelectedSkin(skin.id);
        close();
      });
      items.push(face);

      const label = this.add.text(x, y + 45, skin.name, {
        fontSize: '11px',
        fontFamily: "'Fredoka', 'Comic Sans MS', cursive",
        fill: '#244A16',
        stroke: '#FFFFFF',
        strokeThickness: 2,
      }).setOrigin(0.5).setDepth(83);
      items.push(label);
    }

    const closeBg = this.add.graphics().setDepth(82);
    closeBg.fillStyle(0x2D6A20, 1);
    closeBg.fillRoundedRect(GW / 2 - 78, 358, 156, 34, 8);
    items.push(closeBg);

    const closeText = this.add.text(GW / 2, 365, 'LISTO', {
      fontSize: '20px',
      fontFamily: "'Bangers', 'Fredoka', 'Comic Sans MS', cursive",
      fill: '#FFFFFF',
    }).setOrigin(0.5).setDepth(83).setPosition(GW / 2, 375);
    items.push(closeText);

    const closeZone = this.add.zone(GW / 2, 375, 156, 34).setInteractive({ useHandCursor: true });
    items.push(closeZone);

    const close = () => {
      for (const item of items) item.destroy();
      this.skinPanel = null;
      this.input.setDefaultCursor('default');
    };
    closeZone.on('pointerdown', close);

    this.skinPanel = items;
  }

  drawCreditsBox() {
    const box = this.add.graphics().setDepth(4);
    box.fillStyle(0x1A3A0A, 0.75);
    box.fillRoundedRect(GW / 2 - 220, 322, 440, 58, 8);
    box.lineStyle(2, 0x4E8A2A, 1);
    box.strokeRoundedRect(GW / 2 - 220, 322, 440, 58, 8);

    this.add.text(GW / 2, 336, 'Grupo 4 presenta:', {
      fontSize: '15px', fontFamily: "'Bangers', 'Fredoka', 'Comic Sans MS', cursive", fill: '#88DD44',
    }).setOrigin(0.5).setDepth(5);

    this.add.text(GW / 2, 358, 'Rodri · Ciro · Alex · Mauri · Ema', {
      fontSize: '15px', fontFamily: "'Fredoka', 'Comic Sans MS', cursive", fill: '#CCFF88',
      stroke: '#1A3A0A', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(5);
  }

  spawnMenuMachine() {
    const type = Math.random() < 0.5 ? 'excavator' : 'bulldozer';
    const m = this.add.sprite(-100, 366, `${type}_move1`).setDepth(3).setScale(0.7);
    this.machines.push(m);
    this.tweens.add({
      targets: m,
      x: GW + 120,
      duration: 6000 + Math.random() * 4000,
      ease: 'Linear',
      onComplete: () => {
        const idx = this.machines.indexOf(m);
        if (idx !== -1) this.machines.splice(idx, 1);
        m.destroy();
      },
    });
  }

  update() {
    // Walk Palito back and forth
    this.palitoX += this.palitoDir * 0.8;
    if (this.palitoX > 720) this.palitoDir = -1;
    if (this.palitoX < 80) this.palitoDir = 1;
    this.palito.x = this.palitoX;
    this.palito.setFlipX(this.palitoDir < 0);
    this.palito.play('palito_walk', true);
    this.menuFace?.setPosition(this.palito.x, this.palito.y - 27);
  }
}
