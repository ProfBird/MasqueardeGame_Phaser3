/**
 * Base Guest class with shared physics and positioning logic
 * Both Player and NonPlayerGuest extend this class
 */
class Guest {
  constructor(scene, x, y, options = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.spriteGroup = []; // Track all visual components for cleanup
  }

  /**
   * Initialize physics body for a game object
   * @param {Phaser.GameObjects.GameObject} gameObject - The object to add physics to
   * @param {Object} physicsConfig - Physics configuration
   * @param {number} physicsConfig.width - Physics body width
   * @param {number} physicsConfig.height - Physics body height
   * @param {number} physicsConfig.offsetY - Physics body Y offset
   * @param {boolean} physicsConfig.isImmovable - Whether the body is immovable
   * @param {boolean} physicsConfig.collideWorldBounds - Whether to collide with world bounds
   * @param {boolean} physicsConfig.allowSeparation - Whether physics should separate this body in collisions
   */
  addPhysics(gameObject, physicsConfig = {}) {
    const {
      width = 32,
      height = 48,
      offsetY = 0,
      isImmovable = false,
      isPushable = true,
      collideWorldBounds = true
    } = physicsConfig;

    this.scene.physics.add.existing(gameObject);
    gameObject.body.setSize(width, height);
    // For Arcade Bodies, setOffset is relative to the GameObject top-left
    // With origin (0.5, 0.5), body.x/y already align to the sprite bounds
    gameObject.body.setOffset(0, offsetY);
    gameObject.body.setImmovable(isImmovable);
    gameObject.body.setCollideWorldBounds(collideWorldBounds);
    gameObject.body.setBounce(0, 0);
    
    // Configure pushable state if supported
    if (typeof gameObject.body.setPushable === 'function') {
      gameObject.body.setPushable(isPushable);
    }

    // Link physics body back to this Guest instance for collision handling
    gameObject.owner = this;

    return gameObject;
  }

  /**
   * Base collision handler - called when colliding with another Guest
   * Subclasses override to add custom behavior (stun, delays, etc)
   * @param {Guest} other - The other guest involved in the collision
   */
  onCollision(other) {
    // Base implementation does nothing - subclasses override for custom behavior
  }

  /**
   * Track a visual component for later cleanup
   */
  trackSprite(sprite) {
    if (sprite) {
      this.spriteGroup.push(sprite);
    }
    return sprite;
  }

  /**
   * Cleanup all visual components
   */
  destroy() {
    this.spriteGroup.forEach((sprite) => {
      if (sprite && sprite.destroy) {
        sprite.destroy();
      }
    });
    this.spriteGroup = [];
  }
}

export default Guest;
