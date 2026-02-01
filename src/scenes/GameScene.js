import Phaser from 'phaser';
import GameState from '../systems/GameState';
import Player from '../entities/Player';
import NonPlayerGuest from '../entities/NonPlayerGuest';
import { FEATURE_FLAGS } from '../config/featureFlags';
import { COLORS, TEXT_SIZES, KEYS } from '../config/constants';
import { PLAYER_CONFIG } from '../config/playerConfig';
import { GUEST_CONFIG } from '../config/guestConfig';

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const isDev =
      typeof process !== 'undefined' &&
      process.env &&
      process.env.NODE_ENV !== 'production';

    this.debug = {
      physics: isDev,
      api: isDev,
      logs: isDev
    };

    this.cameras.main.setBackgroundColor(COLORS.medium);

    const { width, height } = this.scale;

    this.gameState = new GameState();
    
    // Spawn guests
    this.guestGroup = this.physics.add.group();
    this.guests = [];
    GUEST_CONFIG.spawnPoints.forEach((point, index) => {
      const guest = new NonPlayerGuest(this, point.x, point.y, `guest-${index + 1}`, point.variant);
      this.guests.push(guest);
      this.guestGroup.add(guest.sprite);
    });

    // Create player
    this.player = new Player(this, PLAYER_CONFIG.x, PLAYER_CONFIG.y, {
      speed: PLAYER_CONFIG.speed,
      interactionRadius: PLAYER_CONFIG.interactionRadius
    });

    // Enable physics debug graphics (toggle with this.debug.physics)
    if (this.debug.physics) {
      this.physics.debug = true;
      const debugGraphics = this.add.graphics();
      debugGraphics.setDepth(1000);
      this.events.on('update', () => {
        debugGraphics.clear();
        debugGraphics.fillStyle(0x00ff00, 0.3);
      returnScene: this.sys.settings.key
        if (this.player && this.player.body) {
          debugGraphics.fillRect(
            this.player.body.x,
            this.player.body.y,
            this.player.body.width,
            this.player.body.height
          );
        }
        // Draw guest bodies (Arcade Body x/y is top-left)
        debugGraphics.fillStyle(0xff0000, 0.3);
        this.guestGroup.children.entries.forEach((guest) => {
          if (guest.body) {
            debugGraphics.fillRect(
              guest.body.x,
              guest.body.y,
              guest.body.width,
              guest.body.height
            );
          }
        });
      });
    }

    // Add collision detection
    // Guests collide with each other
    this.physics.add.collider(this.guestGroup, this.guestGroup, (obj1, obj2) => {
      // Trigger collision handlers for both guests
      if (obj1.owner && obj1.owner.onCollision) obj1.owner.onCollision(obj2.owner);
      if (obj2.owner && obj2.owner.onCollision) obj2.owner.onCollision(obj1.owner);
    });

    // Player overlaps with guests (manual equal separation)
    // We keep this to avoid Arcade's default push while still detecting contact.
    this.physics.add.overlap(this.guestGroup, this.player.sprite, (guestBody, playerBody) => {
      
      // Call collision handlers on both
      if (guestBody.owner && guestBody.owner.onCollision) {
        guestBody.owner.onCollision(playerBody.owner);
      }
      if (playerBody.owner && playerBody.owner.onCollision) {
        playerBody.owner.onCollision(guestBody.owner);
      }
      
      // Manually separate them equally so neither is "pushed"
      const dx = playerBody.x - guestBody.x;
      const dy = playerBody.y - guestBody.y;
      const distance = Math.hypot(dx, dy);
      
      if (distance > 0) {
        // Calculate combined collision radius based on body sizes
        const playerRadius = playerBody.width / 2;
        const guestRadius = guestBody.width / 2;
        const combined = playerRadius + guestRadius;
        const overlap = combined - distance;
        
        if (overlap > 0) {
          // Push each away from the other by half the overlap
          const pushDist = overlap / 2 + 1;
          const dirX = dx / distance;
          const dirY = dy / distance;
          
          playerBody.x += dirX * pushDist;
          playerBody.y += dirY * pushDist;
          guestBody.x -= dirX * pushDist;
          guestBody.y -= dirY * pushDist;
        }
      }
    });

    this.add.text(width / 2, height / 2 - 40, 'Gameplay Scene', {
      fontFamily: 'Arial, sans-serif',
      fontSize: TEXT_SIZES.heading,
      color: '#ffffff'
    }).setOrigin(0.5);

    this.clueText = this.add.text(width / 2, height / 2, 'Clue: ...', {
      fontFamily: 'Arial, sans-serif',
      fontSize: TEXT_SIZES.body,
      color: COLORS.light
    }).setOrigin(0.5);

    this.timerText = this.add.text(width / 2, height / 2 + 30, 'Time: 02:00', {
      fontFamily: 'Arial, sans-serif',
      fontSize: TEXT_SIZES.body,
      color: COLORS.light
    }).setOrigin(0.5);

    this.interactionText = this.add.text(width / 2, height / 2 + 55, `Interact: ${KEYS.interact} or Space`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: TEXT_SIZES.small,
      color: COLORS.lighter
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 85, 'Press ESC to return to Menu', {
      fontFamily: 'Arial, sans-serif',
      fontSize: TEXT_SIZES.small,
      color: COLORS.light
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 110, 'Press END to view End Scene', {
      fontFamily: 'Arial, sans-serif',
      fontSize: TEXT_SIZES.hint,
      color: COLORS.lighter
    }).setOrigin(0.5);

    // Debug: interaction radius graphics
    this.interactionDebugGraphics = this.add.graphics();
    this.showInteractionRadius = false;
    
    // Setup debug API (toggle with this.debug.api)
    if (this.debug.api) {
      this.setupDebugAPI();
    }

    // Bind game state event listeners
    this.gameState.on('clue', ({ clueFeature }) => {
      this.clueText.setText(`Clue: ${clueFeature}`);
    });

    this.events.on('guest-unmasked', ({ guestId }) => {
      const guest = this.guests.find((entry) => entry.id === guestId);
      if (guest) {
        guest.unmask(400);
      }
    });

    this.gameState.on('timer', (remainingSeconds) => {
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      this.timerText.setText(`Time: ${formatted}`);
    });

    this.gameState.on('win', ({ thiefId }) => {
      this.cleanup();
      this.scene.start('EndScene', { result: `You caught the thief (${thiefId}).` });
    });

    this.gameState.on('loss', ({ reason, thiefId }) => {
      const message = reason === 'timeout'
        ? `Time's up. The thief was ${thiefId}.`
        : `Wrong accusation. The thief was ${thiefId}.`;
      this.cleanup();
      this.scene.start('EndScene', { result: message });
    });

    this.gameState.startTimer(this);

    // Keyboard input handlers
    this.input.keyboard.on('keydown-ESC', () => {
      this.cleanup();
      this.scene.start('MenuScene');
    });

    if (FEATURE_FLAGS.enableEndSceneShortcut) {
      this.input.keyboard.on('keydown-END', () => {
        this.cleanup();
        this.scene.start('EndScene', { result: 'placeholder' });
      });
    }

    // Interaction key bindings (E / Space)
    this.input.keyboard.on('keydown-E', () => {
      this.handleInteraction();
    });
    this.input.keyboard.on('keydown-SPACE', () => {
      this.handleInteraction();
    });

    // Cleanup when scene stops
    this.events.on('sleep', () => this.cleanup());
    this.events.on('shutdown', () => this.cleanup());
  }
  
  setupDebugAPI() {
    window.gameDebug = {
      scene: this,
      
      // Get player position
      getPlayerPos: () => {
        if (!this.player || !this.player.body) {
          console.error('Player or player body not ready');
          return null;
        }
        return {
          x: this.player.x,
          y: this.player.y,
          bodyX: this.player.body.x,
          bodyY: this.player.body.y,
          velocityX: this.player.body.velocity.x,
          velocityY: this.player.body.velocity.y
        };
      },
      
      // Get all guest positions
      getGuestPositions: () => {
        if (!this.player || !this.player.body) {
          console.error('Player not ready');
          return [];
        }
        const guests = [];
        this.guestGroup.children.entries.forEach((body, index) => {
          if (body.owner) {
            guests.push({
              index,
              x: body.owner.x,
              y: body.owner.y,
              bodyX: body.x,
              bodyY: body.y,
              distance: Math.hypot(body.x - this.player.body.x, body.y - this.player.body.y).toFixed(1)
            });
          }
        });
        return guests.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
      },
      
      // Move player to position
      movePlayerTo: (x, y) => {
        if (!this.player || !this.player.sprite) return null;
        this.player.sprite.setPosition(x, y);
        this.player.x = x;
        this.player.y = y;
        console.log(`Player moved to (${x}, ${y})`);
        return window.gameDebug.getPlayerPos();
      },
      
      // Move player by delta
      movePlayerBy: (dx, dy) => {
        if (!this.player || !this.player.sprite) return null;
        this.player.sprite.setPosition(this.player.sprite.x + dx, this.player.sprite.y + dy);
        this.player.x += dx;
        this.player.y += dy;
        console.log(`Player moved by (${dx}, ${dy}) to body (${this.player.body.x.toFixed(1)}, ${this.player.body.y.toFixed(1)})}`);
        return window.gameDebug.getPlayerPos();
      },
      
      // Get distance to nearest guest
      getNearestGuest: () => {
        const guests = window.gameDebug.getGuestPositions();
        return guests[0];
      },
      
      // Move toward nearest guest by specific distance
      moveTowardNearestGuest: (distance = 5) => {
        if (!this.player || !this.player.body) return null;
        const nearest = window.gameDebug.getNearestGuest();
        if (nearest) {
          const dx = nearest.bodyX - this.player.body.x;
          const dy = nearest.bodyY - this.player.body.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0) {
            const moveX = (dx / dist) * distance;
            const moveY = (dy / dist) * distance;
            window.gameDebug.movePlayerBy(moveX, moveY);
            const newDist = Math.hypot(nearest.bodyX - this.player.body.x, nearest.bodyY - this.player.body.y);
            console.log(`Moved ${distance}px toward guest ${nearest.index}. New distance: ${newDist.toFixed(1)}px`);
            return { oldDistance: dist.toFixed(1), newDistance: newDist.toFixed(1), guest: nearest };
          }
        }
        return null;
      },
      
      // Show all distances in a table
      showDistances: () => {
        const guests = window.gameDebug.getGuestPositions();
        console.table(guests);
        return guests;
      },
      
      // Step toward nearest guest repeatedly
      stepTowardNearest: (steps = 1, stepSize = 5) => {
        for (let i = 0; i < steps; i++) {
          window.gameDebug.moveTowardNearestGuest(stepSize);
        }
      },

      // Inspect current overlap distances vs threshold
      inspectProximity: () => {
        if (!this.player || !this.player.body) return [];
        const rows = [];
        this.guestGroup.children.entries.forEach((guest, index) => {
          if (!guest.body) return;
          const playerCenter = this.player.body.center;
          const guestCenter = guest.body.center;
          const dx = guestCenter.x - playerCenter.x;
          const dy = guestCenter.y - playerCenter.y;
          const distance = Math.hypot(dx, dy);
          const playerRadius = Math.max(this.player.body.width, this.player.body.height) / 2;
          const guestRadius = Math.max(guest.body.width, guest.body.height) / 2;
          const combinedRadius = playerRadius + guestRadius;
          rows.push({
            index,
            distance: Number(distance.toFixed(2)),
            threshold: Number(combinedRadius.toFixed(2)),
            overlapping: distance < combinedRadius
          });
        });
        console.table(rows);
        return rows;
      },

      // Force resolve any overlaps by pushing player away
      resolveOverlaps: () => {
        if (!this.player || !this.player.body) return 0;
        let resolved = 0;
        this.guestGroup.children.entries.forEach((guest) => {
          if (!guest.body) return;
          const playerCenter = this.player.body.center;
          const guestCenter = guest.body.center;
          const dx = guestCenter.x - playerCenter.x;
          const dy = guestCenter.y - playerCenter.y;
          const distance = Math.hypot(dx, dy);
          const playerRadius = Math.max(this.player.body.width, this.player.body.height) / 2;
          const guestRadius = Math.max(guest.body.width, guest.body.height) / 2;
          const combinedRadius = playerRadius + guestRadius;
          if (distance < combinedRadius && distance > 0) {
            const overlap = combinedRadius - distance;
            const dirX = dx / distance;
            const dirY = dy / distance;
            this.player.sprite.setPosition(
              this.player.sprite.x - dirX * overlap,
              this.player.sprite.y - dirY * overlap
            );
            this.player.body.updateFromGameObject();
            resolved += 1;
          }
        });
        console.log(`Resolved ${resolved} overlaps`);
        return resolved;
      }
    };
    
    console.log('%c🎮 Debug API Ready!', 'color: #00ff00; font-weight: bold; font-size: 16px; text-shadow: 2px 2px 4px #000;');
    console.log('%cAvailable commands:', 'color: #ffff00; font-weight: bold;');
    console.log('  %cgameDebug.getPlayerPos()%c - Get player position & velocity', 'color: #00ffff;', 'color: inherit;');
    console.log('  %cgameDebug.getGuestPositions()%c - Get all guests sorted by distance', 'color: #00ffff;', 'color: inherit;');
    console.log('  %cgameDebug.movePlayerTo(x, y)%c - Teleport player to coordinates', 'color: #00ffff;', 'color: inherit;');
    console.log('  %cgameDebug.movePlayerBy(dx, dy)%c - Move player by delta', 'color: #00ffff;', 'color: inherit;');
    console.log('  %cgameDebug.getNearestGuest()%c - Get nearest guest info', 'color: #00ffff;', 'color: inherit;');
    console.log('  %cgameDebug.moveTowardNearestGuest(dist)%c - Move toward nearest guest (default 5px)', 'color: #00ffff;', 'color: inherit;');
    console.log('  %cgameDebug.stepTowardNearest(steps, size)%c - Repeatedly step toward nearest', 'color: #00ffff;', 'color: inherit;');
    console.log('  %cgameDebug.showDistances()%c - Show table of all guests with distances', 'color: #00ffff;', 'color: inherit;');
  }

  update() {
    if (this.player) {
      this.player.update();
      if (this.showInteractionRadius) {
        this.player.drawInteractionRadius(this.interactionDebugGraphics);
      }
    }
    // Skip destroyed guests to avoid crashes during collision cleanup
    this.guests.forEach((guest) => {
      if (guest && guest.body && !guest.body.destroyed) {
        guest.update(this.time.delta);
      }
    });
  }

  highlightNearbyGuests() {
    const nearbyGuests = this.player.getNearbyNPCs(
      this.guests.map((guest) => ({
        id: guest.id,
        x: guest.x,
        y: guest.y
      }))
    );

    this.guests.forEach((guest) => {
      const isNearby = nearbyGuests.some((nearby) => nearby.id === guest.id);
      if (isNearby) {
        guest.highlight();
      } else {
        guest.removeHighlight();
      }
    });
  }

  handleInteraction() {
    if (!this.player) return;

    const nearbyGuests = this.player.getNearbyNPCs(
      this.guests.map((guest) => ({
        id: guest.id,
        x: guest.x,
        y: guest.y
      }))
    );

    if (!nearbyGuests.length) {
      this.interactionText.setText('No guest nearby');
      return;
    }

    const playerX = this.player.sprite?.x ?? this.player.x;
    const playerY = this.player.sprite?.y ?? this.player.y;
    const nearest = nearbyGuests
      .map((guest) => {
        const dx = guest.x - playerX;
        const dy = guest.y - playerY;
        return { ...guest, distance: Math.hypot(dx, dy) };
      })
      .sort((a, b) => a.distance - b.distance)[0];

    const fullGuest = this.guests.find((guest) => guest.id === nearest.id);
    if (!fullGuest) {
      this.interactionText.setText('Guest not found');
      return;
    }

    this.interactionText.setText(`Interrogating ${nearest.id}...`);
    this.scene.pause();
    this.scene.launch('InterrogationScene', {
      guestId: fullGuest.id,
      guestVariant: fullGuest.variant,
      clueFeature: this.gameState.clueFeature,
      returnScene: this.sys.settings.key
    });
  }

  cleanup() {
    if (this.gameState) {
      this.gameState.stopTimer();
      this.gameState.removeAllListeners();
    }
    if (this.player) {
      this.player.destroy();
    }
    this.guests.forEach((guest) => guest.destroy());
    if (this.interactionDebugGraphics) {
      this.interactionDebugGraphics.destroy();
    }
    if (this.input?.keyboard) {
      this.input.keyboard.removeAllListeners();
    }
  }
}
export default GameScene;
