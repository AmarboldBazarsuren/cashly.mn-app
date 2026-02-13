/**
 * CASHLY APP - Home Screen
 * БАЙРШИЛ: Cashly.mn/App/src/screens/main/HomeScreen.js
 * Үндсэн dashboard
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../contexts/AuthContext';
import { getWallet } from '../../api/services/walletService';
import { getActiveLoans } from '../../api/services/loanService';
import Button from '../../components/Button';
import COLORS from '../../constants/colors';
import { FONTS, TEXT_STYLES } from '../../constants/typography';
import LAYOUT from '../../constants/layout';
import { formatMoney } from '../../utils/formatters';

const HomeScreen = ({ navigation }) => {
  const { user, refreshProfile } = useAuth();
  
  const [wallet, setWallet] = useState(null);
  const [loans, setLoans] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadWallet(),
      loadLoans(),
      refreshProfile(),
    ]);
  };

  const loadWallet = async () => {
    const result = await getWallet();
    if (result.success) {
      setWallet(result.data);
    }
  };

  const loadLoans = async () => {
    const result = await getActiveLoans();
    if (result.success) {
      setLoans(result.data);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Quick Actions
  const quickActions = [
    {
      icon: 'cash-outline',
      label: 'Зээл авах',
      color: COLORS.primary,
      onPress: () => {
        if (user?.kycStatus !== 'approved') {
          navigation.navigate('KYC');
        } else {
          navigation.navigate('ApplyLoan');
        }
      },
    },
    {
      icon: 'wallet-outline',
      label: 'Цэнэглэх',
      color: COLORS.secondary,
      onPress: () => navigation.navigate('Deposit'),
    },
    {
      icon: 'arrow-up-outline',
      label: 'Татах',
      color: COLORS.accent,
      onPress: () => navigation.navigate('Withdraw'),
    },
    {
      icon: 'time-outline',
      label: 'Түүх',
      color: COLORS.info,
      onPress: () => navigation.navigate('TransactionHistory'),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <LinearGradient colors={COLORS.gradient.primary} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Сайн байна уу,</Text>
            <Text style={styles.userName}>{user?.name || 'Хэрэглэгч'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Wallet Card */}
        <View style={styles.walletCard}>
          <Text style={styles.walletLabel}>Нийт үлдэгдэл</Text>
          <Text style={styles.walletBalance}>
            {formatMoney(wallet?.balance || 0)}
          </Text>
          
          <View style={styles.walletDetails}>
            <View>
              <Text style={styles.walletDetailLabel}>Боломжит</Text>
              <Text style={styles.walletDetailValue}>
                {formatMoney(wallet?.availableBalance || 0)}
              </Text>
            </View>
            <View>
              <Text style={styles.walletDetailLabel}>Зээлийн эрх</Text>
              <Text style={styles.walletDetailValue}>
                {formatMoney(user?.creditLimit || 0)}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Үйлдлүүд</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionButton}
                onPress={action.onPress}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* KYC Status */}
        {user?.kycStatus !== 'approved' && (
          <TouchableOpacity
            style={styles.kycBanner}
            onPress={() => navigation.navigate('KYC')}
          >
            <Ionicons name="alert-circle-outline" size={24} color={COLORS.warning} />
            <View style={styles.kycBannerText}>
              <Text style={styles.kycBannerTitle}>Хувийн мэдээлэл</Text>
              <Text style={styles.kycBannerSubtitle}>
                Зээл авахын тулд хувийн мэдээлэл бөглөнө үү
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Active Loans */}
        {loans.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Идэвхтэй зээлүүд</Text>
            {loans.slice(0, 3).map((loan) => (
              <TouchableOpacity
                key={loan._id}
                style={styles.loanCard}
                onPress={() => navigation.navigate('LoanDetail', { loanId: loan._id })}
              >
                <View style={styles.loanHeader}>
                  <Text style={styles.loanNumber}>{loan.loanNumber}</Text>
                  <View style={[styles.loanStatus, { backgroundColor: COLORS.loanActive + '20' }]}>
                    <Text style={[styles.loanStatusText, { color: COLORS.loanActive }]}>
                      {loan.status === 'active' ? 'Идэвхтэй' : 'Сунгагдсан'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.loanAmount}>
                  {formatMoney(loan.remainingAmount)}
                </Text>
                <Text style={styles.loanLabel}>Төлөх үлдэгдэл</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: LAYOUT.padding.screen,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xl,
  },
  greeting: {
    fontSize: FONTS.size.base,
    color: COLORS.white,
    opacity: 0.9,
  },
  userName: {
    fontSize: FONTS.size.xxl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.white,
    marginTop: 4,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: LAYOUT.radius.round,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: LAYOUT.radius.lg,
    padding: LAYOUT.padding.card + 4,
    backdropFilter: 'blur(10px)',
  },
  walletLabel: {
    fontSize: FONTS.size.sm,
    color: COLORS.white,
    opacity: 0.9,
  },
  walletBalance: {
    fontSize: FONTS.size.huge,
    fontWeight: FONTS.weight.bold,
    color: COLORS.white,
    marginVertical: LAYOUT.spacing.sm,
  },
  walletDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: LAYOUT.spacing.md,
    paddingTop: LAYOUT.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  walletDetailLabel: {
    fontSize: FONTS.size.xs,
    color: COLORS.white,
    opacity: 0.8,
  },
  walletDetailValue: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.white,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: LAYOUT.padding.screen,
    marginTop: -10,
  },
  section: {
    marginTop: LAYOUT.spacing.xl,
  },
  sectionTitle: {
    ...TEXT_STYLES.h5,
    color: COLORS.textPrimary,
    marginBottom: LAYOUT.spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '23%',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.md,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: LAYOUT.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.sm,
  },
  actionLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  kycBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    borderRadius: LAYOUT.radius.md,
    padding: LAYOUT.padding.container,
    marginTop: LAYOUT.spacing.lg,
    borderWidth: 1,
    borderColor: COLORS.warning + '40',
  },
  kycBannerText: {
    flex: 1,
    marginLeft: LAYOUT.spacing.md,
  },
  kycBannerTitle: {
    ...TEXT_STYLES.body,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.textPrimary,
  },
  kycBannerSubtitle: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  loanCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.md,
    padding: LAYOUT.padding.card,
    marginBottom: LAYOUT.spacing.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.sm,
  },
  loanNumber: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.textSecondary,
  },
  loanStatus: {
    paddingHorizontal: LAYOUT.spacing.sm,
    paddingVertical: 4,
    borderRadius: LAYOUT.radius.sm,
  },
  loanStatusText: {
    ...TEXT_STYLES.caption,
    fontWeight: FONTS.weight.semibold,
  },
  loanAmount: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  loanLabel: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});

export default HomeScreen;