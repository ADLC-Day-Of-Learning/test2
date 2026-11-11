const STORAGE_KEY = 'whack-a-mole.best-score';

// Best score remembered in memory when persistence fails (private mode,
// quota). `loadBestScore` consults it alongside storage so the best shown
// on the game-over screen is the one later `loadBestScore` calls restore.
let sessionBest = null;

/** Test helper: forget the in-memory fallback best. */
export function resetBestScoreSessionFallback() {
  sessionBest = null;
}

function defaultStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    // Some environments throw on mere access to `localStorage`.
    return null;
  }
}

/**
 * Read the persisted best score. Returns 0 when nothing (valid) is stored.
 */
export function loadBestScore(storage = defaultStorage()) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    const value = Number.parseInt(raw ?? '', 10);
    const stored = Number.isFinite(value) && value >= 0 ? value : 0;
    return sessionBest !== null ? Math.max(stored, sessionBest) : stored;
  } catch {
    return sessionBest ?? 0;
  }
}

/**
 * Persist `score` as the new best score if it beats the stored one.
 * Returns the best score after the update together with whether `score`
 * set a new best, so callers dispatch on this single result instead of
 * re-deriving the comparison against a separately loaded best.
 */
export function updateBestScore(score, storage = defaultStorage()) {
  const current = loadBestScore(storage);
  if (!Number.isFinite(score) || score < 0 || score <= current) {
    return { best: current, isNewBest: false };
  }
  try {
    // No optional chaining here on purpose: when storage is entirely
    // unavailable, the property access throws into the catch below, so
    // absent storage gets the same in-memory fallback as a failed write.
    storage.setItem(STORAGE_KEY, String(score));
  } catch {
    // Storage unavailable (private mode, quota): remember the best in
    // memory so it survives this session instead of silently reverting.
    sessionBest = Math.max(sessionBest ?? 0, score);
  }
  return { best: score, isNewBest: true };
}
