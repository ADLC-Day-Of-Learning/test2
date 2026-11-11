import { describe, expect, it } from 'vitest';
import { MOLE_HEIGHT } from '../src/game/constants.js';
import {
  isWhackable,
  whackOutcome,
  isPointOnEmergedMole,
} from '../src/game/whack.js';

const HOLE_Y = 100;
const THRESHOLD = MOLE_HEIGHT * 0.5;

describe('isWhackable', () => {
  it('accepts a fully emerged mole', () => {
    // A mole that is all the way up sits just below the hole line.
    expect(isWhackable(HOLE_Y + 22, HOLE_Y)).toBe(true);
  });

  it('accepts a mole exactly at the emergence threshold (boundary)', () => {
    expect(isWhackable(HOLE_Y + THRESHOLD, HOLE_Y)).toBe(true);
  });

  it('rejects a mole one pixel below the emergence threshold', () => {
    expect(isWhackable(HOLE_Y + THRESHOLD + 1, HOLE_Y)).toBe(false);
  });

  it('rejects a mostly hidden mole', () => {
    expect(isWhackable(HOLE_Y + THRESHOLD + 20, HOLE_Y)).toBe(false);
  });

  it('rejects a fully hidden mole', () => {
    // A mole that is all the way down sits fully below the hole line.
    expect(isWhackable(HOLE_Y + MOLE_HEIGHT, HOLE_Y)).toBe(false);
  });

  it('works with a hole at a different position', () => {
    expect(isWhackable(500, 450)).toBe(true);
    expect(isWhackable(600, 450)).toBe(false);
  });
});

describe('whackOutcome', () => {
  const hit = {
    roundOver: false,
    busy: true,
    whacked: false,
    moleY: HOLE_Y + 22,
    holeY: HOLE_Y,
  };

  it('returns hit for an emerged, un-whacked mole', () => {
    expect(whackOutcome(hit)).toBe('hit');
  });

  it('returns hit at the emergence threshold (boundary)', () => {
    expect(whackOutcome({ ...hit, moleY: HOLE_Y + THRESHOLD })).toBe('hit');
  });

  it('returns ignored when the round is over', () => {
    expect(whackOutcome({ ...hit, roundOver: true })).toBe('ignored');
  });

  it('returns miss for an empty hole', () => {
    expect(whackOutcome({ ...hit, busy: false })).toBe('miss');
  });

  it('returns miss for an already-whacked mole', () => {
    expect(whackOutcome({ ...hit, whacked: true })).toBe('miss');
  });

  it('returns miss for a mole still emerging', () => {
    expect(whackOutcome({ ...hit, moleY: HOLE_Y + THRESHOLD + 1 })).toBe(
      'miss',
    );
  });

  it('returns miss for a fully hidden mole', () => {
    expect(whackOutcome({ ...hit, moleY: HOLE_Y + MOLE_HEIGHT })).toBe(
      'miss',
    );
  });
});

describe('isPointOnEmergedMole', () => {
  it('accepts a point on the emerged part of a raised mole', () => {
    // Fully up: the bottom edge sits 22px below the hole line, so the
    // top MOLE_HEIGHT - 22 pixels of the texture are emerged.
    expect(isPointOnEmergedMole(HOLE_Y + 22, HOLE_Y, 0)).toBe(true);
    expect(
      isPointOnEmergedMole(HOLE_Y + 22, HOLE_Y, MOLE_HEIGHT - 22 - 1),
    ).toBe(true);
  });

  it('rejects a point below the hole centre line of a raised mole', () => {
    expect(isPointOnEmergedMole(HOLE_Y + 22, HOLE_Y, MOLE_HEIGHT - 22)).toBe(
      false,
    );
    expect(isPointOnEmergedMole(HOLE_Y + 22, HOLE_Y, MOLE_HEIGHT)).toBe(
      false,
    );
  });

  it('rejects every point on a fully hidden mole', () => {
    expect(isPointOnEmergedMole(HOLE_Y + MOLE_HEIGHT, HOLE_Y, 0)).toBe(
      false,
    );
    expect(
      isPointOnEmergedMole(HOLE_Y + MOLE_HEIGHT, HOLE_Y, MOLE_HEIGHT),
    ).toBe(false);
  });

  it('tracks the emergence line as the mole rises', () => {
    // Half emerged: only the top half of the texture is clickable.
    expect(
      isPointOnEmergedMole(HOLE_Y + MOLE_HEIGHT / 2, HOLE_Y, 0),
    ).toBe(true);
    expect(
      isPointOnEmergedMole(HOLE_Y + MOLE_HEIGHT / 2, HOLE_Y, MOLE_HEIGHT / 2),
    ).toBe(false);
  });
});
