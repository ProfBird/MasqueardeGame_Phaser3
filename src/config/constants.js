/**
 * Global constants for UI, colors, and positioning
 */

// Colors
export const COLORS = {
  dark: '#1a4d2e',
  darkMedium: '#1f5f3a',
  medium: '#2e7d50',
  light: '#d8f3dc',
  lighter: '#cdeac0',
  success: '#4caf50',
  neutral: '#333333'
};

// UI Positioning
export const UI_POSITIONS = {
  centerX: () => {
    // This will be calculated dynamically in scenes
    // For now, we'll use relative offsets
  },
  title: { offsetY: -60 },
  main: { offsetY: 0 },
  subtitle: { offsetY: 50 },
  controls: { offsetY: 70 },
  hint: { offsetY: 95 }
};

// UI Text Sizes
export const TEXT_SIZES = {
  title: '36px',
  heading: '28px',
  body: '20px',
  small: '16px',
  hint: '14px'
};

// Progress Bar
export const PROGRESS_BAR = {
  width: 300,
  height: 20,
  bgColor: COLORS.neutral,
  fillColor: COLORS.success,
  offsetX: 150 // half of width
};

// Keyboard Keys
export const KEYS = {
  interact: 'E',
  accuse: 'Q',
  back: 'ESC',
  test: 'END'
};
