import { MOLE_WIDTH, MOLE_HEIGHT } from './constants.js';

// A mole must be at least this far out of its hole for a whack to count.
const MOLE_MIN_EMERGED = MOLE_HEIGHT * 0.5;

/**
 * Whether the mole in the hole centred on `holeY` is far enough out of its
 * hole to be whacked. `moleY` is the mole's bottom edge (its origin is
 * 0.5, 1); `holeY` is the hole's centre line. A mole that is still mostly
 * hidden inside its hole cannot be hit.
 */
export function isWhackable(moleY, holeY) {
  return moleY <= holeY + MOLE_MIN_EMERGED;
}

/**
 * Classify a whack attempt on a hole. Returns `'hit'` when the mole is
 * out far enough to be whacked, `'miss'` for a rejected whack that
 * still deserves feedback (an empty hole, an already-whacked mole, or
 * one still (almost) fully inside its hole), and `'ignored'` when the
 * round is over and input must be silently dropped. Kept pure so the
 * feedback branching is unit-testable independently of Phaser.
 */
export function whackOutcome({ roundOver, busy, whacked, moleY, holeY }) {
  if (roundOver) {
    return 'ignored';
  }
  if (!busy || whacked || !isWhackable(moleY, holeY)) {
    return 'miss';
  }
  return 'hit';
}

/**
 * Classify a pointer-originated whack attempt on a hole. `localX` and
 * `localY` are the pointer's coordinates in the mole texture's local
 * space (0,0 = texture top-left, i.e. the mole's top-centre in world
 * space, since the sprite's origin is 0.5, 1). Unlike a keyboard whack,
 * which is hole-granular, a pointer whack only counts as a hit when the
 * click actually lands on the mole's emerged region — the part above
 * the hole's centre line, within the mole's width. A click on the hole
 * dirt beside an emerged mole, or on the covered part of a rising mole,
 * is a `miss` and takes the same feedback path as a keyboard miss.
 * Kept pure so the pointer contract is unit-testable independently of
 * Phaser.
 */
export function pointerWhackOutcome({
  roundOver,
  busy,
  whacked,
  moleY,
  holeY,
  localX,
  localY,
}) {
  if (roundOver) {
    return 'ignored';
  }
  const onEmergedMole =
    localX >= 0 &&
    localX <= MOLE_WIDTH &&
    localY >= 0 &&
    isPointOnEmergedMole(moleY, holeY, localY);
  if (!onEmergedMole) {
    return 'miss';
  }
  return whackOutcome({ roundOver, busy, whacked, moleY, holeY });
}

/**
 * Whether a point at `localY` inside the mole texture (0 = texture
 * top, MOLE_HEIGHT = texture bottom) lies on the emerged part of the
 * mole — the part above the hole's centre line. The rest of the mole's
 * texture rectangle is covered by the playfield background, so clicks
 * there must not register on the mole. `moleY` is the mole's bottom
 * edge (its origin is 0.5, 1); `holeY` is the hole's centre line.
 */
export function isPointOnEmergedMole(moleY, holeY, localY) {
  return localY < MOLE_HEIGHT - (moleY - holeY);
}
