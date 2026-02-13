/**
 * CASHLY APP - Wallet Screen
 * БАЙРШИЛ: Cashly.mn/App/src/screens/main/WalletScreen.js
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { getWallet } from '../../api/services/walletService';
import { getTransactions } from '../../api/services/transactionService';
import COLORS from '../../constants/colors';
import { FONTS, TEXT_STYLES } from '../../constants/typography';
import LAYOUT from '../../constants/layout';
import { formatMoney, formatDate } from '../../utils/formatters';

const WalletScreen = ({ navigation }) => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [walletResult, transResult] = await Promise.all([
      getWallet(),
      getTransactions({ limit: 10 })
    ]);
    
    if (walletResult.success) setWallet(walletResult.data);
    if (transResult.success) setTransactions(transResult.data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const quickActions = [
    { icon: 'arrow-down-outline', label: 'Цэнэглэх', color: COLORS.secondary, onPress: () => navigation.navigate('Deposit') },
    { icon: 'arrow-up-outline', label: 'Татах', color: COLORS.accent, onPress: () => navigation.navigate('Withdraw') },
    { icon: 'list-outline', label: 'Түүх', color: COLORS.info, onPress: () => navigation.navigate('TransactionHistory') },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient colors={COLORS.gradient.primary} style={styles.header}>
        <Text style={styles.headerTitle}>Хэтэвч</Text>
        
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Нийт үлдэгдэл</Text>
          <Text style={styles.balanceAmount}>{formatMoney(wallet?.balance || 0)}</Text>
          
          <View style={styles.balanceDetails}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Боломжит</Text>
              <Text style={styles.balanceItemValue}>{formatMoney(wallet?.availableBalance || 0)}</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Түгжигдсэн</Text>
              <Text style={styles.balanceItemValue}>{formatMoney(wallet?.frozenBalance || 0)}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.actionsContainer}>
        {quickActions.map((action, index) => (
          <TouchableOpacity key={index} style={styles.actionButton} onPress={action.onPress}>
            <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
              <Ionicons name={action.icon} size={24} color={action.color} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Сүүлийн гүйлгээ</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
              <Text style={styles.seeAllText}>Бүгдийг харах</Text>
            </TouchableOpacity>
          </View>
          
          {transactions.length > 0 ? (
            transactions.map((tx) => (
              <View key={tx._id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <Text style={styles.transactionType}>{tx.description}</Text>
                  <Text style={styles.transactionDate}>{formatDate(tx.createdAt, 'relative')}</Text>
                </View>
                <Text style={[styles.transactionAmount, 
                  tx.type === 'deposit' || tx.type === 'loan_disbursement' ? 
                  { color: COLORS.secondary } : { color: COLORS.error }
                ]}>
                  {tx.type === 'deposit' || tx.type === 'loan_disbursement' ? '+' : '-'}
                  {formatMoney(tx.amount)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Гүйлгээ байхгүй</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 30, paddingHorizontal: LAYOUT.padding.screen },
  headerTitle: { fontSize: FONTS.size.xxxl, fontWeight: FONTS.weight.bold, color: COLORS.white, marginBottom: 20 },
  balanceCard: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: LAYOUT.radius.lg, padding: 20 },
  balanceLabel: { fontSize: FONTS.size.sm, color: COLORS.white, opacity: 0.9 },
  balanceAmount: { fontSize: FONTS.size.huge, fontWeight: FONTS.weight.bold, color: COLORS.white, marginVertical: 8 },
  balanceDetails: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' },
  balanceItem: { flex: 1 },
  balanceItemLabel: { fontSize: FONTS.size.xs, color: COLORS.white, opacity: 0.8 },
  balanceItemValue: { fontSize: FONTS.size.md, fontWeight: FONTS.weight.semibold, color: COLORS.white, marginTop: 4 },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: LAYOUT.padding.screen, backgroundColor: COLORS.white },
  actionButton: { alignItems: 'center' },
  actionIcon: { width: 56, height: 56, borderRadius: LAYOUT.radius.md, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionLabel: { fontSize: FONTS.size.sm, color: COLORS.textSecondary },
  content: { flex: 1 },
  section: { padding: LAYOUT.padding.screen },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { ...TEXT_STYLES.h5, color: COLORS.textPrimary },
  seeAllText: { color: COLORS.primary, fontSize: FONTS.size.sm },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  transactionLeft: { flex: 1 },
  transactionType: { fontSize: FONTS.size.base, color: COLORS.textPrimary, marginBottom: 4 },
  transactionDate: { fontSize: FONTS.size.xs, color: COLORS.textSecondary },
  transactionAmount: { fontSize: FONTS.size.md, fontWeight: FONTS.weight.semibold },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 20 },
});

export default WalletScreen;