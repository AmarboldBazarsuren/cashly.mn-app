/**
 * CASHLY APP - Loan Detail Screen
 * БАЙРШИЛ: Cashly.mn/App/src/screens/loan/LoanDetailScreen.js
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getLoanDetails, extendLoan, repayLoan } from '../../api/services/loanService';
import { getWallet } from '../../api/services/walletService';
import Button from '../../components/Button';
import COLORS from '../../constants/colors';
import { FONTS, TEXT_STYLES } from '../../constants/typography';
import LAYOUT from '../../constants/layout';
import { formatMoney, formatDate, getLoanStatusText, getDaysUntilDue } from '../../utils/formatters';

const LoanDetailScreen = ({ route, navigation }) => {
  const { loanId } = route.params;
  
  const [loan, setLoan] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [extending, setExtending] = useState(false);
  const [repaying, setRepaying] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    const [loanResult, walletResult] = await Promise.all([
      getLoanDetails(loanId),
      getWallet()
    ]);
    
    if (loanResult.success) {
      setLoan(loanResult.data);
    }
    
    if (walletResult.success) {
      setWallet(walletResult.data);
    }
    
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleExtend = () => {
    if (!loan) return;
    
    Alert.alert(
      'Зээл сунгах',
      `Сунгалтын төлбөр: ${formatMoney(loan.interestAmount)}\n\nТа зээлээ сунгахдаа итгэлтэй байна уу?`,
      [
        { text: 'Болих', style: 'cancel' },
        {
          text: 'Сунгах',
          onPress: async () => {
            setExtending(true);
            const result = await extendLoan(loanId);
            setExtending(false);
            
            if (result.success) {
              Alert.alert('Амжилттай', result.message);
              await loadData();
            } else {
              Alert.alert('Алдаа', result.message);
            }
          }
        }
      ]
    );
  };

  const handleRepay = () => {
    if (!loan) return;
    
    const totalDue = loan.remainingAmount + (loan.lateFee || 0);
    
    Alert.prompt(
      'Төлбөр төлөх',
      `Төлөх ёстой: ${formatMoney(totalDue)}\n\nТөлөх дүнгээ оруулна уу:`,
      [
        { text: 'Болих', style: 'cancel' },
        {
          text: 'Төлөх',
          onPress: async (value) => {
            const amount = Number(value);
            
            if (!amount || amount <= 0) {
              Alert.alert('Алдаа', 'Дүн буруу байна');
              return;
            }
            
            if (amount > totalDue) {
              Alert.alert('Алдаа', `Төлөх дүн хэт их байна. Төлөх ёстой: ${formatMoney(totalDue)}`);
              return;
            }
            
            setRepaying(true);
            const result = await repayLoan(loanId, amount);
            setRepaying(false);
            
            if (result.success) {
              Alert.alert('Амжилттай', result.message);
              await loadData();
            } else {
              Alert.alert('Алдаа', result.message);
            }
          }
        }
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  if (loading || !loan) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Уншиж байна...</Text>
      </View>
    );
  }

  const statusColor = {
    pending: COLORS.loanPending,
    approved: COLORS.loanActive,
    active: COLORS.loanActive,
    extended: COLORS.loanActive,
    completed: COLORS.loanCompleted,
    overdue: COLORS.loanOverdue,
    rejected: COLORS.error,
  }[loan.status] || COLORS.textSecondary;

  const daysLeft = ['active', 'extended', 'overdue'].includes(loan.status) 
    ? getDaysUntilDue(loan.dueDate) 
    : null;

  const progressPercent = Math.round(((loan.totalAmount - loan.remainingAmount) / loan.totalAmount) * 100);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={COLORS.gradient.primary} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{loan.loanNumber}</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '30' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {getLoanStatusText(loan.status)}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Төлөх үлдэгдэл</Text>
          <Text style={styles.amountValue}>{formatMoney(loan.remainingAmount)}</Text>
          
          {loan.lateFee > 0 && (
            <View style={styles.lateFeeBox}>
              <Ionicons name="warning-outline" size={16} color={COLORS.error} />
              <Text style={styles.lateFeeText}>
                Хоцролтын төлбөр: {formatMoney(loan.lateFee)}
              </Text>
            </View>
          )}
        </View>

        {/* Due Date */}
        {daysLeft !== null && (
          <View style={[styles.dueDateCard, loan.status === 'overdue' && styles.dueDateCardOverdue]}>
            <Ionicons 
              name="time-outline" 
              size={24} 
              color={loan.status === 'overdue' ? COLORS.error : COLORS.textPrimary} 
            />
            <View style={styles.dueDateContent}>
              <Text style={[styles.dueDateLabel, loan.status === 'overdue' && { color: COLORS.error }]}>
                {loan.status === 'overdue' ? 'Хугацаа хэтэрсэн' : 'Дуусах огноо'}
              </Text>
              <Text style={[styles.dueDateValue, loan.status === 'overdue' && { color: COLORS.error }]}>
                {formatDate(loan.dueDate, 'full')}
              </Text>
              <Text style={styles.dueDateDays}>
                {loan.status === 'overdue' 
                  ? `${Math.abs(daysLeft)} хоног хоцорсон`
                  : `${daysLeft} хоног үлдсэн`
                }
              </Text>
            </View>
          </View>
        )}

        {/* Progress */}
        {['active', 'extended', 'overdue'].includes(loan.status) && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Төлбөрийн явц</Text>
              <Text style={styles.progressPercent}>{progressPercent}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: statusColor }]} />
            </View>
            <View style={styles.progressDetails}>
              <Text style={styles.progressDetailText}>
                Төлсөн: {formatMoney(loan.paidAmount)}
              </Text>
              <Text style={styles.progressDetailText}>
                Үлдсэн: {formatMoney(loan.remainingAmount)}
              </Text>
            </View>
          </View>
        )}

        {/* Loan Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Зээлийн мэдээлэл</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Зээлийн дүн:</Text>
            <Text style={styles.detailValue}>{formatMoney(loan.principal)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Хүү ({loan.interestRate}%):</Text>
            <Text style={styles.detailValue}>{formatMoney(loan.interestAmount)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Нийт төлөх:</Text>
            <Text style={[styles.detailValue, { fontWeight: FONTS.weight.bold }]}>
              {formatMoney(loan.totalAmount)}
            </Text>
          </View>
          
          <View style={styles.detailDivider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Хугацаа:</Text>
            <Text style={styles.detailValue}>{loan.term} хоног</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Эхэлсэн:</Text>
            <Text style={styles.detailValue}>{formatDate(loan.disbursedAt || loan.createdAt, 'short')}</Text>
          </View>
          
          {loan.dueDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Дуусах:</Text>
              <Text style={styles.detailValue}>{formatDate(loan.dueDate, 'short')}</Text>
            </View>
          )}
        </View>

        {/* Extension History */}
        {loan.extensions && loan.extensions.length > 0 && (
          <View style={styles.extensionsCard}>
            <Text style={styles.extensionsTitle}>
              Сунгалтын түүх ({loan.extensionCount})
            </Text>
            
            {loan.extensions.map((ext, index) => (
              <View key={index} style={styles.extensionItem}>
                <View style={styles.extensionDot} />
                <View style={styles.extensionContent}>
                  <Text style={styles.extensionDate}>
                    {formatDate(ext.extendedAt, 'long')}
                  </Text>
                  <Text style={styles.extensionFee}>
                    Төлбөр: {formatMoney(ext.extensionFee)}
                  </Text>
                  <Text style={styles.extensionDueDate}>
                    Шинэ дуусах огноо: {formatDate(ext.newDueDate, 'short')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        {['active', 'extended', 'overdue'].includes(loan.status) && (
          <View style={styles.actionsCard}>
            {/* Сунгах */}
            {loan.term !== 14 && loan.extensionCount < 4 && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleExtend}
                disabled={extending}
              >
                <LinearGradient
                  colors={[COLORS.accent, COLORS.accentDark]}
                  style={styles.actionButtonGradient}
                >
                  {extending ? (
                    <Text style={styles.actionButtonText}>Сунгаж байна...</Text>
                  ) : (
                    <>
                      <Ionicons name="time-outline" size={20} color={COLORS.white} />
                      <Text style={styles.actionButtonText}>
                        Сунгах ({formatMoney(loan.interestAmount)})
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
            
            {/* Төлөх */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleRepay}
              disabled={repaying}
            >
              <LinearGradient
                colors={COLORS.gradient.secondary}
                style={styles.actionButtonGradient}
              >
                {repaying ? (
                  <Text style={styles.actionButtonText}>Төлж байна...</Text>
                ) : (
                  <>
                    <Ionicons name="cash-outline" size={20} color={COLORS.white} />
                    <Text style={styles.actionButtonText}>Төлөх</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Wallet Balance */}
        {wallet && (
          <View style={styles.walletCard}>
            <Ionicons name="wallet-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.walletText}>
              Хэтэвчний үлдэгдэл: {formatMoney(wallet.balance)}
            </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
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
    marginBottom: 16,
  },
  headerTitle: {
    ...TEXT_STYLES.h5,
    color: COLORS.white,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: LAYOUT.radius.md,
  },
  statusText: {
    ...TEXT_STYLES.bodySmall,
    fontWeight: FONTS.weight.semibold,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: LAYOUT.padding.screen,
    paddingBottom: 40,
  },
  amountCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.lg,
    padding: LAYOUT.padding.card + 4,
    marginBottom: LAYOUT.spacing.md,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  amountLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  amountValue: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    fontWeight: FONTS.weight.bold,
  },
  lateFeeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: LAYOUT.radius.sm,
    marginTop: 12,
  },
  lateFeeText: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.error,
    marginLeft: 6,
    fontWeight: FONTS.weight.semibold,
  },
  dueDateCard: {
    flexDirection: 'row',
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
  dueDateCardOverdue: {
    backgroundColor: COLORS.error + '10',
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  dueDateContent: {
    flex: 1,
    marginLeft: 12,
  },
  dueDateLabel: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.textSecondary,
  },
  dueDateValue: {
    ...TEXT_STYLES.h6,
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  dueDateDays: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  progressCard: {
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
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.textPrimary,
  },
  progressPercent: {
    ...TEXT_STYLES.h6,
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray200,
    borderRadius: LAYOUT.radius.round,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: LAYOUT.radius.round,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  progressDetailText: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.textSecondary,
  },
  detailsCard: {
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
  detailsTitle: {
    ...TEXT_STYLES.h6,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  detailValue: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weight.medium,
  },
  detailDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 12,
  },
  extensionsCard: {
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
  extensionsTitle: {
    ...TEXT_STYLES.h6,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  extensionItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  extensionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
    marginTop: 4,
    marginRight: 12,
  },
  extensionContent: {
    flex: 1,
  },
  extensionDate: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weight.medium,
  },
  extensionFee: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  extensionDueDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textDisabled,
    marginTop: 2,
  },
  actionsCard: {
    marginBottom: LAYOUT.spacing.md,
  },
  actionButton: {
    marginBottom: LAYOUT.spacing.sm,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: LAYOUT.radius.md,
  },
  actionButtonText: {
    ...TEXT_STYLES.button,
    color: COLORS.white,
    marginLeft: 8,
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info + '15',
    borderRadius: LAYOUT.radius.md,
    padding: LAYOUT.padding.container,
  },
  walletText: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
});

export default LoanDetailScreen;