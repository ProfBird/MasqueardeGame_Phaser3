import BootScene from '../scenes/BootScene';
import MenuScene from '../scenes/MenuScene';
import GameScene from '../scenes/GameScene';
import InterrogationScene from '../scenes/InterrogationScene';
import EndScene from '../scenes/EndScene';

/**
 * Main Phaser game configuration
 */
const gameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#2e7d50',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [
    BootScene,
    MenuScene,
    GameScene,
    InterrogationScene,
    EndScene
  ]
};

export default gameConfig;
