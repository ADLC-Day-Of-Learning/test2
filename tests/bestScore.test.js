import { describe, expect, it, beforeEach } from 'vitest';
import {
  loadBestScore,
  updateBestScore,
  resetBestScoreSessionFallback,
} from '../src/game/bestScore.js';

beforeEach(() => {
  resetBestScoreSessionFallback();
});

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => {
      data.set(key, String(value));
    },
  };
}

describe('loadBestScore', () => {
  it('returns 0 when nothing is stored', () => {
    expect(loadBestScore(memoryStorage())).toBe(0);
  });

  it('returns the stored score', () => {
    const storage = memoryStorage({ 'whack-a-mole.best-score': '17' });
    expect(loadBestScore(storage)).toBe(17);
  });

  it('returns 0 for a corrupt stored value', () => {
    const storage = memoryStorage({ 'whack-a-mole.best-score': 'not-a-number' });
    expect(loadBestScore(storage)).toBe(0);
  });

  it('returns 0 when storage is unavailable', () => {
    expect(loadBestScore(null)).toBe(0);
  });
});

describe('updateBestScore', () => {
  it('stores a new best score and flags it', () => {
    const storage = memoryStorage();
    expect(updateBestScore(12, storage)).toEqual({ best: 12, isNewBest: true });
    expect(loadBestScore(storage)).toBe(12);
  });

  it('keeps the previous best and flags no new best when the score is lower', () => {
    const storage = memoryStorage({ 'whack-a-mole.best-score': '20' });
    expect(updateBestScore(5, storage)).toEqual({ best: 20, isNewBest: false });
    expect(loadBestScore(storage)).toBe(20);
  });

  it('updates the best score and flags it when the score is higher', () => {
    const storage = memoryStorage({ 'whack-a-mole.best-score': '20' });
    expect(updateBestScore(21, storage)).toEqual({ best: 21, isNewBest: true });
    expect(loadBestScore(storage)).toBe(21);
  });

  it('ignores invalid scores', () => {
    const storage = memoryStorage({ 'whack-a-mole.best-score': '20' });
    expect(updateBestScore(-3, storage)).toEqual({ best: 20, isNewBest: false });
    expect(updateBestScore(Number.NaN, storage)).toEqual({
      best: 20,
      isNewBest: false,
    });
    expect(loadBestScore(storage)).toBe(20);
  });

  it('returns the in-memory best when persistence fails', () => {
    const failing = memoryStorage({ 'whack-a-mole.best-score': '5' });
    failing.setItem = () => {
      throw new Error('quota exceeded');
    };
    expect(updateBestScore(10, failing)).toEqual({ best: 10, isNewBest: true });
    expect(loadBestScore(failing)).toBe(10);
  });

  it('remembers the best in memory when storage is entirely unavailable', () => {
    expect(updateBestScore(10, null)).toEqual({ best: 10, isNewBest: true });
    expect(loadBestScore(null)).toBe(10);
  });

  it('keeps raising the in-memory best across failed writes', () => {
    const failing = memoryStorage();
    failing.setItem = () => {
      throw new Error('quota exceeded');
    };
    expect(updateBestScore(7, failing)).toEqual({ best: 7, isNewBest: true });
    expect(updateBestScore(4, failing)).toEqual({ best: 7, isNewBest: false });
    expect(updateBestScore(9, failing)).toEqual({ best: 9, isNewBest: true });
    expect(loadBestScore(failing)).toBe(9);
  });

  it('does not let the in-memory best shadow a higher stored score', () => {
    const failing = memoryStorage({ 'whack-a-mole.best-score': '5' });
    failing.setItem = () => {
      throw new Error('quota exceeded');
    };
    expect(updateBestScore(6, failing)).toEqual({ best: 6, isNewBest: true });
    const working = memoryStorage({ 'whack-a-mole.best-score': '30' });
    expect(loadBestScore(working)).toBe(30);
  });

  it('does not flag a new best when the score ties the stored best', () => {
    const storage = memoryStorage({ 'whack-a-mole.best-score': '20' });
    expect(updateBestScore(20, storage)).toEqual({ best: 20, isNewBest: false });
  });
});
