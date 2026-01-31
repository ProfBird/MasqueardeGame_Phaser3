import Phaser from 'phaser';

class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#1f5f3a');

    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 60, 'Masquerade Game', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '36px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2, 'Press ENTER to Start', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#d8f3dc'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 50, 'Unmask guests to find the thief.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#cdeac0'
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('GameScene');
    });
  }
}

export default MenuScene;
