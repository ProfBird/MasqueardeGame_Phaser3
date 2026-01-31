import Phaser from 'phaser';
import GameState from '../systems/GameState';

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#2e7d50');

    const { width, height } = this.scale;

    this.gameState = new GameState();
    this.gameState.initializeRound();

    this.add.text(width / 2, height / 2 - 40, 'Gameplay Scene', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.clueText = this.add.text(width / 2, height / 2, 'Clue: ...', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#d8f3dc'
    }).setOrigin(0.5);

    this.timerText = this.add.text(width / 2, height / 2 + 30, 'Time: 02:00', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#d8f3dc'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 70, 'Press ESC to return to Menu', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#d8f3dc'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 95, 'Press END to view End Scene', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#cdeac0'
    }).setOrigin(0.5);

    this.gameState.on('clue', ({ clueFeature }) => {
      this.clueText.setText(`Clue: ${clueFeature}`);
    });

    this.gameState.on('timer', (remainingSeconds) => {
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      this.timerText.setText(`Time: ${formatted}`);
    });

    this.gameState.on('win', ({ thiefId }) => {
      this.scene.start('EndScene', { result: `You caught the thief (${thiefId}).` });
    });

    this.gameState.on('loss', ({ reason, thiefId }) => {
      const message = reason === 'timeout'
        ? `Time's up. The thief was ${thiefId}.`
        : `Wrong accusation. The thief was ${thiefId}.`;
      this.scene.start('EndScene', { result: message });
    });

    this.gameState.startTimer(this);

    this.input.keyboard.once('keydown-ESC', () => {
      this.gameState.stopTimer();
      this.scene.start('MenuScene');
    });

    this.input.keyboard.once('keydown-END', () => {
      this.gameState.stopTimer();
      this.scene.start('EndScene', { result: 'placeholder' });
    });
  }
}

export default GameScene;
