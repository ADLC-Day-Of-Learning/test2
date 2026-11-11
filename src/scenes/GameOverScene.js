import Phaser from 'phaser';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  SCENE_GAME,
  SCENE_GAME_OVER,
  DEPTH_TEXT,
} from '../game/constants.js';
import { updateBestScore } from '../game/bestScore.js';
import { announceStatus } from '../game/a11y.js';
import {
  createOverlayDimmer,
  createBlinkingPrompt,
  wireConfirmControls,
} from './overlay.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SCENE_GAME_OVER);
  }

  init(data) {
    this.finalScore = data.score ?? 0;
  }

  create() {
    // The new-best decision is made once by the bestScore helper —
    // like every other round outcome, the scene only dispatches on
    // the helper's result instead of re-deriving it.
    const { best, isNewBest } = updateBestScore(this.finalScore);

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'background');
    createOverlayDimmer(this, 0.55);

    let summary = this.createSummaryTexts(best, isNewBest);
    this.createPlayAgainPrompt();

    // The restart instruction is part of the announced summary, not
    // only canvas text, so screen-reader users learn how to continue.
    summary += ' Press Enter or Space to play again.';

    announceStatus(summary);

    // The round can be restarted with the keyboard as well as the
    // pointer (WCAG 2.1.1), via the shared overlay confirm wiring.
    wireConfirmControls(this, () => this.scene.start(SCENE_GAME));
  }

  createSummaryTexts(best, isNewBest) {
    const titleStyle = { fontFamily: 'Arial', fontSize: '40px', color: '#ffffff' };
    const subStyle = { fontFamily: 'Arial', fontSize: '28px', color: '#ffe066' };

    this.add
      .text(GAME_WIDTH / 2, 170, "Time's up!", { ...titleStyle, fontSize: '56px' })
      .setOrigin(0.5)
      .setDepth(DEPTH_TEXT);
    this.add
      .text(GAME_WIDTH / 2, 270, `Final score: ${this.finalScore}`, titleStyle)
      .setOrigin(0.5)
      .setDepth(DEPTH_TEXT);
    this.add
      .text(GAME_WIDTH / 2, 340, `Best score: ${best}`, subStyle)
      .setOrigin(0.5)
      .setDepth(DEPTH_TEXT);

    let summary = `Time's up! Final score: ${this.finalScore}. Best score: ${best}.`;

    if (isNewBest && this.finalScore > 0) {
      this.add
        .text(GAME_WIDTH / 2, 405, 'New best score!', {
          ...subStyle,
          color: '#7ee8fa',
        })
        .setOrigin(0.5)
        .setDepth(DEPTH_TEXT);
      summary += ' New best score!';
    }

    return summary;
  }

  createPlayAgainPrompt() {
    const playAgain = this.add
      .text(GAME_WIDTH / 2, 490, 'Click, tap, or press Enter or Space to play again', {
        fontFamily: 'Arial',
        fontSize: '26px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_TEXT);
    createBlinkingPrompt(this, playAgain);
  }
}
