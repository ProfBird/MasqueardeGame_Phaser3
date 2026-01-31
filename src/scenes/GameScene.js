import Phaser from 'phaser';
import GameState from '../systems/GameState';
import { COLORS, TEXT_SIZES, KEYS } from '../config/constants';

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.medium);

    const { width, height } = this.scale;

    this.gameState = new GameState();
    this.gameState.initializeRound();

    this.add.text(width / 2, height / 2 - 40, 'Gameplay Scene', {
      fontFamily: 'Arial, sans-serif',
      fontSize: TEXT_SIZES.heading,
      color: '#ffffff'
    }).setOrigin(0.5);

    this.clueText = this.add.text(width / 2, height / 2, 'Clue: ...', {
      fontFamily: 'Arial, sans-serif',
      fontSize: TEXT_SIZES.body,
      color: COLORS.light
    }).setOrigin(0.5);

    this.timerText = this.add.text(width / 2, height / 2 + 30, 'Time: 02:00', {
      fontFamily: 'Arial, sans-serif',
      fontSize: TEXT_SIZES.body,
      color: COLORS.light
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 70, 'Press ESC to return to Menu', {
      fontFamily: 'Arial, sans-serif',
      fontSize: TEXT_SIZES.small,
      color: COLORS.light
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 95, 'Press END to view End Scene', {
      fontFamily: 'Arial, sans-serif',
      fontSize: TEXT_SIZES.hint,
      color: COLORS.lighter
    }).setOrigin(0.5);

    // Bind game state event listeners
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
      this.cleanup();
      this.scene.start('EndScene', { result: `You caught the thief (${thiefId}).` });
    });

    this.gameState.on('loss', ({ reason, thiefId }) => {
      const message = reason === 'timeout'
        ? `Time's up. The thief was ${thiefId}.`
        : `Wrong accusation. The thief was ${thiefId}.`;
      this.cleanup();
      this.scene.start('EndScene', { result: message });
    });

    this.gameState.startTimer(this);

    // Keyboard input handlers
    this.input.keyboard.on('keydown-ESC', () => {
      this.cleanup();
      this.scene.start('MenuScene');
    });

    this.input.keyboard.on('keydown-END', () => {
      this.cleanup();
      this.scene.start('EndScene', { result: 'placeholder' });
    });

    // Cleanup when scene stops
    this.events.on('sleep', () => this.cleanup());
    this.events.on('shutdown', () => this.cleanup());
  }

  cleanup() {
    if (this.gameState) {
      this.gameState.stopTimer();
      this.gameState.removeAllListeners();
    }
  }
}

export default GameScene;
