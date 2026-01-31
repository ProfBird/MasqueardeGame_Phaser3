import Phaser from 'phaser';
import gameConfig from './config/gameConfig';

// Initialize Phaser game instance
const game = new Phaser.Game(gameConfig);

// Export for debugging in console
window.game = game;
