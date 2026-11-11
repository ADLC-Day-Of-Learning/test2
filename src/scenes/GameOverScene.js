import Phaser from 'phaser';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  SCENE_GAME,
  SCENE_GAME_OVER,
  DIMMER_DEPTH,
  TEXT_DEPTH,
} from '../game/constants.js';
import { loadBestScore, updateBestScore } from '../game/bestScore.js';
import { announceStatus, isGameFocused } from '../game/a11y.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SCENE_GAME_OVER);
  }

  init(data) {
    this.finalScore = data.score ?? 0;
  }

  create() {
    this.restartTriggered = false;
    const previousBest = loadBestScore();
    const best = updateBestScore(this.finalScore);
    const isNewBest = best > previousBest;

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'background');
    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.55)
      .setDepth(DIMMER_DEPTH);

    const center = { fontFamily: 'Arial', fontSize: '40px', color: '#ffffff' };
    const sub = { fontFamily: 'Arial', fontSize: '28px', color: '#ffe066' };

    this.add
      .text(GAME_WIDTH / 2, 170, "Time's up!", { ...center, fontSize: '56px' })
      .setOrigin(0.5)
      .setDepth(TEXT_DEPTH);
    this.add
      .text(GAME_WIDTH / 2, 270, `Final score: ${this.finalScore}`, center)
      .setOrigin(0.5)
      .setDepth(TEXT_DEPTH);
    this.add
      .text(GAME_WIDTH / 2, 340, `Best score: ${best}`, sub)
      .setOrigin(0.5)
      .setDepth(TEXT_DEPTH);

    let summary = `Time's up! Final score: ${this.finalScore}. Best score: ${best}.`;

    if (isNewBest && this.finalScore > 0) {
      this.add
        .text(GAME_WIDTH / 2, 405, 'New best score!', {
          ...sub,
          color: '#7ee8fa',
        })
        .setOrigin(0.5)
        .setDepth(TEXT_DEPTH);
      summary += ' New best score!';
    }

    const playAgain = this.add
      .text(GAME_WIDTH / 2, 490, 'Click, tap, or press Enter to play again', {
        fontFamily: 'Arial',
        fontSize: '26px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(TEXT_DEPTH);

    this.tweens.add({
      targets: playAgain,
      alpha: 0.35,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    // The restart instruction is part of the announced summary, not
    // only canvas text, so screen-reader users learn how to continue.
    summary += ' Press Enter to play again.';

    announceStatus(summary);

    // The round can be restarted with the keyboard as well as the
    // pointer (WCAG 2.1.1). Keyboard restarts are only honored while the
    // game canvas has focus, so keys pressed while interacting with the
    // rest of the page do not restart the game. The handlers use `on`
    // (not `once`) so a keypress while the canvas is unfocused cannot
    // silently consume them and leave the screen un-restartable; the
    // restartTriggered guard in restart() prevents double restarts, and
    // scene shutdown removes the listeners.
    this.input.once('pointerdown', () => this.restart());
    const restartOnKey = () => {
      if (isGameFocused()) {
        this.restart();
      }
    };
    this.input.keyboard.on('keydown-ENTER', restartOnKey);
    this.input.keyboard.on('keydown-SPACE', restartOnKey);
  }

  restart() {
    if (this.restartTriggered) {
      return;
    }
    this.restartTriggered = true;
    this.scene.start(SCENE_GAME);
  }
}
