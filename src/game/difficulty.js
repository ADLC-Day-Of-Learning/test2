import { ROUND_SECONDS } from './constants.js';

// How long to wait between spawns at the start / end of a round (ms).
export const SPAWN_INTERVAL_START = 1100;
export const SPAWN_INTERVAL_END = 380;

// How long a mole stays up at the start / end of a round (ms).
export const MOLE_UP_TIME_START = 1100;
export const MOLE_UP_TIME_END = 450;

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * Progress through a round, from 0 (start) to 1 (end).
 */
export function roundProgress(elapsedMs) {
  return clamp01(elapsedMs / (ROUND_SECONDS * 1000));
}

/**
 * Delay between mole spawns for the given elapsed round time (ms).
 * Shrinks over the round so moles appear faster as time passes.
 */
export function spawnInterval(elapsedMs) {
  return lerp(SPAWN_INTERVAL_START, SPAWN_INTERVAL_END, roundProgress(elapsedMs));
}

/**
 * How long a mole stays up for the given elapsed round time (ms).
 * Shrinks over the round so moles get harder to hit as time passes.
 */
export function moleUpTime(elapsedMs) {
  return lerp(MOLE_UP_TIME_START, MOLE_UP_TIME_END, roundProgress(elapsedMs));
}
