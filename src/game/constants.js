// Shared game dimensions and rules.
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

// The playfield is a grid of holes the moles pop out of.
export const GRID_ROWS = 3;
export const GRID_COLS = 3;

// One round lasts this many seconds.
export const ROUND_SECONDS = 60;

// Sprite dimensions shared between the boot-time texture generation and
// the game scene's hole/mole layout math. Keeping them here ensures both
// scenes agree on the rendered sizes.
export const HOLE_WIDTH = 170;
export const HOLE_HEIGHT = 64;
export const MOLE_WIDTH = 96;
export const MOLE_HEIGHT = 118;

// Scene keys, shared so every scene and transition agrees on them.
export const SCENE_BOOT = 'Boot';
export const SCENE_GAME = 'Game';
export const SCENE_GAME_OVER = 'GameOver';

// Depth layers for the overlay screens (the boot start screen and the
// game-over screen): the dimmer rectangle sits above the background
// image, and all text renders on top of the dimmer.
export const DIMMER_DEPTH = 5;
export const TEXT_DEPTH = 10;
