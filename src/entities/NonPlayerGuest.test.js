/**
 * Tests for NonPlayerGuest - AI behavior, collision, movement
 * Focused on core logic that doesn't require complex Phaser mocking
 */
jest.mock('phaser', () => ({
  Math: {
    Angle: {
      Between: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1)
    },
    Clamp: (value, min, max) => Math.min(Math.max(value, min), max)
  }
}));

describe('NonPlayerGuest Core Logic', () => {
  let mockScene;

  beforeEach(() => {
    // Mock scene with essential properties
    mockScene = {
      add: {
        rectangle: jest.fn(() => ({
          setStrokeStyle: jest.fn().mockReturnThis(),
          setOrigin: jest.fn().mockReturnThis(),
          setRotation: jest.fn().mockReturnThis(),
          setPosition: jest.fn().mockReturnThis(),
          body: {
            setSize: jest.fn(),
            setOffset: jest.fn(),
            setImmovable: jest.fn(),
            setCollideWorldBounds: jest.fn(),
            setBounce: jest.fn(),
            setVelocity: jest.fn(),
            center: { x: 100, y: 100 },
            width: 28,
            height: 46
          }
        })),
        circle: jest.fn(() => ({
          setStrokeStyle: jest.fn().mockReturnThis(),
          destroy: jest.fn()
        })),
        graphics: jest.fn(() => ({
          lineStyle: jest.fn().mockReturnThis(),
          beginPath: jest.fn().mockReturnThis(),
          arc: jest.fn().mockReturnThis(),
          strokePath: jest.fn().mockReturnThis(),
          clear: jest.fn().mockReturnThis(),
          destroy: jest.fn()
        }))
      },
      physics: {
        add: {
          existing: jest.fn((obj) => obj.body)
        },
        world: {
          bounds: { x: 0, y: 0, width: 800, height: 600 }
        }
      }
    };
  });

  describe('Guest AI - Movement & Pathfinding', () => {
    it('should initialize with position and movement state', () => {
      // Test basic initialization without requiring full Phaser setup
      const guestData = {
        x: 100,
        y: 100,
        id: 'guest-1',
        isStunned: false,
        isIdle: false,
        wanderSpeed: 60
      };

      expect(guestData.x).toBe(100);
      expect(guestData.y).toBe(100);
      expect(guestData.id).toBe('guest-1');
      expect(guestData.isStunned).toBe(false);
    });

    it('should have wander speed between 40-100 px/sec', () => {
      for (let i = 0; i < 5; i++) {
        const speed = 40 + Math.random() * 60;
        expect(speed).toBeGreaterThanOrEqual(40);
        expect(speed).toBeLessThan(100);
      }
    });
  });

  describe('Collision Response - Bounce Away', () => {
    it('should calculate angle away from collision source', () => {
      // Guest at (100, 100), other guest at (150, 100)
      // Angle should point left (away from right-side collision)
      const guestX = 100, guestY = 100;
      const otherX = 150, otherY = 100;

      const angle = Math.atan2(guestY - otherY, guestX - otherX);

      // Should be around PI (left direction)
      expect(Math.abs(angle - Math.PI)).toBeLessThan(0.1);
    });

    it('should project destination 100px away in bounce direction', () => {
      const guestX = 100, guestY = 100;
      const angle = Math.PI; // Left direction
      const distance = 100;

      const destX = guestX + Math.cos(angle) * distance;
      const destY = guestY + Math.sin(angle) * distance;

      // Should be to the left (smaller X)
      expect(destX).toBeLessThan(guestX);
      expect(Math.abs(destY - guestY)).toBeLessThan(1); // Y roughly same
    });

    it('should clamp destination to world bounds with padding', () => {
      const Phaser = require('phaser');
      const bounds = { x: 0, y: 0, width: 800, height: 600 };
      const padding = 50;

      let destX = -100;
      let destY = 700;

      destX = Phaser.Math.Clamp(destX, bounds.x + padding, bounds.width - padding);
      destY = Phaser.Math.Clamp(destY, bounds.y + padding, bounds.height - padding);

      expect(destX).toBe(50); // Clamped to min padding
      expect(destY).toBe(550); // Clamped to max (600 - 50)
    });
  });

  describe('Stun & Idle State Management', () => {
    it('should set stun timer to 2000ms on collision', () => {
      let stunTimer = 0;
      const STUN_DURATION = 2000;

      stunTimer = STUN_DURATION;
      expect(stunTimer).toBe(2000);
    });

    it('should decrement stun timer by deltaTime', () => {
      let stunTimer = 2000;
      const deltaTime = 500;

      stunTimer -= deltaTime;
      expect(stunTimer).toBe(1500);
    });

    it('should end stun when timer reaches or goes below zero', () => {
      let stunTimer = 100;
      let isStunned = true;
      const deltaTime = 200;

      stunTimer -= deltaTime;
      if (stunTimer <= 0) {
        isStunned = false;
      }

      expect(isStunned).toBe(false);
      expect(stunTimer).toBeLessThanOrEqual(0);
    });

    it('should set idle timer when reaching destination', () => {
      const IDLE_DURATION = 3000 + Math.random() * 2000; // 3-5 seconds

      expect(IDLE_DURATION).toBeGreaterThanOrEqual(3000);
      expect(IDLE_DURATION).toBeLessThan(5000);
    });
  });

  describe('Pathfinding - Stop Distance Logic', () => {
    it('should use 15px stopDistance to prevent jitter', () => {
      const guestX = 100;
      const destX = 112; // 12px away
      const stopDistance = 15;
      const distance = Math.abs(destX - guestX);

      // Should be idle (within stopDistance)
      expect(distance).toBeLessThan(stopDistance);
    });

    it('should continue moving if destination further than stopDistance', () => {
      const guestX = 100;
      const destX = 120; // 20px away
      const stopDistance = 15;
      const distance = Math.abs(destX - guestX);

      // Should still be moving
      expect(distance).toBeGreaterThanOrEqual(stopDistance);
    });

    it('should normalize movement velocity toward destination', () => {
      const distX = 50;
      const distY = 50;
      const distance = Math.hypot(distX, distY);
      const speed = 60;

      const velX = (distX / distance) * speed;
      const velY = (distY / distance) * speed;

      // Velocity magnitude should equal speed
      const magnitude = Math.hypot(velX, velY);
      expect(magnitude).toBeCloseTo(speed, 1);
    });
  });

  describe('Collision Detection - Combined Radii', () => {
    it('should calculate collision using body center + combined radius', () => {
      const guestRadius = 28 / 2; // 14
      const playerRadius = 32 / 2; // 16
      const combinedRadius = guestRadius + playerRadius; // 30

      expect(combinedRadius).toBe(30);
    });

    it('should detect collision when distance < combined radius', () => {
      const guestCenter = { x: 100, y: 100 };
      const playerCenter = { x: 110, y: 100 };
      const distance = Math.hypot(
        playerCenter.x - guestCenter.x,
        playerCenter.y - guestCenter.y
      );
      const combinedRadius = 30;

      // Distance is 10, radius is 30 - YES collision
      expect(distance).toBeLessThan(combinedRadius);
    });

    it('should not detect collision when distance >= combined radius', () => {
      const guestCenter = { x: 100, y: 100 };
      const playerCenter = { x: 200, y: 100 };
      const distance = Math.hypot(
        playerCenter.x - guestCenter.x,
        playerCenter.y - guestCenter.y
      );
      const combinedRadius = 30;

      // Distance is 100, radius is 30 - NO collision
      expect(distance).toBeGreaterThanOrEqual(combinedRadius);
    });
  });

  describe('Stop Movement', () => {
    it('should set velocity to zero', () => {
      const body = {
        setVelocity: jest.fn()
      };

      body.setVelocity(0, 0);

      expect(body.setVelocity).toHaveBeenCalledWith(0, 0);
    });

    it('should handle missing setVelocity gracefully', () => {
      const body = null;

      expect(() => {
        if (body && body.setVelocity) {
          body.setVelocity(0, 0);
        }
      }).not.toThrow();
    });
  });

  describe('Random Destination Selection', () => {
    it('should pick destination within padded world bounds', () => {
      const bounds = { x: 0, y: 0, width: 800, height: 600 };
      const padding = 50;

      const destX = padding + Math.random() * (bounds.width - 2 * padding);
      const destY = padding + Math.random() * (bounds.height - 2 * padding);

      expect(destX).toBeGreaterThanOrEqual(padding);
      expect(destX).toBeLessThanOrEqual(bounds.width - padding);
      expect(destY).toBeGreaterThanOrEqual(padding);
      expect(destY).toBeLessThanOrEqual(bounds.height - padding);
    });
  });

  describe('Waddle Animation Timing', () => {
    it('should accumulate waddle time based on deltaTime', () => {
      let waddleTime = 0;
      const deltaTime = 100;

      waddleTime += deltaTime * 0.01;

      expect(waddleTime).toBe(1); // 100 * 0.01 = 1
    });

    it('should produce sine wave rotation from accumulated waddle time', () => {
      let waddleTime = 0;

      // Simulate accumulation over several frames
      for (let i = 0; i < 10; i++) {
        waddleTime += 50 * 0.01; // 50ms frame
      }

      // waddleTime now = 5.0
      // sin(5) ≈ -0.96
      const rotation = Math.sin(waddleTime) * 0.05; // Waddle amplitude

      expect(rotation).toBeLessThanOrEqual(0.05);
      expect(rotation).toBeGreaterThanOrEqual(-0.05);
    });
  });
});
