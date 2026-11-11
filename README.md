# Whack-a-mole

A browser-based Whack-a-mole game built with [Phaser](https://phaser.io/),
the fast, free, and fun HTML5 game framework.

## About

Whack-a-mole is a classic reflex game. Moles pop up from holes at random,
and your job is to whack them as quickly as you can before they disappear.
The faster and more accurately you hit them, the higher your score.

The game is implemented with [Phaser 3](https://phaser.io/) and [Vite](https://vite.dev/),
with all artwork drawn procedurally so there are no binary assets to manage.

## Tech Stack

- **Phaser 3** — HTML5 game framework for rendering, scenes, and input
- **JavaScript** — game logic
- **Vite** — local development server and production build tooling
- **Web browsers** — runs on desktop and mobile, no installation required

## Gameplay

- A grid of holes in a playful carnival-style playfield
- Moles pop up from random holes at random intervals
- Click or tap a mole to whack it and score points
- A 60-second round timer — hit as many moles as you can
- Score display and a game-over screen with your final score and best score
- Difficulty ramps up over time: moles appear faster and stay up shorter

### Possible Future Features

- Bonus moles (extra points) and bomb moles (avoid hitting them)
- Sound effects and background music
- Local high-score leaderboard
- Skins or themes for the playfield

## Getting Started

1. Clone this repository
2. Install dependencies with `npm install`
3. Start the dev server with `npm run dev`
4. Open the printed local URL in your browser and start whacking

To run the unit tests:

```bash
npm test
```

To build the production bundle (output in `dist/`):

```bash
npm run build
```

## Contributing

Ideas and feedback are welcome. Contribution guidelines will be added here.

## License

To be decided.
