import { describe, expect, it } from 'vitest';
import { MOLE_WIDTH, MOLE_HEIGHT } from '../src/game/constants.js';
import {
  isWhackable,
  whackOutcome,
  isPointOnEmergedMole,
  pointerWhackOutcome,
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

describe('pointerWhackOutcome', () => {
  // A fully emerged, un-whacked mole — a click on it is a hit.
  const ready = {
    roundOver: false,
    busy: true,
    whacked: false,
    moleY: HOLE_Y + 22,
    holeY: HOLE_Y,
  };
  const onMole = { localX: MOLE_WIDTH / 2, localY: 10 };

  it('returns hit for a click on the emerged region of a whackable mole', () => {
    expect(pointerWhackOutcome({ ...ready, ...onMole })).toBe('hit');
  });

  it('returns hit for a click at the edge of the mole texture', () => {
    expect(
      pointerWhackOutcome({ ...ready, localX: 0, localY: 10 }),
    ).toBe('hit');
    expect(
      pointerWhackOutcome({ ...ready, localX: MOLE_WIDTH, localY: 10 }),
    ).toBe('hit');
  });

  it('returns miss for a click on the hole dirt beside an emerged mole', () => {
    // The mole is whackable and fully emerged, but the click lands
    // outside the mole's width — inside the hole's bounding box.
    expect(
      pointerWhackOutcome({ ...ready, localX: -1, localY: 10 }),
    ).toBe('miss');
    expect(
      pointerWhackOutcome({ ...ready, localX: MOLE_WIDTH + 1, localY: 10 }),
    ).toBe('miss');
  });

  it('returns miss for a click above the mole texture', () => {
    expect(
      pointerWhackOutcome({ ...ready, localX: MOLE_WIDTH / 2, localY: -1 }),
    ).toBe('miss');
  });

  it('returns miss for a click on the covered part of a rising mole', () => {
    // The mole has passed the 50% whackable threshold, so a keyboard
    // whack on this hole is a hit — but a pointer click below the
    // hole's centre line (on the covered background) is a miss.
    const rising = { ...ready, moleY: HOLE_Y + THRESHOLD };
    expect(
      pointerWhackOutcome({
        ...rising,
        localX: MOLE_WIDTH / 2,
        localY: MOLE_HEIGHT - 1,
      }),
    ).toBe('miss');
    // The same click on the emerged part of the same mole is a hit.
    expect(
      pointerWhackOutcome({ ...rising, localX: MOLE_WIDTH / 2, localY: 0 }),
    ).toBe('hit');
  });

  it('returns miss for a click on an empty hole', () => {
    expect(
      pointerWhackOutcome({ ...ready, busy: false, ...onMole }),
    ).toBe('miss');
  });

  it('returns miss for a click on an already-whacked mole', () => {
    expect(
      pointerWhackOutcome({ ...ready, whacked: true, ...onMole }),
    ).toBe('miss');
  });

  it('returns miss for a click on the emerged part of a barely-emerged mole', () => {
    // Below the whackable threshold: even a click on the emerged
    // sliver is a miss, matching the keyboard outcome.
    const barely = { ...ready, moleY: HOLE_Y + THRESHOLD + 1 };
    expect(
      pointerWhackOutcome({ ...barely, localX: MOLE_WIDTH / 2, localY: 0 }),
    ).toBe('miss');
  });

  it('returns ignored when the round is over', () => {
    expect(
      pointerWhackOutcome({ ...ready, roundOver: true, ...onMole }),
    ).toBe('ignored');
  });
});
