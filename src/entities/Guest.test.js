/**
 * Tests for Guest base class - physics setup, sprite tracking, collision
 */
describe('Guest', () => {
  let Guest;
  let mockScene;
  let guest;
  let mockGameObject;

  beforeEach(() => {
    // Clear modules before each test
    jest.resetModules();
    Guest = require('./Guest').default;

    // Mock scene with physics system
    mockScene = {
      physics: {
        add: {
          existing: jest.fn((obj) => {
            obj.body = {
              setSize: jest.fn(),
              setOffset: jest.fn(),
              setImmovable: jest.fn(),
              setCollideWorldBounds: jest.fn(),
              setBounce: jest.fn(),
              setPushable: jest.fn()
            };
            return obj.body;
          })
        }
      }
    };

    // Mock game object
    mockGameObject = {
      destroy: jest.fn()
    };

    guest = new Guest(mockScene, 100, 200);
  });

  describe('constructor', () => {
    it('should initialize with scene, position, and empty sprite group', () => {
      expect(guest.scene).toBe(mockScene);
      expect(guest.x).toBe(100);
      expect(guest.y).toBe(200);
      expect(guest.spriteGroup).toEqual([]);
    });

    it('should accept options parameter', () => {
      const guestWithOptions = new Guest(mockScene, 50, 75, { custom: 'option' });
      expect(guestWithOptions.x).toBe(50);
      expect(guestWithOptions.y).toBe(75);
    });
  });

  describe('addPhysics', () => {
    it('should add physics body to game object with default config', () => {
      guest.addPhysics(mockGameObject);

      expect(mockScene.physics.add.existing).toHaveBeenCalledWith(mockGameObject);
      expect(mockGameObject.body.setSize).toHaveBeenCalledWith(32, 48);
      expect(mockGameObject.body.setOffset).toHaveBeenCalledWith(0, 0);
      expect(mockGameObject.body.setImmovable).toHaveBeenCalledWith(false);
      expect(mockGameObject.body.setCollideWorldBounds).toHaveBeenCalledWith(true);
      expect(mockGameObject.body.setBounce).toHaveBeenCalledWith(0, 0);
    });

    it('should apply custom physics config', () => {
      const config = {
        width: 28,
        height: 46,
        offsetY: -14,
        isImmovable: true,
        isPushable: false,
        collideWorldBounds: false
      };

      guest.addPhysics(mockGameObject, config);

      expect(mockGameObject.body.setSize).toHaveBeenCalledWith(28, 46);
      expect(mockGameObject.body.setOffset).toHaveBeenCalledWith(0, -14);
      expect(mockGameObject.body.setImmovable).toHaveBeenCalledWith(true);
      expect(mockGameObject.body.setCollideWorldBounds).toHaveBeenCalledWith(false);
      expect(mockGameObject.body.setPushable).toHaveBeenCalledWith(false);
    });

    it('should link gameObject back to guest instance via owner property', () => {
      guest.addPhysics(mockGameObject);
      expect(mockGameObject.owner).toBe(guest);
    });

    it('should return the game object', () => {
      const result = guest.addPhysics(mockGameObject);
      expect(result).toBe(mockGameObject);
    });

    it('should handle missing setPushable gracefully', () => {
      const objWithoutSetPushable = { destroy: jest.fn() };
      mockScene.physics.add.existing = jest.fn((obj) => {
        obj.body = {
          setSize: jest.fn(),
          setOffset: jest.fn(),
          setImmovable: jest.fn(),
          setCollideWorldBounds: jest.fn(),
          setBounce: jest.fn()
          // No setPushable method
        };
        return obj.body;
      });

      expect(() => {
        guest.addPhysics(objWithoutSetPushable, { isPushable: false });
      }).not.toThrow();
    });
  });

  describe('onCollision', () => {
    it('should be a no-op in base class', () => {
      const otherGuest = new Guest(mockScene, 200, 300);
      expect(() => {
        guest.onCollision(otherGuest);
      }).not.toThrow();
    });
  });

  describe('trackSprite', () => {
    it('should add sprite to tracking group', () => {
      const sprite1 = { destroy: jest.fn() };
      const sprite2 = { destroy: jest.fn() };

      guest.trackSprite(sprite1);
      guest.trackSprite(sprite2);

      expect(guest.spriteGroup).toEqual([sprite1, sprite2]);
    });

    it('should return the tracked sprite', () => {
      const sprite = { destroy: jest.fn() };
      const result = guest.trackSprite(sprite);
      expect(result).toBe(sprite);
    });

    it('should handle null sprite gracefully', () => {
      expect(() => {
        guest.trackSprite(null);
      }).not.toThrow();
      // trackSprite checks if sprite exists before adding
      expect(guest.spriteGroup).toEqual([]);
    });
  });

  describe('destroy', () => {
    it('should destroy all tracked sprites', () => {
      const sprite1 = { destroy: jest.fn() };
      const sprite2 = { destroy: jest.fn() };
      const sprite3 = { destroy: jest.fn() };

      guest.trackSprite(sprite1);
      guest.trackSprite(sprite2);
      guest.trackSprite(sprite3);

      guest.destroy();

      expect(sprite1.destroy).toHaveBeenCalled();
      expect(sprite2.destroy).toHaveBeenCalled();
      expect(sprite3.destroy).toHaveBeenCalled();
    });

    it('should handle sprites without destroy method', () => {
      const sprite = { name: 'no-destroy' }; // No destroy method
      guest.trackSprite(sprite);

      expect(() => {
        guest.destroy();
      }).not.toThrow();
    });

    it('should clear sprite group after cleanup', () => {
      guest.trackSprite({ destroy: jest.fn() });
      guest.destroy();
      expect(guest.spriteGroup).toEqual([]);
    });
  });

  describe('physics body offset accuracy (critical for collision)', () => {
    it('should correctly offset body by specified Y offset', () => {
      const config = {
        width: 28,
        height: 46,
        offsetY: -14 // Head offset: physics box is below visual center
      };

      guest.addPhysics(mockGameObject, config);

      // Body should be positioned with upward offset to account for head
      expect(mockGameObject.body.setOffset).toHaveBeenCalledWith(0, -14);
    });

    it('should not offset X by default (centered body)', () => {
      guest.addPhysics(mockGameObject);
      expect(mockGameObject.body.setOffset).toHaveBeenCalledWith(0, 0);
    });

    it('should maintain proper body dimensions for collision radius calculations', () => {
      const config = {
        width: 32,
        height: 48
      };

      guest.addPhysics(mockGameObject, config);

      // Body size should be set exactly as specified (used for collision radius math)
      expect(mockGameObject.body.setSize).toHaveBeenCalledWith(32, 48);
    });
  });
});
