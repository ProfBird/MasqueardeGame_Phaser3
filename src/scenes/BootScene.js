import Phaser from 'phaser';
import { getAssetLoadQueue } from '../config/assetManifest';
import { COLORS, TEXT_SIZES, PROGRESS_BAR } from '../config/constants';

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.cameras.main.setBackgroundColor(COLORS.dark);

    const { width, height } = this.scale;
    const loadingText = this.add.text(width / 2, height / 2 - 20, 'Loading...', {
      fontFamily: 'Arial, sans-serif',
      fontSize: TEXT_SIZES.body,
      color: '#ffffff'
    }).setOrigin(0.5);

    const progressBar = this.add.rectangle(
      width / 2,
      height / 2 + 20,
      PROGRESS_BAR.width,
      PROGRESS_BAR.height,
      PROGRESS_BAR.bgColor
    );
    const progressFill = this.add.rectangle(
      width / 2 - PROGRESS_BAR.offsetX,
      height / 2 + 20,
      0,
      PROGRESS_BAR.height,
      PROGRESS_BAR.fillColor
    ).setOrigin(0, 0.5);

    const progressText = this.add.text(width / 2, height / 2 + 50, '0%', {
      fontFamily: 'Arial, sans-serif',
      fontSize: TEXT_SIZES.small,
      color: COLORS.light
    }).setOrigin(0.5);

    // Load assets from manifest
    const assetQueue = getAssetLoadQueue();

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
      const barWidth = PROGRESS_BAR.width * progress;
      progressFill.width = barWidth;
      progressText.setText(`${Math.round(progress * 100)}%`);
    });

    // Handle load errors
    this.load.on('filefailed', (file) => {
      console.warn(`Failed to load: ${file.key} (${file.src})`);
    });

    this.load.on('loaderror', () => {
      loadingText.setText('Load failed! Check console.');
      console.error('Asset loading failed');
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
