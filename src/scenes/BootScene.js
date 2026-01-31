import Phaser from 'phaser';
import { getAssetLoadQueue, getTotalAssetCount } from '../config/assetManifest';

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.cameras.main.setBackgroundColor('#1a4d2e');

    const { width, height } = this.scale;
    const loadingText = this.add.text(width / 2, height / 2 - 20, 'Loading...', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const progressBar = this.add.rectangle(
      width / 2,
      height / 2 + 20,
      300,
      20,
      0x333333
    );
    const progressFill = this.add.rectangle(
      width / 2 - 150,
      height / 2 + 20,
      0,
      20,
      0x4caf50
    ).setOrigin(0, 0.5);

    const progressText = this.add.text(width / 2, height / 2 + 50, '0%', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#d8f3dc'
    }).setOrigin(0.5);

    // Load assets from manifest
    const assetQueue = getAssetLoadQueue();
    const totalAssets = getTotalAssetCount();

    assetQueue.forEach((asset) => {
      const { key, type, path } = asset;

      if (type === 'image') {
        this.load.image(key, path);
      } else if (type === 'audio') {
        this.load.audio(key, path);
      } else if (type === 'tilemapTiledJSON') {
        this.load.tilemapTiledJSON(key, path);
      }
    });

    // Update progress display
    this.load.on('progress', (progress) => {
      const barWidth = 300 * progress;
      progressFill.width = barWidth;
      progressText.setText(`${Math.round(progress * 100)}%`);
    });

    this.load.on('complete', () => {
      loadingText.setText('Loaded! Starting game...');
    });
  }

  create() {
    this.scene.start('MenuScene');
  }
}

export default BootScene;
