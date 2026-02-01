import Phaser from 'phaser';
import NonPlayerGuest from '../entities/NonPlayerGuest';
import { COLORS, TEXT_SIZES, KEYS } from '../config/constants';

class InterrogationScene extends Phaser.Scene {
  constructor() {
    super({ key: 'InterrogationScene' });
    this.hasAsked = false;
  }

  create(data = {}) {
    this.hasAsked = false;
    this.didReveal = false;
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(COLORS.darkMedium);

    const {
      guestId,
      guestVariant,
      clueFeature,
      returnScene = 'GameScene'
    } = data;

    this.returnScene = returnScene;
    this.guestId = guestId;
    this.clueFeature = clueFeature;

    this.add.text(width / 2, 60, 'Interrogation', {
      fontFamily: 'Arial, sans-serif',
      fontSize: TEXT_SIZES.heading,
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, 110, `Clue: ${clueFeature ?? 'Unknown'}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: TEXT_SIZES.body,
      color: COLORS.light
    }).setOrigin(0.5);

    this.promptText = this.add.text(
      width / 2,
      height - 120,
      `Press ${KEYS.accuse} to cite the clue and ask for identity`,
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: TEXT_SIZES.small,
        color: COLORS.lighter
      }
    ).setOrigin(0.5);

    this.add.text(width / 2, height - 80, 'Press ESC to return', {
      fontFamily: 'Arial, sans-serif',
      fontSize: TEXT_SIZES.small,
      color: COLORS.lighter
    }).setOrigin(0.5);

    const guestX = width / 2;
    const guestY = height / 2 + 40;
    this.guest = new NonPlayerGuest(this, guestX, guestY, guestId ?? 'guest', guestVariant ?? 'red');

    this.input.keyboard.on(`keydown-${KEYS.accuse}`, () => {
      if (this.hasAsked) return;
      this.hasAsked = true;
      this.promptText.setText('Identity requested...');

      this.guest.unmask(700);
      this.time.delayedCall(800, () => {
        this.promptText.setText(`Identity revealed: ${guestId ?? 'Unknown'}. Press ESC to return.`);
        this.didReveal = true;
      });
    });

    this.input.keyboard.on(`keydown-${KEYS.back}`, () => {
      this.returnToGame();
    });

  }

  returnToGame() {
    if (this.returnScene) {
      const gameScene = this.scene.get(this.returnScene);
      if (gameScene?.events && this.guestId && this.didReveal) {
        gameScene.events.emit('guest-unmasked', { guestId: this.guestId });
      }
      if (this.scene.isPaused(this.returnScene)) {
        this.scene.resume(this.returnScene);
      }
    }
    this.scene.stop();
  }
}

export default InterrogationScene;
