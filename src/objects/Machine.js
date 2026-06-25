export default class Machine extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    const key = `${type}_idle`;
    super(scene, x, y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.machineType = type;
    this.maxHealth = type === 'bulldozer' ? 4 : 3;
    this.health = this.maxHealth;
    this.speed = type === 'bulldozer' ? 50 : 45;
    this.direction = -1; // start moving left toward player
    this.dead = false;
    this.stunned = false;
    this.stunTimer = 0;
    this.patrolDir = Math.random() < 0.5 ? 1 : -1;
    this.patrolTimer = 0;
    this.patrolRange = 180 + Math.random() * 120;
    this.startX = x;

    this.setDepth(15);
    this.setScale(1.0);

    // Physics body size
    if (type === 'excavator') {
      this.body.setSize(72, 46);
      this.body.setOffset(4, 10);
    } else {
      this.body.setSize(76, 44);
      this.body.setOffset(4, 8);
    }

    this.body.setCollideWorldBounds(false);
    this.body.allowGravity = true;

    // Health bar
    this.healthBar = scene.add.graphics().setDepth(25);
    this.updateHealthBar();

    // State machine
    this.state = 'patrol'; // patrol | chase | idle
    this.chaseRange = 320;
  }

  update(time, delta, playerX, playerY) {
    if (this.dead) return;

    this.patrolTimer -= delta;
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Stun check
    if (this.stunned) {
      this.stunTimer -= delta;
      if (this.stunTimer <= 0) {
        this.stunned = false;
        this.clearTint();
      }
      this.setVelocityX(0);
      this.updateHealthBar();
      return;
    }

    // State transitions
    if (dist < this.chaseRange) {
      this.state = 'chase';
    } else if (dist > this.chaseRange + 100) {
      this.state = 'patrol';
    }

    if (this.state === 'chase') {
      // Chase player
      const dir = dx < 0 ? -1 : 1;
      this.setVelocityX(dir * this.speed * 1.5);
      this.setFlipX(dir > 0);
      this.play(`${this.machineType}_move`, true);
    } else {
      // Patrol back and forth
      if (this.patrolTimer <= 0) {
        this.patrolDir *= -1;
        this.patrolTimer = 1500 + Math.random() * 1000;
      }

      const atEdge = Math.abs(this.x - this.startX) > this.patrolRange;
      if (atEdge) this.patrolDir *= -1;

      this.setVelocityX(this.patrolDir * this.speed);
      this.setFlipX(this.patrolDir > 0);

      if (Math.abs(this.body.velocity.x) > 5) {
        this.play(`${this.machineType}_move`, true);
      } else {
        this.play(`${this.machineType}_idle`, true);
      }
    }

    this.updateHealthBar();
  }

  hit(damage = 1) {
    if (this.dead || this.stunned) return false;

    this.health -= damage;
    this.stunned = true;
    this.stunTimer = 420;

    this.play(`${this.machineType}_hit`, true);
    this.setTint(0xFF6666);

    // Emit smoke particles (one-shot burst: maxParticles = quantity)
    const smoke = this.scene.add.particles(this.x, this.y - 20, 'dust', {
      speed: { min: 40, max: 100 },
      angle: { min: -120, max: -60 },
      scale: { start: 0.8, end: 0 },
      lifespan: 380,
      quantity: 6,
      maxParticles: 6,
      tint: [0xFF8800, 0xFF4400, 0x888888],
    }).setDepth(30);
    this.scene.time.delayedCall(450, () => smoke?.destroy?.());

    // Numbers: show damage
    const dmgText = this.scene.add.text(this.x, this.y - 40, `-${damage}`, {
      fontSize: '18px',
      fontFamily: '"Comic Sans MS", cursive',
      fill: '#FF4444',
      stroke: '#FFFFFF',
      strokeThickness: 2,
    }).setDepth(40);
    this.scene.tweens.add({
      targets: dmgText,
      y: dmgText.y - 40,
      alpha: 0,
      duration: 700,
      onComplete: () => dmgText.destroy(),
    });

    if (this.health <= 0) {
      this.explode();
      return true; // destroyed
    }
    return false;
  }

  explode() {
    this.dead = true;
    this.setVelocityX(0);
    this.healthBar.destroy();

    // Big explosion - 3 bursts, each one-shot (maxParticles = quantity)
    for (let i = 0; i < 3; i++) {
      const px = this.x, py = this.y;
      this.scene.time.delayedCall(i * 150, () => {
        if (!this.scene?.add) return;
        const blast = this.scene.add.particles(
          px + (Math.random() - 0.5) * 50,
          py - 15 + (Math.random() - 0.5) * 25,
          'dust',
          {
            speed: { min: 60, max: 160 },
            angle: { min: 0, max: 360 },
            scale: { start: 1.0, end: 0 },
            lifespan: 550,
            quantity: 10,
            maxParticles: 10,
            tint: [0xFF8800, 0xFF4400, 0xFFCC00, 0x888888],
          }
        ).setDepth(30);
        this.scene?.time?.delayedCall(700, () => blast?.destroy?.());
      });
    }

    // Shake camera
    this.scene.cameras.main.shake(300, 0.015);

    // Score text
    const pts = this.scene.add.text(this.x, this.y - 50, '¡DESTRUIDA!', {
      fontSize: '14px',
      fontFamily: '"Comic Sans MS", cursive',
      fill: '#FFFF44',
      stroke: '#884400',
      strokeThickness: 2,
    }).setDepth(40);
    this.scene.tweens.add({
      targets: pts,
      y: pts.y - 60,
      alpha: 0,
      duration: 1200,
      onComplete: () => pts.destroy(),
    });

    // Fade out and destroy
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      angle: (Math.random() - 0.5) * 90,
      y: this.y + 20,
      duration: 600,
      onComplete: () => {
        this.destroy();
      },
    });
  }

  updateHealthBar() {
    this.healthBar.clear();
    if (this.dead) return;

    const bw = 60, bh = 6;
    const bx = this.x - bw / 2;
    const by = this.y - 60;

    // Background
    this.healthBar.fillStyle(0x440000, 0.8);
    this.healthBar.fillRoundedRect(bx, by, bw, bh, 2);

    // Health fill
    const ratio = Math.max(0, this.health / this.maxHealth);
    const fillColor = ratio > 0.6 ? 0x44CC44 : ratio > 0.3 ? 0xFFAA00 : 0xFF3300;
    this.healthBar.fillStyle(fillColor, 1);
    this.healthBar.fillRoundedRect(bx, by, bw * ratio, bh, 2);

    // Border
    this.healthBar.lineStyle(1, 0xFFFFFF, 0.6);
    this.healthBar.strokeRoundedRect(bx, by, bw, bh, 2);
  }

  destroy() {
    if (this.healthBar) this.healthBar.destroy();
    super.destroy();
  }
}
