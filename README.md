# Masquerade Game - Phaser 3

A top-down social deduction detective game set at a solarpunk masquerade ball. You're a detective with one clue: a single facial feature of the thief hidden among masked guests. Unmask guests to find your target before time runs out—but one wrong accusation ends the game.

## Overview

Navigate a beautifully stylized Art Nouveau ballroom filled with 10-15 masked guests. Interact with each to reveal their face for 2 seconds, then decide: is this the thief? The clock is ticking, and you only get one shot at an accusation.

**Key Features:**
- Top-down 2D paper cutout art style with solarpunk aesthetic
- Randomized guest appearances (body, face, mask combinations)
- NPC AI with wandering, idle, and social behaviors
- Persistent clue system and countdown timer
- Precise timing mechanics for unmask and accusation windows

## Dev Environment & Phaser 3 Setup

### Prerequisites
- **Node.js** 16.x or higher
- **npm** 8.x or higher
- Modern web browser (Chrome, Firefox, Safari, or Edge)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd MasqueardeGame_Phaser3
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```
   Game will be available at `http://localhost:8080`

4. **Build for production:**
   ```bash
   npm run build
   ```
   Output will be in the `dist/` directory

### Project Structure
```
MasqueardeGame_Phaser3/
├── src/
│   ├── scenes/          # Phaser scenes (Boot, Menu, Game, End)
│   ├── entities/        # Player and Guest classes
│   ├── systems/         # Game state, AI, collision systems
│   ├── config/          # Game settings and asset keys
│   ├── assets/          # Sprites, audio, tilemaps
│   └── index.js         # Entry point
├── docs/                # Documentation and planning files
├── webpack.config.js    # Webpack configuration
├── package.json         # Dependencies and scripts
└── README.md
```

### Key Dependencies

- **phaser** (^3.80.0) - Game engine
- **webpack** (^5.90.0) - Module bundler
- **webpack-dev-server** (^5.0.0) - Hot-reload development server
- **html-webpack-plugin** (^5.6.0) - HTML generation
- **eslint** (^8.56.0) - Code linting

### Development Workflow

1. **Run in development mode** with hot-reload: `npm start`
2. **Lint code** for errors: `npm run lint`
3. **Build production bundle**: `npm run build`
4. **Test production build**: Serve `dist/` directory with any static server

### Configuration

Game settings are centralized in `src/config/settings.js`:
- Timer duration (default: 120 seconds)
- Guest count (10-15 range)
- Movement speeds
- Interaction radius
- Unmask animation timing

Modify these values to adjust gameplay balance and difficulty.

## Documentation

See [docs/plan-phaser3MasqueradeGame.prompt.md](docs/plan-phaser3MasqueradeGame.prompt.md) for the complete implementation plan.

See [GameRequirements.md](GameRequirements.md) for detailed game design requirements.

## License

TBD
