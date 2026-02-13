/**
 * CASHLY APP - Apply Loan Screen
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { applyLoan } from '../../api/services/loanService';
import Input from '../../components/Input';
import Button from '../../components/Button';
import COLORS from '../../constants/colors';
import { FONTS, TEXT_STYLES } from '../../constants/typography';
import LAYOUT from '../../constants/layout';
import { formatMoney, calculateLoanInterest } from '../../utils/formatters';
import { validateLoanAmount, validateLoanTerm } from '../../utils/validators';

const ApplyLoanScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState(14);
  const [loading, setLoading] = useState(false);

  const loanTerms = [
    { value: 14, label: '14 хоног', rate: 1.8 },
    { value: 21, label: '21 хоног', rate: 2.4 },
    { value: 90, label: '90 хоног', rate: 2.4 },
  ];

  const handleApply = async () => {
    const validation = validateLoanAmount(Number(amount), user?.creditLimit);
    if (!validation.valid) {
      Alert.alert('Алдаа', validation.message);
      return;
    }

    setLoading(true);
    const result = await applyLoan({ amount: Number(amount), term });
    setLoading(false);

    if (result.success) {
      Alert.alert('Амжилттай', result.message, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Алдаа', result.message);
    }
  };

  const { interestAmount, totalAmount } = calculateLoanInterest(Number(amount) || 0, term);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Зээл авах</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.creditLimit}>
          Зээлийн эрх: {formatMoney(user?.creditLimit || 0)}
        </Text>

        <Input
          label="Зээлийн дүн"
          placeholder="100,000"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          icon="cash-outline"
        />

        <Text style={styles.label}>Хугацаа сонгох</Text>
        <View style={styles.termContainer}>
          {loanTerms.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[styles.termButton, term === t.value && styles.termButtonActive]}
              onPress={() => setTerm(t.value)}
            >
              <Text style={[styles.termLabel, term === t.value && styles.termLabelActive]}>
                {t.label}
              </Text>
              <Text style={[styles.termRate, term === t.value && styles.termRateActive]}>
                {t.rate}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {amount && (
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
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.summaryTotalLabel}>Нийт төлөх:</Text>
              <Text style={styles.summaryTotalValue}>{formatMoney(totalAmount)}</Text>
            </View>
          </View>
        )}

        <Button title="Зээл хүсэх" onPress={handleApply} loading={loading} style={styles.submitButton} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: LAYOUT.padding.screen, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  headerTitle: { ...TEXT_STYLES.h5, color: COLORS.textPrimary },
  content: { flex: 1, padding: LAYOUT.padding.screen },
  creditLimit: { ...TEXT_STYLES.h6, color: COLORS.primary, marginBottom: 20, textAlign: 'center' },
  label: { ...TEXT_STYLES.body, fontWeight: FONTS.weight.semibold, color: COLORS.textPrimary, marginBottom: 12 },
  termContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  termButton: { flex: 1, backgroundColor: COLORS.white, borderRadius: LAYOUT.radius.md, padding: 16, marginHorizontal: 4, borderWidth: 2, borderColor: COLORS.borderLight, alignItems: 'center' },
  termButtonActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  termLabel: { fontSize: FONTS.size.base, color: COLORS.textSecondary, marginBottom: 4 },
  termLabelActive: { color: COLORS.primary, fontWeight: FONTS.weight.semibold },
  termRate: { fontSize: FONTS.size.sm, color: COLORS.textDisabled },
  termRateActive: { color: COLORS.primary },
  summaryCard: { backgroundColor: COLORS.white, borderRadius: LAYOUT.radius.lg, padding: 20, marginBottom: 24 },
  summaryTitle: { ...TEXT_STYLES.h6, color: COLORS.textPrimary, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: FONTS.size.base, color: COLORS.textSecondary },
  summaryValue: { fontSize: FONTS.size.base, color: COLORS.textPrimary, fontWeight: FONTS.weight.medium },
  summaryTotal: { paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.borderLight, marginTop: 4 },
  summaryTotalLabel: { fontSize: FONTS.size.md, fontWeight: FONTS.weight.semibold, color: COLORS.textPrimary },
  summaryTotalValue: { fontSize: FONTS.size.md, fontWeight: FONTS.weight.bold, color: COLORS.primary },
  submitButton: { marginTop: 16 },
});

export default ApplyLoanScreen;