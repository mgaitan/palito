const ANIM_KEYS = {
  vizcacha: 'vizcacha_hop',
  bird:     'bird_fly',
  lizard:   'lizard_walk',
  fox:      'fox_walk',
  condor:   'condor_glide',
};

const SPEEDS = {
  vizcacha: 35,
  bird:     60,
  lizard:   25,
  fox:      55,
  condor:   40,
};

const FLYING = new Set(['bird', 'condor']);

export default class Animal extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    const textureKey = type === 'condor'
      ? 'condor_glide1'
      : (`${type}_idle` in scene.textures.list ? `${type}_idle` : `${type}_fly1`);
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.animalType = type;
    this.flying = FLYING.has(type);
    this.speed = SPEEDS[type] || 40;
    this.dir = Math.random() < 0.5 ? 1 : -1;
    this.wanderTimer = 2000 + Math.random() * 3000;
    this.startX = x;
    this.startY = y;
    this.scared = false;
    this.walkPlatform = null;
    this.walkMinX = null;
    this.walkMaxX = null;

    this.setDepth(12);
    this.setScale(type === 'condor' ? 1.15 : 1.1);

    if (this.flying) {
      this.body.allowGravity = false;
      this.body.setSize(type === 'condor' ? 48 : 24, type === 'condor' ? 20 : 14);
    } else {
      this.body.allowGravity = false;
      this.body.setCollideWorldBounds(false);
      this.setWalkPlatform(scene.levelData?.platforms, x, y);
      this.snapToWalkPlatform();
    }

    this.play(ANIM_KEYS[type], true);
  }

  setWalkPlatform(platforms, x, y) {
    const platform = platforms
      ?.filter(p => x >= p.x && x <= p.x + p.w && y <= p.y + 90)
      .sort((a, b) => Math.abs(a.y - y) - Math.abs(b.y - y))[0];

    if (!platform) return;

    const margin = Math.max(12, this.displayWidth / 2 + 4);
    this.walkPlatform = platform;
    this.walkMinX = platform.x + margin;
    this.walkMaxX = platform.x + platform.w - margin;
    this.startY = platform.y - this.displayHeight / 2 + 1;
  }

  snapToWalkPlatform() {
    if (!this.walkPlatform) return;
    this.y = this.walkPlatform.y - this.displayHeight / 2 + 1;
    this.body.updateFromGameObject?.();
  }

  scare() {
    if (this.scared) return;
    this.scared = true;
    this.setTint(0xFFAAAA);
    // Flee fast in current direction
    if (this.flying) {
      this.setVelocityY(-80);
      this.setVelocityX(this.dir * this.speed * 3);
    } else {
      this.setVelocityX(this.dir * this.speed * 4);
      this.setVelocityY(0);
      this.scene.tweens.add({
        targets: this,
        y: this.y - 16,
        duration: 160,
        yoyo: true,
        ease: 'Sine.easeOut',
        onComplete: () => this.snapToWalkPlatform(),
      });
    }
    this.scene.time.delayedCall(2000, () => {
      if (!this.scene) return;
      this.scared = false;
      this.clearTint();
    });
  }

  returnToNormal() {
    this.scared = false;
    this.clearTint();
    // Bounce back after regrowth
    this.scene.tweens.add({
      targets: this,
      y: this.y - 15,
      duration: 300,
      yoyo: true,
      ease: 'Bounce.easeOut',
    });
  }

  update(delta) {
    if (this.scared) return;

    this.wanderTimer -= delta;
    if (this.wanderTimer <= 0) {
      this.dir *= -1;
      this.wanderTimer = 1500 + Math.random() * 2500;
    }

    const rangeX = this.flying ? 200 : 120;
    if (Math.abs(this.x - this.startX) > rangeX) {
      this.dir = this.startX > this.x ? 1 : -1;
    }

    if (this.flying) {
      // Float up and down slightly
      const floatY = Math.sin(this.scene.time.now * 0.001 + this.startX) * 12;
      const targetY = this.startY + floatY;
      this.y += (targetY - this.y) * 0.03;
      this.setVelocityX(this.dir * this.speed);
      this.setVelocityY(0);
    } else {
      if (this.walkPlatform) {
        this.snapToWalkPlatform();
        if (this.x <= this.walkMinX) this.dir = 1;
        else if (this.x >= this.walkMaxX) this.dir = -1;
      }
      this.setVelocityX(this.dir * this.speed);
      this.setVelocityY(0);
    }

    this.setFlipX(this.dir < 0);
    this.play(ANIM_KEYS[this.animalType], true);
  }
}
