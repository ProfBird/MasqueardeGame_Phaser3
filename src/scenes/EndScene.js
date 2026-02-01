import Phaser from 'phaser';
import { COLORS, TEXT_SIZES } from '../config/constants';

class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndScene' });
  }

  init(data) {
    this.result = data?.result || 'Game Over';
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.dark);

    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 40, 'Result', {
      fontFamily: 'Arial, sans-serif',
      fontSize: TEXT_SIZES.heading,
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2, this.result, {
      fontFamily: 'Arial, sans-serif',
      fontSize: TEXT_SIZES.body,
      color: COLORS.light
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 50, 'Press ENTER to return to Menu', {
      fontFamily: 'Arial, sans-serif',
      fontSize: TEXT_SIZES.small,
      color: COLORS.lighter
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('MenuScene');
    });
  }
}

export default EndScene;
