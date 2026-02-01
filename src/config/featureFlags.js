const isDev =
  typeof process !== 'undefined' &&
  process.env &&
  process.env.NODE_ENV !== 'production';

export const FEATURE_FLAGS = {
  // Placeholder/temporary features
  enablePlaceholderGraphics: true,
  enableEndSceneShortcut: isDev
};
