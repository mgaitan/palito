import {
  PLAYER_SPEED,
  PLAYER_JUMP,
  PLAYER_HEALTH,
  INVULN_MS,
  ATTACK_MS,
  ATTACK_COOLDOWN,
} from '../constants.js';

export default class Palito extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'palito_idle');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(22, 44);
    this.body.setOffset(5, 10);
    this.setCollideWorldBounds(false); // levels handle bounds via camera
    this.setDepth(20);
    this.setScale(1.3);

    this.health = PLAYER_HEALTH;
    this.isAttacking = false;
    this.attackCooldown = 0;
    this.invulnerable = false;
    this.facing = 'right';
    this.dead = false;

    // Attack hitbox (invisible rectangle)
    this.hitbox = scene.add.rectangle(0, 0, 48, 28, 0xFF0000, 0);
    scene.physics.add.existing(this.hitbox, false);
    this.hitbox.body.allowGravity = false;
    this.hitbox.body.setEnable(false);
  }

  setupKeys() {
    const kb = this.scene.input.keyboard;
    this.cursors = kb.createCursorKeys();
    this.wasd = {
      up:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.attackKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.attackKeyX = kb.addKey(Phaser.Input.Keyboard.KeyCodes.X);
  }

  // Called by mobile buttons
  mobileJump() {
    if (this.dead) return;
    if (this.body.blocked.down) this.setVelocityY(PLAYER_JUMP);
  }

  mobileAttack() {
    if (this.dead) return;
    if (!this.isAttacking && this.attackCooldown <= 0) this.triggerAttack();
  }

  update(time, delta, mobileLeft = false, mobileRight = false) {
    if (this.dead) return;

    const { cursors, wasd } = this;
    const onGround = this.body.blocked.down;

    // ── Horizontal movement ──────────────────────────────────
    let moving = false;
    if (cursors.left.isDown || wasd.left.isDown || mobileLeft) {
      this.setVelocityX(-PLAYER_SPEED);
      this.setFlipX(true);
      this.facing = 'left';
      moving = true;
    } else if (cursors.right.isDown || wasd.right.isDown || mobileRight) {
      this.setVelocityX(PLAYER_SPEED);
      this.setFlipX(false);
      this.facing = 'right';
      moving = true;
    } else {
      this.setVelocityX(0);
    }

    // ── Jump ─────────────────────────────────────────────────
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(cursors.up) ||
      Phaser.Input.Keyboard.JustDown(cursors.space) ||
      Phaser.Input.Keyboard.JustDown(wasd.up);

    if (jumpPressed && onGround) {
      this.setVelocityY(PLAYER_JUMP);
    }

    // ── Attack ───────────────────────────────────────────────
    this.attackCooldown -= delta;
    const attackPressed =
      Phaser.Input.Keyboard.JustDown(this.attackKey) ||
      Phaser.Input.Keyboard.JustDown(this.attackKeyX);

    if (attackPressed && !this.isAttacking && this.attackCooldown <= 0) {
      this.triggerAttack();
    }

    // ── Animations ───────────────────────────────────────────
    if (!this.isAttacking) {
      if (!onGround) {
        this.play('palito_jump', true);
      } else if (moving) {
        this.play('palito_walk', true);
      } else {
        this.play('palito_idle', true);
      }
    }

    // ── Update hitbox position ────────────────────────────────
    const dir = this.facing === 'right' ? 1 : -1;
    this.hitbox.x = this.x + dir * 36;
    this.hitbox.y = this.y - 4;
  }

  triggerAttack() {
    this.isAttacking = true;
    this.attackCooldown = ATTACK_COOLDOWN;
    this.play('palito_attack', true);
    this.hitbox.body.setEnable(true);

    // Swing effect: brief particle burst
    const dir = this.facing === 'right' ? 1 : -1;
    const swingFx = this.scene.add.particles(
      this.x + dir * 40, this.y - 10, 'star',
      {
        speed: { min: 50, max: 120 },
        angle: { min: this.facing === 'right' ? -60 : 120, max: this.facing === 'right' ? 60 : 240 },
        scale: { start: 0.8, end: 0 },
        lifespan: 250,
        quantity: 4,
        maxParticles: 4,
      }
    );
    this.scene.time.delayedCall(320, () => swingFx?.destroy?.());

    this.scene.time.delayedCall(ATTACK_MS, () => {
      this.isAttacking = false;
      this.hitbox.body.setEnable(false);
    });
  }

  takeDamage() {
    if (this.invulnerable || this.dead) return;
    this.health--;
    this.invulnerable = true;

    // Flash red
    this.setTint(0xFF4444);
    // Knockback
    const dir = this.facing === 'right' ? -1 : 1;
    this.setVelocityX(dir * 250);
    this.setVelocityY(-200);

    // Blink during invulnerability
    this.scene.tweens.add({
      targets: this,
      alpha: 0.2,
      duration: 120,
      yoyo: true,
      repeat: 5,
      onComplete: () => this.setAlpha(1),
    });

    this.scene.time.delayedCall(INVULN_MS, () => {
      this.invulnerable = false;
      this.clearTint();
    });

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    this.dead = true;
    this.hitbox.body.setEnable(false);
    this.setTint(0x888888);
    this.setVelocityX(0);
    this.setVelocityY(-300);
    this.scene.time.delayedCall(1200, () => {
      this.scene.onPlayerDie();
    });
  }

  destroy() {
    if (this.hitbox) this.hitbox.destroy();
    super.destroy();
  }
}
