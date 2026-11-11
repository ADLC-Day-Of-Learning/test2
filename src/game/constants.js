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

// Depth layers, all defined in one place with one naming scheme
// (DEPTH_<role>) so the full layering is visible at a glance.
//
// Overlay screens (the boot start screen and the game-over screen):
// the dimmer rectangle sits above the background image, and all
// overlay text renders on top of the dimmer.
export const DEPTH_DIMMER = 5;
export const DEPTH_TEXT = 10;

// Playfield: each row of holes gets its own block of depths so that
// lower rows (and their covers) always draw above the rows behind
// them. The selection highlight, HUD, and popup tiers sit above the
// whole playfield.
export const DEPTH_PER_ROW = 10;
export const DEPTH_HIGHLIGHT = 30;
export const DEPTH_HUD = 40;
export const DEPTH_POPUP = 50;
