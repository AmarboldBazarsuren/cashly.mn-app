/**
 * CASHLY APP - Withdraw Screen
 * БАЙРШИЛ: Cashly.mn/App/src/screens/wallet/WithdrawScreen.js
 * Мөнгө татах хүсэлт илгээх - Production-ready
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { requestWithdrawal, getWithdrawalRequests } from '../../api/services/walletService';
import { getWallet } from '../../api/services/walletService';
import Input from '../../components/Input';
import Button from '../../components/Button';
import COLORS from '../../constants/colors';
import { FONTS, TEXT_STYLES } from '../../constants/typography';
import LAYOUT from '../../constants/layout';
import { formatMoney, formatDate } from '../../utils/formatters';

const WithdrawScreen = ({ navigation }) => {
  const { user } = useAuth();
  
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState(null);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [walletResult, requestsResult] = await Promise.all([
      getWallet(),
      getWithdrawalRequests()
    ]);
    
    if (walletResult.success) {
      setWallet(walletResult.data);
    }
    
    if (requestsResult.success) {
      setWithdrawalRequests(requestsResult.data);
    }
  };

  const quickAmounts = [50000, 100000, 200000, 500000];

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
    setErrors({ ...errors, amount: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!amount || Number(amount) <= 0) {
      newErrors.amount = 'Дүн оруулна уу';
    } else if (Number(amount) < 10000) {
      newErrors.amount = 'Хамгийн бага татах дүн 10,000₮';
    } else if (wallet && Number(amount) > wallet.balance - wallet.frozenBalance) {
      newErrors.amount = `Хэтэвчийн үлдэгдэл хүрэлцэхгүй. Боломжит: ${formatMoney(wallet.balance - wallet.frozenBalance)}`;
    }
    
    if (!user?.personalInfo?.bankInfo?.bankName || !user?.personalInfo?.bankInfo?.accountNumber) {
      newErrors.bank = 'Банкны мэдээлэл бүртгэгдээгүй байна. Профайл хэсгээс нэмнэ үү';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleWithdraw = async () => {
    if (!validateForm()) return;
    
    Alert.alert(
      'Мөнгө татах',
      `${formatMoney(Number(amount))} татахдаа итгэлтэй байна уу?\n\nМөнгө таны бүртгэлтэй данс руу шилжүүлэгдэнэ.\n\nБанк: ${user?.personalInfo?.bankInfo?.bankName}\nДанс: ${user?.personalInfo?.bankInfo?.accountNumber}`,
      [
        { text: 'Болих', style: 'cancel' },
        {
          text: 'Татах',
          onPress: async () => {
            setLoading(true);
            
            try {
              const result = await requestWithdrawal({
                amount: Number(amount)
              });
              
              if (result.success) {
                await loadData();
                setAmount('');
                Alert.alert(
                  'Амжилттай!',
                  'Татах хүсэлт амжилттай илгээгдлээ. Админ баталгаажуулах болно.',
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert('Алдаа', result.message);
              }
            } catch (error) {
              Alert.alert('Алдаа', 'Хүсэлт илгээхэд алдаа гарлаа');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return COLORS.warning;
      case 'approved':
      case 'completed':
        return COLORS.success;
      case 'rejected':
      case 'failed':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Хүлээгдэж байна';
      case 'approved':
        return 'Зөвшөөрөгдсөн';
      case 'completed':
        return 'Хийгдсэн';
      case 'rejected':
        return 'Татгалзсан';
      case 'failed':
        return 'Амжилтгүй';
      default:
        return status;
    }
  };

  const availableBalance = wallet ? wallet.balance - wallet.frozenBalance : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={COLORS.gradient.primary} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Мөнгө татах</Text>
          <View style={{ width: 24 }} />
        </View>
        
        {wallet && (
          <View style={styles.balanceCard}>
            <View style={styles.balanceRow}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>Нийт үлдэгдэл</Text>
                <Text style={styles.balanceValue}>{formatMoney(wallet.balance)}</Text>
              </View>
              
              <View style={styles.balanceDivider} />
              
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>Боломжит</Text>
                <Text style={styles.balanceValue}>{formatMoney(availableBalance)}</Text>
              </View>
            </View>
            
            {wallet.frozenBalance > 0 && (
              <View style={styles.frozenBox}>
                <Ionicons name="lock-closed-outline" size={16} color={COLORS.warning} />
                <Text style={styles.frozenText}>
                  Түгжигдсэн: {formatMoney(wallet.frozenBalance)}
                </Text>
              </View>
            )}
          </View>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Bank Info */}
        {user?.personalInfo?.bankInfo?.bankName && (
          <View style={styles.bankCard}>
            <View style={styles.bankHeader}>
              <Ionicons name="business-outline" size={24} color={COLORS.primary} />
              <Text style={styles.bankTitle}>Татах данс</Text>
            </View>
            
            <View style={styles.bankInfo}>
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Банк:</Text>
                <Text style={styles.bankValue}>{user.personalInfo.bankInfo.bankName}</Text>
              </View>
              
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Данс:</Text>
                <Text style={styles.bankValue}>{user.personalInfo.bankInfo.accountNumber}</Text>
              </View>
              
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Эзэмшигч:</Text>
                <Text style={styles.bankValue}>
                  {user.personalInfo.bankInfo.accountName || user.name}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.changeBankButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.changeBankText}>Данс солих</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        )}
        
        {errors.bank && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={20} color={COLORS.error} />
            <Text style={styles.errorBoxText}>{errors.bank}</Text>
          </View>
        )}

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Татах дүн</Text>
          
          <Input
            placeholder="50,000"
            value={amount}
            onChangeText={(text) => {
              setAmount(text);
              setErrors({ ...errors, amount: '' });
            }}
            keyboardType="numeric"
            icon="cash-outline"
            error={errors.amount}
          />
          
          {/* Quick Amounts */}
          <View style={styles.quickAmountsContainer}>
            {quickAmounts.map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.quickAmountButton,
                  amount === value.toString() && styles.quickAmountButtonActive
                ]}
                onPress={() => handleQuickAmount(value)}
              >
                <Text
                  style={[
                    styles.quickAmountText,
                    amount === value.toString() && styles.quickAmountTextActive
                  ]}
                >
                  {formatMoney(value, false)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            style={styles.maxButton}
            onPress={() => {
              if (availableBalance > 0) {
                setAmount(availableBalance.toString());
                setErrors({ ...errors, amount: '' });
              }
            }}
          >
            <Text style={styles.maxButtonText}>Бүгдийг татах</Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        {amount && Number(amount) >= 10000 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Нийлбэр</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Татах дүн:</Text>
              <Text style={styles.summaryValue}>{formatMoney(Number(amount))}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Шимтгэл:</Text>
              <Text style={styles.summaryValue}>0₮</Text>
            </View>
            
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.summaryTotalLabel}>Таны данс руу орох:</Text>
              <Text style={styles.summaryTotalValue}>{formatMoney(Number(amount))}</Text>
            </View>
          </View>
        )}

        {/* Submit Button */}
        <Button
          title="Татах хүсэлт илгээх"
          onPress={handleWithdraw}
          loading={loading}
  disabled={loading || !user?.personalInfo?.bankInfo?.bankName}
          style={styles.submitButton}
        />

        {/* Info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.info} />
          <Text style={styles.infoText}>
            Админ таны хүсэлтийг баталгаажуулсны дараа мөнгө 1-3 ажлын өдөрт таны данс руу шилжинэ.
          </Text>
        </View>

        {/* Withdrawal Requests */}
        {withdrawalRequests.length > 0 && (
          <View style={styles.requestsSection}>
            <Text style={styles.requestsTitle}>Миний хүсэлтүүд</Text>
            
            {withdrawalRequests.slice(0, 5).map((request) => (
              <View key={request._id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View>
                    <Text style={styles.requestAmount}>{formatMoney(request.amount)}</Text>
                    <Text style={styles.requestDate}>
                      {formatDate(request.createdAt, 'long')}
                    </Text>
                  </View>
                  
                  <View style={[styles.requestStatus, { backgroundColor: getStatusColor(request.status) + '20' }]}>
                    <Text style={[styles.requestStatusText, { color: getStatusColor(request.status) }]}>
                      {getStatusText(request.status)}
                    </Text>
                  </View>
                </View>
                
                {request.rejectedReason && (
                  <View style={styles.rejectedBox}>
                    <Text style={styles.rejectedLabel}>Шалтгаан:</Text>
                    <Text style={styles.rejectedReason}>{request.rejectedReason}</Text>
                  </View>
                )}
              </View>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: LAYOUT.padding.screen,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    ...TEXT_STYLES.h5,
    color: COLORS.white,
  },
  balanceCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: LAYOUT.radius.md,
    padding: LAYOUT.padding.container,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 16,
  },
  balanceLabel: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.white,
    opacity: 0.9,
  },
  balanceValue: {
    ...TEXT_STYLES.h5,
    color: COLORS.white,
    fontWeight: FONTS.weight.bold,
    marginTop: 4,
  },
  frozenBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  frozenText: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.white,
    marginLeft: 6,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: LAYOUT.padding.screen,
    paddingBottom: 40,
  },
  bankCard: {
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
  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bankTitle: {
    ...TEXT_STYLES.h6,
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  bankInfo: {
    backgroundColor: COLORS.gray100,
    borderRadius: LAYOUT.radius.md,
    padding: LAYOUT.padding.container,
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bankLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  bankValue: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weight.semibold,
  },
  changeBankButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  changeBankText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: FONTS.weight.medium,
    marginRight: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '15',
    borderRadius: LAYOUT.radius.md,
    padding: LAYOUT.padding.container,
    marginBottom: LAYOUT.spacing.md,
  },
  errorBoxText: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.error,
    marginLeft: 8,
    flex: 1,
  },
  section: {
    marginBottom: LAYOUT.spacing.xl,
  },
  sectionTitle: {
    ...TEXT_STYLES.h6,
    color: COLORS.textPrimary,
    marginBottom: LAYOUT.spacing.md,
  },
  quickAmountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  quickAmountButton: {
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.sm,
    borderRadius: LAYOUT.radius.md,
    backgroundColor: COLORS.gray200,
    marginRight: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.sm,
  },
  quickAmountButtonActive: {
    backgroundColor: COLORS.primary,
  },
  quickAmountText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  quickAmountTextActive: {
    color: COLORS.white,
    fontWeight: FONTS.weight.semibold,
  },
  maxButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  maxButtonText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: FONTS.weight.semibold,
  },
  summaryCard: {
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
  summaryTitle: {
    ...TEXT_STYLES.h6,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weight.medium,
  },
  summaryTotal: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    marginTop: 4,
  },
  summaryTotalLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weight.semibold,
  },
  summaryTotalValue: {
    ...TEXT_STYLES.h5,
    color: COLORS.success,
    fontWeight: FONTS.weight.bold,
  },
  submitButton: {
    marginBottom: LAYOUT.spacing.md,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info + '15',
    borderRadius: LAYOUT.radius.md,
    padding: LAYOUT.padding.container,
    marginBottom: LAYOUT.spacing.xl,
  },
  infoText: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  requestsSection: {
    marginTop: LAYOUT.spacing.lg,
  },
  requestsTitle: {
    ...TEXT_STYLES.h6,
    color: COLORS.textPrimary,
    marginBottom: LAYOUT.spacing.md,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.md,
    padding: LAYOUT.padding.card,
    marginBottom: LAYOUT.spacing.sm,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  requestAmount: {
    ...TEXT_STYLES.h6,
    color: COLORS.textPrimary,
  },
  requestDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  requestStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: LAYOUT.radius.sm,
  },
  requestStatusText: {
    ...TEXT_STYLES.caption,
    fontWeight: FONTS.weight.semibold,
  },
  rejectedBox: {
    backgroundColor: COLORS.error + '10',
    borderRadius: LAYOUT.radius.sm,
    padding: 12,
    marginTop: 12,
  },
  rejectedLabel: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.error,
    fontWeight: FONTS.weight.semibold,
    marginBottom: 4,
  },
  rejectedReason: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.textSecondary,
  },
});

export default WithdrawScreen;