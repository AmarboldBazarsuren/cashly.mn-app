/**
 * CASHLY APP - KYC Screen
 * БАЙРШИЛ: Cashly.mn/App/src/screens/kyc/KYCScreen.js
 * Хувийн мэдээлэл бөглөх - Production-ready
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { submitKYC } from '../../api/services/userService';
import Input from '../../components/Input';
import Button from '../../components/Button';
import COLORS from '../../constants/colors';
import { FONTS, TEXT_STYLES } from '../../constants/typography';
import LAYOUT from '../../constants/layout';
import { validateRegister, validateAccountNumber } from '../../utils/validators';

const KYCScreen = ({ navigation }) => {
  const { user, refreshProfile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Personal, 2: Employment, 3: Address, 4: Bank, 5: Documents
  
  // Personal Info
  const [education, setEducation] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  
  // Employment
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  
  // Address
  const [city, setCity] = useState('Улаанбаатар');
  const [district, setDistrict] = useState('');
  const [khoroo, setKhoroo] = useState('');
  const [building, setBuilding] = useState('');
  const [apartment, setApartment] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  
  // Bank Info
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState(user?.name || '');
  
  // Emergency Contacts
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: '', relationship: '', phoneNumber: '' },
    { name: '', relationship: '', phoneNumber: '' }
  ]);
  
  // Documents
  const [idCardFront, setIdCardFront] = useState(null);
  const [idCardBack, setIdCardBack] = useState(null);
  const [selfie, setSelfie] = useState(null);
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    requestPermissions();
    
    // Хэрэв KYC аль хэдийн бөглөгдсөн бол
    if (user?.kycStatus === 'pending') {
      Alert.alert('Мэдэгдэл', 'Таны хувийн мэдээлэл хянагдаж байна');
      navigation.goBack();
    } else if (user?.kycStatus === 'approved') {
      Alert.alert('Мэдэгдэл', 'Таны хувийн мэдээлэл аль хэдийн баталгаажсан байна');
      navigation.goBack();
    }
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert('Анхааруулга', 'Камер болон зургийн сангийн эрх шаардлагатай');
    }
  };

  const pickImage = async (type) => {
    Alert.alert(
      'Зураг сонгох',
      'Зураг авах эсвэл сангаас сонгох',
      [
        {
          text: 'Камер',
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: type === 'selfie' ? [1, 1] : [4, 3],
              quality: 0.8,
              base64: true,
            });
            
            if (!result.canceled) {
              const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
              if (type === 'idFront') setIdCardFront(base64);
              else if (type === 'idBack') setIdCardBack(base64);
              else if (type === 'selfie') setSelfie(base64);
            }
          }
        },
        {
          text: 'Санг',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: type === 'selfie' ? [1, 1] : [4, 3],
              quality: 0.8,
              base64: true,
            });
            
            if (!result.canceled) {
              const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
              if (type === 'idFront') setIdCardFront(base64);
              else if (type === 'idBack') setIdCardBack(base64);
              else if (type === 'selfie') setSelfie(base64);
            }
          }
        },
        { text: 'Болих', style: 'cancel' }
      ]
    );
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!education) newErrors.education = 'Боловсрол сонгоно уу';
      if (registerNumber && !validateRegister(registerNumber)) {
        newErrors.registerNumber = 'Регистрийн дугаар буруу байна (Жишээ: УБ12345678)';
      }
    } else if (currentStep === 2) {
      if (!employmentStatus) newErrors.employmentStatus = 'Ажил эрхлэлт сонгоно уу';
      if (employmentStatus === 'Ажилтай' && !companyName) {
        newErrors.companyName = 'Байгууллагын нэр оруулна уу';
      }
    } else if (currentStep === 3) {
      if (!district) newErrors.district = 'Дүүрэг сонгоно уу';
      if (!fullAddress) newErrors.fullAddress = 'Хаягаа бүрэн оруулна уу';
    } else if (currentStep === 4) {
      if (!bankName) newErrors.bankName = 'Банк сонгоно уу';
      if (!accountNumber) newErrors.accountNumber = 'Дансны дугаар оруулна уу';
      else if (!validateAccountNumber(accountNumber)) {
        newErrors.accountNumber = 'Дансны дугаар буруу байна';
      }
      if (!accountName) newErrors.accountName = 'Дансны эзэмшигчийн нэр оруулна уу';
    } else if (currentStep === 5) {
      if (!idCardFront) newErrors.idCardFront = 'Иргэний үнэмлэхний урд талыг авна уу';
      if (!idCardBack) newErrors.idCardBack = 'Иргэний үнэмлэхний ард талыг авна уу';
      if (!selfie) newErrors.selfie = 'Селфи зураг авна уу';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 5) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    
    setLoading(true);
    
    try {
      const kycData = {
        education,
        employmentStatus,
        companyName,
        position,
        monthlyIncome: monthlyIncome ? Number(monthlyIncome) : 0,
        city,
        district,
        khoroo,
        building,
        apartment,
        fullAddress,
        bankName,
        accountNumber,
        accountName,
        emergencyContacts: emergencyContacts.filter(c => c.name && c.phoneNumber),
        registerNumber,
        idCardFrontBase64: idCardFront,
        idCardBackBase64: idCardBack,
        selfieBase64: selfie
      };
      
      const result = await submitKYC(kycData);
      
      if (result.success) {
        await refreshProfile();
        Alert.alert(
          'Амжилттай!',
          'Хувийн мэдээлэл амжилттай илгээгдлээ. Админ баталгаажуулах болно.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Алдаа', result.message);
      }
    } catch (error) {
      Alert.alert('Алдаа', 'Хувийн мэдээлэл илгээхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>Хувийн мэдээлэл</Text>
      
      <Text style={styles.label}>Боловсрол *</Text>
      <View style={styles.selectContainer}>
        {['Бага', 'Дунд', 'Тусгай дунд', 'Бакалавр', 'Магистр', 'Доктор'].map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.selectButton, education === item && styles.selectButtonActive]}
            onPress={() => setEducation(item)}
          >
            <Text style={[styles.selectButtonText, education === item && styles.selectButtonTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.education && <Text style={styles.errorText}>{errors.education}</Text>}
      
      <Input
        label="Регистрийн дугаар (Заавал биш)"
        placeholder="УБ12345678"
        value={registerNumber}
        onChangeText={setRegisterNumber}
        maxLength={10}
        autoCapitalize="characters"
        error={errors.registerNumber}
      />
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>Ажил эрхлэлт</Text>
      
      <Text style={styles.label}>Ажлын байдал *</Text>
      <View style={styles.selectContainer}>
        {['Ажилтай', 'Ажилгүй', 'Оюутан', 'Тэтгэвэрт', 'Бизнес эрхлэгч'].map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.selectButton, employmentStatus === item && styles.selectButtonActive]}
            onPress={() => setEmploymentStatus(item)}
          >
            <Text style={[styles.selectButtonText, employmentStatus === item && styles.selectButtonTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.employmentStatus && <Text style={styles.errorText}>{errors.employmentStatus}</Text>}
      
      {employmentStatus === 'Ажилтай' && (
        <>
          <Input
            label="Байгууллагын нэр"
            placeholder="Жишээ: Монгол банк"
            value={companyName}
            onChangeText={setCompanyName}
            error={errors.companyName}
          />
          
          <Input
            label="Албан тушаал"
            placeholder="Жишээ: Менежер"
            value={position}
            onChangeText={setPosition}
          />
        </>
      )}
      
      <Input
        label="Сарын орлого (₮)"
        placeholder="1,000,000"
        value={monthlyIncome}
        onChangeText={setMonthlyIncome}
        keyboardType="numeric"
      />
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>Оршин суух хаяг</Text>
      
      <Text style={styles.label}>Дүүрэг *</Text>
      <View style={styles.selectContainer}>
        {['Баянзүрх', 'Баянгол', 'Сүхбаатар', 'Хан-Уул', 'Чингэлтэй', 'Сонгинохайрхан'].map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.selectButton, district === item && styles.selectButtonActive]}
            onPress={() => setDistrict(item)}
          >
            <Text style={[styles.selectButtonText, district === item && styles.selectButtonTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.district && <Text style={styles.errorText}>{errors.district}</Text>}
      
      <Input
        label="Хороо"
        placeholder="1-р хороо"
        value={khoroo}
        onChangeText={setKhoroo}
      />
      
      <Input
        label="Байр"
        placeholder="Жишээ: 3-р байр"
        value={building}
        onChangeText={setBuilding}
      />
      
      <Input
        label="Тоот"
        placeholder="45"
        value={apartment}
        onChangeText={setApartment}
      />
      
      <Input
        label="Дэлгэрэнгүй хаяг *"
        placeholder="Жишээ: Баянзүрх дүүрэг, 1-р хороо, 3-р байр, 45 тоот"
        value={fullAddress}
        onChangeText={setFullAddress}
        multiline
        numberOfLines={3}
        error={errors.fullAddress}
      />
      
      <Text style={styles.sectionTitle}>Холбоо барих хүмүүс</Text>
      
      {emergencyContacts.map((contact, index) => (
        <View key={index} style={styles.contactCard}>
          <Text style={styles.contactLabel}>Хүн {index + 1}</Text>
          
          <Input
            placeholder="Нэр"
            value={contact.name}
            onChangeText={(text) => {
              const newContacts = [...emergencyContacts];
              newContacts[index].name = text;
              setEmergencyContacts(newContacts);
            }}
            style={styles.contactInput}
          />
          
          <Input
            placeholder="Хамаарал (Жишээ: Эх, Эцэг, Ах)"
            value={contact.relationship}
            onChangeText={(text) => {
              const newContacts = [...emergencyContacts];
              newContacts[index].relationship = text;
              setEmergencyContacts(newContacts);
            }}
            style={styles.contactInput}
          />
          
          <Input
            placeholder="Утасны дугаар (8 орон)"
            value={contact.phoneNumber}
            onChangeText={(text) => {
              const newContacts = [...emergencyContacts];
              newContacts[index].phoneNumber = text;
              setEmergencyContacts(newContacts);
            }}
            keyboardType="phone-pad"
            maxLength={8}
            style={styles.contactInput}
          />
        </View>
      ))}
    </View>
  );

  const renderStep4 = () => (
    <View>
      <Text style={styles.stepTitle}>Банкны мэдээлэл</Text>
      
      <Text style={styles.label}>Банк *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bankScroll}>
        {['Хаан банк', 'Төрийн банк', 'Голомт банк', 'Хас банк', 'Капитрон банк', 
          'Ариг банк', 'Богд банк', 'Чингис хаан банк'].map((bank) => (
          <TouchableOpacity
            key={bank}
            style={[styles.bankButton, bankName === bank && styles.bankButtonActive]}
            onPress={() => setBankName(bank)}
          >
            <Text style={[styles.bankButtonText, bankName === bank && styles.bankButtonTextActive]}>
              {bank}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {errors.bankName && <Text style={styles.errorText}>{errors.bankName}</Text>}
      
      <Input
        label="Дансны дугаар *"
        placeholder="1234567890"
        value={accountNumber}
        onChangeText={setAccountNumber}
        keyboardType="numeric"
        error={errors.accountNumber}
      />
      
      <Input
        label="Дансны эзэмшигч *"
        placeholder="Таны нэр"
        value={accountName}
        onChangeText={setAccountName}
        error={errors.accountName}
      />
      
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color={COLORS.info} />
        <Text style={styles.infoText}>
          Мөнгө татах үед энэ данс руу шилжүүлэгдэнэ
        </Text>
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View>
      <Text style={styles.stepTitle}>Баримт бичиг</Text>
      
      <Text style={styles.documentLabel}>Иргэний үнэмлэх - Урд тал *</Text>
      <TouchableOpacity
        style={styles.imagePicker}
        onPress={() => pickImage('idFront')}
      >
        {idCardFront ? (
          <Image source={{ uri: idCardFront }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePickerContent}>
            <Ionicons name="camera-outline" size={48} color={COLORS.primary} />
            <Text style={styles.imagePickerText}>Зураг авах</Text>
          </View>
        )}
      </TouchableOpacity>
      {errors.idCardFront && <Text style={styles.errorText}>{errors.idCardFront}</Text>}
      
      <Text style={styles.documentLabel}>Иргэний үнэмлэх - Ард тал *</Text>
      <TouchableOpacity
        style={styles.imagePicker}
        onPress={() => pickImage('idBack')}
      >
        {idCardBack ? (
          <Image source={{ uri: idCardBack }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePickerContent}>
            <Ionicons name="camera-outline" size={48} color={COLORS.primary} />
            <Text style={styles.imagePickerText}>Зураг авах</Text>
          </View>
        )}
      </TouchableOpacity>
      {errors.idCardBack && <Text style={styles.errorText}>{errors.idCardBack}</Text>}
      
      <Text style={styles.documentLabel}>Селфи зураг *</Text>
      <TouchableOpacity
        style={styles.imagePicker}
        onPress={() => pickImage('selfie')}
      >
        {selfie ? (
          <Image source={{ uri: selfie }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePickerContent}>
            <Ionicons name="camera-outline" size={48} color={COLORS.primary} />
            <Text style={styles.imagePickerText}>Селфи авах</Text>
          </View>
        )}
      </TouchableOpacity>
      {errors.selfie && <Text style={styles.errorText}>{errors.selfie}</Text>}
      
      <View style={styles.infoBox}>
        <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.success} />
        <Text style={styles.infoText}>
          Таны мэдээлэл найдвартай хамгаалагдана
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Хувийн мэдээлэл</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4, 5].map((s) => (
          <View
            key={s}
            style={[
              styles.progressDot,
              s <= step && styles.progressDotActive,
              s < step && styles.progressDotCompleted
            ]}
          />
        ))}
      </View>
      <Text style={styles.progressText}>Алхам {step}/5</Text>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </ScrollView>

      {/* Buttons */}
      <View style={styles.footer}>
        <Button
          title={step === 5 ? 'Илгээх' : 'Үргэлжлүүлэх'}
          onPress={handleNext}
          loading={loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: LAYOUT.padding.screen,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    ...TEXT_STYLES.h5,
    color: COLORS.textPrimary,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.md,
    backgroundColor: COLORS.white,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.gray300,
    marginHorizontal: 6,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  progressDotCompleted: {
    backgroundColor: COLORS.success,
  },
  progressText: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingBottom: LAYOUT.spacing.md,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: LAYOUT.padding.screen,
    paddingBottom: 100,
  },
  stepTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginBottom: LAYOUT.spacing.lg,
  },
  label: {
    ...TEXT_STYLES.body,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.textPrimary,
    marginBottom: LAYOUT.spacing.sm,
    marginTop: LAYOUT.spacing.md,
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: LAYOUT.spacing.md,
  },
  selectButton: {
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.sm,
    borderRadius: LAYOUT.radius.md,
    backgroundColor: COLORS.gray200,
    marginRight: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.sm,
  },
  selectButtonActive: {
    backgroundColor: COLORS.primary,
  },
  selectButtonText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  selectButtonTextActive: {
    color: COLORS.white,
    fontWeight: FONTS.weight.semibold,
  },
  errorText: {
    ...TEXT_STYLES.caption,
    color: COLORS.error,
    marginTop: -LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.sm,
  },
  sectionTitle: {
    ...TEXT_STYLES.h6,
    color: COLORS.textPrimary,
    marginTop: LAYOUT.spacing.xl,
    marginBottom: LAYOUT.spacing.md,
  },
  contactCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.md,
    padding: LAYOUT.padding.card,
    marginBottom: LAYOUT.spacing.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactLabel: {
    ...TEXT_STYLES.body,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.textPrimary,
    marginBottom: LAYOUT.spacing.sm,
  },
  contactInput: {
    marginBottom: LAYOUT.spacing.sm,
  },
  bankScroll: {
    marginBottom: LAYOUT.spacing.md,
  },
  bankButton: {
    paddingHorizontal: LAYOUT.spacing.md + 4,
    paddingVertical: LAYOUT.spacing.sm + 2,
    borderRadius: LAYOUT.radius.md,
    backgroundColor: COLORS.white,
    marginRight: LAYOUT.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  bankButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  bankButtonText: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
  },
  bankButtonTextActive: {
    color: COLORS.white,
    fontWeight: FONTS.weight.semibold,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info + '15',
    borderRadius: LAYOUT.radius.md,
    padding: LAYOUT.padding.container,
    marginTop: LAYOUT.spacing.md,
  },
  infoText: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: LAYOUT.spacing.sm,
    flex: 1,
  },
  documentLabel: {
    ...TEXT_STYLES.body,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.textPrimary,
    marginTop: LAYOUT.spacing.lg,
    marginBottom: LAYOUT.spacing.sm,
  },
  imagePicker: {
    height: 200,
    borderRadius: LAYOUT.radius.md,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    overflow: 'hidden',
  },
  imagePickerContent: {
    alignItems: 'center',
  },
  imagePickerText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    marginTop: LAYOUT.spacing.sm,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: LAYOUT.padding.screen,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
});

export default KYCScreen;