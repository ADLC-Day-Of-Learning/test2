// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  announceStatus,
  announceWarning,
  isGameFocused,
  makeCanvasFocusable,
  onGameFocusChange,
} from '../src/game/a11y.js';

// The a11y module keeps its focus state at module scope and only exposes
// it through canvas focus/blur listeners, so tests share that state.
// Each test normalizes it back to unfocused first: dispatching blur when
// already unfocused is a no-op, so this is safe in any test order.
function freshCanvas() {
  const canvas = document.createElement('canvas');
  makeCanvasFocusable(canvas);
  canvas.dispatchEvent(new Event('blur'));
  return canvas;
}

beforeEach(() => {
  document.body.innerHTML =
    '<p id="game-status" role="status" aria-live="polite"></p>' +
    '<p id="game-alerts" role="alert"></p>';
});

describe('live region routing', () => {
  it('announceStatus writes to the polite status region only', () => {
    announceStatus('Score: 3');
    expect(document.getElementById('game-status').textContent).toBe('Score: 3');
    expect(document.getElementById('game-alerts').textContent).toBe('');
  });

  it('announceWarning writes to the assertive alert region only', () => {
    announceWarning('10 seconds remaining');
    expect(document.getElementById('game-alerts').textContent).toBe(
      '10 seconds remaining',
    );
    expect(document.getElementById('game-status').textContent).toBe('');
  });
});

describe('canvas focus tracking', () => {
  it('makeCanvasFocusable makes the canvas focusable and tracks focus', () => {
    const canvas = document.createElement('canvas');
    expect(canvas.getAttribute('tabindex')).toBeNull();
    makeCanvasFocusable(canvas);
    expect(canvas.getAttribute('tabindex')).toBe('0');

    canvas.dispatchEvent(new Event('blur'));
    expect(isGameFocused()).toBe(false);
    canvas.dispatchEvent(new Event('focus'));
    expect(isGameFocused()).toBe(true);
    canvas.dispatchEvent(new Event('blur'));
    expect(isGameFocused()).toBe(false);
  });

  it('onGameFocusChange invokes the listener immediately and on every change', () => {
    const canvas = freshCanvas();
    const listener = vi.fn();
    onGameFocusChange(listener);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenLastCalledWith(false);

    canvas.dispatchEvent(new Event('focus'));
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(true);

    canvas.dispatchEvent(new Event('blur'));
    expect(listener).toHaveBeenCalledTimes(3);
    expect(listener).toHaveBeenLastCalledWith(false);
  });

  it('an unchanged focus state does not notify listeners', () => {
    const canvas = freshCanvas();
    const listener = vi.fn();
    onGameFocusChange(listener);
    expect(listener).toHaveBeenCalledTimes(1);

    // Already unfocused, so another blur must not fire the listener.
    canvas.dispatchEvent(new Event('blur'));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('unsubscribing stops delivery of focus changes', () => {
    const canvas = freshCanvas();
    const listener = vi.fn();
    const unsubscribe = onGameFocusChange(listener);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    canvas.dispatchEvent(new Event('focus'));
    expect(listener).toHaveBeenCalledTimes(1);
    // The focus state itself still updates for other listeners.
    expect(isGameFocused()).toBe(true);
  });
});
