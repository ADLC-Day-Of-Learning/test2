// The game renders inside a canvas, which assistive technology cannot
// see into. These helpers mirror game state into visually-hidden DOM
// elements declared in index.html so it can be announced, and expose
// whether the canvas (the keyboard-operable game target) has focus.

const STATUS_ID = 'game-status';
const ALERT_ID = 'game-alerts';

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
 * Update the visually-hidden live region (`role="status"`) with a routine
 * message for screen-reader users, such as the current score or the
 * selected hole.
 */
export function announceStatus(message) {
  setText(STATUS_ID, message);
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
