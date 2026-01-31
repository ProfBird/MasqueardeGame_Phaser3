import Phaser from 'phaser';

class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndScene' });
  }

  init(data) {
    this.result = data?.result || 'Game Over';
  }

  create() {
    this.cameras.main.setBackgroundColor('#163824');

    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 40, 'Result', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2, this.result, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#d8f3dc'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 50, 'Press ENTER to return to Menu', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#cdeac0'
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('MenuScene');
    });
  }
}

export default EndScene;
