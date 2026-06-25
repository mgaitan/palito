import { GW, GH } from '../constants.js';

const PAGES = [
  {
    text: [
      'Hace mucho tiempo, el monte cordobés',
      'paravachasca era un monte lleno de vida...',
      '',
      'Quebrachos, algarrobos, jarillas y cactus',
      'daban hogar a zorros, vizcachas, pájaros',
      'y lagartijas.',
    ],
    icon: 'quebracho_full',
    iconScale: 1.15,
  },
  {
    text: [
      'Pero un día llegaron las máquinas.',
      '',
      'Excavadoras y topadoras comenzaron',
      'a arrancar los árboles para construir',
      'edificios y shoppings.',
      '',
      'El monte empezó a desaparecer...',
    ],
    icon: 'excavator_idle',
    iconScale: 0.9,
  },
  {
    text: [
      '¡Pero apareció PALITO!',
      '',
      'Este valiente personaje de palitos',
      'decidió defender el monte cordobés.',
      '',
      'Con su palo, destruye las máquinas',
      'y deja que la naturaleza vuelva a crecer.',
    ],
    icon: 'palito_idle',
    iconScale: 1.8,
  },
  {
    text: [
      'Tu misión:',
      '',
      '  Flechas: moverse',
      '  Arriba o ESPACIO: saltar',
      '  Z: atacar con el palo',
      '',
      '¡Llega a la cumbre y encontrá la semilla!',
    ],
    icon: 'seed',
    iconScale: 1.8,
  },
];

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super('IntroScene');
    this.page = 0;
    this.charIdx = 0;
    this.displayedText = '';
    this.typing = false;
    this.timer = null;
  }

  create() {
    this.page = 0;
    this.cameras.main.fadeIn(500);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0E1E0A, 1);
    bg.fillRect(0, 0, GW, GH);
    bg.fillStyle(0x1A3A0A, 0.8);
    bg.fillRoundedRect(60, 40, GW - 120, GH - 80, 16);
    bg.lineStyle(2, 0x4E8A2A, 1);
    bg.strokeRoundedRect(60, 40, GW - 120, GH - 80, 16);

    // Stars in background
    bg.fillStyle(0xFFFFFF, 0.6);
    for (let i = 0; i < 30; i++) {
      bg.fillCircle(
        Math.random() * GW,
        Math.random() * 40 + 5,
        Math.random() * 1.5 + 0.5
      );
    }

    // Story picture
    this.storyIcon = this.add.sprite(GW / 2, 92, 'palito_idle')
      .setOrigin(0.5)
      .setDepth(2);

    // Main text
    this.mainText = this.add.text(GW / 2, 180, '', {
      fontSize: '15px',
      fontFamily: "'Fredoka', 'Comic Sans MS', cursive",
      fill: '#CCFF99',
      align: 'center',
      lineSpacing: 8,
      wordWrap: { width: GW - 160 },
    }).setOrigin(0.5);

    // Page indicator
    this.pageText = this.add.text(GW / 2, GH - 80, '', {
      fontSize: '11px',
      fontFamily: "'Fredoka', 'Comic Sans MS', cursive",
      fill: '#558833',
    }).setOrigin(0.5);

    // Next button
    this.nextBg = this.add.graphics();
    this.drawNextButton(false);
    this.nextZone = this.add.zone(GW / 2, GH - 55, 200, 36).setInteractive();
    this.nextZone.on('pointerdown', () => this.advancePage());
    this.nextZone.on('pointerover', () => this.drawNextButton(true));
    this.nextZone.on('pointerout', () => this.drawNextButton(false));

    // Skip button
    const skipText = this.add.text(GW - 80, GH - 58, 'Saltar »', {
      fontSize: '13px',
      fontFamily: "'Fredoka', 'Comic Sans MS', cursive",
      fill: '#446622',
    }).setOrigin(0.5).setInteractive();
    skipText.on('pointerover', () => skipText.setFill('#88CC44'));
    skipText.on('pointerout', () => skipText.setFill('#446622'));
    skipText.on('pointerdown', () => this.startGame());

    // Space key shortcut
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.showPage(0);
  }

  drawNextButton(hover) {
    this.nextBg.clear();
    this.nextBg.fillStyle(hover ? 0x4E9E2A : 0x3D7E1A, 1);
    this.nextBg.fillRoundedRect(GW / 2 - 100, GH - 72, 200, 36, 8);
    this.nextBg.lineStyle(2, hover ? 0xFFFF00 : 0x88CC44, 1);
    this.nextBg.strokeRoundedRect(GW / 2 - 100, GH - 72, 200, 36, 8);

    if (this.nextLabel) this.nextLabel.destroy();
    const label = this.page < PAGES.length - 1 ? 'Siguiente ▶' : '¡A jugar! ▶';
    this.nextLabel = this.add.text(GW / 2, GH - 54, label, {
      fontSize: '15px',
      fontFamily: "'Bangers', 'Fredoka', 'Comic Sans MS', cursive",
      fill: '#FFFFFF',
    }).setOrigin(0.5);
  }

  showPage(idx) {
    const pg = PAGES[idx];
    this.storyIcon
      .setTexture(pg.icon)
      .setScale(pg.iconScale ?? 1)
      .setFlipX(false);
    this.mainText.setText('');
    this.charIdx = 0;
    this.displayedText = '';
    this.typing = true;

    const fullText = pg.text.join('\n');
    this.pageText.setText(`${idx + 1} / ${PAGES.length}`);

    if (this.timer) this.timer.remove();
    this.timer = this.time.addEvent({
      delay: 28,
      callback: () => {
        if (this.charIdx < fullText.length) {
          this.displayedText += fullText[this.charIdx];
          this.mainText.setText(this.displayedText);
          this.charIdx++;
        } else {
          this.typing = false;
          this.timer.remove();
        }
      },
      loop: true,
    });

    this.tweens.add({
      targets: this.storyIcon,
      scaleX: (pg.iconScale ?? 1) * 1.12,
      scaleY: (pg.iconScale ?? 1) * 1.12,
      duration: 400,
      yoyo: true,
      ease: 'Bounce.easeOut',
    });

    this.drawNextButton(false);
  }

  advancePage() {
    if (this.typing) {
      // Fast-forward text
      const pg = PAGES[this.page];
      this.mainText.setText(pg.text.join('\n'));
      this.typing = false;
      if (this.timer) this.timer.remove();
      return;
    }

    this.page++;
    if (this.page >= PAGES.length) {
      this.startGame();
    } else {
      this.showPage(this.page);
    }
  }

  startGame() {
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene', { level: 0 });
    });
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.advancePage();
    }
  }
}
