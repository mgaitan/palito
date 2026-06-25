import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import IntroScene from './scenes/IntroScene.js';
import GameScene from './scenes/GameScene.js';
import WinScene from './scenes/WinScene.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  parent: document.body,
  backgroundColor: '#1A2A1A',
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
    width: 800,
    height: 450,
    zoom: 1,
  },
  render: {
    antialias: true,
    antialiasGL: true,
    pixelArt: false,
    roundPixels: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
  },
};

new Phaser.Game(config);
