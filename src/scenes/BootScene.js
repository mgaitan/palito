import {
  makePalito,
  makeExcavator,
  makeBulldozer,
  makePlants,
  makeAnimals,
  makeUI,
  makeBackground,
} from '../drawUtils.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    const text = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Cargando el monte...',
      { fontSize: '20px', fill: '#4E8A2A', fontFamily: 'Courier New' }
    ).setOrigin(0.5);

    // Generate all textures programmatically
    makePalito(this);
    makeExcavator(this);
    makeBulldozer(this);
    makePlants(this);
    makeAnimals(this);
    makeUI(this);
    makeBackground(this);

    // Register animations
    this.registerAnimations();

    text.destroy();
    this.scene.start('MenuScene');
  }

  registerAnimations() {
    const anims = this.anims;

    // Palito animations
    anims.create({
      key: 'palito_idle',
      frames: [{ key: 'palito_idle' }],
      frameRate: 1,
      repeat: -1,
    });

    anims.create({
      key: 'palito_walk',
      frames: [
        { key: 'palito_walk1' },
        { key: 'palito_walk2' },
      ],
      frameRate: 8,
      repeat: -1,
    });

    anims.create({
      key: 'palito_jump',
      frames: [{ key: 'palito_jump' }],
      frameRate: 1,
      repeat: -1,
    });

    anims.create({
      key: 'palito_attack',
      frames: [
        { key: 'palito_attack1' },
        { key: 'palito_attack2' },
        { key: 'palito_attack1' },
      ],
      frameRate: 14,
      repeat: 0,
    });

    // Excavator animations
    anims.create({
      key: 'excavator_idle',
      frames: [{ key: 'excavator_idle' }],
      frameRate: 1,
      repeat: -1,
    });
    anims.create({
      key: 'excavator_move',
      frames: [
        { key: 'excavator_move1' },
        { key: 'excavator_move2' },
      ],
      frameRate: 5,
      repeat: -1,
    });
    anims.create({
      key: 'excavator_hit',
      frames: [{ key: 'excavator_hit' }],
      frameRate: 1,
      repeat: 0,
    });

    // Bulldozer animations
    anims.create({
      key: 'bulldozer_idle',
      frames: [{ key: 'bulldozer_idle' }],
      frameRate: 1,
      repeat: -1,
    });
    anims.create({
      key: 'bulldozer_move',
      frames: [
        { key: 'bulldozer_move1' },
        { key: 'bulldozer_move2' },
      ],
      frameRate: 5,
      repeat: -1,
    });
    anims.create({
      key: 'bulldozer_hit',
      frames: [{ key: 'bulldozer_hit' }],
      frameRate: 1,
      repeat: 0,
    });

    // Animal animations
    anims.create({
      key: 'vizcacha_hop',
      frames: [
        { key: 'vizcacha_idle' },
        { key: 'vizcacha_hop' },
        { key: 'vizcacha_idle' },
      ],
      frameRate: 4,
      repeat: -1,
    });

    anims.create({
      key: 'bird_fly',
      frames: [
        { key: 'bird_fly1' },
        { key: 'bird_fly2' },
      ],
      frameRate: 7,
      repeat: -1,
    });

    anims.create({
      key: 'lizard_walk',
      frames: [
        { key: 'lizard_idle' },
        { key: 'lizard_walk' },
      ],
      frameRate: 5,
      repeat: -1,
    });

    anims.create({
      key: 'fox_walk',
      frames: [
        { key: 'fox_idle' },
        { key: 'fox_walk' },
      ],
      frameRate: 5,
      repeat: -1,
    });

    anims.create({
      key: 'condor_glide',
      frames: [
        { key: 'condor_glide1' },
        { key: 'condor_glide2' },
      ],
      frameRate: 3,
      repeat: -1,
    });
  }
}
