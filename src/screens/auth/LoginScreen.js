/**
 * CASHLY APP - Login Screen
 * БАЙРШИЛ: Cashly.mn/App/src/screens/auth/LoginScreen.js
 * Нэвтрэх дэлгэц - Production-ready
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import COLORS from '../../constants/colors';
import { FONTS, TEXT_STYLES } from '../../constants/typography';
import LAYOUT from '../../constants/layout';
import { validatePhone, validatePassword } from '../../utils/validators';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Нэвтрэх
  const handleLogin = async () => {
    // Validation
    const newErrors = {};
    
    if (!phoneNumber || phoneNumber.trim() === '') {
      newErrors.phoneNumber = 'Утасны дугаар оруулна уу';
    } else if (!validatePhone(phoneNumber)) {
      newErrors.phoneNumber = 'Утасны дугаар буруу байна (8 орон)';
    }
    
    if (!password || password.trim() === '') {
      newErrors.password = 'Нууц үг оруулна уу';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Нууц үг багадаа 6 тэмдэгттэй байх ёстой';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setLoading(true);
    
    try {
      const result = await login(phoneNumber, password);
      
      if (!result.success) {
        Alert.alert('Алдаа', result.message || 'Нэвтрэхэд алдаа гарлаа');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Алдаа', 'Нэвтрэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Gradient Header */}
      <LinearGradient
        colors={COLORS.gradient.primary}
        style={styles.header}
      >
        <Text style={styles.logo}>💰</Text>
        <Text style={styles.title}>CASHLY</Text>
        <Text style={styles.subtitle}>Тавтай морил!</Text>
      </LinearGradient>

      {/* Form */}
      <KeyboardAvoidingView
        style={styles.formContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Нэвтрэх</Text>
            
            {/* Phone Input */}
            <Input
              label="Утасны дугаар"
              placeholder="99119911"
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                if (errors.phoneNumber) {
                  setErrors({ ...errors, phoneNumber: '' });
                }
              }}
              keyboardType="phone-pad"
              maxLength={8}
              icon="call-outline"
              error={errors.phoneNumber}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Password Input */}
            <Input
              label="Нууц үг"
              placeholder="••••••••"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors({ ...errors, password: '' });
                }
              }}
              secureTextEntry={true}
              icon="lock-closed-outline"
              error={errors.password}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>
                Нууц үгээ мартсан уу?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Button
              title="Нэвтрэх"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
            />

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Шинэ хэрэглэгч үү? </Text>
              <TouchableOpacity 
                onPress={() => {
                  if (navigation && typeof navigation.navigate === 'function') {
                    navigation.navigate('Register');
                  }
                }}
              >
                <Text style={styles.registerLink}>Бүртгүүлэх</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: FONTS.weight.bold,
    color: COLORS.white,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 8,
  },
  formContainer: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: LAYOUT.padding.screen,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.padding.card + 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 20,
  },
  formTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginBottom: LAYOUT.spacing.lg,
    textAlign: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.md,
  },
  forgotPasswordText: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.primary,
  },
  loginButton: {
    marginTop: LAYOUT.spacing.md,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: LAYOUT.spacing.lg,
  },
  registerText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  registerLink: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: FONTS.weight.semibold,
  },
});

export default LoginScreen;