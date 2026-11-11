import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './game/constants.js';
import { makeCanvasFocusable } from './game/a11y.js';
import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#9adcf0',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, GameScene, GameOverScene],
});

// Phaser 3 defers booting (and with it canvas creation) past the
// constructor, so the canvas only exists once the game emits 'ready'.
// Set its accessibility attributes then: Phaser sets none itself.
game.events.once('ready', () => {
  const canvas = game.canvas;
  canvas.setAttribute('role', 'application');
  canvas.setAttribute(
    'aria-label',
    'Whack-a-mole game. Use arrow keys to aim and Enter or Space to whack.',
  );
  // The canvas is the keyboard-operable game target: make it focusable
  // and give it focus so keyboard users can reach and discover it.
  makeCanvasFocusable(canvas);
  canvas.focus();
});
