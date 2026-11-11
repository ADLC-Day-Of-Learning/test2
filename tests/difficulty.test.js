import { describe, expect, it } from 'vitest';
import { ROUND_SECONDS } from '../src/game/constants.js';
import {
  MOLE_UP_TIME_END,
  MOLE_UP_TIME_START,
  SPAWN_INTERVAL_END,
  SPAWN_INTERVAL_START,
  moleUpTime,
  roundProgress,
  spawnInterval,
} from '../src/game/difficulty.js';

const ROUND_MS = ROUND_SECONDS * 1000;

describe('roundProgress', () => {
  it('is 0 at the start of a round', () => {
    expect(roundProgress(0)).toBe(0);
  });

  it('is 1 at the end of a round', () => {
    expect(roundProgress(ROUND_MS)).toBe(1);
  });

  it('clamps values outside the round', () => {
    expect(roundProgress(-500)).toBe(0);
    expect(roundProgress(ROUND_MS * 3)).toBe(1);
  });
});

describe('spawnInterval', () => {
  it('starts at the initial interval', () => {
    expect(spawnInterval(0)).toBeCloseTo(SPAWN_INTERVAL_START);
  });

  it('ends at the final interval', () => {
    expect(spawnInterval(ROUND_MS)).toBeCloseTo(SPAWN_INTERVAL_END);
  });

  it('decreases as the round progresses (difficulty ramp)', () => {
    let previous = spawnInterval(0);
    for (let elapsed = 1000; elapsed <= ROUND_MS; elapsed += 1000) {
      const current = spawnInterval(elapsed);
      expect(current).toBeLessThanOrEqual(previous);
      previous = current;
    }
  });

  it('is always positive', () => {
    expect(spawnInterval(0)).toBeGreaterThan(0);
    expect(spawnInterval(ROUND_MS)).toBeGreaterThan(0);
    expect(spawnInterval(ROUND_MS * 10)).toBeGreaterThan(0);
  });
});

describe('moleUpTime', () => {
  it('starts at the initial up time', () => {
    expect(moleUpTime(0)).toBeCloseTo(MOLE_UP_TIME_START);
  });

  it('ends at the final up time', () => {
    expect(moleUpTime(ROUND_MS)).toBeCloseTo(MOLE_UP_TIME_END);
  });

  it('decreases as the round progresses (moles stay up shorter)', () => {
    let previous = moleUpTime(0);
    for (let elapsed = 1000; elapsed <= ROUND_MS; elapsed += 1000) {
      const current = moleUpTime(elapsed);
      expect(current).toBeLessThanOrEqual(previous);
      previous = current;
    }
  });

  it('is always positive', () => {
    expect(moleUpTime(0)).toBeGreaterThan(0);
    expect(moleUpTime(ROUND_MS)).toBeGreaterThan(0);
  });
});
