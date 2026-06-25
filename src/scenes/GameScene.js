import { GW, GH, C, LEVELS } from '../constants.js';
import Palito from '../objects/Palito.js';
import Machine from '../objects/Machine.js';
import Plant from '../objects/Plant.js';
import Animal from '../objects/Animal.js';

const FONT = "'Fredoka One', 'Comic Sans MS', cursive";
const FONT_BODY = "'Fredoka', 'Courier New', monospace";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.levelIndex = data?.level ?? 0;
    this.levelData = LEVELS[this.levelIndex];
    this.machineCount = 0;
    this.machinesDefeated = 0;
    this.levelComplete = false;
    this.playerDead = false;
    this.seedCollected = false;
    this.mobileLeft = false;
    this.mobileRight = false;
  }

  create() {
    const ld = this.levelData;
    const worldW = ld.worldW;

    this.cameras.main.setBounds(0, 0, worldW, GH);
    this.physics.world.setBounds(0, -200, worldW, GH + 200);
    this.cameras.main.fadeIn(600);

    // ── Background ───────────────────────────────────────────
    this.drawBackground(worldW);

    // ── Platforms (physics + visual) ─────────────────────────
    this.platforms = this.physics.add.staticGroup();
    this.buildPlatforms(ld.platforms);

    // ── Plants ────────────────────────────────────────────────
    this.plants = [];
    for (const pd of ld.plants) {
      this.plants.push(new Plant(this, pd.x, pd.y, pd.type));
    }

    // ── Animals ───────────────────────────────────────────────
    this.animals = [];
    this.animalGroup = this.physics.add.group();
    for (const ad of ld.animals) {
      const a = new Animal(this, ad.x, ad.y, ad.type);
      this.animals.push(a);
      if (!a.flying) this.animalGroup.add(a);
    }
    if (this.animalGroup.getLength() > 0) {
      this.physics.add.collider(this.animalGroup, this.platforms);
    }

    // ── Machines ──────────────────────────────────────────────
    this.machines = [];
    this.machineGroup = this.physics.add.group();
    for (const md of ld.machines) {
      const m = new Machine(this, md.x, md.y, md.type);
      this.machines.push(m);
      this.machineGroup.add(m);
    }
    this.machineCount = this.machines.length;
    this.physics.add.collider(this.machineGroup, this.platforms);

    // ── Player ────────────────────────────────────────────────
    this.palito = new Palito(this, 80, 300);
    this.palito.setupKeys();
    this.cameras.main.startFollow(this.palito, true, 0.1, 0.1);
    this.cameras.main.setFollowOffset(0, 80);

    this.physics.add.collider(this.palito, this.platforms);

    // ── Seed (level 3 only) ───────────────────────────────────
    this.seed = null;
    if (ld.seedX !== undefined) {
      this.seed = this.add.sprite(ld.seedX, ld.seedY, 'seed').setDepth(22);
      this.tweens.add({
        targets: this.seed,
        y: this.seed.y - 10,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.tweens.add({
        targets: this.seed,
        alpha: 0.6,
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    }

    // ── Collision: attack vs machines ─────────────────────────
    this.physics.add.overlap(
      this.palito.hitbox,
      this.machineGroup,
      this.onAttackHit,
      null,
      this
    );

    // ── Collision: machines touch player ──────────────────────
    this.physics.add.overlap(
      this.palito,
      this.machineGroup,
      this.onMachineTouchPlayer,
      null,
      this
    );

    // ── HUD ────────────────────────────────────────────────────
    this.buildHUD();
    this.showLevelBanner();

    // ── Mobile controls ───────────────────────────────────────
    this.addMobileControls();

    // ── Periodic checks ───────────────────────────────────────
    this.time.addEvent({
      delay: 1200,
      callback: this.checkMachinePlantDamage,
      callbackScope: this,
      loop: true,
    });
    this.time.addEvent({
      delay: 2000,
      callback: this.checkMachineAnimalScare,
      callbackScope: this,
      loop: true,
    });
  }

  // ── Background ─────────────────────────────────────────────────────────────
  drawBackground(worldW) {
    const ld = this.levelData;
    const skyColors = [
      [0x87CEEB, 0x87CEEB, 0xBDE5F5, 0xBDE5F5],
      [0x6ABADD, 0x6ABADD, 0xA0CDE6, 0xA0CDE6],
      [0x3A8ECC, 0x3A8ECC, 0x7AB4DE, 0x7AB4DE],
    ];
    const sc = skyColors[ld.bgIdx];

    const sky = this.add.graphics().setScrollFactor(0).setDepth(-10);
    sky.fillGradientStyle(sc[0], sc[1], sc[2], sc[3], 1);
    sky.fillRect(0, 0, GW, GH);

    // Far mountains (parallax)
    for (let mx = -100; mx < worldW + 200; mx += 180) {
      this.add.image(mx, 360, 'mountain_far')
        .setOrigin(0.5, 1).setScrollFactor(0.15).setDepth(-5)
        .setAlpha(0.6).setScale(1.2 + Math.random() * 0.4);
    }
    for (let mx = -60; mx < worldW + 160; mx += 130) {
      this.add.image(mx, 395, 'mountain_mid')
        .setOrigin(0.5, 1).setScrollFactor(0.35).setDepth(-4)
        .setAlpha(0.8).setScale(0.9 + Math.random() * 0.3);
    }

    // Ground visual (y=400 to 450)
    const gfx = this.add.graphics().setDepth(-1);
    gfx.fillStyle(C.GROUND_TOP, 1);
    gfx.fillRect(0, 400, worldW, 6);
    gfx.fillStyle(C.GROUND, 1);
    gfx.fillRect(0, 406, worldW, 44);
    // grass blades
    gfx.lineStyle(2, C.GRASS_BLADE, 0.9);
    for (let bx = 6; bx < worldW; bx += 14) {
      gfx.lineBetween(bx, 402, bx - 3, 394 + (bx % 4));
      gfx.lineBetween(bx + 6, 402, bx + 9, 395 + (bx % 3));
    }

    // Sun / moon
    const celestial = this.add.graphics().setScrollFactor(0.05).setDepth(-6);
    if (ld.bgIdx < 2) {
      celestial.fillStyle(0xFFEE44, 1);
      celestial.fillCircle(680, 55, 28);
      celestial.fillStyle(0xFFFF88, 0.3);
      celestial.fillCircle(680, 55, 44);
    } else {
      celestial.fillStyle(0xFFFFCC, 0.8);
      for (let i = 0; i < 25; i++) {
        celestial.fillCircle(
          Math.random() * GW, Math.random() * 120,
          Math.random() * 2 + 0.5
        );
      }
    }
  }

  // ── Platforms ──────────────────────────────────────────────────────────────
  // Use invisible zone bodies for reliable collision, draw visuals with Graphics
  buildPlatforms(platData) {
    const gfx = this.add.graphics().setDepth(1);

    for (const pd of platData) {
      const isGround = pd.y >= 395;

      if (!isGround) {
        // Draw floating platform visual
        gfx.fillStyle(C.GROUND_TOP, 1);
        gfx.fillRect(pd.x, pd.y, pd.w, 5);
        gfx.fillStyle(C.PLATFORM, 1);
        gfx.fillRect(pd.x, pd.y + 5, pd.w, pd.h - 5);
        // Small grass blades on top
        gfx.lineStyle(1.5, C.GRASS_BLADE, 1);
        for (let bx = pd.x + 5; bx < pd.x + pd.w - 3; bx += 9) {
          gfx.lineBetween(bx, pd.y, bx - 2, pd.y - 5);
          gfx.lineBetween(bx + 4, pd.y, bx + 6, pd.y - 4);
        }
      }

      // Physics: one static zone per platform
      // Zone origin is (0.5, 0.5) so center it at (x + w/2, y + h/2)
      const zone = this.add.zone(pd.x + pd.w / 2, pd.y + pd.h / 2, pd.w, pd.h);
      this.physics.add.existing(zone, true);
      this.platforms.add(zone);
    }
  }

  // ── HUD ────────────────────────────────────────────────────────────────────
  buildHUD() {
    this.hearts = [];
    for (let i = 0; i < 3; i++) {
      this.hearts.push(
        this.add.image(20 + i * 26, 22, 'heart_full')
          .setScrollFactor(0).setDepth(50).setScale(0.95)
      );
    }

    this.add.text(GW / 2, 14, this.levelData.name, {
      fontSize: '17px', fontFamily: FONT,
      fill: '#FFFFFF', stroke: '#1A3A0A', strokeThickness: 3,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(50);

    this.machineCounterText = this.add.text(GW - 14, 14, '', {
      fontSize: '14px', fontFamily: FONT_BODY,
      fill: '#FFFF88', stroke: '#333300', strokeThickness: 2,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(50);
    this.updateMachineCounter();

    if (this.levelData.seedX !== undefined) {
      this.add.text(GW / 2, GH - 28, '🌱 ¡Buscá la semilla en la cumbre!', {
        fontSize: '13px', fontFamily: FONT,
        fill: '#FFFF88', stroke: '#1A3A0A', strokeThickness: 2,
      }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(50);
    }
  }

  updateHUDHearts() {
    const hp = this.palito?.health ?? 0;
    for (let i = 0; i < this.hearts.length; i++) {
      this.hearts[i].setTexture(i < hp ? 'heart_full' : 'heart_empty');
    }
  }

  updateMachineCounter() {
    const remaining = this.machines.filter(m => !m.dead).length;
    this.machineCounterText?.setText(`🔧 ${remaining}/${this.machineCount}`);
  }

  // ── Level banner ───────────────────────────────────────────────────────────
  showLevelBanner() {
    const ld = this.levelData;
    const bg = this.add.graphics().setScrollFactor(0).setDepth(60);
    bg.fillStyle(0x0A1A0A, 0.88);
    bg.fillRoundedRect(GW / 2 - 210, GH / 2 - 50, 420, 100, 14);
    bg.lineStyle(2, 0x4E8A2A, 1);
    bg.strokeRoundedRect(GW / 2 - 210, GH / 2 - 50, 420, 100, 14);

    const sub = this.add.text(GW / 2, GH / 2 - 28, ld.subtitle, {
      fontSize: '15px', fontFamily: FONT, fill: '#88DD44',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(61);

    const name = this.add.text(GW / 2, GH / 2 + 8, ld.name, {
      fontSize: '28px', fontFamily: FONT, fill: '#CCFF88',
      stroke: '#0A1A0A', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(61);

    this.time.delayedCall(2600, () => {
      this.tweens.add({
        targets: [bg, sub, name],
        alpha: 0, duration: 600,
        onComplete: () => { bg.destroy(); sub.destroy(); name.destroy(); },
      });
    });
  }

  // ── Mobile controls ────────────────────────────────────────────────────────
  addMobileControls() {
    const depth = 60;
    const alpha = 0.55;
    const btnR = 32; // button radius

    // Only draw if touch is primary OR always for demo accessibility
    const isMobile = this.sys.game.device.input.touch;

    // We always add them (they work with mouse too on desktop)
    // Left button
    const leftBtn = this.add.circle(btnR + 14, GH - btnR - 14, btnR, 0x224400, alpha)
      .setScrollFactor(0).setDepth(depth).setInteractive();
    this.add.text(leftBtn.x, leftBtn.y, '◀', {
      fontSize: '22px', fill: '#AAFFAA', fontFamily: 'monospace',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);

    // Right button
    const rightBtn = this.add.circle(btnR * 3 + 28, GH - btnR - 14, btnR, 0x224400, alpha)
      .setScrollFactor(0).setDepth(depth).setInteractive();
    this.add.text(rightBtn.x, rightBtn.y, '▶', {
      fontSize: '22px', fill: '#AAFFAA', fontFamily: 'monospace',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);

    // Jump button (right side)
    const jumpBtn = this.add.circle(GW - btnR - 14, GH - btnR * 3 - 20, btnR, 0x003366, alpha)
      .setScrollFactor(0).setDepth(depth).setInteractive();
    this.add.text(jumpBtn.x, jumpBtn.y, '▲', {
      fontSize: '20px', fill: '#AACCFF', fontFamily: 'monospace',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);

    // Attack button (right side)
    const attackBtn = this.add.circle(GW - btnR - 14, GH - btnR - 14, btnR, 0x660011, alpha)
      .setScrollFactor(0).setDepth(depth).setInteractive();
    this.add.text(attackBtn.x, attackBtn.y, '💥', {
      fontSize: '22px', fontFamily: 'monospace',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);

    // Helper to darken on press
    const press = (btn, color) => {
      btn.on('pointerdown', () => btn.setFillStyle(color, 0.85));
      btn.on('pointerup',   () => btn.setFillStyle(btn._origColor ?? color, alpha));
      btn.on('pointerout',  () => btn.setFillStyle(btn._origColor ?? color, alpha));
    };

    // Wire up events
    leftBtn.on('pointerdown',  () => { this.mobileLeft = true; });
    leftBtn.on('pointerup',    () => { this.mobileLeft = false; });
    leftBtn.on('pointerout',   () => { this.mobileLeft = false; });

    rightBtn.on('pointerdown', () => { this.mobileRight = true; });
    rightBtn.on('pointerup',   () => { this.mobileRight = false; });
    rightBtn.on('pointerout',  () => { this.mobileRight = false; });

    jumpBtn.on('pointerdown',  () => { this.palito?.mobileJump(); });
    attackBtn.on('pointerdown',() => { this.palito?.mobileAttack(); });

    press(leftBtn,   0x224400);
    press(rightBtn,  0x224400);
    press(jumpBtn,   0x003366);
    press(attackBtn, 0x660011);

    // Show controls hint on first level
    if (this.levelIndex === 0) {
      const hint = this.add.text(GW / 2, GH - 14,
        '← → saltar=↑  atacar=Z', {
          fontSize: '11px', fontFamily: FONT_BODY,
          fill: '#88BB44', alpha: 0.7,
        }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(55);
      this.time.delayedCall(5000, () => {
        this.tweens.add({ targets: hint, alpha: 0, duration: 1000, onComplete: () => hint.destroy() });
      });
    }
  }

  // ── Overlap handlers ───────────────────────────────────────────────────────
  onAttackHit(hitbox, machineSprite) {
    const machine = this.machines.find(m => m === machineSprite);
    if (!machine || machine.dead || machine.stunned) return;

    const destroyed = machine.hit(1);
    this.updateMachineCounter();

    if (destroyed) {
      this.machinesDefeated++;
      this.regrowNearbyPlants(machine.x);
      this.returnNearbyAnimals(machine.x);

      const remaining = this.machines.filter(m => !m.dead).length;
      if (remaining === 0 && !this.levelComplete) {
        this.time.delayedCall(1800, () => this.completeLevelOrSeed());
      }
    }
  }

  onMachineTouchPlayer(player, machineSprite) {
    if (!machineSprite.active) return;
    const machine = this.machines.find(m => m === machineSprite);
    if (!machine || machine.dead) return;
    this.palito.takeDamage();
    this.updateHUDHearts();
  }

  // ── Plant / animal effects after machine dies ──────────────────────────────
  checkMachinePlantDamage() {
    for (const machine of this.machines) {
      if (machine.dead) continue;
      for (const plant of this.plants) {
        const dx = Math.abs(plant.x - machine.x);
        if (dx < 100 && plant.state === 'full') plant.wither();
        else if (dx < 55 && plant.state === 'wilted' && plant.cfg?.states?.includes('stump')) plant.stump();
      }
    }
  }

  checkMachineAnimalScare() {
    for (const machine of this.machines) {
      if (machine.dead) continue;
      for (const animal of this.animals) {
        if (Math.abs(animal.x - machine.x) < 150) animal.scare();
      }
    }
  }

  regrowNearbyPlants(mx) {
    let delay = 800;
    for (const plant of this.plants) {
      if (Math.abs(plant.x - mx) < 350) {
        plant.regrow(delay);
        delay += 600;
      }
    }
  }

  returnNearbyAnimals(mx) {
    for (const animal of this.animals) {
      if (Math.abs(animal.x - mx) < 400) {
        this.time.delayedCall(2000, () => { if (animal.scene) animal.returnToNormal(); });
      }
    }
  }

  // ── Level complete / seed ─────────────────────────────────────────────────
  completeLevelOrSeed() {
    if (this.levelComplete) return;
    if (this.levelData.seedX !== undefined && !this.seedCollected) {
      this.showMessage('¡Máquinas destruidas!\n🌱 ¡Buscá la semilla en la cumbre!', 3000);
      return;
    }
    this.levelComplete = true;
    this.showLevelCompleteScreen();
  }

  showMessage(msg, duration = 2500) {
    const bg = this.add.graphics().setScrollFactor(0).setDepth(70);
    bg.fillStyle(0x0A1A0A, 0.92);
    bg.fillRoundedRect(GW / 2 - 210, GH / 2 - 45, 420, 90, 10);
    bg.lineStyle(2, 0x88CC44, 1);
    bg.strokeRoundedRect(GW / 2 - 210, GH / 2 - 45, 420, 90, 10);

    const txt = this.add.text(GW / 2, GH / 2, msg, {
      fontSize: '16px', fontFamily: FONT, fill: '#CCFF88', align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(71);

    this.time.delayedCall(duration, () => {
      this.tweens.add({
        targets: [bg, txt], alpha: 0, duration: 500,
        onComplete: () => { bg.destroy(); txt.destroy(); },
      });
    });
  }

  showLevelCompleteScreen() {
    // Celebrate! (maxParticles = quantity for one-shot bursts)
    for (let i = 0; i < 4; i++) {
      this.time.delayedCall(i * 220, () => {
        if (!this.scene?.add) return;
        const confetti = this.add.particles(
          GW / 2 + (Math.random() - 0.5) * 300, GH / 2,
          'star',
          {
            speed: { min: 100, max: 300 },
            angle: { min: -180, max: 0 },
            scale: { start: 1.2, end: 0 },
            lifespan: 800,
            quantity: 10,
            maxParticles: 10,
            tint: [0xFFFF44, 0x88FF44, 0xFF8844, 0x44FFFF],
          }
        ).setScrollFactor(0).setDepth(80);
        this.time.delayedCall(1000, () => confetti?.destroy?.());
      });
    }

    const bg = this.add.graphics().setScrollFactor(0).setDepth(75);
    bg.fillStyle(0x0A2A0A, 0.93);
    bg.fillRoundedRect(GW / 2 - 230, GH / 2 - 70, 460, 140, 16);
    bg.lineStyle(3, 0x88EE44, 1);
    bg.strokeRoundedRect(GW / 2 - 230, GH / 2 - 70, 460, 140, 16);

    this.add.text(GW / 2, GH / 2 - 42, '🎉 ¡NIVEL COMPLETADO! 🎉', {
      fontSize: '24px', fontFamily: FONT, fill: '#FFFF44',
      stroke: '#1A4A0A', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(76);

    const msg = this.levelIndex < 2
      ? '¡El monte agradece tu ayuda!\n¿Listo para el siguiente nivel?'
      : '¡Llegaste a la cumbre!';
    this.add.text(GW / 2, GH / 2 + 2, msg, {
      fontSize: '15px', fontFamily: FONT, fill: '#CCFF88', align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(76);

    this.time.delayedCall(3000, () => {
      this.cameras.main.fadeOut(700, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        if (this.levelIndex < LEVELS.length - 1) {
          this.scene.start('GameScene', { level: this.levelIndex + 1 });
        } else {
          this.scene.start('WinScene');
        }
      });
    });
  }

  // ── Player death ───────────────────────────────────────────────────────────
  onPlayerDie() {
    if (this.playerDead) return;
    this.playerDead = true;

    const bg = this.add.graphics().setScrollFactor(0).setDepth(75);
    bg.fillStyle(0x1A0000, 0.92);
    bg.fillRoundedRect(GW / 2 - 190, GH / 2 - 60, 380, 120, 14);
    bg.lineStyle(2, 0xCC4444, 1);
    bg.strokeRoundedRect(GW / 2 - 190, GH / 2 - 60, 380, 120, 14);

    this.add.text(GW / 2, GH / 2 - 28, '😵 ¡Palito cayó!', {
      fontSize: '26px', fontFamily: FONT, fill: '#FF6666',
      stroke: '#1A0000', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(76);

    this.add.text(GW / 2, GH / 2 + 10, '¡El monte te necesita! Volvé a intentarlo.', {
      fontSize: '13px', fontFamily: FONT, fill: '#FFAA88',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(76);

    this.time.delayedCall(2600, () => {
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene', { level: this.levelIndex });
      });
    });
  }

  // ── Seed collection ────────────────────────────────────────────────────────
  collectSeed() {
    this.seedCollected = true;

    this.tweens.add({
      targets: this.seed,
      y: this.seed.y - 60, scaleX: 2, scaleY: 2, alpha: 0,
      duration: 700,
      onComplete: () => this.seed?.destroy(),
    });

    const seedFx = this.add.particles(this.seed.x, this.seed.y, 'star', {
      speed: { min: 80, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.2, end: 0 },
      lifespan: 800,
      quantity: 16,
      maxParticles: 16,
      tint: [0xFFFF44, 0x88FF44, 0xFFEE88],
    }).setDepth(40);
    this.time.delayedCall(1000, () => seedFx?.destroy?.());

    this.cameras.main.shake(400, 0.012);
    this.showMessage('✨ ¡Encontraste la semilla sagrada! ✨', 2500);

    this.time.delayedCall(3200, () => {
      if (!this.levelComplete) {
        this.levelComplete = true;
        this.showLevelCompleteScreen();
      }
    });
  }

  // ── Main loop ──────────────────────────────────────────────────────────────
  update(time, delta) {
    if (this.levelComplete || this.playerDead) return;

    this.palito.update(time, delta, this.mobileLeft, this.mobileRight);
    this.updateHUDHearts();

    // Fall death
    if (this.palito.y > GH + 100 && !this.palito.dead) {
      this.palito.health = 0;
      this.palito.die();
    }

    for (const m of this.machines) {
      if (!m.dead) m.update(time, delta, this.palito.x, this.palito.y);
    }

    for (const a of this.animals) a.update(delta);

    // Seed pickup (level 3)
    if (this.seed && !this.seedCollected) {
      const dx = Math.abs(this.palito.x - this.seed.x);
      const dy = Math.abs(this.palito.y - this.seed.y);
      if (dx < 40 && dy < 40) this.collectSeed();
    }
  }
}
