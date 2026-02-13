/**
 * CASHLY APP - Profile Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../contexts/AuthContext';
import COLORS from '../../constants/colors';
import { FONTS, TEXT_STYLES } from '../../constants/typography';
import LAYOUT from '../../constants/layout';
import { getKYCStatusText, formatPhone } from '../../utils/formatters';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Гарах', 'Та гарахдаа итгэлтэй байна уу?', [
      { text: 'Үгүй', style: 'cancel' },
      { text: 'Тийм', onPress: async () => await logout() }
    ]);
  };

  const menuItems = [
    { icon: 'person-outline', label: 'Хувийн мэдээлэл', onPress: () => navigation.navigate('KYC'), badge: user?.kycStatus !== 'approved' ? 'Бөглөх' : null },
    { icon: 'card-outline', label: 'Банкны мэдээлэл', onPress: () => {} },
    { icon: 'settings-outline', label: 'Тохиргоо', onPress: () => {} },
    { icon: 'help-circle-outline', label: 'Тусламж', onPress: () => {} },
    { icon: 'information-circle-outline', label: 'Апп-ын тухай', onPress: () => {} },
    { icon: 'log-out-outline', label: 'Гарах', onPress: handleLogout, color: COLORS.error },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient colors={COLORS.gradient.primary} style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.phone}>{formatPhone(user?.phoneNumber)}</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.creditScore || 0}</Text>
            <Text style={styles.statLabel}>Оноо</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{getKYCStatusText(user?.kycStatus)}</Text>
            <Text style={styles.statLabel}>KYC</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon} size={24} color={item.color || COLORS.textPrimary} />
                <Text style={[styles.menuLabel, item.color && { color: item.color }]}>{item.label}</Text>
              </View>
              <View style={styles.menuRight}>
                {item.badge && <View style={styles.badge}><Text style={styles.badgeText}>{item.badge}</Text></View>}
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.version}>v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 30, paddingHorizontal: LAYOUT.padding.screen, alignItems: 'center' },
  profileInfo: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 36, fontWeight: FONTS.weight.bold, color: COLORS.white },
  name: { fontSize: FONTS.size.xxl, fontWeight: FONTS.weight.bold, color: COLORS.white },
  phone: { fontSize: FONTS.size.base, color: COLORS.white, opacity: 0.9, marginTop: 4 },
  statsContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: LAYOUT.radius.md, padding: 16, width: '100%' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FONTS.size.xl, fontWeight: FONTS.weight.bold, color: COLORS.white },
  statLabel: { fontSize: FONTS.size.sm, color: COLORS.white, opacity: 0.8, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 16 },
  content: { flex: 1 },
  menu: { backgroundColor: COLORS.white, marginTop: -10, borderTopLeftRadius: LAYOUT.radius.xl, borderTopRightRadius: LAYOUT.radius.xl, padding: LAYOUT.padding.screen },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  menuLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuLabel: { fontSize: FONTS.size.base, color: COLORS.textPrimary, marginLeft: 16 },
  menuRight: { flexDirection: 'row', alignItems: 'center' },
  badge: { backgroundColor: COLORS.warning + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: LAYOUT.radius.sm, marginRight: 8 },
  badgeText: { fontSize: FONTS.size.xs, color: COLORS.warning, fontWeight: FONTS.weight.semibold },
  version: { textAlign: 'center', color: COLORS.textDisabled, fontSize: FONTS.size.xs, padding: 20 },
});

export default ProfileScreen;