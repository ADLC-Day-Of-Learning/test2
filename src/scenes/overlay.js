// Shared scaffolding for the full-screen overlay screens (the boot
// start screen and the game-over screen), extracted so the two scenes
// do not each keep a near-identical copy of it. The scenes still own
// their content; this module owns the dimmer, the blinking prompt, and
// the confirm-action wiring, with one naming scheme (confirm*) shared
// by both screens.
import { GAME_WIDTH, GAME_HEIGHT, DEPTH_DIMMER } from '../game/constants.js';
import { isGameFocused } from '../game/a11y.js';

// The blinking prompt fades to this alpha and back, indefinitely.
const PROMPT_BLINK_ALPHA = 0.35;
const PROMPT_BLINK_DURATION_MS = 700;

/**
 * Adds the dimmer rectangle shared by the overlay screens: a black
 * overlay at the given alpha, above the background image and below
 * the overlay text.
 */
export function createOverlayDimmer(scene, alpha) {
  return scene.add
    .rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x000000,
      alpha,
    )
    .setDepth(DEPTH_DIMMER);
}

/**
 * Makes the given prompt text blink (fade partway out and back,
 * indefinitely), as the shared "press to continue" affordance.
 */
export function createBlinkingPrompt(scene, prompt) {
  scene.tweens.add({
    targets: prompt,
    alpha: PROMPT_BLINK_ALPHA,
    duration: PROMPT_BLINK_DURATION_MS,
    yoyo: true,
    repeat: -1,
  });
  return prompt;
}

/**
 * Wires the overlay's confirm action: pointer input anywhere on the
 * screen, or the ENTER/SPACE keys, run `onConfirm` exactly once. The
 * keyboard handlers use `on` (not `once`) so a keypress while the
 * canvas is unfocused cannot silently consume them and leave the
 * screen un-confirmable; keyboard confirms are only honored while the
 * game canvas has focus, so keys pressed while interacting with the
 * rest of the page do not confirm the overlay. The one-shot guard
 * prevents pointer and keyboard input from double-confirming, and
 * scene shutdown removes the listeners.
 */
export function wireConfirmControls(scene, onConfirm) {
  let confirmTriggered = false;
  const triggerConfirm = () => {
    if (confirmTriggered) {
      return;
    }
    confirmTriggered = true;
    onConfirm();
  };

  scene.input.once('pointerdown', triggerConfirm);

  const confirmOnKey = () => {
    if (isGameFocused()) {
      triggerConfirm();
    }
  };
  scene.input.keyboard.on('keydown-ENTER', confirmOnKey);
  scene.input.keyboard.on('keydown-SPACE', confirmOnKey);
}
