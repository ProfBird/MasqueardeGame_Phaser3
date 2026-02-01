# Phaser 3 Masquerade Game Implementation Plan

**Project:** Top-down social deduction detective game at a solarpunk masquerade
**Tech Stack:** Phaser 3, Webpack, JavaScript
**Requirements:** See [GameRequirements.md](./GameRequirements.md)

---

## Phase 1: Project Setup & Toolchain ✅

### 1.1 Initialize Phaser 3 + Webpack Project ✅
- Install Node.js dependencies: `phaser`, `webpack`, `webpack-cli`, `webpack-dev-server` ✅
- Install dev dependencies: `html-webpack-plugin`, `copy-webpack-plugin` ✅
- Create `webpack.config.js` with dev/prod modes ✅
- Set up `src/` directory structure: `scenes/`, `entities/`, `systems/`, `config/`, `assets/` ✅
- Create `index.html` template and entry point `src/index.js` ✅
- Add npm scripts: `start` (dev server), `build` (production bundle) ✅

### 1.2 Configure Linting & Development Tools ✅
- Install ESLint with JavaScript config ✅
- Create `eslint.config.js` with Phaser globals ✅
- Add `.gitignore` for `node_modules/`, `dist/`, etc. ✅
- Set up VSCode settings for JavaScript/Phaser autocomplete ✅

---

## Phase 2: Core Game Architecture ✅

### 2.1 Scene Structure ✅
- Create `BootScene` for preloading core assets ✅
- Create `MenuScene` with start button and instructions ✅
- Create `GameScene` as main gameplay container ✅
- Create `EndScene` for win/loss screens ✅
- Configure scene transitions in `src/config/gameConfig.js` ✅

### 2.2 Game State Management ✅
- Create `GameState` class to track:
  - Global countdown timer (configurable, default 120 seconds) ✅
  - Current thief ID (randomly selected from guest pool) ✅
  - Clue feature (facial attribute to display) ✅
  - Win/loss status ✅
  - Player accusation state ✅
- Implement timer countdown with events for UI updates ✅
- Add win/loss detection logic ✅
- Write comprehensive unit tests (19 tests passing) ✅

### 2.3 Asset Loading System ✅
- Define asset manifests for sprites, tilesets, audio ✅
- Implement loading progress display in BootScene ✅
- Create asset keys registry in `src/config/assetKeys.js` ✅

---

## Phase 3: Player Character

### 3.1 Player Entity with Placeholder Graphics
- Create `Player` class extending Phaser sprite ✅
- Use colored rectangle (placeholder) for visual representation ✅
- Gate placeholder graphics behind feature flags (see `FEATURE_FLAGS.enablePlaceholderGraphics`) ✅
- Implement WASD/Arrow key movement with configurable speed ✅
- Add collision detection with world bounds, furniture, NPCs ✅
- Create interaction radius/zone (e.g., 50-pixel circle) ✅
- Implement interaction key binding (E or Space)

### 3.2 Player Animations & Visual
- Implement idle wobble animation (subtle rotation/scale) using placeholder
- Add directional facing when moving
- Create interaction highlight visual feedback (colored glow)

---

## Phase 4: NPC Guest System

### 4.1 Guest Entity & Randomization with Placeholders
- Create `Guest` class with properties:
  - `bodyType` (1 of 3-4 body variants)
  - `headType` (1 of 5+ head variants with distinct features)
  - `maskType` (1 of 3-4 mask designs)
  - `isThief` boolean
  - `currentState` (wander, idle, socialize)
- Implement randomization system that assigns unique combinations
- Use colored rectangles with labels (placeholder graphics) for each guest
- Gate placeholder graphics behind feature flags (see `FEATURE_FLAGS.enablePlaceholderGraphics`)
- Store facial features for clue matching

### 4.2 Guest Behavior AI
- **Wander state:** Select random navigable point, move toward it
- **Idle state:** Stand still for 3-5 seconds (randomized), play wobble animation
- **Socialize state:** On collision with another guest, face each other briefly (1-2 sec)
- Implement state transitions with timers
- Add simple pathfinding or direct movement with obstacle avoidance

### 4.3 Unmask Interaction
- Create unmask animation sequence (2.0 seconds):
  1. Guest raises arm
  2. Mask lifts/becomes transparent
  3. Face revealed with surprised expression (color change or indicator)
  4. Mask returns to position
- Lock player input during animation
- Emit events for UI to show "Press [Key] to Accuse" prompt
- Track which guest is currently unmasked

---

## Phase 5: Environment & Collision

### 5.1 Tilemap & Environment with Placeholders
- Create 2D top-down tilemap for ballroom/garden using placeholder tiles
- Place furniture obstacles (placeholder rectangles) at strategic points
- Define collision layers for walls, furniture, NPCs
- Set world bounds for player and NPCs

### 5.2 Basic Visual Layout
- Use placeholder colors/rectangles for environment
- Ensure collision detection works with placeholder obstacles
- Prefer body center distance for proximity checks; combined radius from body sizes

---

## Phase 6: Accusation & Win/Loss Logic (Fully Playable)

### 6.1 Accusation System
- Bind accusation key (e.g., "Q" or separate button)
- Enable accusation ONLY during 2-second unmask window
- On accusation:
  - Compare current guest ID with thief ID
  - If match: trigger win condition
  - If mismatch: trigger immediate loss
- Disable further input after accusation

### 6.2 Win/Loss Conditions & Transitions
- **Win:** Accuse correct guest while unmasked → show victory screen with thief identity
- **Loss (wrong accusation):** Show defeat screen, reveal correct thief
- **Loss (timer expiry):** When countdown reaches 0, show timeout screen with thief reveal
- Implement scene transition to EndScene with result data

**MILESTONE: Fully playable game with placeholder graphics**

---

## Phase 7: User Interface Polish

### 7.1 HUD Elements Refinement
- **Clue Display:** Top-left or bottom-left text box showing thief's facial feature (immutable)
- **Countdown Timer:** Top-center large display (MM:SS format), configurable duration (settings file)
- **Interaction Highlight:** Visual ring/glow around nearby guest when in range
- **Interaction Prompt:** "Press [E] to Unmask" text when player is near guest
- **Accusation Prompt:** "Press [Q] to Accuse!" shown ONLY during unmask window

### 7.2 Menu & End Screens
- Main menu with "Play" button and brief instructions overlay
- End screen variants:
  - Victory: "You caught the thief!" + thief sprite + restart button
  - Defeat (wrong): "Wrong person! The real thief escaped." + thief sprite
  - Defeat (timeout): "Time's up! The thief got away." + thief sprite
- Restart button returns to MenuScene

---

## Phase 8: Asset Integration (Replace Placeholders with Real Art)

### 8.1 Character Assets
- Create/import 3-4 body sprite variants (different outfits, colors)
- Create/import 5+ head variants with distinct facial features:
  - Different hair styles, eye shapes, nose shapes, facial hair, etc.
- Create/import 3-4 ornate mask designs
- Ensure all sprites have white borders (paper cutout style)
- Swap placeholder rectangles with real character sprites (code unchanged)

### 8.2 Environment Assets
- Import tileset for floor, walls, furniture
- Create obstacle sprites (tables, fountains, statues)
- Add decorative background elements
- Replace placeholder tiles with real tileset

### 8.3 Audio Assets
- Background music: ambient solarpunk/jazz
- SFX: footsteps, unmask sound, accusation sound, timer warning
- Win/loss music cues

---

## Phase 9: Polish & Tuning

### 9.1 Animation Polish
- Fine-tune paper-doll wobble (rotation ±2-3°, scale 0.98-1.02)
- Smooth NPC movement transitions
- Add particle effects for interactions (sparkles, confetti on win)

### 9.2 Gameplay Balancing
- Adjust NPC count (10-15) based on difficulty
- Test timer duration (configurable in settings file, default 120s)
- Tweak interaction radius for comfortable gameplay
- Ensure clue difficulty (facial features must be distinguishable)

### 9.3 Bug Testing & Edge Cases
- Test collision edge cases (corners, multiple NPCs)
- Verify accusation can only happen during unmask window
- Ensure timer stops on game end
- Test all win/loss paths
- Validate asset randomization produces unique guests

---

## Phase 10: Build & Deploy

### 10.1 Production Build
- Run `npm run build` to create optimized bundle
- Minify assets and code
- Test production build locally

### 10.2 Deployment Options
- Option A: Deploy to GitHub Pages (static hosting)
- Option B: Deploy to itch.io (game distribution)
- Option C: Deploy to Netlify/Vercel (continuous deployment)

---

## Key Advantages of This Reordered Approach

1. **Playable by Phase 6**: Full game loop testable with placeholder graphics
2. **Early Feedback**: Validate gameplay mechanics before investing in art
3. **Incremental Art**: Asset integration (Phase 8) is purely visual replacement
4. **Code Stability**: Game logic finalized before visual polishing
5. **Testing Friendly**: Easy to test mechanics with simple placeholder graphics
6. **Parallel Work**: Art/audio can be created while gameplay is being tested

---

## Configuration Files

### Settings File Structure
Create `src/config/settings.js`:
```javascript
export const GAME_SETTINGS = {
  timer: {
    duration: 120, // seconds
    warningThreshold: 30 // show warning when ≤30s remain
  },
  guests: {
    count: 12, // 10-15 range
    wanderSpeed: 50,
    idleDuration: { min: 3, max: 5 }, // seconds
    socializeDuration: 1.5 // seconds
  },
  player: {
    speed: 100,
    interactionRadius: 50
  },
  unmask: {
    duration: 2000, // milliseconds
    animationStages: [500, 1000, 1500, 2000] // timing for arm/mask/face/reset
  }
};
```

---

## Dependencies

### Core
- `phaser`: ^3.80.1
- `webpack`: ^5.90.3
- `webpack-cli`: ^5.1.4
- `webpack-dev-server`: ^5.0.2

### Development
- `html-webpack-plugin`: ^5.6.0
- `copy-webpack-plugin`: ^12.0.2
- `eslint`: ^9.17.0
- `@eslint/js`: ^9.17.0
- `jest`: ^30.x (testing)
- `babel-jest`: ^30.x (test transpilation)

---

## Next Steps

1. ✅ Phases 1–2 complete
2. Begin Phase 3 (Player with placeholder graphics)
3. Implement incrementally through Phase 6 (playable game)
4. Then enhance UI, art, and polish
