/**
 * CASHLY APP - Loans Screen
 * БАЙРШИЛ: Cashly.mn/App/src/screens/main/LoansScreen.js
 * Зээлийн жагсаалт - Бүх зээлүүд
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
import { getMyLoans } from '../../api/services/loanService';
import Button from '../../components/Button';
import COLORS from '../../constants/colors';
import { FONTS, TEXT_STYLES } from '../../constants/typography';
import LAYOUT from '../../constants/layout';
import { formatMoney, formatDate, getLoanStatusText, getDaysUntilDue } from '../../utils/formatters';

const LoansScreen = ({ navigation }) => {
  const { user } = useAuth();
  
  const [loans, setLoans] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all | active | completed

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    setLoading(true);
    const result = await getMyLoans();
    if (result.success) {
      setLoans(result.data);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLoans();
    setRefreshing(false);
  };

  // Filter loans by tab
  const filteredLoans = loans.filter(loan => {
    if (activeTab === 'active') {
      return ['active', 'extended', 'overdue'].includes(loan.status);
    } else if (activeTab === 'completed') {
      return loan.status === 'completed';
    }
    return true; // all
  });

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return COLORS.loanPending;
      case 'active':
      case 'extended':
        return COLORS.loanActive;
      case 'overdue':
        return COLORS.loanOverdue;
      case 'completed':
        return COLORS.loanCompleted;
      case 'rejected':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  // Render loan card
  const renderLoanCard = (loan) => {
    const statusColor = getStatusColor(loan.status);
    const daysLeft = getDaysUntilDue(loan.dueDate);
    
    return (
      <TouchableOpacity
        key={loan._id}
        style={styles.loanCard}
        onPress={() => navigation.navigate('LoanDetail', { loanId: loan._id })}
        activeOpacity={0.7}
      >
        <View style={styles.loanHeader}>
          <View>
            <Text style={styles.loanNumber}>{loan.loanNumber}</Text>
            <Text style={styles.loanDate}>
              {formatDate(loan.createdAt, 'short')}
            </Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getLoanStatusText(loan.status)}
            </Text>
          </View>
        </View>

        <View style={styles.loanAmounts}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Зээлийн дүн</Text>
            <Text style={styles.amountValue}>{formatMoney(loan.principal)}</Text>
          </View>
          
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Төлөх үлдэгдэл</Text>
            <Text style={[styles.amountValue, { color: COLORS.primary }]}>
              {formatMoney(loan.remainingAmount)}
            </Text>
          </View>
        </View>

        {/* Due date for active loans */}
        {['active', 'extended', 'overdue'].includes(loan.status) && (
          <View style={styles.dueDateContainer}>
            <Ionicons 
              name="time-outline" 
              size={16} 
              color={loan.status === 'overdue' ? COLORS.error : COLORS.textSecondary} 
            />
            <Text style={[
              styles.dueDateText,
              loan.status === 'overdue' && { color: COLORS.error }
            ]}>
              {loan.status === 'overdue' 
                ? `${Math.abs(daysLeft)} хоног хоцорсон`
                : `${daysLeft} хоног үлдсэн`
              }
            </Text>
          </View>
        )}

        {/* Progress bar for active loans */}
        {['active', 'extended', 'overdue'].includes(loan.status) && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${((loan.totalAmount - loan.remainingAmount) / loan.totalAmount) * 100}%`,
                    backgroundColor: statusColor 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(((loan.totalAmount - loan.remainingAmount) / loan.totalAmount) * 100)}% төлөгдсөн
            </Text>
          </View>
        )}

        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={COLORS.textSecondary}
          style={styles.chevron}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient colors={COLORS.gradient.primary} style={styles.header}>
        <Text style={styles.headerTitle}>Миний зээлүүд</Text>
        <Text style={styles.headerSubtitle}>
          Нийт {loans.length} зээл
        </Text>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            Бүгд
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Идэвхтэй
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            Төлөгдсөн
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Уншиж байна...</Text>
          </View>
        ) : filteredLoans.length > 0 ? (
          filteredLoans.map(renderLoanCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={COLORS.textDisabled} />
            <Text style={styles.emptyTitle}>Зээл байхгүй байна</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'all' 
                ? 'Та одоог хүртэл зээл аваагүй байна'
                : activeTab === 'active'
                ? 'Идэвхтэй зээл байхгүй байна'
                : 'Төлөгдсөн зээл байхгүй байна'
              }
            </Text>
            
            {user?.kycStatus === 'approved' && user?.creditLimit > 0 && (
              <Button
                title="Зээл авах"
                onPress={() => navigation.navigate('ApplyLoan')}
                style={styles.applyButton}
              />
            )}
          </View>
        )}
      </ScrollView>

      {user?.kycStatus === 'approved' && user?.creditLimit > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('ApplyLoan')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={COLORS.gradient.primary}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={32} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      )}
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
  headerTitle: {
    fontSize: FONTS.size.xxxl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONTS.size.base,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: LAYOUT.padding.screen,
    paddingVertical: LAYOUT.spacing.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tab: {
    flex: 1,
    paddingVertical: LAYOUT.spacing.sm,
    alignItems: 'center',
    borderRadius: LAYOUT.radius.md,
    marginHorizontal: 4,
  },
  tabActive: {
    backgroundColor: COLORS.primary + '20',
  },
  tabText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weight.medium,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: FONTS.weight.semibold,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: LAYOUT.padding.screen,
    paddingBottom: 80,
  },
  loanCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.lg,
    padding: LAYOUT.padding.card,
    marginBottom: LAYOUT.spacing.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: LAYOUT.spacing.md,
  },
  loanNumber: {
    ...TEXT_STYLES.body,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.textPrimary,
  },
  loanDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: LAYOUT.spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: LAYOUT.radius.sm,
  },
  statusText: {
    ...TEXT_STYLES.caption,
    fontWeight: FONTS.weight.semibold,
  },
  loanAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: LAYOUT.spacing.md,
  },
  amountItem: {
    flex: 1,
  },
  amountLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  amountValue: {
    ...TEXT_STYLES.h5,
    color: COLORS.textPrimary,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.sm,
  },
  dueDateText: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  progressContainer: {
    marginTop: LAYOUT.spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.gray200,
    borderRadius: LAYOUT.radius.round,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: LAYOUT.radius.round,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  chevron: {
    position: 'absolute',
    right: LAYOUT.padding.card,
    top: '50%',
    marginTop: -10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LAYOUT.spacing.xxxl * 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginTop: LAYOUT.spacing.lg,
  },
  emptyText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: LAYOUT.spacing.sm,
  },
  applyButton: {
    marginTop: LAYOUT.spacing.xl,
    paddingHorizontal: LAYOUT.spacing.xxxl,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: LAYOUT.radius.round,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: LAYOUT.radius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoansScreen;