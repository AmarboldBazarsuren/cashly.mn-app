/**
 * CASHLY APP - Splash Screen
 * БАЙРШИЛ: Cashly.mn/App/src/screens/auth/SplashScreen.js
 * App эхлэх үеийн дэлгэц
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/typography';

const SplashScreen = () => {
  return (
    <LinearGradient
      colors={COLORS.gradient.primary}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo / App Name */}
        <Text style={styles.logo}>💰</Text>
        <Text style={styles.appName}>CASHLY</Text>
        <Text style={styles.tagline}>Хурдан, Хялбар, Найдвартай</Text>
        
        {/* Loading Indicator */}
        <ActivityIndicator 
          size="large" 
          color={COLORS.white} 
          style={styles.loader}
        />
      </View>
      
      {/* Version */}
      <Text style={styles.version}>v1.0.0</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  appName: {
    fontSize: 48,
    fontWeight: FONTS.weight.bold,
    color: COLORS.white,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 8,
  },
  loader: {
    marginTop: 40,
  },
  version: {
    position: 'absolute',
    bottom: 30,
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.7,
  },
});

export default SplashScreen;