/**
 * CASHLY APP - Typography
 * БАЙРШИЛ: Cashly.mn/App/src/constants/typography.js
 * Font sizes, weights, line heights
 */

import { Platform } from 'react-native';

export const FONTS = {
  // Font Families
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System'
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System'
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System'
  }),
  
  // Font Sizes
  size: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    huge: 32,
    massive: 40,
  },
  
  // Font Weights
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

// Predefined Text Styles
export const TEXT_STYLES = {
  // Headings
  h1: {
    fontSize: FONTS.size.massive,
    fontWeight: FONTS.weight.bold,
    lineHeight: FONTS.size.massive * FONTS.lineHeight.tight,
  },
  h2: {
    fontSize: FONTS.size.huge,
    fontWeight: FONTS.weight.bold,
    lineHeight: FONTS.size.huge * FONTS.lineHeight.tight,
  },
  h3: {
    fontSize: FONTS.size.xxxl,
    fontWeight: FONTS.weight.bold,
    lineHeight: FONTS.size.xxxl * FONTS.lineHeight.normal,
  },
  h4: {
    fontSize: FONTS.size.xxl,
    fontWeight: FONTS.weight.semibold,
    lineHeight: FONTS.size.xxl * FONTS.lineHeight.normal,
  },
  h5: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.semibold,
    lineHeight: FONTS.size.xl * FONTS.lineHeight.normal,
  },
  h6: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.semibold,
    lineHeight: FONTS.size.lg * FONTS.lineHeight.normal,
  },
  
  // Body Text
  body: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.regular,
    lineHeight: FONTS.size.base * FONTS.lineHeight.normal,
  },
  bodyLarge: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.regular,
    lineHeight: FONTS.size.md * FONTS.lineHeight.normal,
  },
  bodySmall: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.regular,
    lineHeight: FONTS.size.sm * FONTS.lineHeight.normal,
  },
  
  // Special
  caption: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.regular,
    lineHeight: FONTS.size.xs * FONTS.lineHeight.normal,
  },
  button: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.semibold,
    lineHeight: FONTS.size.md * FONTS.lineHeight.tight,
  },
  link: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.medium,
    textDecorationLine: 'underline',
  },
};

export default FONTS;