import { spawnSpriteBurst } from '../effects.js';

const PLANT_CONFIGS = {
  quebracho: { states: ['full', 'wilted', 'stump'], originY: 1, scale: 1.0 },
  algarrobo: { states: ['full', 'wilted', 'stump'], originY: 1, scale: 1.0 },
  jarilla:   { states: ['full', 'wilted'],          originY: 1, scale: 1.1 },
  cactus:    { states: ['full', 'wilted'],          originY: 1, scale: 1.0 },
};

export default class Plant extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, type) {
    const cfg = PLANT_CONFIGS[type];
    super(scene, x, y, `${type}_full`);
    scene.add.existing(this);

    this.plantType = type;
    this.cfg = cfg;
    this.state = 'full';
    this.setOrigin(0.5, cfg.originY);
    this.setScale(cfg.scale);
    this.setDepth(8);

    // Slight random scale variation
    const variation = 0.85 + Math.random() * 0.3;
    this.setScale(cfg.scale * variation);

    // Gentle sway tween
    this.swayTween = scene.tweens.add({
      targets: this,
      angle: { from: -2, to: 2 },
      duration: 1800 + Math.random() * 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: Math.random() * 1000,
    });
  }

  wither() {
    if (this.state === 'full') {
      this.state = 'wilted';
      this.scene.tweens.add({
        targets: this,
        alpha: 0.7,
        tint: 0xBBAA44,
        duration: 600,
        onComplete: () => {
          this.setTexture(`${this.plantType}_wilted`);
          this.clearTint();
        },
      });
    }
  }

  stump() {
    const cfg = this.cfg;
    if (cfg.states.includes('stump') && this.state !== 'stump') {
      this.state = 'stump';
      this.swayTween?.stop();
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: 400,
        onComplete: () => {
          this.setTexture(`${this.plantType}_stump`);
          this.setAlpha(1);
        },
      });
    }
  }

  regrow(delay = 0) {
    if (this.state === 'full') return;
    this.scene.time.delayedCall(delay, () => {
      if (!this.scene) return;
      this.state = 'regrowing';
      this.setTexture(`${this.plantType}_full`);
      this.setAlpha(0);
      const targetScaleY = this.scaleY;
      this.scene.tweens.add({
        targets: this,
        alpha: 1,
        scaleY: targetScaleY,
        duration: 1200,
        ease: 'Back.easeOut',
        onStart: () => this.setScale(this.scaleX, 0),
        onComplete: () => {
          this.state = 'full';
          this.clearTint();
          // Resume sway
          this.swayTween = this.scene.tweens.add({
            targets: this,
            angle: { from: -2, to: 2 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });

          spawnSpriteBurst(this.scene, this.x, this.y - 30, 'star', {
            count: 5,
            speed: 70,
            duration: 600,
            angleMin: -180,
            angleMax: 0,
            scaleMin: 0.4,
            scaleMax: 0.8,
            tints: [0x88FF44, 0xFFFF44, 0x44FF88],
          });
        },
      });
    });
  }
}
