/**
 * CASHLY APP - Apply Loan Screen
 * БАЙРШИЛ: Cashly.mn/App/src/screens/loan/ApplyLoanScreen.js
 * Зээлийн хүсэлт илгээх
 */

import React, { useState } from 'react';
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
import { applyLoan } from '../../api/services/loanService';
import Input from '../../components/Input';
import Button from '../../components/Button';
import COLORS from '../../constants/colors';
import { FONTS, TEXT_STYLES } from '../../constants/typography';
import LAYOUT from '../../constants/layout';
import { formatMoney, calculateLoanInterest } from '../../utils/formatters';
import { validateLoanAmount } from '../../utils/validators';

const ApplyLoanScreen = ({ navigation }) => {
  const { user } = useAuth();
  
  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState(21); // Default 21 хоног
  const [purpose, setPurpose] = useState('Хувийн');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const loanTerms = [
    { value: 14, label: '14 хоног', rate: 1.8 },
    { value: 21, label: '21 хоног', rate: 2.4 },
    { value: 90, label: '90 хоног', rate: 2.4 },
  ];

  const purposes = ['Хувийн', 'Бизнес', 'Боловсрол', 'Эрүүл мэнд', 'Бусад'];

  const quickAmounts = [100000, 200000, 500000, 1000000];

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
    setErrors({ ...errors, amount: '' });
  };

  const validateForm = () => {
  const newErrors = {};
  
  if (!amount || Number(amount) <= 0) {
    newErrors.amount = 'Дүн оруулна уу';
  } else if (Number(amount) < 10000) {
    newErrors.amount = 'Хамгийн бага зээл 10,000₮';
  } else if (!user?.creditLimit || user.creditLimit === 0) {
    newErrors.amount = 'Зээлийн эрх тогтоогдоогүй байна';
  } else if (Number(amount) > user.creditLimit) {
    newErrors.amount = `Зээлийн эрх хүрэлцэхгүй (${user.creditLimit.toLocaleString()}₮)`;
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleApply = async () => {
    if (!validateForm()) return;
    
    const { interestAmount, totalAmount } = calculateLoanInterest(Number(amount), term);
    
    Alert.alert(
      'Зээлийн хүсэлт',
      `Зээлийн дүн: ${formatMoney(Number(amount))}\nХүү (${term === 14 ? 1.8 : 2.4}%): ${formatMoney(interestAmount)}\nНийт төлөх: ${formatMoney(totalAmount)}\nХугацаа: ${term} хоног\n\nТа зээлийн хүсэлт илгээхдээ итгэлтэй байна уу?`,
      [
        { text: 'Болих', style: 'cancel' },
        {
          text: 'Илгээх',
          onPress: async () => {
            setLoading(true);
            
            try {
              const result = await applyLoan({
                amount: Number(amount),
                term,
                purpose
              });
              
              if (result.success) {
                Alert.alert(
                  'Амжилттай!',
                  result.message,
                  [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
              } else {
                Alert.alert('Алдаа', result.message);
              }
            } catch (error) {
              Alert.alert('Алдаа', 'Зээлийн хүсэлт илгээхэд алдаа гарлаа');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const { interestAmount, totalAmount } = calculateLoanInterest(Number(amount) || 0, term);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={COLORS.gradient.primary} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Зээл авах</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.creditLimitCard}>
          <Text style={styles.creditLimitLabel}>Зээлийн эрх</Text>
          <Text style={styles.creditLimitValue}>
            {formatMoney(user?.creditLimit || 0)}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Зээлийн дүн</Text>
          
          <Input
            placeholder="100,000"
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
        </View>

        {/* Loan Term */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Хугацаа сонгох</Text>
          
          <View style={styles.termContainer}>
            {loanTerms.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[
                  styles.termButton,
                  term === t.value && styles.termButtonActive
                ]}
                onPress={() => setTerm(t.value)}
              >
                <Text style={[styles.termLabel, term === t.value && styles.termLabelActive]}>
                  {t.label}
                </Text>
                <Text style={[styles.termRate, term === t.value && styles.termRateActive]}>
                  {t.rate}% хүү
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Purpose */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Зориулалт</Text>
          
          <View style={styles.purposeContainer}>
            {purposes.map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.purposeButton,
                  purpose === p && styles.purposeButtonActive
                ]}
                onPress={() => setPurpose(p)}
              >
                <Text
                  style={[
                    styles.purposeText,
                    purpose === p && styles.purposeTextActive
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary */}
        {amount && Number(amount) >= 10000 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Нийлбэр</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Зээлийн дүн:</Text>
              <Text style={styles.summaryValue}>{formatMoney(Number(amount))}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Хүү ({term === 14 ? 1.8 : 2.4}%):</Text>
              <Text style={styles.summaryValue}>{formatMoney(interestAmount)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Хугацаа:</Text>
              <Text style={styles.summaryValue}>{term} хоног</Text>
            </View>
            
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.summaryTotalLabel}>Нийт төлөх:</Text>
              <Text style={styles.summaryTotalValue}>{formatMoney(totalAmount)}</Text>
            </View>
          </View>
        )}

        {/* Submit Button */}
        <Button
          title="Зээлийн хүсэлт илгээх"
          onPress={handleApply}
          loading={loading}
          style={styles.submitButton}
        />

        {/* Info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.info} />
          <Text style={styles.infoText}>
            Админ таны хүсэлтийг шалгаж зөвшөөрсний дараа мөнгө таны хэтэвчинд орно.
          </Text>
        </View>
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
  creditLimitCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: LAYOUT.radius.md,
    padding: LAYOUT.padding.container,
    alignItems: 'center',
  },
  creditLimitLabel: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.white,
    opacity: 0.9,
  },
  creditLimitValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.white,
    fontWeight: FONTS.weight.bold,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: LAYOUT.padding.screen,
    paddingBottom: 40,
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
  termContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  termButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.md,
    padding: LAYOUT.padding.container,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  termButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  termLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  termLabelActive: {
    color: COLORS.primary,
    fontWeight: FONTS.weight.semibold,
  },
  termRate: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.textDisabled,
  },
  termRateActive: {
    color: COLORS.primary,
  },
  purposeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  purposeButton: {
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.sm,
    borderRadius: LAYOUT.radius.md,
    backgroundColor: COLORS.gray200,
    marginRight: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.sm,
  },
  purposeButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  purposeText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  purposeTextActive: {
    color: COLORS.white,
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
    ...TEXT_STYLES.h6,
    color: COLORS.textPrimary,
  },
  summaryTotalValue: {
    ...TEXT_STYLES.h5,
    color: COLORS.primary,
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
  },
  infoText: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
});

export default ApplyLoanScreen;