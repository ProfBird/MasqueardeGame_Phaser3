import Phaser from 'phaser';
import Guest from './Guest';
import { FEATURE_FLAGS } from '../config/featureFlags';

class Player extends Guest {
  constructor(scene, x, y, options = {}) {
    super(scene, x, y, options);
    this.speed = options.speed || 200;
    this.interactionRadius = options.interactionRadius || 50;
    this.facingAngle = 0;
    this.isHighlighted = false;

    // Create placeholder rectangle with physics body
    this.createSprite(x, y);

    // Direction indicator
    this.createFacingIndicator(x, y);

    // Input handling
    this.setupInput();

    // Interaction state
    this.nearbyNPCs = [];
  }

  createSprite(x, y) {
    if (!FEATURE_FLAGS.enablePlaceholderGraphics) {
      throw new Error('Placeholder graphics are disabled. Provide player sprite assets.');
    }
    this.sprite = this.scene.add.rectangle(x, y, 32, 48, 0x4285f4, 1);
    this.sprite.setStrokeStyle(2, 0xffffff, 1);
    this.sprite.setOrigin(0.5, 0.5); // Ensure centered origin
    this.trackSprite(this.sprite);

    // Player is movable (can be stopped by collisions) but not pushable
    this.addPhysics(this.sprite, {
      width: 32,
      height: 48,
      offsetY: 0,
      isImmovable: false,
      isPushable: false,
      collideWorldBounds: true
    });

    this.body = this.sprite.body;
  }

  createFacingIndicator(x, y) {
    this.arrow = this.scene.add.triangle(
      x,
      y,
      0,
      6,
      12,
      3,
      0,
      0,
      0xffffff,
      1
    );
    this.arrow.setOrigin(0.5, 0.5);
    this.trackSprite(this.arrow);
  }

  setupInput() {
    const keys = this.scene.input.keyboard.createCursorKeys();
    this.keys = {
      up: keys.up,
      down: keys.down,
      left: keys.left,
      right: keys.right,
      w: this.scene.input.keyboard.addKey('W'),
      a: this.scene.input.keyboard.addKey('A'),
      s: this.scene.input.keyboard.addKey('S'),
      d: this.scene.input.keyboard.addKey('D')
    };
  }

  update() {
    // Handle input and update velocity
    const movement = this.handleMovement();

    this.updateFacing(movement);
    this.updateIdleWobble(movement.isMoving);
  }

  handleMovement() {
    const maxVelocity = this.speed;
    let velocityX = 0;
    let velocityY = 0;

    // Check if player is trying to move
    const isPressingKeys = 
      this.keys.up.isDown || this.keys.w.isDown ||
      this.keys.down.isDown || this.keys.s.isDown ||
      this.keys.left.isDown || this.keys.a.isDown ||
      this.keys.right.isDown || this.keys.d.isDown;

    // Check for nearby obstacles before processing input
    let blockedDirections = { up: false, down: false, left: false, right: false };
    
    if (this.scene.guestGroup && isPressingKeys) {
      for (const body of this.scene.guestGroup.children.entries) {
        if (!body.body || !this.body) continue;

        const playerCenter = this.body.center;
        const guestCenter = body.body.center;
        const dx = guestCenter.x - playerCenter.x;
        const dy = guestCenter.y - playerCenter.y;
        const distance = Math.hypot(dx, dy);

        const playerRadius = Math.max(this.body.width, this.body.height) / 2;
        const guestRadius = Math.max(body.body.width, body.body.height) / 2;
        const combinedRadius = playerRadius + guestRadius;
        
        if (distance < combinedRadius) {
          // Normalize direction to guest
          if (distance > 0) {
            const dirX = dx / distance;
            const dirY = dy / distance;
            
            // Block directions facing toward the guest
            if (dirY < -0.5) blockedDirections.up = true;
            if (dirY > 0.5) blockedDirections.down = true;
            if (dirX < -0.5) blockedDirections.left = true;
            if (dirX > 0.5) blockedDirections.right = true;
            
            // If overlapping, nudge player away from the guest
            const overlap = combinedRadius - distance;
            if (overlap > 0) {
              const awayX = -dirX;
              const awayY = -dirY;
              this.sprite.setPosition(
                this.sprite.x + awayX * overlap,
                this.sprite.y + awayY * overlap
              );
              this.body.updateFromGameObject();
            }
          }
        }
      }
    }

    // Up (blocked if collision ahead)
    if ((this.keys.up.isDown || this.keys.w.isDown) && !blockedDirections.up) {
      velocityY -= maxVelocity;
    }
    // Down
    if ((this.keys.down.isDown || this.keys.s.isDown) && !blockedDirections.down) {
      velocityY += maxVelocity;
    }
    // Left
    if ((this.keys.left.isDown || this.keys.a.isDown) && !blockedDirections.left) {
      velocityX -= maxVelocity;
    }
    // Right
    if ((this.keys.right.isDown || this.keys.d.isDown) && !blockedDirections.right) {
      velocityX += maxVelocity;
    }

    const isMoving = velocityX !== 0 || velocityY !== 0;

    if (isMoving) {
      const length = Math.hypot(velocityX, velocityY);
      velocityX = (velocityX / length) * maxVelocity;
      velocityY = (velocityY / length) * maxVelocity;
    }

    // Only block movement toward guests; allow moving away
    if (blockedDirections.left && velocityX < 0) velocityX = 0;
    if (blockedDirections.right && velocityX > 0) velocityX = 0;
    if (blockedDirections.up && velocityY < 0) velocityY = 0;
    if (blockedDirections.down && velocityY > 0) velocityY = 0;

    this.body.setVelocity(velocityX, velocityY);

    const isActuallyMoving =
      Math.abs(this.body.velocity.x) > 0.01 || Math.abs(this.body.velocity.y) > 0.01;

    return {
      isMoving: isActuallyMoving,
      velocityX,
      velocityY
    };
  }

  updateFacing({ isMoving, velocityX, velocityY }) {
    if (isMoving) {
      if (Math.abs(velocityX) >= Math.abs(velocityY)) {
        this.facingAngle = velocityX >= 0 ? 0 : Math.PI;
      } else {
        this.facingAngle = velocityY >= 0 ? Math.PI / 2 : -Math.PI / 2;
      }
    }

    const offset = 14;
    const offsetX = Math.cos(this.facingAngle) * offset;
    const offsetY = Math.sin(this.facingAngle) * offset;

    this.arrow.setPosition(this.sprite.x + offsetX, this.sprite.y + offsetY);
    this.arrow.setRotation(this.facingAngle);
  }

  updateIdleWobble(isMoving) {
    if (isMoving) {
      this.sprite.setRotation(0);
      this.sprite.setScale(1, 1);
      this.arrow.setScale(1, 1);
      return;
    }

    const t = this.scene.time.now * 0.004;
    const wobbleScale = 1 + Math.sin(t) * 0.02;
    const wobbleRotation = Math.sin(t * 0.8) * 0.03;

    this.sprite.setScale(wobbleScale, wobbleScale);
    this.sprite.setRotation(wobbleRotation);
    this.arrow.setScale(wobbleScale, wobbleScale);
  }

  setInteractionHighlight(enabled) {
    this.isHighlighted = enabled;
    const strokeColor = enabled ? 0xffe082 : 0xffffff;
    const arrowColor = enabled ? 0xffe082 : 0xffffff;

    this.sprite.setStrokeStyle(2, strokeColor, 1);
    this.arrow.setFillStyle(arrowColor, 1);
  }

  /**
   * Get NPCs within interaction radius
   */
  getNearbyNPCs(npcs) {
    return npcs.filter((npc) => {
      const distance = Phaser.Math.Distance.Between(
        this.sprite.x,
        this.sprite.y,
        npc.x,
        npc.y
      );
      return distance <= this.interactionRadius;
    });
  }

  /**
   * Draw interaction radius (for debugging)
   */
  drawInteractionRadius(graphics) {
    if (!graphics) return;

    graphics.clear();
    graphics.lineStyle(2, 0x00ff00, 0.3); // Green outline
    graphics.strokeCircleShape(
      new Phaser.Geom.Circle(this.sprite.x, this.sprite.y, this.interactionRadius)
    );
  }

  /**
   * Collision handler - called when colliding with a NonPlayerGuest
   * Uses Phaser's standard collision to naturally stop movement
   * @param {Guest} other - The other guest involved in the collision
   */
  onCollision(other) {
    // Call parent implementation (which does nothing in base class)
    super.onCollision(other);
    // Player movement is controlled by input; collision naturally stops it via Phaser physics
  }

  /**
   * Cleanup resources
   */
  destroy() {
    super.destroy();
  }
}

export default Player;
