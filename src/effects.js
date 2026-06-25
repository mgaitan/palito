export function spawnSpriteBurst(scene, x, y, key, options = {}) {
  if (!scene?.add || !scene?.tweens) return;

  const {
    count = 8,
    speed = 100,
    duration = 500,
    depth = 30,
    angleMin = 0,
    angleMax = 360,
    scaleMin = 0.6,
    scaleMax = 1.1,
    tints,
    scrollFactor,
  } = options;

  for (let i = 0; i < count; i++) {
    const angle = Phaser.Math.DegToRad(Phaser.Math.Between(angleMin, angleMax));
    const distance = speed * Phaser.Math.FloatBetween(0.35, 1);
    const sprite = scene.add.image(x, y, key)
      .setDepth(depth)
      .setScale(Phaser.Math.FloatBetween(scaleMin, scaleMax))
      .setAlpha(0.95);

    if (scrollFactor !== undefined) sprite.setScrollFactor(scrollFactor);
    if (tints?.length) sprite.setTint(Phaser.Utils.Array.GetRandom(tints));

    scene.tweens.add({
      targets: sprite,
      x: x + Math.cos(angle) * distance,
      y: y + Math.sin(angle) * distance - 12,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration,
      ease: 'Quad.easeOut',
      onComplete: () => sprite.destroy(),
    });
  }
}
