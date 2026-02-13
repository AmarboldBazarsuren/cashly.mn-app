/**
 * CASHLY APP - Input Component
 * ЗАСВАРЛАСАН - Boolean type асуудал бүрэн арилгасан
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
  secureTextEntry,
  keyboardType = 'default',
  error,
  icon,
  rightIcon,
  maxLength,
  editable,
  multiline,
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
      {label ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          isFocused ? styles.inputContainerFocused : null,
          error ? styles.inputContainerError : null,
          editable === false ? styles.inputContainerDisabled : null,
        ]}
      >
        {icon ? (
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={LAYOUT.icon.sm} color={COLORS.textSecondary} />
          </View>
        ) : null}

        <TextInput
          style={[
            styles.input,
            multiline === true ? styles.inputMultiline : null,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textDisabled}
          secureTextEntry={secureTextEntry === true && !showPassword}
          keyboardType={keyboardType}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable === false ? false : true}
          maxLength={maxLength}
          multiline={multiline === true ? true : false}
          numberOfLines={numberOfLines}
          {...props}
        />

        {secureTextEntry === true ? (
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

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      {maxLength && value ? (
        <Text style={styles.characterCount}>
          {value.length}/{maxLength}
        </Text>
      ) : null}
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