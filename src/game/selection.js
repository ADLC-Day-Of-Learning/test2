// Keyboard hole selection, extracted from GameScene's moveSelection so
// the grid clamping is unit-testable independently of Phaser input.

/**
 * Index of the hole to select after moving `dx` columns and `dy` rows
 * from the currently selected hole (`selectedIndex`, row-major), with
 * the result clamped to the grid so the selection can never leave the
 * playfield. Returns the input index unchanged when the move is fully
 * clamped away.
 */
export function nextSelectedHole(selectedIndex, dx, dy, rows, cols) {
  const row = Math.floor(selectedIndex / cols);
  const col = selectedIndex % cols;
  const newRow = Math.min(rows - 1, Math.max(0, row + dy));
  const newCol = Math.min(cols - 1, Math.max(0, col + dx));
  return newRow * cols + newCol;
}
