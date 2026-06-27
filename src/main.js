import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import IntroScene from './scenes/IntroScene.js';
import GameScene from './scenes/GameScene.js';
import WinScene from './scenes/WinScene.js';
import { GW, GH } from './constants.js';

const config = {
  type: Phaser.AUTO,
  width: GW,
  height: GH,
  parent: 'game',
  backgroundColor: '#1A2A1A',
  input: {
    activePointers: 4,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 900 },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, IntroScene, GameScene, WinScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GW,
    height: GH,
    expandParent: true,
    fullscreenTarget: 'game',
  },
  render: {
    antialias: true,
    antialiasGL: true,
    pixelArt: false,
    roundPixels: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
  },
};

const game = new Phaser.Game(config);

function requestImmersiveMode() {
  const target = document.getElementById('game');
  if (!target) return;

  if (!document.fullscreenElement && target.requestFullscreen) {
    target.requestFullscreen().catch(() => {});
  }

  if (screen.orientation?.lock) {
    screen.orientation.lock('landscape').catch(() => {});
  }

  game.scale.refresh();
}

const isTouchDevice = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
if (isTouchDevice) {
  window.addEventListener('pointerdown', requestImmersiveMode, { once: true, passive: true });
  window.addEventListener('resize', () => game.scale.refresh());
  window.visualViewport?.addEventListener('resize', () => game.scale.refresh());
}
