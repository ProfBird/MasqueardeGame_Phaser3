/**
 * Asset keys registry - centralized constants for all game assets
 */

// Characters
export const PLAYER_KEY = 'player';
export const GUEST_BODY_KEYS = {
  body1: 'guest-body-1',
  body2: 'guest-body-2',
  body3: 'guest-body-3',
  body4: 'guest-body-4'
};

export const GUEST_HEAD_KEYS = {
  head1: 'guest-head-1',
  head2: 'guest-head-2',
  head3: 'guest-head-3',
  head4: 'guest-head-4',
  head5: 'guest-head-5',
  head6: 'guest-head-6'
};

export const GUEST_MASK_KEYS = {
  mask1: 'guest-mask-1',
  mask2: 'guest-mask-2',
  mask3: 'guest-mask-3',
  mask4: 'guest-mask-4'
};

// Environment
export const TILESET_KEY = 'ballroom-tileset';
export const TILEMAP_KEY = 'ballroom-map';
export const FURNITURE_KEYS = {
  table: 'furniture-table',
  fountain: 'furniture-fountain',
  column: 'furniture-column',
  plant: 'furniture-plant'
};

// UI
export const UI_FONT_KEY = 'ui-font';

// Audio
export const AUDIO_KEYS = {
  bgm: 'audio-bgm',
  sfxUnmask: 'audio-sfx-unmask',
  sfxAccuse: 'audio-sfx-accuse',
  sfxFootstep: 'audio-sfx-footstep',
  sfxTimerWarning: 'audio-sfx-timer-warning',
  sfxWin: 'audio-sfx-win',
  sfxLose: 'audio-sfx-lose'
};

/**
 * Utility to get all body variant keys
 */
export const getBodyVariantKeys = () => Object.values(GUEST_BODY_KEYS);

/**
 * Utility to get all head variant keys
 */
export const getHeadVariantKeys = () => Object.values(GUEST_HEAD_KEYS);

/**
 * Utility to get all mask variant keys
 */
export const getMaskVariantKeys = () => Object.values(GUEST_MASK_KEYS);
