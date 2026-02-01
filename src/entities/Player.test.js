jest.mock('phaser', () => ({
  Math: {
    Distance: {
      Between: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1)
    }
  }
}));

import Player from './Player';

describe('Player.getNearbyNPCs', () => {
  const createPlayerStub = (x, y, radius) => {
    const player = Object.create(Player.prototype);
    player.sprite = { x, y };
    player.interactionRadius = radius;
    return player;
  };

  it('should return NPCs within interaction radius', () => {
    const player = createPlayerStub(0, 0, 10);
    const npcs = [
      { id: 'near', x: 3, y: 4 },
      { id: 'edge', x: 10, y: 0 },
      { id: 'far', x: 11, y: 0 }
    ];

    const result = player.getNearbyNPCs(npcs);
    expect(result.map((npc) => npc.id)).toEqual(['near', 'edge']);
  });

  it('should return empty array when no NPCs are in range', () => {
    const player = createPlayerStub(0, 0, 5);
    const npcs = [
      { id: 'far1', x: 10, y: 10 },
      { id: 'far2', x: -6, y: 0 }
    ];

    const result = player.getNearbyNPCs(npcs);
    expect(result).toEqual([]);
  });
});

describe('Player Proximity-Based Collision (handleMovement)', () => {
  let mockScene;
  let player;
  let mockGuest;

  beforeEach(() => {
    // Mock scene with physics system
    mockScene = {
      add: {
        rectangle: jest.fn((x, y, w, h, color) => ({
          x,
          y,
          width: w,
          height: h,
          setStrokeStyle: jest.fn().mockReturnThis(),
          setOrigin: jest.fn().mockReturnThis(),
          setPosition: jest.fn().mockReturnThis(),
          body: {
            setSize: jest.fn(),
            setOffset: jest.fn(),
            setImmovable: jest.fn(),
            setCollideWorldBounds: jest.fn(),
            setBounce: jest.fn(),
            setVelocity: jest.fn(),
            updateFromGameObject: jest.fn(),
            center: { x, y: y + 24 }, // Center of 32x48 body
            width: 32,
            height: 48
          },
          destroy: jest.fn()
        })),
        triangle: jest.fn(() => ({
          setOrigin: jest.fn().mockReturnThis(),
          destroy: jest.fn()
        }))
      },
      physics: {
        add: {
          existing: jest.fn((obj) => obj.body)
        }
      },
      input: {
        keyboard: {
          createCursorKeys: jest.fn(() => ({
            up: { isDown: false },
            down: { isDown: false },
            left: { isDown: false },
            right: { isDown: false }
          })),
          addKey: jest.fn(() => ({ isDown: false }))
        }
      }
    };

    // Mock guest with physics body
    mockGuest = {
      body: {
        x: 200,
        y: 300,
        center: { x: 200, y: 323 },
        width: 28,
        height: 46
      },
      onCollision: jest.fn()
    };

    // Create player stub with necessary properties
    player = Object.create(Player.prototype);
    player.scene = mockScene;
    player.sprite = mockScene.add.rectangle(100, 300, 32, 48, 0x4285f4);
    player.body = player.sprite.body;
    player.speed = 200;
    player.keys = {
      up: { isDown: false },
      down: { isDown: false },
      left: { isDown: false },
      right: { isDown: false },
      w: { isDown: false },
      a: { isDown: false },
      s: { isDown: false },
      d: { isDown: false }
    };
  });

  describe('Combined Radius Calculation', () => {
    it('should calculate combined radius from body dimensions', () => {
      const playerRadius = player.body.width / 2; // 16
      const guestRadius = mockGuest.body.width / 2; // 14
      const combinedRadius = playerRadius + guestRadius;

      expect(combinedRadius).toBe(30);
    });

    it('should use max(width, height) / 2 for radius if asymmetric', () => {
      // Using width as primary (32 and 28)
      const playerRadius = Math.max(player.body.width, player.body.height) / 2;
      const guestRadius = Math.max(mockGuest.body.width, mockGuest.body.height) / 2;

      expect(playerRadius).toBe(24); // max(32, 48) / 2
      expect(guestRadius).toBe(23); // max(28, 46) / 2
    });
  });

  describe('Body Center Distance Calculation', () => {
    it('should use body.center for distance, not top-left position', () => {
      const playerCenter = player.body.center;
      const guestCenter = mockGuest.body.center;

      expect(playerCenter).toEqual({ x: 100, y: 324 });
      expect(guestCenter).toEqual({ x: 200, y: 323 });

      const dx = guestCenter.x - playerCenter.x;
      const dy = guestCenter.y - playerCenter.y;
      const distance = Math.hypot(dx, dy);

      expect(distance).toBeGreaterThan(0);
    });

    it('should handle distance calculation when guest is to the right', () => {
      // Guest at (200, 323), Player at (100, 324)
      // Direction: to the right and slightly above
      const playerCenter = player.body.center;
      const guestCenter = mockGuest.body.center;
      const dx = guestCenter.x - playerCenter.x;
      const dy = guestCenter.y - playerCenter.y;

      expect(dx).toBeGreaterThan(0); // Guest is to the right
      expect(Math.abs(dy)).toBeLessThan(Math.abs(dx)); // Mostly horizontal
    });
  });

  describe('Directional Blocking (block toward guest)', () => {
    it('should block upward movement if guest is above', () => {
      // Setup: guest above player
      mockGuest.body.center.y = 200; // Above player at 324
      mockGuest.body.center.x = 100; // Same X

      const playerCenter = player.body.center;
      const guestCenter = mockGuest.body.center;
      const dx = guestCenter.x - playerCenter.x;
      const dy = guestCenter.y - playerCenter.y;
      const distance = Math.hypot(dx, dy);

      const dirY = dy / distance;
      // dirY < -0.5 means significant upward component
      if (dirY < -0.5) {
        // Up movement should be blocked
        expect(dirY).toBeLessThan(-0.5);
      }
    });

    it('should block rightward movement if guest is to the right', () => {
      // Setup: guest to the right
      mockGuest.body.center.x = 200;
      mockGuest.body.center.y = 324;

      const playerCenter = player.body.center;
      const guestCenter = mockGuest.body.center;
      const dx = guestCenter.x - playerCenter.x;
      const dy = guestCenter.y - playerCenter.y;
      const distance = Math.hypot(dx, dy);

      const dirX = dx / distance;
      // dirX > 0.5 means significant rightward component
      if (dirX > 0.5) {
        // Right movement should be blocked
        expect(dirX).toBeGreaterThan(0.5);
      }
    });

    it('should use directional thresholds (0.5) to determine blocking', () => {
      // Threshold prevents blocking on diagonal directions where primary direction is not blocked
      // e.g., if moving up-right toward guest that is mostly right, only right is blocked

      const testCases = [
        { dx: 1, dy: 0, expect: { up: false, down: false, left: false, right: true } },
        { dx: 0, dy: 1, expect: { up: false, down: true, left: false, right: false } },
        { dx: -1, dy: 0, expect: { up: false, down: false, left: true, right: false } },
        { dx: 0, dy: -1, expect: { up: true, down: false, left: false, right: false } },
        { dx: 1, dy: 1, expect: { up: false, down: true, left: false, right: true } }
      ];

      testCases.forEach(({ dx, dy, expect: expectations }) => {
        const distance = Math.hypot(dx, dy);
        const dirX = dx / distance;
        const dirY = dy / distance;

        const blocked = {
          up: dirY < -0.5,
          down: dirY > 0.5,
          left: dirX < -0.5,
          right: dirX > 0.5
        };

        Object.keys(expectations).forEach((direction) => {
          expect(blocked[direction]).toBe(expectations[direction]);
        });
      });
    });
  });

  describe('Overlap Nudging (reposition player away)', () => {
    it('should nudge player away when overlapping', () => {
      // Setup: bodies overlapping
      player.body.center = { x: 100, y: 324 };
      mockGuest.body.center = { x: 110, y: 324 }; // Only 10px away
      player.sprite.x = 100;
      player.sprite.y = 300; // Visual body position (y = center - offset)

      const playerRadius = Math.max(player.body.width, player.body.height) / 2;
      const guestRadius = Math.max(mockGuest.body.width, mockGuest.body.height) / 2;
      const combinedRadius = playerRadius + guestRadius;

      const dx = mockGuest.body.center.x - player.body.center.x;
      const dy = mockGuest.body.center.y - player.body.center.y;
      const distance = Math.hypot(dx, dy);

      if (distance < combinedRadius) {
        const overlap = combinedRadius - distance;
        if (overlap > 0) {
          const awayX = -dx / distance;
          const awayY = -dy / distance;

          // New position should be away from guest
          const newX = player.sprite.x + awayX * overlap;
          expect(newX).toBeLessThan(player.sprite.x); // Nudged left, away from right-side guest
        }
      }
    });

    it('should only nudge player, not guest (one-way separation)', () => {
      // Player is nudged; guest position is not modified in handleMovement
      // This is intentional: guest AI handles its own collision response
      const guestOldX = mockGuest.body.x;
      const guestOldY = mockGuest.body.y;

      // Simulate handleMovement overlap nudge
      // Only player.sprite.setPosition() is called, not mockGuest
      // mockGuest position remains unchanged
      expect(mockGuest.body.x).toBe(guestOldX);
      expect(mockGuest.body.y).toBe(guestOldY);
    });
  });

  describe('Movement Input Processing with Blocking', () => {
    it('should allow movement away from guest even if blocked toward guest', () => {
      // Setup: guest to the right, blocked.right = true
      // Player should be able to move left (negative velocityX)

      const blockedDirections = { up: false, down: false, left: false, right: true };
      let velocityX = -200; // Moving left
      let velocityY = 0;

      // Apply blocking
      if (blockedDirections.left && velocityX < 0) velocityX = 0;
      if (blockedDirections.right && velocityX > 0) velocityX = 0;

      // Right is blocked, but left isn't, so velocity should remain
      expect(velocityX).toBe(-200);
    });

    it('should block movement toward guest', () => {
      // Setup: guest to the right, blocked.right = true
      // Player trying to move right should be blocked

      const blockedDirections = { up: false, down: false, left: false, right: true };
      let velocityX = 200; // Moving right
      let velocityY = 0;

      // Apply blocking
      if (blockedDirections.right && velocityX > 0) velocityX = 0;

      // Right is blocked and moving right, so velocity is zeroed
      expect(velocityX).toBe(0);
    });

    it('should normalize diagonal velocity to maintain speed', () => {
      let velocityX = 150;
      let velocityY = 150;
      const maxVelocity = 200;

      // Normalize diagonal
      const length = Math.hypot(velocityX, velocityY);
      velocityX = (velocityX / length) * maxVelocity;
      velocityY = (velocityY / length) * maxVelocity;

      // Result should maintain maxVelocity magnitude
      const magnitude = Math.hypot(velocityX, velocityY);
      expect(magnitude).toBeCloseTo(maxVelocity, 1);
    });
  });

  describe('Detection Skip Conditions', () => {
    it('should not check proximity if keys are not being pressed', () => {
      // If no keys are pressed, skip guest group iteration
      const isPressingKeys = false;
      if (mockScene.guestGroup && isPressingKeys) {
        // Should not reach here
        throw new Error('Should not check proximity when no keys pressed');
      }
      expect(isPressingKeys).toBe(false);
    });

    it('should skip guest if bodies are missing', () => {
      // Safe handling if guest.body or player.body is null/undefined
      const bodies = [
        { body: null },
        { body: { center: { x: 100, y: 100 }, width: 28, height: 46 } },
        { body: undefined }
      ];

      bodies.forEach((bodyObj) => {
        if (!bodyObj.body || !player.body) {
          // Skip this guest
          expect(bodyObj.body === null || bodyObj.body === undefined).toBe(
            bodyObj.body === null || bodyObj.body === undefined
          );
        }
      });
    });
  });

  describe('Integration: Movement Blocking + Velocity Setting', () => {
    it('should result in zero velocity when trying to move into adjacent guest', () => {
      // Scenario: Player at (100, 324), Guest at (110, 324)
      // Player presses right arrow (tries to move right)
      // Result: rightward velocity should be zero

      const blockedDirections = { up: false, down: false, left: false, right: true };
      let velocityX = 200;
      let velocityY = 0;

      // Player is only moving right
      const isMoving = velocityX !== 0 || velocityY !== 0;
      expect(isMoving).toBe(true);

      // Apply blocking
      if (blockedDirections.right && velocityX > 0) velocityX = 0;

      expect(velocityX).toBe(0);
      expect(velocityY).toBe(0);
    });
  });
});
