import Phaser from 'phaser';
import Guest from './Guest';
import { FEATURE_FLAGS } from '../config/featureFlags';

const GUEST_COLORS = {
  red: { body: 0xff6b6b, mask: 0xcc0000 },
  blue: { body: 0x4ecdc4, mask: 0x0066cc },
  green: { body: 0x95e1d3, mask: 0x00cc00 },
  yellow: { body: 0xffe66d, mask: 0xffcc00 },
  purple: { body: 0xc7a4ff, mask: 0x8800ff },
  orange: { body: 0xffb347, mask: 0xff6600 }
};

const GUEST_PHYSICS = {
  width: 28,
  height: 46,
  offsetY: -14
};

class NonPlayerGuest extends Guest {
  constructor(scene, x, y, id, variant = 'red', options = {}) {
    super(scene, x, y, options);
    this.id = id;
    this.variant = variant;
    this.isMasked = true;
    this.isUnmasking = false;

    // Movement state
    this.isStunned = false;
    this.stunTimer = 0;

    const colors = GUEST_COLORS[variant] || GUEST_COLORS.red;
    this.bodyColor = colors.body;
    this.maskColor = colors.mask;

    // Wandering behavior
    this.wanderSpeed = 40 + Math.random() * 60; // 40-100 pixels/sec
    this.destinationX = x;
    this.destinationY = y;
    this.idleTimer = 0;
    this.isIdle = false;
    this.waddleTime = 0;

    this.createGraphics();
    this.pickNewDestination();
  }

  createGraphics() {
    if (!FEATURE_FLAGS.enablePlaceholderGraphics) {
      throw new Error('Placeholder graphics are disabled. Provide guest sprite assets.');
    }
    // Body (square) - create at exact position
    this.sprite = this.scene.add.rectangle(this.x, this.y, 28, 32, this.bodyColor, 1);
    this.sprite.setStrokeStyle(1, 0xffffff, 1);
    this.sprite.setOrigin(0.5, 0.5); // Center the sprite
    this.trackSprite(this.sprite);

    // Add physics with proper offset for head/body composition.
    // NOTE: Physics body is offset upward (negative Y) because the visual guest sprite
    // includes a head above the body. The collision box only covers the body portion,
    // preventing unrealistic collision with the head area. This ensures proximity checks
    // and collision calculations are based on the actual body-to-body contact zone.
    this.addPhysics(this.sprite, {
      width: GUEST_PHYSICS.width,
      height: GUEST_PHYSICS.height,
      offsetY: GUEST_PHYSICS.offsetY,
      isImmovable: false, // Can be stopped by collisions
      isPushable: false,  // Cannot be pushed by player or other guests. Guests handle their own movement via AI and resolve collisions through onCollision() logic, not physics velocity transfer.
      collideWorldBounds: true
    });

    this.body = this.sprite.body;

    // Head (smiley) - positioned relative to body
    this.head = this.scene.add.circle(this.x, this.y - 12, 10, 0xffdb58, 1);
    this.head.setStrokeStyle(1, 0xffffff, 1);
    this.trackSprite(this.head);

    // Eyes
    const eyeRadius = 2;
    const eyeOffsetX = 3;
    const eyeOffsetY = -2;
    this.eyeLeft = this.scene.add.circle(
      this.x - eyeOffsetX,
      this.y - 14,
      eyeRadius,
      0x000000,
      1
    );
    this.trackSprite(this.eyeLeft);

    this.eyeRight = this.scene.add.circle(
      this.x + eyeOffsetX,
      this.y - 14,
      eyeRadius,
      0x000000,
      1
    );
    this.trackSprite(this.eyeRight);

    // Smile (arc-like curve using line)
    const smileGraphics = this.scene.add.graphics();
    smileGraphics.lineStyle(1, 0x000000, 1);
    smileGraphics.beginPath();
    smileGraphics.arc(this.x, this.y - 10, 4, Math.PI, 0, false);
    smileGraphics.strokePath();
    this.smileGraphics = smileGraphics;
    this.trackSprite(smileGraphics);

    // Mask (solid color overlay)
    this.mask = this.scene.add.rectangle(this.x, this.y - 12, 14, 14, this.maskColor, 0.8);
    this.mask.setStrokeStyle(1, 0xffffff, 1);
    this.trackSprite(this.mask);
  }

  unmask(duration = 500) {
    if (!this.isMasked || this.isUnmasking) {
      return;
    }

    this.isUnmasking = true;
    this.scene.tweens.add({
      targets: this.mask,
      alpha: 0,
      duration,
      onComplete: () => {
        this.isMasked = false;
        this.isUnmasking = false;
        this.mask.setVisible(false);
      }
    });
  }

  /**
   * Highlight guest for interaction
   */
  highlight() {
    this.sprite.setStrokeStyle(2, 0xffe082, 1);
    this.head.setStrokeStyle(2, 0xffe082, 1);
  }

  /**
   * Remove highlight
   */
  removeHighlight() {
    this.sprite.setStrokeStyle(1, 0xffffff, 1);
    this.head.setStrokeStyle(1, 0xffffff, 1);
  }

  /**
   * Handle collision: Stop, wait 2s (stun), then pick new direction away from obstacle
   * @param {Guest} other - The other guest involved in the collision
   */
  onCollision(other) {
    if (this.isStunned || this.isUnmasking) return;

    // Call parent (base implementation does nothing, but good for consistency)
    super.onCollision(other);
    
    this.isStunned = true;
    this.stunTimer = 2000; // 2 seconds

    // Calculate bounce direction away from the collision source.
    // This creates organic avoidance behavior: guests don't simply freeze,
    // they actively stun (pause), then pick a destination away from the obstacle.
    // If other is undefined (wall collision), just pick a random new destination.
    // If other exists (guest-to-guest collision), calculate angle between them and flee.
    if (other && other.x !== undefined && other.y !== undefined) {
      const angle = Phaser.Math.Angle.Between(other.x, other.y, this.x, this.y);
      // Project new destination 100px away in that angle to ensure clear escape
      this.destinationX = this.x + Math.cos(angle) * 100;
      this.destinationY = this.y + Math.sin(angle) * 100;
    } else {
      // Pick random new destination if wall hit
      this.pickNewDestination();
    }
    
    // Clamp to bounds
    const bounds = this.scene.physics.world.bounds;
    this.destinationX = Phaser.Math.Clamp(this.destinationX, bounds.x + 50, bounds.width - 50);
    this.destinationY = Phaser.Math.Clamp(this.destinationY, bounds.y + 50, bounds.height - 50);
  }

  /**
   * Stop movement immediately (used for proximity-based halting)
   */
  stopMovement() {
    if (this.sprite?.body?.setVelocity) {
      this.sprite.body.setVelocity(0, 0);
    }
  }

  /**
   * Update wandering behavior and waddle animation
   */
  update(deltaTime = 16) {
    // Guard against destroyed body (can happen during collision cleanup)
    if (!this.sprite?.body) return;

    if (this.isUnmasking) {
      if (this.sprite?.body) this.sprite.body.setVelocity(0, 0);
      return; // Don't move while unmasking
    }

    // Accumulate waddle time for animation sine wave.
    // Scaled by 0.01 so waddleTime increments slowly (~1 per 100ms),
    // creating smooth oscillation when passed to Math.sin() for rotation.
    this.waddleTime += deltaTime * 0.01;

    // Sync position from physics body after movement calculations.
    // The physics engine moves this.sprite, so we update this.x/this.y to stay in sync.
    // This ensures all child graphics (head, eyes, mask) get updated correctly in updatePositions().
    this.x = this.sprite.x;
    this.y = this.sprite.y;

    if (this.isStunned) {
      if (this.sprite?.body) this.sprite.body.setVelocity(0, 0);
      this.stunTimer -= deltaTime;
      if (this.stunTimer <= 0) {
         this.isStunned = false; 
         // Resume moving to the destination calculated in onCollision
      }
      return;
    }

    if (this.isIdle) {
      if (this.sprite?.body) this.sprite.body.setVelocity(0, 0);
      this.idleTimer -= deltaTime;
      if (this.idleTimer <= 0) {
        this.isIdle = false;
        this.pickNewDestination();
      }
      // Subtle wobble while idle
      if (this.sprite) this.sprite.setRotation(Math.sin(this.waddleTime * 0.8) * 0.02);
    } else {
      // Move toward destination
      const distX = this.destinationX - this.x;
      const distY = this.destinationY - this.y;
      const distance = Math.hypot(distX, distY);
      // Use stopDistance threshold (15px) to prevent guests from oscillating around exact destination.
      // Without this, guests with continuous velocity correction would jitter endlessly.
      const stopDistance = 15;

      if (distance < stopDistance) {
        // Reached destination, start idling
        this.isIdle = true;
        this.idleTimer = 3000 + Math.random() * 2000; // 3-5 seconds
        if (this.sprite?.body) this.sprite.body.setVelocity(0, 0);
      } else {
        // Move toward destination
        const moveVelX = (distX / distance) * this.wanderSpeed;
        const moveVelY = (distY / distance) * this.wanderSpeed;
        if (this.sprite?.body) this.sprite.body.setVelocity(moveVelX, moveVelY);

        // Waddle animation (rotation while walking)
        if (this.sprite) this.sprite.setRotation(Math.sin(this.waddleTime) * 0.05);
      }
    }

    this.updatePositions();
  }

  /**
   * Update all sprite positions (head, mask, etc.) to follow body
   */
  updatePositions() {
    this.head.setPosition(this.x, this.y - 12);
    this.eyeLeft.setPosition(this.x - 3, this.y - 14);
    this.eyeRight.setPosition(this.x + 3, this.y - 14);
    this.mask.setPosition(this.x, this.y - 12);
    this.smileGraphics.clear();
    this.smileGraphics.lineStyle(1, 0x000000, 1);
    this.smileGraphics.beginPath();
    this.smileGraphics.arc(this.x, this.y - 10, 4, Math.PI, 0, false);
    this.smileGraphics.strokePath();
  }

  /**
   * Pick a random destination in the scene
   */
  pickNewDestination() {
    const padding = 50;
    const worldBounds = this.scene.physics.world.bounds;
    this.destinationX = padding + Math.random() * (worldBounds.width - 2 * padding);
    this.destinationY = padding + Math.random() * (worldBounds.height - 2 * padding);
  }

  /**
   * Cleanup resources
   */
  destroy() {
    super.destroy();
  }
}

export default NonPlayerGuest;
export { GUEST_COLORS };
