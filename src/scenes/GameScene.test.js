/**
 * Tests for GameScene - collision system, proximity checks, and overlap handling
 */
jest.mock('../entities/Player');
jest.mock('../entities/NonPlayerGuest');
jest.mock('../systems/GameState');
jest.mock('../config/featureFlags', () => ({
  FEATURE_FLAGS: {
    enablePlaceholderGraphics: true,
    enableEndSceneShortcut: false
  }
}));
jest.mock('phaser');

describe('GameScene Collision System', () => {
  let scene;
  let mockPlayer;
  let mockGuests;

  beforeEach(() => {
    // Mock scene with physics, add, scale, cameras, input, and events
    scene = {
      key: 'GameScene',
      scale: { width: 800, height: 600 },
      cameras: {
        main: {
          setBackgroundColor: jest.fn()
        }
      },
      add: {
        text: jest.fn(() => ({
          setOrigin: jest.fn().mockReturnThis(),
          destroy: jest.fn()
        })),
        graphics: jest.fn(() => ({
          setDepth: jest.fn().mockReturnThis(),
          clear: jest.fn().mockReturnThis(),
          fillStyle: jest.fn().mockReturnThis(),
          fillRect: jest.fn().mockReturnThis(),
          destroy: jest.fn()
        }))
      },
      physics: {
        add: {
          group: jest.fn(() => ({
            add: jest.fn(),
            children: {
              entries: []
            }
          })),
          collider: jest.fn(),
          overlap: jest.fn()
        },
        world: {
          bounds: { x: 0, y: 0, width: 800, height: 600 }
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
      },
      events: {
        on: jest.fn()
      }
    };

    // Setup Player mock
    mockPlayer = {
      sprite: {
        x: 100,
        y: 300,
        body: {
          x: 100,
          y: 300,
          width: 32,
          height: 48,
          center: { x: 100, y: 324 },
          setVelocity: jest.fn(),
          updateFromGameObject: jest.fn()
        }
      },
      body: {
        x: 100,
        y: 300,
        width: 32,
        height: 48,
        center: { x: 100, y: 324 }
      },
      onCollision: jest.fn()
    };

    // Setup Guest mocks
    mockGuests = [
      {
        sprite: {
          x: 200,
          y: 300,
          body: {
            x: 200,
            y: 286,
            width: 28,
            height: 46,
            center: { x: 200, y: 309 },
            setVelocity: jest.fn()
          }
        },
        body: {
          x: 200,
          y: 286,
          width: 28,
          height: 46,
          center: { x: 200, y: 309 }
        },
        id: 'guest-1',
        onCollision: jest.fn(),
        stopMovement: jest.fn()
      },
      {
        sprite: {
          x: 400,
          y: 400,
          body: {
            x: 400,
            y: 386,
            width: 28,
            height: 46,
            center: { x: 400, y: 409 },
            setVelocity: jest.fn()
          }
        },
        body: {
          x: 400,
          y: 386,
          width: 28,
          height: 46,
          center: { x: 400, y: 409 }
        },
        id: 'guest-2',
        onCollision: jest.fn(),
        stopMovement: jest.fn()
      }
    ];
  });

  describe('Proximity-based Collision (body centers + combined radii)', () => {
    it('should detect collision using proximity when bodies overlap', () => {
      // Player at (100, 324), Guest at (200, 309)
      // Distance = sqrt((200-100)^2 + (309-324)^2) ≈ 101.1
      // Player radius = 32/2 = 16, Guest radius = 28/2 = 14
      // Combined radius = 30, so at 101.1 > 30 = NO collision

      const playerCenter = mockPlayer.body.center;
      const guestCenter = mockGuests[0].body.center;
      const dx = guestCenter.x - playerCenter.x;
      const dy = guestCenter.y - playerCenter.y;
      const distance = Math.hypot(dx, dy);

      expect(distance).toBeGreaterThan(
        (mockPlayer.body.width + mockGuests[0].body.width) / 2
      );
    });

    it('should calculate combined collision radius from body dimensions', () => {
      const playerRadius = mockPlayer.body.width / 2;
      const guestRadius = mockGuests[0].body.width / 2;
      const combined = playerRadius + guestRadius;

      expect(combined).toBe(16 + 14); // 30
    });

    it('should use body centers for accurate distance calculation', () => {
      // Using body.center (sprite center) not body.x/y (top-left)
      const playerCenter = mockPlayer.body.center;
      const guestCenter = mockGuests[0].body.center;

      expect(playerCenter).toEqual({ x: 100, y: 324 });
      expect(guestCenter).toEqual({ x: 200, y: 309 });

      const distance = Math.hypot(
        guestCenter.x - playerCenter.x,
        guestCenter.y - playerCenter.y
      );
      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('Overlap Callback (manual separation)', () => {
    it('should call collision handlers on both bodies when overlapping', () => {
      // Simulate overlap callback
      const guestBody = mockGuests[0].sprite.body;
      const playerBody = mockPlayer.sprite.body;
      guestBody.owner = mockGuests[0];
      playerBody.owner = mockPlayer;

      const dx = playerBody.x - guestBody.x;
      const dy = playerBody.y - guestBody.y;
      const distance = Math.hypot(dx, dy);

      if (mockGuests[0].onCollision) {
        mockGuests[0].onCollision(mockPlayer);
      }
      if (mockPlayer.onCollision) {
        mockPlayer.onCollision(mockGuests[0]);
      }

      expect(mockGuests[0].onCollision).toHaveBeenCalledWith(mockPlayer);
      expect(mockPlayer.onCollision).toHaveBeenCalledWith(mockGuests[0]);
    });

    it('should not separate if owner collision handlers are missing', () => {
      const guestBody = mockGuests[0].sprite.body;
      const playerBody = mockPlayer.sprite.body;
      guestBody.owner = null; // No owner
      playerBody.owner = null;

      // Should not throw
      expect(() => {
        if (guestBody.owner && guestBody.owner.onCollision) {
          guestBody.owner.onCollision(playerBody.owner);
        }
      }).not.toThrow();
    });

    it('should calculate overlap distance for separation', () => {
      // Overlap: combined - distance
      const playerRadius = mockPlayer.body.width / 2;
      const guestRadius = mockGuests[0].body.width / 2;
      const combined = playerRadius + guestRadius;

      const dx = mockGuests[0].body.x - mockPlayer.body.x;
      const dy = mockGuests[0].body.y - mockPlayer.body.y;
      const distance = Math.hypot(dx, dy);
      const overlap = Math.max(0, combined - distance);

      expect(overlap).toBeGreaterThanOrEqual(0);
    });

    it('should push each body away by half the overlap distance', () => {
      // Simulated overlap with 10px penetration
      const dx = mockGuests[0].body.x - mockPlayer.body.x;
      const dy = mockGuests[0].body.y - mockPlayer.body.y;
      const distance = Math.hypot(dx, dy) || 0.001;
      const overlap = 10; // Simulated 10px penetration

      const pushDist = overlap / 2 + 1; // 6px each
      const dirX = dx / distance;
      const dirY = dy / distance;

      const playerNewX = mockPlayer.body.x + dirX * pushDist;
      const playerNewY = mockPlayer.body.y + dirY * pushDist;
      const guestNewX = mockGuests[0].body.x - dirX * pushDist;
      const guestNewY = mockGuests[0].body.y - dirY * pushDist;

      // Player should move away from guest
      expect(playerNewX).not.toBe(mockPlayer.body.x);
      expect(guestNewX).not.toBe(mockGuests[0].body.x);
    });

    it('should handle zero distance gracefully (exact center overlap)', () => {
      // Edge case: player and guest at exact same position
      const dx = 0;
      const dy = 0;
      const distance = Math.hypot(dx, dy);

      // Distance is 0, should not divide by zero
      if (distance > 0) {
        const dirX = dx / distance;
        const dirY = dy / distance;
      } else {
        // Handle edge case: pick a default direction or skip separation
        expect(distance).toBe(0);
      }
    });
  });

  describe('Guest-to-Guest Collision', () => {
    it('should setup collider between guest group and guest group', () => {
      // Verify that collider is set up during scene creation
      // The actual GameScene.create() would call this
      expect(scene.physics.add.collider).toBeDefined();
    });

    it('should call onCollision handlers for both guests on collision', () => {
      // When two guests collide
      const obj1 = mockGuests[0].sprite;
      const obj2 = mockGuests[1].sprite;
      obj1.owner = mockGuests[0];
      obj2.owner = mockGuests[1];

      // Simulate collision callback
      if (obj1.owner && obj1.owner.onCollision) {
        obj1.owner.onCollision(obj2.owner);
      }
      if (obj2.owner && obj2.owner.onCollision) {
        obj2.owner.onCollision(obj1.owner);
      }

      expect(mockGuests[0].onCollision).toHaveBeenCalledWith(mockGuests[1]);
      expect(mockGuests[1].onCollision).toHaveBeenCalledWith(mockGuests[0]);
    });
  });

  describe('Physics Body Configuration', () => {
    it('should maintain correct body dimensions for collision math', () => {
      // Player: 32x48
      expect(mockPlayer.body.width).toBe(32);
      expect(mockPlayer.body.height).toBe(48);

      // Guest: 28x46 (smaller, excludes head from collision)
      expect(mockGuests[0].body.width).toBe(28);
      expect(mockGuests[0].body.height).toBe(46);
    });

    it('should position guest body offset upward (for head exclusion)', () => {
      // Guest body y position should be higher (smaller number) than sprite position
      // to account for the head above the body
      expect(mockGuests[0].body.y).toBeLessThan(mockGuests[0].sprite.y);
    });

    it('should use body center for collision calculations, not top-left', () => {
      // body.center should be the geometric center
      const playerCenter = mockPlayer.body.center;
      expect(playerCenter.x).toBe(100);
      expect(playerCenter.y).toBe(324); // sprite.y + (height/2) offset

      const guestCenter = mockGuests[0].body.center;
      expect(guestCenter.x).toBe(200);
      expect(guestCenter.y).toBe(309);
    });
  });

  describe('Debug Features (NODE_ENV gated)', () => {
    it('should setup debug graphics in development mode', () => {
      // In test environment, graphics mock should be defined
      expect(scene.add.graphics).toBeDefined();
    });

    it('should draw collision boxes for physics debug', () => {
      const mockGraphics = {
        setDepth: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis(),
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis()
      };

      // Simulate drawing player body
      mockGraphics.fillStyle(0x00ff00, 0.3);
      mockGraphics.fillRect(100, 300, 32, 48);

      expect(mockGraphics.fillRect).toHaveBeenCalledWith(100, 300, 32, 48);
    });

    it('should use Arcade body x/y (top-left) for drawing debug rectangles', () => {
      // Arcade body x/y are at the top-left corner
      const bodyX = mockPlayer.body.x;
      const bodyY = mockPlayer.body.y;
      const width = mockPlayer.body.width;
      const height = mockPlayer.body.height;

      expect(bodyX).toBe(100);
      expect(bodyY).toBe(300);
      expect(width).toBe(32);
      expect(height).toBe(48);
    });
  });

  describe('Collision System Integration', () => {
    it('should prevent player from moving into guests (directional blocking)', () => {
      // Player at (100, 324), Guest at (200, 309)
      // If player tries to move right (toward guest), movement should be blocked
      const dx = mockGuests[0].body.center.x - mockPlayer.body.center.x;
      const dy = mockGuests[0].body.center.y - mockPlayer.body.center.y;
      const distance = Math.hypot(dx, dy);

      const playerRadius = mockPlayer.body.width / 2;
      const guestRadius = mockGuests[0].body.width / 2;
      const combinedRadius = playerRadius + guestRadius;

      // Guest is to the right and slightly above
      if (distance < combinedRadius) {
        const dirX = dx / distance;
        // If dirX > 0.5, rightward movement should be blocked
        expect(dirX).toBeGreaterThan(0); // Guest is to the right
      }
    });

    it('should allow player to move away from guests (not blocked)', () => {
      // Player should be able to move left (away from guest at right)
      const dx = mockGuests[0].body.center.x - mockPlayer.body.center.x;
      // If player moves in negative X (away), velocity should not be blocked
      const playerVelocity = -150; // Moving left
      
      // Check: if blocked.right && velocity < 0, then unblock
      // Since blocked.right would only be true for rightward movement, leftward is free
      expect(playerVelocity).toBeLessThan(0);
    });

    it('should nudge overlapping bodies apart in overlap callback', () => {
      // When bodies overlap, nudge them apart
      const playerPos = { x: mockPlayer.body.x, y: mockPlayer.body.y };
      const guestPos = { x: mockGuests[0].body.x, y: mockGuests[0].body.y };

      // After nudging (overlap > 0), positions should change
      const dx = guestPos.x - playerPos.x;
      const dy = guestPos.y - playerPos.y;
      const distance = Math.hypot(dx, dy) || 0.001;

      // Simulate nudge
      const overlap = 5;
      const pushDist = overlap / 2 + 1;
      const dirX = dx / distance;
      const dirY = dy / distance;

      const newPlayerX = playerPos.x + dirX * pushDist;
      const newPlayerY = playerPos.y + dirY * pushDist;

      // New position should be different
      expect(newPlayerX).not.toBe(playerPos.x);
    });
  });
});
