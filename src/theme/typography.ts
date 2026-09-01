import { Platform } from 'react-native';

export const typography = {
  // Primary UI Font
  fontFamily: Platform.select({
    web: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    ios: 'System',
    android: 'sans-serif',
    default: 'sans-serif',
  }),

  // Elegant Tamil Font for Reading & Scriptures
  tamilFont: Platform.select({
    web: "'Mukta Malar', 'Noto Sans Tamil', 'Latha', 'Tamil Sangam MN', sans-serif",
    ios: 'Tamil Sangam MN',
    android: 'sans-serif',
    default: 'sans-serif',
  }),

  // Premium Scripture Display (Serif/Sacred aesthetic)
  tamilScriptureFont: Platform.select({
    web: "'Noto Serif Tamil', 'Mukta Malar', 'Latha', serif",
    ios: 'Tamil Sangam MN',
    android: 'serif',
    default: 'serif',
  }),
};
