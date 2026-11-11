import { describe, expect, it } from 'vitest';
import { nextSelectedHole } from '../src/game/selection.js';
import { GRID_ROWS, GRID_COLS } from '../src/game/constants.js';

describe('nextSelectedHole', () => {
  it('moves right within a row', () => {
    expect(nextSelectedHole(0, 1, 0, GRID_ROWS, GRID_COLS)).toBe(1);
    expect(nextSelectedHole(4, 1, 0, GRID_ROWS, GRID_COLS)).toBe(5);
  });

  it('moves left within a row', () => {
    expect(nextSelectedHole(2, -1, 0, GRID_ROWS, GRID_COLS)).toBe(1);
  });

  it('moves down between rows', () => {
    expect(nextSelectedHole(0, 0, 1, GRID_ROWS, GRID_COLS)).toBe(3);
    expect(nextSelectedHole(4, 0, 1, GRID_ROWS, GRID_COLS)).toBe(7);
  });

  it('moves up between rows', () => {
    expect(nextSelectedHole(8, 0, -1, GRID_ROWS, GRID_COLS)).toBe(5);
  });

  it('clamps at every edge of the grid', () => {
    expect(nextSelectedHole(0, -1, 0, GRID_ROWS, GRID_COLS)).toBe(0);
    expect(nextSelectedHole(0, 0, -1, GRID_ROWS, GRID_COLS)).toBe(0);
    expect(nextSelectedHole(2, 1, 0, GRID_ROWS, GRID_COLS)).toBe(2);
    expect(nextSelectedHole(6, 0, 1, GRID_ROWS, GRID_COLS)).toBe(6);
    expect(nextSelectedHole(8, 1, 0, GRID_ROWS, GRID_COLS)).toBe(8);
    expect(nextSelectedHole(8, 0, 1, GRID_ROWS, GRID_COLS)).toBe(8);
  });

  it('clamps diagonal moves that would leave the grid', () => {
    // Top-left corner moving up-left stays put.
    expect(nextSelectedHole(0, -1, -1, GRID_ROWS, GRID_COLS)).toBe(0);
    // Bottom-right corner moving down-right stays put.
    expect(nextSelectedHole(8, 1, 1, GRID_ROWS, GRID_COLS)).toBe(8);
  });

  it('keeps the column when moving vertically', () => {
    // Moving up from the top row is clamped and stays in place.
    expect(nextSelectedHole(1, 0, -1, GRID_ROWS, GRID_COLS)).toBe(1);
    expect(nextSelectedHole(2, 0, -1, GRID_ROWS, GRID_COLS)).toBe(2);
    // Moving up from the middle row keeps the column.
    expect(nextSelectedHole(5, 0, -1, GRID_ROWS, GRID_COLS)).toBe(2);
    expect(nextSelectedHole(7, 0, -1, GRID_ROWS, GRID_COLS)).toBe(4);
  });

  it('works with grids of other sizes', () => {
    expect(nextSelectedHole(0, 1, 0, 2, 4)).toBe(1);
    expect(nextSelectedHole(3, 1, 0, 2, 4)).toBe(3);
    expect(nextSelectedHole(3, 0, 1, 2, 4)).toBe(7);
    expect(nextSelectedHole(7, 0, 1, 2, 4)).toBe(7);
  });
});
