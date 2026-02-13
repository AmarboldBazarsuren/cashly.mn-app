/**
 * CASHLY APP - Input Component
 * БАЙРШИЛ: Cashly.mn/App/src/components/Input.js
 * Текст оруулах талбар
 */

import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';
import { FONTS, TEXT_STYLES } from '../constants/typography';
import LAYOUT from '../constants/layout';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  icon,
  rightIcon,
  maxLength,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
          !editable && styles.inputContainerDisabled,
        ]}
      >
        {/* Left Icon */}
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={LAYOUT.icon.sm} color={COLORS.textSecondary} />
          </View>
        )}

        {/* Text Input */}
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textDisabled}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          {...props}
        />

        {/* Right Icon / Password Toggle */}
        {secureTextEntry ? (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.iconContainer}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={LAYOUT.icon.sm}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.iconContainer}>
            <Ionicons name={rightIcon} size={LAYOUT.icon.sm} color={COLORS.textSecondary} />
          </View>
        ) : null}
      </View>

      {/* Error Message */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Character Count */}
      {maxLength && value && (
        <Text style={styles.characterCount}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: LAYOUT.spacing.md,
  },
  label: {
    ...TEXT_STYLES.bodySmall,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.textPrimary,
    marginBottom: LAYOUT.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundInput,
    borderRadius: LAYOUT.radius.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: LAYOUT.padding.container,
    minHeight: LAYOUT.input.height,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  inputContainerError: {
    borderColor: COLORS.error,
  },
  inputContainerDisabled: {
    backgroundColor: COLORS.gray200,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    paddingVertical: LAYOUT.spacing.sm,
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: LAYOUT.spacing.md,
    textAlignVertical: 'top',
  },
  iconContainer: {
    marginHorizontal: LAYOUT.spacing.xs,
  },
  errorText: {
    ...TEXT_STYLES.caption,
    color: COLORS.error,
    marginTop: LAYOUT.spacing.xs,
  },
  characterCount: {
    ...TEXT_STYLES.caption,
    color: COLORS.textDisabled,
    marginTop: LAYOUT.spacing.xs,
    textAlign: 'right',
  },
});

export default Input;