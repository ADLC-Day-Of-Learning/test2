import { describe, expect, it } from 'vitest';
import {
  initialHoleState,
  onMoleSpawned,
  onMoleWhacked,
  onMoleLowered,
  shouldLowerAfterUpTime,
} from '../src/game/holeState.js';
import { whackOutcome } from '../src/game/whack.js';
import { MOLE_HEIGHT } from '../src/game/constants.js';

// A mole that is fully up sits just below the hole centre line.
const HOLE_Y = 100;
const MOLE_UP_Y = HOLE_Y + 22;

describe('initialHoleState', () => {
  it('starts free and un-whacked', () => {
    expect(initialHoleState()).toEqual({ busy: false, whacked: false });
  });
});

describe('onMoleSpawned', () => {
  it('marks the hole busy and clears the whacked flag', () => {
    expect(onMoleSpawned(initialHoleState())).toEqual({
      busy: true,
      whacked: false,
    });
  });

  it('clears a stale whacked flag from the previous mole', () => {
    const afterWhack = onMoleWhacked(onMoleSpawned(initialHoleState()));
    expect(afterWhack.whacked).toBe(true);
    const respawned = onMoleSpawned(afterWhack);
    expect(respawned).toEqual({ busy: true, whacked: false });
  });
});

describe('mole lifecycle: spawn → up-time elapses → lowered', () => {
  it('frees the hole again after an un-whacked mole lowers', () => {
    let state = onMoleSpawned(initialHoleState());
    expect(state.busy).toBe(true);
    expect(shouldLowerAfterUpTime(state)).toBe(true);
    state = onMoleLowered(state);
    expect(state.busy).toBe(false);
    // A free hole is a miss, so the player cannot score on an empty hole.
    expect(
      whackOutcome({
        roundOver: false,
        busy: state.busy,
        whacked: state.whacked,
        moleY: HOLE_Y + MOLE_HEIGHT,
        holeY: HOLE_Y,
      }),
    ).toBe('miss');
  });
});

describe('mole lifecycle: spawn → whack → squash lowers', () => {
  it('stops the up-time timer from lowering a whacked mole again', () => {
    let state = onMoleSpawned(initialHoleState());
    state = onMoleWhacked(state);
    expect(shouldLowerAfterUpTime(state)).toBe(false);
    state = onMoleLowered(state);
    expect(state.busy).toBe(false);
  });

  it('prevents a whacked mole from being scored twice', () => {
    let state = onMoleSpawned(initialHoleState());
    state = onMoleWhacked(state);
    expect(
      whackOutcome({
        roundOver: false,
        busy: state.busy,
        whacked: state.whacked,
        moleY: MOLE_UP_Y,
        holeY: HOLE_Y,
      }),
    ).toBe('miss');
  });
});

describe('round end', () => {
  it('drops whack input entirely once the round is over', () => {
    // Even a fully emerged, un-whacked mole cannot be hit after
    // endRound; whackOutcome's ignored branch covers the cleanup.
    const state = onMoleSpawned(initialHoleState());
    expect(
      whackOutcome({
        roundOver: true,
        busy: state.busy,
        whacked: state.whacked,
        moleY: MOLE_UP_Y,
        holeY: HOLE_Y,
      }),
    ).toBe('ignored');
  });
});
