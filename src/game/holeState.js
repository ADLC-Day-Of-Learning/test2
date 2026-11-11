// Pure bookkeeping for a single hole's mole lifecycle, extracted from
// GameScene so the hole-state transitions and their guards are
// unit-testable independently of Phaser's tweens and timers — the same
// pattern as whackOutcome and countdownAnnouncement. GameScene applies
// these transitions at the matching tween/timer callbacks:
//
//   onMoleSpawned  — a mole starts rising out of the hole
//   onMoleWhacked  — the mole was hit; its up-time timer must not
//                    lower it again, and it cannot be hit twice
//   onMoleLowered  — the lower tween completed; the hole is free again

/**
 * Fresh state for a hole: empty (not busy) and never whacked.
 */
export function initialHoleState() {
  return { busy: false, whacked: false };
}

/**
 * A mole starts rising out of the hole. The hole becomes busy (no new
 * mole can spawn in it) and any stale whacked flag from the previous
 * mole is cleared.
 */
export function onMoleSpawned(state) {
  return { busy: true, whacked: false };
}

/**
 * The mole in the hole was hit. The hole stays busy until the hit's
 * squash animation lowers the mole, but the mole can no longer be
 * scored again.
 */
export function onMoleWhacked(state) {
  return { ...state, whacked: true };
}

/**
 * The mole finished sinking back into its hole, so the hole is free
 * for a new spawn.
 */
export function onMoleLowered(state) {
  return { ...state, busy: false };
}

/**
 * Whether the up-time timer — which fires when a mole has been up for
 * its full duration — should lower the mole. A mole that was already
 * whacked is lowered by the hit's squash animation instead, so the
 * timer must not lower it a second time.
 */
export function shouldLowerAfterUpTime(state) {
  return !state.whacked;
}
