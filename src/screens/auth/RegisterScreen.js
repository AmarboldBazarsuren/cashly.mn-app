/**
 * CASHLY APP - Register Screen
 * БАЙРШИЛ: Cashly.mn/App/src/screens/auth/RegisterScreen.js
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
import { validatePhone, validatePassword, validateName, validatePasswordMatch } from '../../utils/validators';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleRegister = async () => {
    const newErrors = {};
    
    if (!validateName(name)) {
      newErrors.name = 'Нэрээ оруулна уу';
    }
    
    if (!validatePhone(phoneNumber)) {
      newErrors.phoneNumber = 'Утасны дугаар буруу байна (8 орон)';
    }
    
    if (!validatePassword(password)) {
      newErrors.password = 'Нууц үг багадаа 6 тэмдэгттэй байх ёстой';
    }
    
    if (!validatePasswordMatch(password, confirmPassword)) {
      newErrors.confirmPassword = 'Нууц үг таарахгүй байна';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setLoading(true);
    
    try {
      const result = await register(phoneNumber, password, name);
      
      if (!result.success) {
        Alert.alert('Алдаа', result.message);
      }
    } catch (error) {
      Alert.alert('Алдаа', 'Бүртгэл үүсгэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient colors={COLORS.gradient.primary} style={styles.header}>
        <Text style={styles.logo}>💰</Text>
        <Text style={styles.title}>CASHLY</Text>
        <Text style={styles.subtitle}>Шинэ бүртгэл үүсгэх</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.formContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formCard}>
            <Input
              label="Нэр"
              placeholder="Таны нэр"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors({ ...errors, name: '' });
              }}
              icon="person-outline"
              error={errors.name}
            />

            <Input
              label="Утасны дугаар"
              placeholder="99119911"
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                setErrors({ ...errors, phoneNumber: '' });
              }}
              keyboardType="phone-pad"
              maxLength={8}
              icon="call-outline"
              error={errors.phoneNumber}
            />

            <Input
              label="Нууц үг"
              placeholder="••••••••"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors({ ...errors, password: '' });
              }}
              secureTextEntry
              icon="lock-closed-outline"
              error={errors.password}
            />

            <Input
              label="Нууц үг баталгаажуулах"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrors({ ...errors, confirmPassword: '' });
              }}
              secureTextEntry
              icon="lock-closed-outline"
              error={errors.confirmPassword}
            />

            <Button
              title="Бүртгүүлэх"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Бүртгэлтэй хэрэглэгч үү? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.loginLink}>Нэвтрэх</Text>
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
    paddingBottom: LAYOUT.spacing.xl,
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
  },
  registerButton: {
    marginTop: LAYOUT.spacing.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: LAYOUT.spacing.lg,
  },
  loginText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  loginLink: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: FONTS.weight.semibold,
  },
});

export default RegisterScreen;