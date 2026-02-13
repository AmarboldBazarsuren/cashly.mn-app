/**
 * CASHLY APP - Transaction History Screen
 * БАЙРШИЛ: Cashly.mn/App/src/screens/wallet/TransactionHistoryScreen.js
 * Гүйлгээний түүх харах
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getTransactions } from '../../api/services/transactionService';
import COLORS from '../../constants/colors';
import { FONTS, TEXT_STYLES } from '../../constants/typography';
import LAYOUT from '../../constants/layout';
import { formatMoney, formatDate } from '../../utils/formatters';

const TransactionHistoryScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('all'); // all | deposit | withdrawal | loan

  useEffect(() => {
    loadTransactions();
  }, [filter]);

  const loadTransactions = async (pageNum = 1) => {
    if (pageNum === 1) {
      setLoading(true);
    }
    
    const params = {
      page: pageNum,
      limit: 20
    };
    
    if (filter !== 'all') {
      params.type = filter;
    }
    
    const result = await getTransactions(params);
    
    if (result.success) {
      if (pageNum === 1) {
        setTransactions(result.data);
      } else {
        setTransactions([...transactions, ...result.data]);
      }
      
      setHasMore(pageNum < result.pagination.pages);
      setPage(pageNum);
    }
    
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions(1);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadTransactions(page + 1);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return 'arrow-down-circle';
      case 'withdrawal':
        return 'arrow-up-circle';
      case 'loan_disbursement':
        return 'cash';
      case 'loan_payment':
        return 'card';
      case 'credit_check_fee':
        return 'document-text';
      case 'extension_fee':
        return 'time';
      case 'late_fee':
        return 'warning';
      default:
        return 'swap-horizontal';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit':
      case 'loan_disbursement':
      case 'refund':
      case 'bonus':
      case 'referral_bonus':
        return COLORS.success;
      case 'withdrawal':
      case 'loan_payment':
      case 'credit_check_fee':
      case 'extension_fee':
      case 'late_fee':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const isIncoming = (type) => {
    return ['deposit', 'loan_disbursement', 'refund', 'bonus', 'referral_bonus'].includes(type);
  };

  const renderTransaction = ({ item }) => {
    const color = getTransactionColor(item.type);
    const incoming = isIncoming(item.type);
    
    return (
      <TouchableOpacity style={styles.transactionCard}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons
            name={getTransactionIcon(item.type)}
            size={24}
            color={color}
          />
        </View>
        
        <View style={styles.transactionContent}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text style={styles.transactionDate}>
            {formatDate(item.createdAt, 'relative')}
          </Text>
          {item.status === 'pending' && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>Хүлээгдэж байна</Text>
            </View>
          )}
        </View>
        
        <View style={styles.transactionRight}>
          <Text style={[styles.transactionAmount, { color }]}>
            {incoming ? '+' : '-'}{formatMoney(item.amount)}
          </Text>
          <Text style={styles.transactionBalance}>
            Үлдэгдэл: {formatMoney(item.balanceAfter)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={64} color={COLORS.textDisabled} />
      <Text style={styles.emptyTitle}>Гүйлгээ байхгүй байна</Text>
      <Text style={styles.emptyText}>
        Таны гүйлгээний түүх энд харагдана
      </Text>
    </View>
  );

  const filters = [
    { value: 'all', label: 'Бүгд' },
    { value: 'deposit', label: 'Цэнэглэлт' },
    { value: 'withdrawal', label: 'Зарлага' },
    { value: 'loan_disbursement', label: 'Зээл' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={COLORS.gradient.primary} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Гүйлгээний түүх</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[
              styles.filterButton,
              filter === f.value && styles.filterButtonActive
            ]}
            onPress={() => setFilter(f.value)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.value && styles.filterTextActive
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transactions List */}
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={!loading && renderEmpty}
        ListFooterComponent={
          loading && page > 1 ? (
            <View style={styles.loadingFooter}>
              <Text style={styles.loadingText}>Уншиж байна...</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: LAYOUT.padding.screen,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h5,
    color: COLORS.white,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: LAYOUT.padding.screen,
    paddingVertical: LAYOUT.spacing.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  filterButton: {
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.sm,
    borderRadius: LAYOUT.radius.md,
    backgroundColor: COLORS.gray200,
    marginRight: LAYOUT.spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.white,
    fontWeight: FONTS.weight.semibold,
  },
  listContainer: {
    padding: LAYOUT.padding.screen,
    paddingBottom: 40,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.md,
    padding: LAYOUT.padding.container,
    marginBottom: LAYOUT.spacing.sm,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: LAYOUT.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  transactionDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  pendingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: LAYOUT.radius.sm,
    marginTop: 4,
  },
  pendingText: {
    ...TEXT_STYLES.caption,
    color: COLORS.warning,
    fontWeight: FONTS.weight.semibold,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    ...TEXT_STYLES.h6,
    fontWeight: FONTS.weight.bold,
    marginBottom: 4,
  },
  transactionBalance: {
    ...TEXT_STYLES.caption,
    color: COLORS.textDisabled,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LAYOUT.spacing.xxxl * 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.h5,
    color: COLORS.textPrimary,
    marginTop: LAYOUT.spacing.lg,
  },
  emptyText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: LAYOUT.spacing.sm,
  },
  loadingFooter: {
    paddingVertical: LAYOUT.spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
});

export default TransactionHistoryScreen;