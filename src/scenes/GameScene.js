import Phaser from 'phaser';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GRID_ROWS,
  GRID_COLS,
  ROUND_SECONDS,
  HOLE_WIDTH,
  HOLE_HEIGHT,
  MOLE_WIDTH,
  MOLE_HEIGHT,
  SCENE_GAME,
  SCENE_GAME_OVER,
  DEPTH_PER_ROW,
  DEPTH_HIGHLIGHT,
  DEPTH_HUD,
  DEPTH_POPUP,
} from '../game/constants.js';
import { moleUpTime, spawnInterval } from '../game/difficulty.js';
import { whackOutcome, isPointOnEmergedMole } from '../game/whack.js';
import { shouldAnnounceMilestone } from '../game/countdown.js';
import {
  initialHoleState,
  onMoleSpawned,
  onMoleWhacked,
  onMoleLowered,
  shouldLowerAfterUpTime,
} from '../game/holeState.js';
import { nextSelectedHole } from '../game/selection.js';
import {
  announceStatus,
  announceWarning,
  isGameFocused,
  onGameFocusChange,
} from '../game/a11y.js';

// Vertical extent of the hole grid.
const PLAYFIELD_TOP = 170;
const PLAYFIELD_BOTTOM = 545;

// How far a mole's bottom sits below the hole centre line when up.
const MOLE_UP_OFFSET = 22;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super(SCENE_GAME);
  }

  create() {
    this.score = 0;
    this.elapsedMs = 0;
    this.roundOver = false;
    this.nextSpawnAt = 0;
    this.selectedHole = 0;
    this.lastAnnouncedTime = null;

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'background');
    this.createHud();
    this.createHoles();
    this.createSelectionHighlight();
    this.createControlsHint();
    this.registerKeyboardControls();

    announceStatus(`Round started. ${ROUND_SECONDS} seconds on the clock.`);
  }

  createHud() {
    const style = {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 5,
    };
    this.scoreText = this.add
      .text(16, 14, 'Score: 0', style)
      .setDepth(DEPTH_HUD);
    this.timerText = this.add
      .text(GAME_WIDTH - 16, 14, `Time: ${ROUND_SECONDS}`, style)
      .setOrigin(1, 0)
      .setDepth(DEPTH_HUD);
  }

  createHoles() {
    this.holes = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const x = ((col + 1) * GAME_WIDTH) / (GRID_COLS + 1);
        const y =
          PLAYFIELD_TOP +
          (row * (PLAYFIELD_BOTTOM - PLAYFIELD_TOP)) / (GRID_ROWS - 1);
        this.holes.push(this.createHole(x, y, row * DEPTH_PER_ROW));
      }
    }
  }

  createHole(x, y, depth) {
    // The hole is drawn in two halves with the mole sandwiched between
    // them, and a cropped copy of the background is re-drawn above the
    // mole below the hole's centre line. This depth ordering hides the
    // mole the same way a geometry mask would, but unlike masks (and
    // tint fills) it works with both the WebGL and Canvas renderers.
    this.add
      .image(x, y - HOLE_HEIGHT / 2, 'hole-back')
      .setOrigin(0.5, 0)
      .setDepth(depth + 1);

    const mole = this.add
      .image(x, y + MOLE_HEIGHT, 'mole')
      .setOrigin(0.5, 1)
      .setDepth(depth + 2)
      .setInteractive({
        // Restrict the hit area to the mole's emerged region: the part
        // of the texture above the hole's centre line. The rest of the
        // sprite rectangle lies over covered background, so clicking
        // the playfield there must not register as a whack attempt.
        hitArea: new Phaser.Geom.Rectangle(0, 0, MOLE_WIDTH, MOLE_HEIGHT),
        hitAreaCallback: (area, localX, localY) =>
          Phaser.Geom.Rectangle.Contains(area, localX, localY) &&
          isPointOnEmergedMole(mole.y, y, localY),
        useHandCursor: true,
      });

    const coverWidth = HOLE_WIDTH;
    const coverHeight = Math.min(MOLE_HEIGHT, GAME_HEIGHT - y);
    this.add
      .image(0, 0, 'background')
      .setOrigin(0, 0)
      .setDepth(depth + 3)
      .setCrop(x - coverWidth / 2, y, coverWidth, coverHeight);

    this.add
      .image(x, y, 'hole-front')
      .setOrigin(0.5, 0)
      .setDepth(depth + 4);

    const hole = { x, y, mole, state: initialHoleState() };
    mole.on('pointerdown', () => this.whack(hole));

    // A pointer click on the hole itself — not only on an emerged
    // mole — is a whack attempt too, routed through the same whack()
    // and miss-feedback path as keyboard input. The zone sits below
    // the mole sprite in depth, so a click on the mole's emerged
    // region still reaches the mole handler first, while a click on
    // an empty hole (or the covered part of a rising mole) falls
    // through to the zone: pointer users get the same Missed marker
    // and announcement as keyboard users instead of no feedback at
    // all (WCAG 4.1.3, feedback consistency).
    this.add
      .zone(x, y, HOLE_WIDTH, HOLE_HEIGHT)
      .setDepth(depth + 1)
      .setInteractive()
      .on('pointerdown', () => this.whack(hole));

    return hole;
  }

  createSelectionHighlight() {
    this.selectionGfx = this.add.graphics().setDepth(DEPTH_HIGHLIGHT);
    this.updateSelectionHighlight();
  }

  createControlsHint() {
    // Visible on-screen hint so sighted keyboard users discover the
    // controls; it fades out shortly after the round starts.
    const hint = this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT - 16,
        'Arrow keys to aim · Enter or Space to whack',
        {
          fontFamily: 'Arial',
          fontSize: '20px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 4,
        },
      )
      .setOrigin(0.5, 1)
      .setDepth(DEPTH_HUD);
    this.tweens.add({
      targets: hint,
      alpha: 0,
      delay: 4000,
      duration: 1000,
      ease: 'Quad.easeIn',
      onComplete: () => hint.destroy(),
    });
  }

  updateSelectionHighlight() {
    const hole = this.holes[this.selectedHole];
    this.selectionGfx.clear();
    this.selectionGfx.lineStyle(3, 0xffe066, 0.9);
    this.selectionGfx.strokeRoundedRect(
      hole.x - HOLE_WIDTH / 2 - 6,
      hole.y - HOLE_HEIGHT / 2 - 6,
      HOLE_WIDTH + 12,
      HOLE_HEIGHT + 12,
      12,
    );
  }

  registerKeyboardControls() {
    // Arrow keys move between holes; Enter or Space whacks the selected
    // hole, so the game is fully playable without a pointer (WCAG 2.1.1).
    const keyboard = this.input.keyboard;
    keyboard.addCapture('UP,DOWN,LEFT,RIGHT,ENTER,SPACE');
    // The capture (which preventDefaults the keys) is only active while
    // the game canvas has focus, so assistive-technology and page
    // keyboard navigation keeps working everywhere else. The handlers
    // below are likewise gated on focus in moveSelection/whackSelected.
    const unsubscribe = onGameFocusChange((focused) => {
      if (focused) {
        keyboard.enableGlobalCapture();
      } else {
        keyboard.disableGlobalCapture();
      }
    });
    this.events.once('shutdown', () => {
      unsubscribe();
      keyboard.disableGlobalCapture();
    });
    keyboard.on('keydown-LEFT', () => this.moveSelection(-1, 0));
    keyboard.on('keydown-RIGHT', () => this.moveSelection(1, 0));
    keyboard.on('keydown-UP', () => this.moveSelection(0, -1));
    keyboard.on('keydown-DOWN', () => this.moveSelection(0, 1));
    keyboard.on('keydown-ENTER', () => this.whackSelected());
    keyboard.on('keydown-SPACE', () => this.whackSelected());
  }

  moveSelection(dx, dy) {
    if (this.roundOver || !isGameFocused()) {
      return;
    }
    // The clamping lives in the pure nextSelectedHole helper so it is
    // unit-tested; the scene only dispatches on its result.
    const newIndex = nextSelectedHole(
      this.selectedHole,
      dx,
      dy,
      GRID_ROWS,
      GRID_COLS,
    );
    if (newIndex !== this.selectedHole) {
      this.selectedHole = newIndex;
      this.updateSelectionHighlight();
      const newRow = Math.floor(newIndex / GRID_COLS);
      const newCol = newIndex % GRID_COLS;
      announceStatus(`Hole ${newRow + 1}-${newCol + 1} selected`);
    }
  }

  whackSelected() {
    if (!isGameFocused()) {
      return;
    }
    this.whack(this.holes[this.selectedHole]);
  }

  trySpawnMole() {
    const free = this.holes.filter((hole) => !hole.state.busy);
    if (free.length === 0) {
      return;
    }
    const hole = Phaser.Utils.Array.GetRandom(free);
    hole.state = onMoleSpawned(hole.state);

    this.tweens.add({
      targets: hole.mole,
      y: hole.y + MOLE_UP_OFFSET,
      duration: 180,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(moleUpTime(this.elapsedMs), () => {
          if (shouldLowerAfterUpTime(hole.state)) {
            this.lowerMole(hole);
          }
        });
      },
    });
  }

  lowerMole(hole) {
    this.tweens.add({
      targets: hole.mole,
      y: hole.y + MOLE_HEIGHT,
      duration: 160,
      ease: 'Quad.easeIn',
      onComplete: () => {
        hole.state = onMoleLowered(hole.state);
      },
    });
  }

  whack(hole) {
    // The outcome decision (which rejections still count as a miss
    // versus which input is ignored entirely) lives in the pure
    // whackOutcome helper so it is unit-tested; the scene only
    // dispatches on its result.
    const outcome = whackOutcome({
      roundOver: this.roundOver,
      busy: hole.state.busy,
      whacked: hole.state.whacked,
      moleY: hole.mole.y,
      holeY: hole.y,
    });
    if (outcome === 'ignored') {
      return;
    }
    if (outcome === 'miss') {
      // The visual marker and the announcement use the same word so
      // sighted and non-visual users get identical feedback.
      announceStatus('Missed');
      this.showPopup(hole, 'Missed', '#b8b8b8');
      return;
    }

    hole.state = onMoleWhacked(hole.state);
    this.score += 1;
    this.scoreText.setText(`Score: ${this.score}`);
    announceStatus(`Score: ${this.score}`);
    this.showPopup(hole, '+1', '#ffe066');

    // Squash-and-flash. An alpha dip is used instead of a tint fill so the
    // effect also works with the Canvas renderer.
    this.tweens.killTweensOf(hole.mole);
    this.tweens.add({
      targets: hole.mole,
      scaleX: 1.25,
      scaleY: 0.8,
      alpha: 0.4,
      duration: 70,
      yoyo: true,
      onComplete: () => {
        hole.mole.setScale(1);
        hole.mole.setAlpha(1);
        this.lowerMole(hole);
      },
    });
  }

  // A rejected whack — an empty hole, an already-whacked mole, or one
  // still (almost) inside its hole — still gives feedback: a polite
  // announcement plus a brief visual marker, so keyboard and
  // screen-reader users can tell a miss apart from an unresponsive
  // game (WCAG 4.1.3).
  //
  // The same floating popup serves both outcomes — the gray 'Missed'
  // marker and the golden '+1' — so the animation and teardown logic
  // exists only once.
  showPopup(hole, label, color) {
    const popup = this.add
      .text(hole.x, hole.y - 100, label, {
        fontFamily: 'Arial',
        fontSize: '32px',
        color,
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_POPUP);
    this.tweens.add({
      targets: popup,
      y: popup.y - 45,
      alpha: 0,
      duration: 500,
      ease: 'Quad.easeOut',
      onComplete: () => popup.destroy(),
    });
  }

  update(time, delta) {
    if (this.roundOver) {
      return;
    }

    this.elapsedMs += delta;
    const remaining = Math.max(
      0,
      ROUND_SECONDS - Math.floor(this.elapsedMs / 1000),
    );
    this.timerText.setText(`Time: ${remaining}`);
    if (remaining <= 10) {
      this.timerText.setColor('#ff5252');
    }

    // Announce the countdown at a few milestones so screen-reader users
    // can follow the round without being flooded with messages. The
    // milestone lookup and the dedup guard (each milestone announced
    // once, despite the update loop ticking faster than once per second)
    // both live in the pure shouldAnnounceMilestone helper, which
    // returns the announcement to make — or null when there is none —
    // so the decision is evaluated exactly once per frame; only the 10-
    // and 5-seconds-left warnings are time-critical enough for the
    // assertive alert region.
    const announcement = shouldAnnounceMilestone(
      remaining,
      this.lastAnnouncedTime,
    );
    if (announcement) {
      this.lastAnnouncedTime = remaining;
      if (announcement.region === 'alert') {
        announceWarning(announcement.message);
      } else {
        announceStatus(announcement.message);
      }
    }

    if (this.elapsedMs >= ROUND_SECONDS * 1000) {
      this.endRound();
      return;
    }

    if (time >= this.nextSpawnAt) {
      this.trySpawnMole();
      this.nextSpawnAt = time + spawnInterval(this.elapsedMs);
    }
  }

  endRound() {
    this.roundOver = true;
    this.time.removeAllEvents();
    this.scene.start(SCENE_GAME_OVER, { score: this.score });
  }
}
