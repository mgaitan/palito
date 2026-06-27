import { GW, GH, C, LEVELS } from '../constants.js';
import Palito from '../objects/Palito.js';
import Machine from '../objects/Machine.js';
import Plant from '../objects/Plant.js';
import Animal from '../objects/Animal.js';
import { spawnSpriteBurst } from '../effects.js';

const FONT = "'Bangers', 'Fredoka', 'Comic Sans MS', cursive";
const FONT_BODY = "'Fredoka', 'Comic Sans MS', cursive";

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
      m.applyWalkPlatformPhysics();
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

      gfx.fillStyle(C.GROUND_TOP, 1);
      gfx.fillRect(pd.x, pd.y, pd.w, 5);
      gfx.fillStyle(isGround ? C.GROUND : C.PLATFORM, 1);
      gfx.fillRect(pd.x, pd.y + 5, pd.w, pd.h - 5);

      // Small grass blades on top
      gfx.lineStyle(isGround ? 2 : 1.5, C.GRASS_BLADE, isGround ? 0.9 : 1);
      const grassStep = isGround ? 14 : 9;
      for (let bx = pd.x + 5; bx < pd.x + pd.w - 3; bx += grassStep) {
        gfx.lineBetween(bx, pd.y, bx - 2, pd.y - 5);
        gfx.lineBetween(bx + 4, pd.y, bx + 6, pd.y - 4);
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
      this.add.text(GW / 2, GH - 28, 'Semilla: buscala en la cumbre', {
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
    const remaining = this.machines.filter(m => this.isMachineAlive(m)).length;
    this.machineCounterText?.setText(`Maquinas ${remaining}/${this.machineCount}`);
  }

  isMachineAlive(machine) {
    return Boolean(machine?.active && machine.scene && !machine.dead);
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
    const depth = 120;
    const alpha = 0.72;
    const btnR = 38;
    const bottomY = GH - 54;

    const makeButton = (x, y, label, color, labelColor) => {
      const btn = this.add.circle(x, y, btnR, color, alpha)
        .setScrollFactor(0)
        .setDepth(depth)
        .setInteractive({ useHandCursor: true });
      btn._origColor = color;

      const ring = this.add.circle(x, y, btnR, 0xFFFFFF, 0)
        .setScrollFactor(0)
        .setDepth(depth + 1);
      ring.setStrokeStyle(3, 0xFFFFFF, 0.42);

      const text = this.add.text(x, y, label, {
        fontSize: label.length > 1 ? '22px' : '28px',
        fill: labelColor,
        fontFamily: FONT,
        stroke: '#071407',
        strokeThickness: 3,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2);

      return { btn, ring, text, color };
    };

    const left = makeButton(58, bottomY, '<', 0x245C2B, '#C9FFC9');
    const right = makeButton(150, bottomY, '>', 0x245C2B, '#C9FFC9');
    const jump = makeButton(GW - 78, GH - 146, 'J', 0x134F90, '#D7ECFF');
    const attack = makeButton(GW - 78, bottomY, 'Z', 0x8D1730, '#FFD4DE');

    const leftBtn = left.btn;
    const rightBtn = right.btn;
    const jumpBtn = jump.btn;
    const attackBtn = attack.btn;

    const press = ({ btn, ring, color }) => {
      const release = () => {
        btn.setFillStyle(color, alpha);
        ring.setStrokeStyle(3, 0xFFFFFF, 0.42);
      };
      btn.on('pointerdown', () => {
        btn.setFillStyle(color, 0.95);
        ring.setStrokeStyle(4, 0xFFFFFF, 0.8);
      });
      btn.on('pointerup', release);
      btn.on('pointerout', release);
      btn.on('pointerupoutside', release);
    };

    // Wire up events
    leftBtn.on('pointerdown',  () => { this.mobileLeft = true; });
    leftBtn.on('pointerup',    () => { this.mobileLeft = false; });
    leftBtn.on('pointerout',   () => { this.mobileLeft = false; });
    leftBtn.on('pointerupoutside', () => { this.mobileLeft = false; });

    rightBtn.on('pointerdown', () => { this.mobileRight = true; });
    rightBtn.on('pointerup',   () => { this.mobileRight = false; });
    rightBtn.on('pointerout',  () => { this.mobileRight = false; });
    rightBtn.on('pointerupoutside', () => { this.mobileRight = false; });

    jumpBtn.on('pointerdown',  () => { this.palito?.mobileJump(); });
    attackBtn.on('pointerdown',() => { this.palito?.mobileAttack(); });

    press(left);
    press(right);
    press(jump);
    press(attack);

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
    if (!this.isMachineAlive(machine) || machine.stunned) return;

    const destroyed = machine.hit(1);
    this.updateMachineCounter();

    if (destroyed) {
      this.machineGroup.remove(machine, false, false);
      this.machinesDefeated++;
      this.regrowNearbyPlants(machine.x);
      this.returnNearbyAnimals(machine.x);

      const remaining = this.machines.filter(m => this.isMachineAlive(m)).length;
      if (remaining === 0 && !this.levelComplete) {
        this.time.delayedCall(1800, () => this.completeLevelOrSeed());
      }
    }
  }

  onMachineTouchPlayer(player, machineSprite) {
    const machine = this.machines.find(m => m === machineSprite);
    if (!this.isMachineAlive(machine)) return;
    this.palito.takeDamage();
    this.updateHUDHearts();
  }

  // ── Plant / animal effects after machine dies ──────────────────────────────
  checkMachinePlantDamage() {
    for (const machine of this.machines) {
      if (!this.isMachineAlive(machine)) continue;
      for (const plant of this.plants) {
        const dx = Math.abs(plant.x - machine.x);
        if (dx < 100 && plant.state === 'full') plant.wither();
        else if (dx < 55 && plant.state === 'wilted' && plant.cfg?.states?.includes('stump')) plant.stump();
      }
    }
  }

  checkMachineAnimalScare() {
    for (const machine of this.machines) {
      if (!this.isMachineAlive(machine)) continue;
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
      this.showMessage('¡Máquinas destruidas!\nBuscá la semilla en la cumbre.', 3000);
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
    for (let i = 0; i < 4; i++) {
      this.time.delayedCall(i * 220, () => {
        if (!this.scene?.add) return;
        spawnSpriteBurst(this, GW / 2 + (Math.random() - 0.5) * 300, GH / 2, 'star', {
          count: 10,
          speed: 240,
          duration: 800,
          depth: 80,
          angleMin: -180,
          angleMax: 0,
          scaleMin: 0.7,
          scaleMax: 1.2,
          scrollFactor: 0,
          tints: [0xFFFF44, 0x88FF44, 0xFF8844, 0x44FFFF],
        });
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

    spawnSpriteBurst(this, this.seed.x, this.seed.y, 'star', {
      count: 16,
      speed: 170,
      duration: 800,
      depth: 40,
      scaleMin: 0.7,
      scaleMax: 1.2,
      tints: [0xFFFF44, 0x88FF44, 0xFFEE88],
    });

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
      if (this.isMachineAlive(m)) m.update(time, delta, this.palito.x, this.palito.y);
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
