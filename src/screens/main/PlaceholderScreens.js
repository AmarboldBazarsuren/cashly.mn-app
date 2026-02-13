/**
 * CASHLY APP - Placeholder Screens
 * БАЙРШИЛ: Cashly.mn/App/src/screens/main/
 * Эдгээр дэлгэцийн бүрэн код нь дараагийн файлуудад байна
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';
import { TEXT_STYLES } from '../../constants/typography';

// LoansScreen
export const LoansScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Зээл</Text>
      <Text style={styles.subtitle}>Loans screen байршуулах</Text>
    </View>
  );
};

// WalletScreen  
export const WalletScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Хэтэвч</Text>
      <Text style={styles.subtitle}>Wallet screen байршуулах</Text>
    </View>
  );
};

// ProfileScreen
export const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Профайл</Text>
      <Text style={styles.subtitle}>Profile screen байршуулах</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  title: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
  },
  subtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
});