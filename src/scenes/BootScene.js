import Phaser from 'phaser';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  HOLE_WIDTH,
  HOLE_HEIGHT,
  MOLE_WIDTH,
  MOLE_HEIGHT,
  ROUND_SECONDS,
  SCENE_BOOT,
  SCENE_GAME,
  DIMMER_DEPTH,
  TEXT_DEPTH,
} from '../game/constants.js';
import { isGameFocused } from '../game/a11y.js';

const FLAG_COLORS = [0xff5f6d, 0xffc371, 0x8093f1, 0x7ee8fa, 0xb4ffd2];

/**
 * Generates all textures procedurally so the game ships with no binary
 * assets, then hands over to the game scene.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_BOOT);
  }

  create() {
    this.createBackgroundTexture();
    this.createHoleTexture();
    this.createMoleTexture();
    this.createStartScreen();
  }

  /**
   * Visible start screen shown before the first round begins, so
   * sighted players see the rules, scoring, and both control schemes
   * instead of only the sr-only description in index.html. The round
   * starts on pointer input, or via the keyboard like the game-over
   * screen: `on` (not `once`) plus the startTriggered guard, with the
   * handler gated on canvas focus.
   */
  createStartScreen() {
    this.startTriggered = false;
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'background');
    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.45)
      .setDepth(DIMMER_DEPTH);

    this.add
      .text(GAME_WIDTH / 2, 130, 'Whack-a-mole', {
        fontFamily: 'Arial',
        fontSize: '56px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(TEXT_DEPTH);

    const body = { fontFamily: 'Arial', fontSize: '26px', color: '#ffffff' };
    const lines = [
      'Moles pop out of the holes — whack them before they hide!',
      'Click or tap a mole to whack it.',
      'Arrow keys move the selection · Enter or Space whacks.',
      `Each mole scores one point · ${ROUND_SECONDS}-second round.`,
    ];
    lines.forEach((line, index) => {
      this.add
        .text(GAME_WIDTH / 2, 225 + index * 44, line, body)
        .setOrigin(0.5)
        .setDepth(TEXT_DEPTH);
    });

    const prompt = this.add
      .text(GAME_WIDTH / 2, 480, 'Click, tap, or press Enter to start', {
        ...body,
        color: '#ffe066',
      })
      .setOrigin(0.5)
      .setDepth(TEXT_DEPTH);
    this.tweens.add({
      targets: prompt,
      alpha: 0.35,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.input.once('pointerdown', () => this.startGame());
    const startOnKey = () => {
      if (isGameFocused()) {
        this.startGame();
      }
    };
    this.input.keyboard.on('keydown-ENTER', startOnKey);
    this.input.keyboard.on('keydown-SPACE', startOnKey);
  }

  startGame() {
    if (this.startTriggered) {
      return;
    }
    this.startTriggered = true;
    this.scene.start(SCENE_GAME);
  }

  createBackgroundTexture() {
    const g = this.make.graphics({ add: false });

    // Sky and grass.
    g.fillStyle(0x9adcf0);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    g.fillStyle(0x7ec850);
    g.fillRect(0, 120, GAME_WIDTH, GAME_HEIGHT - 120);

    // Alternating turf stripes for a playful carnival look.
    g.fillStyle(0x74bd49);
    for (let x = 0; x < GAME_WIDTH; x += 80) {
      g.fillRect(x, 120, 40, GAME_HEIGHT - 120);
    }

    // Bunting flags strung along the top.
    g.fillStyle(0x4a3620);
    g.fillRect(0, 22, GAME_WIDTH, 8);
    for (let i = 0; i < GAME_WIDTH / 40; i++) {
      const left = i * 40;
      g.fillStyle(FLAG_COLORS[i % FLAG_COLORS.length]);
      g.fillTriangle(left, 30, left + 40, 30, left + 20, 66);
    }

    g.generateTexture('background', GAME_WIDTH, GAME_HEIGHT);
    g.destroy();
  }

  createHoleTexture() {
    // The hole is generated in two halves so the game scene can sandwich
    // the mole between them: the back half renders behind the mole and the
    // front half (with the hole's front lip) renders above it. This works
    // with both the WebGL and Canvas renderers, unlike geometry masks.
    const back = this.make.graphics({ add: false });
    this.drawHole(back, 0);
    back.generateTexture('hole-back', HOLE_WIDTH, HOLE_HEIGHT / 2);
    back.destroy();

    const front = this.make.graphics({ add: false });
    this.drawHole(front, -HOLE_HEIGHT / 2);
    front.generateTexture('hole-front', HOLE_WIDTH, HOLE_HEIGHT / 2);
    front.destroy();
  }

  drawHole(g, offsetY) {
    const cx = HOLE_WIDTH / 2;
    const cy = HOLE_HEIGHT / 2 + offsetY;
    g.fillStyle(0x3b2a1a);
    g.fillEllipse(cx, cy, HOLE_WIDTH, HOLE_HEIGHT);
    g.lineStyle(8, 0x6b4a2a);
    g.strokeEllipse(cx, cy, HOLE_WIDTH, HOLE_HEIGHT);
  }

  createMoleTexture() {
    const g = this.make.graphics({ add: false });

    // Body.
    g.fillStyle(0x8a5a33);
    g.fillEllipse(MOLE_WIDTH / 2, MOLE_HEIGHT / 2, 88, MOLE_HEIGHT - 6);

    // Belly and snout.
    g.fillStyle(0xc89f6d);
    g.fillEllipse(MOLE_WIDTH / 2, MOLE_HEIGHT * 0.72, 52, 62);

    // Eyes.
    g.fillStyle(0x1d1206);
    g.fillCircle(MOLE_WIDTH / 2 - 16, 44, 7);
    g.fillCircle(MOLE_WIDTH / 2 + 16, 44, 7);
    g.fillStyle(0xffffff);
    g.fillCircle(MOLE_WIDTH / 2 - 14, 42, 2);
    g.fillCircle(MOLE_WIDTH / 2 + 18, 42, 2);

    // Nose.
    g.fillStyle(0xe58e8e);
    g.fillEllipse(MOLE_WIDTH / 2, 62, 16, 12);

    // Whiskers.
    g.lineStyle(2, 0x1d1206, 0.5);
    g.lineBetween(MOLE_WIDTH / 2 - 8, 62, 10, 52);
    g.lineBetween(MOLE_WIDTH / 2 - 8, 66, 10, 70);
    g.lineBetween(MOLE_WIDTH / 2 + 8, 62, MOLE_WIDTH - 10, 52);
    g.lineBetween(MOLE_WIDTH / 2 + 8, 66, MOLE_WIDTH - 10, 70);

    // Paws.
    g.fillStyle(0xc89f6d);
    g.fillEllipse(16, 30, 22, 18);
    g.fillEllipse(MOLE_WIDTH - 16, 30, 22, 18);

    g.generateTexture('mole', MOLE_WIDTH, MOLE_HEIGHT);
    g.destroy();
  }
}
