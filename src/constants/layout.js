/**
 * CASHLY APP - Spacing & Layout
 * БАЙРШИЛ: Cashly.mn/App/src/constants/layout.js
 * Spacing, dimensions, paddings, margins
 */

import { Dimensions, Platform, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

export const LAYOUT = {
  // Screen Dimensions
  window: {
    width,
    height,
  },
  
  // Responsive
  isSmallDevice: width < 375,
  isMediumDevice: width >= 375 && width < 768,
  isLargeDevice: width >= 768,
  
  // Spacing Scale (8px базтай)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    xxxl: 48,
  },
  
  // Padding
  padding: {
    screen: 20,
    container: 16,
    card: 16,
    button: 16,
  },
  
  // Margin
  margin: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  // Border Radius
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 9999,
  },
  
  // Border Width
  borderWidth: {
    thin: 0.5,
    normal: 1,
    thick: 2,
  },
  
  // Icon Sizes
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
    xxl: 48,
  },
  
  // Button Sizes
  button: {
    height: {
      sm: 36,
      md: 48,
      lg: 56,
    },
  },
  
  // Input Sizes
  input: {
    height: 52,
  },
  
  // Header Height
  header: {
    height: Platform.select({
      ios: 88,
      android: 56 + (StatusBar.currentHeight || 0),
      default: 64,
    }),
  },
  
  // Tab Bar Height
  tabBar: {
    height: Platform.select({
      ios: 83,
      android: 60,
      default: 60,
    }),
  },
  
  // Card
  card: {
    minHeight: 100,
    elevation: 4,
    shadowRadius: 8,
  },
  
  // Bottom Sheet
  bottomSheet: {
    minHeight: height * 0.3,
    maxHeight: height * 0.9,
  },
};

export default LAYOUT;