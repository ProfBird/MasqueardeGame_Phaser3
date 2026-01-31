/**
 * Asset manifest - defines loading paths and metadata
 * Assets are organized by type: sprites, audio, tilemaps, etc.
 */

export const ASSET_MANIFEST = {
  // Character sprites - placeholder paths, will be replaced with actual assets
  characters: {
    player: {
      key: 'player',
      type: 'image',
      path: 'assets/sprites/player.png'
    },
    guestBodies: [
      { key: 'guest-body-1', type: 'image', path: 'assets/sprites/guest-body-1.png' },
      { key: 'guest-body-2', type: 'image', path: 'assets/sprites/guest-body-2.png' },
      { key: 'guest-body-3', type: 'image', path: 'assets/sprites/guest-body-3.png' },
      { key: 'guest-body-4', type: 'image', path: 'assets/sprites/guest-body-4.png' }
    ],
    guestHeads: [
      { key: 'guest-head-1', type: 'image', path: 'assets/sprites/guest-head-1.png' },
      { key: 'guest-head-2', type: 'image', path: 'assets/sprites/guest-head-2.png' },
      { key: 'guest-head-3', type: 'image', path: 'assets/sprites/guest-head-3.png' },
      { key: 'guest-head-4', type: 'image', path: 'assets/sprites/guest-head-4.png' },
      { key: 'guest-head-5', type: 'image', path: 'assets/sprites/guest-head-5.png' },
      { key: 'guest-head-6', type: 'image', path: 'assets/sprites/guest-head-6.png' }
    ],
    guestMasks: [
      { key: 'guest-mask-1', type: 'image', path: 'assets/sprites/guest-mask-1.png' },
      { key: 'guest-mask-2', type: 'image', path: 'assets/sprites/guest-mask-2.png' },
      { key: 'guest-mask-3', type: 'image', path: 'assets/sprites/guest-mask-3.png' },
      { key: 'guest-mask-4', type: 'image', path: 'assets/sprites/guest-mask-4.png' }
    ]
  },

  // Environment
  environment: {
    tileset: {
      key: 'ballroom-tileset',
      type: 'image',
      path: 'assets/tilesets/ballroom-tileset.png'
    },
    tilemap: {
      key: 'ballroom-map',
      type: 'tilemapTiledJSON',
      path: 'assets/tilemaps/ballroom-map.json'
    },
    furniture: [
      { key: 'furniture-table', type: 'image', path: 'assets/sprites/furniture-table.png' },
      { key: 'furniture-fountain', type: 'image', path: 'assets/sprites/furniture-fountain.png' },
      { key: 'furniture-column', type: 'image', path: 'assets/sprites/furniture-column.png' },
      { key: 'furniture-plant', type: 'image', path: 'assets/sprites/furniture-plant.png' }
    ]
  },

  // Audio
  audio: {
    bgm: {
      key: 'audio-bgm',
      type: 'audio',
      path: 'assets/audio/bgm-masquerade.mp3'
    },
    sfx: [
      { key: 'audio-sfx-unmask', type: 'audio', path: 'assets/audio/sfx-unmask.mp3' },
      { key: 'audio-sfx-accuse', type: 'audio', path: 'assets/audio/sfx-accuse.mp3' },
      { key: 'audio-sfx-footstep', type: 'audio', path: 'assets/audio/sfx-footstep.mp3' },
      { key: 'audio-sfx-timer-warning', type: 'audio', path: 'assets/audio/sfx-timer-warning.mp3' },
      { key: 'audio-sfx-win', type: 'audio', path: 'assets/audio/sfx-win.mp3' },
      { key: 'audio-sfx-lose', type: 'audio', path: 'assets/audio/sfx-lose.mp3' }
    ]
  }
};

/**
 * Flatten manifest into a simple array for easier iteration
 */
export const getAssetLoadQueue = () => {
  const queue = [];

  // Characters
  queue.push(ASSET_MANIFEST.characters.player);
  queue.push(...ASSET_MANIFEST.characters.guestBodies);
  queue.push(...ASSET_MANIFEST.characters.guestHeads);
  queue.push(...ASSET_MANIFEST.characters.guestMasks);

  // Environment
  queue.push(ASSET_MANIFEST.environment.tileset);
  queue.push(ASSET_MANIFEST.environment.tilemap);
  queue.push(...ASSET_MANIFEST.environment.furniture);

  // Audio
  queue.push(ASSET_MANIFEST.audio.bgm);
  queue.push(...ASSET_MANIFEST.audio.sfx);

  return queue;
};

/**
 * Get total asset count for progress calculations
 */
export const getTotalAssetCount = () => {
  return getAssetLoadQueue().length;
};
