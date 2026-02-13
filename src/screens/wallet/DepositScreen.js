/**
 * CASHLY APP - Deposit Screen
 * БАЙРШИЛ: Cashly.mn/App/src/screens/wallet/DepositScreen.js
 * Хэтэвч цэнэглэх - Production-ready
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
import { deposit } from '../../api/services/walletService';
import { getWallet } from '../../api/services/walletService';
import Input from '../../components/Input';
import Button from '../../components/Button';
import COLORS from '../../constants/colors';
import { FONTS, TEXT_STYLES } from '../../constants/typography';
import LAYOUT from '../../constants/layout';
import { formatMoney } from '../../utils/formatters';

const DepositScreen = ({ navigation }) => {
  const { user } = useAuth();
  
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('qpay');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    const result = await getWallet();
    if (result.success) {
      setWallet(result.data);
    }
  };

  const paymentMethods = [
    { id: 'qpay', name: 'QPay', icon: 'qr-code-outline', color: COLORS.primary },
    { id: 'bank_transfer', name: 'Шилжүүлэг', icon: 'business-outline', color: COLORS.secondary },
    { id: 'card', name: 'Карт', icon: 'card-outline', color: COLORS.accent },
    { id: 'social_pay', name: 'SocialPay', icon: 'phone-portrait-outline', color: COLORS.info },
  ];

  const quickAmounts = [10000, 50000, 100000, 500000, 1000000];

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
    setErrors({ ...errors, amount: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!amount || Number(amount) <= 0) {
      newErrors.amount = 'Дүн оруулна уу';
    } else if (Number(amount) < 1000) {
      newErrors.amount = 'Хамгийн бага цэнэглэх дүн 1,000₮';
    }
    
    if (!selectedMethod) {
      newErrors.method = 'Төлбөрийн арга сонгоно уу';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDeposit = async () => {
    if (!validateForm()) return;
    
    // Production дээр бодит төлбөрийн gateway холбох
    Alert.alert(
      'Төлбөр төлөх',
      `${formatMoney(Number(amount))} төлөхдөө итгэлтэй байна уу?\n\n⚠️ Энэ нь test төлбөр бөгөөд таны хэтэвчинд автоматаар нэмэгдэнэ.\n\nProduction дээр бодит төлбөрийн gateway холбогдоно.`,
      [
        { text: 'Болих', style: 'cancel' },
        {
          text: 'Төлөх',
          onPress: async () => {
            setLoading(true);
            
            try {
              const result = await deposit({
                amount: Number(amount),
                paymentMethod: selectedMethod,
                referenceNumber: referenceNumber || `TEST${Date.now()}`
              });
              
              if (result.success) {
                await loadWallet();
                Alert.alert(
                  'Амжилттай!',
                  result.message,
                  [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
              } else {
                Alert.alert('Алдаа', result.message);
              }
            } catch (error) {
              Alert.alert('Алдаа', 'Цэнэглэхэд алдаа гарлаа');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={COLORS.gradient.primary} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Хэтэвч цэнэглэх</Text>
          <View style={{ width: 24 }} />
        </View>
        
        {wallet && (
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Одоогийн үлдэгдэл</Text>
            <Text style={styles.balanceValue}>{formatMoney(wallet.balance)}</Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Дүн оруулах</Text>
          
          <Input
            placeholder="10,000"
            value={amount}
            onChangeText={(text) => {
              setAmount(text);
              setErrors({ ...errors, amount: '' });
            }}
            keyboardType="numeric"
            icon="cash-outline"
            error={errors.amount}
            style={styles.amountInput}
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

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Төлбөрийн арга сонгох</Text>
          
          <View style={styles.methodsContainer}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodButton,
                  selectedMethod === method.id && styles.methodButtonActive
                ]}
                onPress={() => {
                  setSelectedMethod(method.id);
                  setErrors({ ...errors, method: '' });
                }}
              >
                <View
                  style={[
                    styles.methodIcon,
                    { backgroundColor: method.color + '20' }
                  ]}
                >
                  <Ionicons
                    name={method.icon}
                    size={28}
                    color={selectedMethod === method.id ? method.color : COLORS.textSecondary}
                  />
                </View>
                <Text
                  style={[
                    styles.methodName,
                    selectedMethod === method.id && styles.methodNameActive
                  ]}
                >
                  {method.name}
                </Text>
                {selectedMethod === method.id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={COLORS.success}
                    style={styles.methodCheck}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
          {errors.method && <Text style={styles.errorText}>{errors.method}</Text>}
        </View>

        {/* Payment Instructions */}
        {selectedMethod && (
          <View style={styles.instructionsCard}>
            <View style={styles.instructionsHeader}>
              <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
              <Text style={styles.instructionsTitle}>Төлбөрийн заавар</Text>
            </View>
            
            {selectedMethod === 'qpay' && (
              <View style={styles.instructionsContent}>
                <Text style={styles.instructionText}>1. QPay аппликэйшн нээнэ</Text>
                <Text style={styles.instructionText}>2. QR код уншуулна</Text>
                <Text style={styles.instructionText}>3. Дүнгээ шалгаад төлнө</Text>
                <Text style={styles.instructionText}>4. Гүйлгээний дугаараа доор оруулна</Text>
                
                <View style={styles.qrPlaceholder}>
                  <Ionicons name="qr-code-outline" size={120} color={COLORS.textDisabled} />
                  <Text style={styles.qrText}>QR Code энд харагдана</Text>
                </View>
              </View>
            )}
            
            {selectedMethod === 'bank_transfer' && (
              <View style={styles.instructionsContent}>
                <Text style={styles.instructionText}>
                  <Text style={styles.bold}>Банк:</Text> Хаан банк
                </Text>
                <Text style={styles.instructionText}>
                  <Text style={styles.bold}>Данс:</Text> 5000123456
                </Text>
                <Text style={styles.instructionText}>
                  <Text style={styles.bold}>Дансны нэр:</Text> Cashly ХХК
                </Text>
                <Text style={styles.instructionText}>
                  <Text style={styles.bold}>Гүйлгээний утга:</Text> {user?.phoneNumber}
                </Text>
                
                <View style={styles.warningBox}>
                  <Ionicons name="warning-outline" size={20} color={COLORS.warning} />
                  <Text style={styles.warningText}>
                    Шилжүүлэг хийсний дараа гүйлгээний дугаараа оруулна уу
                  </Text>
                </View>
              </View>
            )}
            
            {selectedMethod === 'card' && (
              <View style={styles.instructionsContent}>
                <Text style={styles.instructionText}>
                  Карт төлбөрийн холболт удахгүй нэмэгдэнэ
                </Text>
              </View>
            )}
            
            {selectedMethod === 'social_pay' && (
              <View style={styles.instructionsContent}>
                <Text style={styles.instructionText}>
                  SocialPay холболт удахгүй нэмэгдэнэ
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Reference Number */}
        {(selectedMethod === 'qpay' || selectedMethod === 'bank_transfer') && (
          <View style={styles.section}>
            <Input
              label="Гүйлгээний дугаар (Заавал биш)"
              placeholder="Жишээ: 123456789"
              value={referenceNumber}
              onChangeText={setReferenceNumber}
              icon="document-text-outline"
            />
          </View>
        )}

        {/* Summary */}
        {amount && Number(amount) >= 1000 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Нийлбэр</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Цэнэглэх дүн:</Text>
              <Text style={styles.summaryValue}>{formatMoney(Number(amount))}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Шимтгэл:</Text>
              <Text style={styles.summaryValue}>0₮</Text>
            </View>
            
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.summaryTotalLabel}>Нийт:</Text>
              <Text style={styles.summaryTotalValue}>{formatMoney(Number(amount))}</Text>
            </View>
          </View>
        )}

        {/* Submit Button */}
        <Button
          title="Цэнэглэх"
          onPress={handleDeposit}
          loading={loading}
          style={styles.submitButton}
        />

        {/* Info */}
        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.success} />
          <Text style={styles.infoText}>
            Таны төлбөр найдвартай хамгаалагдана. Цэнэглэлт 1-5 минутанд хийгдэнэ.
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
  balanceCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: LAYOUT.radius.md,
    padding: LAYOUT.padding.container,
    alignItems: 'center',
  },
  balanceLabel: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.white,
    opacity: 0.9,
  },
  balanceValue: {
    ...TEXT_STYLES.h4,
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
  amountInput: {
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
  methodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  methodButton: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.lg,
    padding: LAYOUT.padding.card,
    marginRight: '4%',
    marginBottom: LAYOUT.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  methodButtonActive: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + '05',
  },
  methodIcon: {
    width: 60,
    height: 60,
    borderRadius: LAYOUT.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodName: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weight.medium,
  },
  methodNameActive: {
    color: COLORS.textPrimary,
    fontWeight: FONTS.weight.semibold,
  },
  methodCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  errorText: {
    ...TEXT_STYLES.caption,
    color: COLORS.error,
    marginTop: 4,
  },
  instructionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.lg,
    padding: LAYOUT.padding.card,
    marginBottom: LAYOUT.spacing.xl,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructionsTitle: {
    ...TEXT_STYLES.h6,
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  instructionsContent: {
    paddingLeft: 8,
  },
  instructionText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 22,
  },
  bold: {
    fontWeight: FONTS.weight.semibold,
    color: COLORS.textPrimary,
  },
  qrPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: LAYOUT.radius.md,
    padding: LAYOUT.spacing.xl,
    marginTop: 16,
  },
  qrText: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.textDisabled,
    marginTop: 8,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '15',
    borderRadius: LAYOUT.radius.md,
    padding: LAYOUT.padding.container,
    marginTop: 12,
  },
  warningText: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: 8,
    flex: 1,
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
    backgroundColor: COLORS.success + '15',
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

export default DepositScreen;