// The game renders inside a canvas, which assistive technology cannot
// see into. These helpers mirror game state into visually-hidden DOM
// elements declared in index.html so it can be announced, and expose
// whether the canvas (the keyboard-operable game target) has focus.

const STATUS_ID = 'game-status';
const STATUS_NEXT_ID = 'game-status-next';
const ALERT_ID = 'game-alerts';

// Routine messages (score, selection, miss feedback) can arrive in
// quick succession during fast play. Writing them into a single polite
// region would overwrite each message before screen readers finish
// announcing it, so announcements rotate between two status regions:
// each new message lands in the region the previous one did not use
// (WCAG 4.1.3 — status messages).
const STATUS_REGION_IDS = [STATUS_ID, STATUS_NEXT_ID];
let nextStatusRegion = 0;

/** Test helper: restart the polite-region rotation. */
export function resetStatusRotation() {
  nextStatusRegion = 0;
}

function setText(id, message) {
  if (typeof document === 'undefined') {
    return;
  }
  const region = document.getElementById(id);
  if (region) {
    region.textContent = message;
  }
}

/**
 * Update a visually-hidden polite live region (`role="status"`) with a
 * routine message for screen-reader users, such as the current score,
 * the selected hole, or miss feedback. Consecutive messages rotate
 * between the two status regions so a rapid burst of updates cannot
 * silently overwrite the previous message before screen readers
 * finish announcing it (WCAG 4.1.3).
 */
export function announceStatus(message) {
  setText(STATUS_REGION_IDS[nextStatusRegion], message);
  nextStatusRegion = (nextStatusRegion + 1) % STATUS_REGION_IDS.length;
}

/**
 * Announce a time-critical message (for example a countdown warning).
 * This uses a separate assertive region (`role="alert"`) so a routine
 * score or selection update cannot overwrite the message before screen
 * readers finish announcing it.
 */
export function announceWarning(message) {
  setText(ALERT_ID, message);
}

// Whether the game canvas currently has keyboard focus.
let gameFocused = false;
const focusListeners = new Set();

/**
 * Whether the game canvas currently has focus. Keyboard input to the
 * game should only be acted upon (and its keys captured) while this is
 * true, so page and assistive-technology keyboard navigation keeps
 * working everywhere else.
 */
export function isGameFocused() {
  return gameFocused;
}

/**
 * Subscribe to game-canvas focus changes. The listener is invoked
 * immediately with the current state, and again on every change.
 * Returns an unsubscribe function.
 */
export function onGameFocusChange(listener) {
  focusListeners.add(listener);
  listener(gameFocused);
  return () => focusListeners.delete(listener);
}

function setGameFocus(focused) {
  if (focused === gameFocused) {
    return;
  }
  gameFocused = focused;
  focusListeners.forEach((listener) => listener(focused));
}

/**
 * Make the game canvas a focusable target so keyboard users (and screen
 * readers switching into focus/forms mode) can reach the game with Tab.
 */
export function makeCanvasFocusable(canvas) {
  canvas.setAttribute('tabindex', '0');
  canvas.addEventListener('focus', () => setGameFocus(true));
  canvas.addEventListener('blur', () => setGameFocus(false));
}
