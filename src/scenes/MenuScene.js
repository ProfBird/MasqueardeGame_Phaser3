import Phaser from 'phaser';
import { COLORS, TEXT_SIZES, KEYS } from '../config/constants';

class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.darkMedium);

    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 60, 'Masquerade Game', {
      fontFamily: 'Arial, sans-serif',
      fontSize: TEXT_SIZES.title,
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2, 'Press ENTER to Start', {
      fontFamily: 'Arial, sans-serif',
      fontSize: TEXT_SIZES.body,
      color: COLORS.light
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 50, 'Unmask guests to find the thief.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: TEXT_SIZES.small,
      color: COLORS.lighter
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('GameScene');
    });
  }
}

export default MenuScene;
