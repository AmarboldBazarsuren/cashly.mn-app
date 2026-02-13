/**
 * CASHLY APP - Button Component
 * БАЙРШИЛ: Cashly.mn/App/src/components/Button.js
 * Дахин ашиглагдах товч
 */

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../constants/colors';
import { FONTS, TEXT_STYLES } from '../constants/typography';
import LAYOUT from '../constants/layout';

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary | secondary | outline | text
  size = 'md', // sm | md | lg
  disabled = false,
  loading = false,
  icon,
  fullWidth = true,
  style,
  textStyle,
  ...props
}) => {
  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: COLORS.gradient.primary,
          textColor: COLORS.white,
        };
      case 'secondary':
        return {
          background: [COLORS.secondary, COLORS.secondaryLight],
          textColor: COLORS.white,
        };
      case 'outline':
        return {
          background: null,
          borderColor: COLORS.primary,
          textColor: COLORS.primary,
        };
      case 'text':
        return {
          background: null,
          textColor: COLORS.primary,
        };
      default:
        return {
          background: COLORS.gradient.primary,
          textColor: COLORS.white,
        };
    }
  };

  // Size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: LAYOUT.button.height.sm,
          paddingHorizontal: LAYOUT.padding.container,
          fontSize: FONTS.size.sm,
        };
      case 'md':
        return {
          height: LAYOUT.button.height.md,
          paddingHorizontal: LAYOUT.padding.card,
          fontSize: FONTS.size.md,
        };
      case 'lg':
        return {
          height: LAYOUT.button.height.lg,
          paddingHorizontal: LAYOUT.padding.card,
          fontSize: FONTS.size.lg,
        };
      default:
        return {
          height: LAYOUT.button.height.md,
          paddingHorizontal: LAYOUT.padding.card,
          fontSize: FONTS.size.md,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const isDisabled = disabled || loading;

  // Button content
  const ButtonContent = () => (
    <>
      {loading ? (
        <ActivityIndicator color={variantStyles.textColor} size="small" />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text
            style={[
              styles.text,
              { 
                color: variantStyles.textColor,
                fontSize: sizeStyles.fontSize,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </>
  );

  // Container style
  const containerStyle = [
    styles.button,
    {
      height: sizeStyles.height,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      width: fullWidth ? '100%' : 'auto',
      opacity: isDisabled ? 0.6 : 1,
    },
    variant === 'outline' && {
      borderWidth: 2,
      borderColor: variantStyles.borderColor,
      backgroundColor: COLORS.transparent,
    },
    variant === 'text' && {
      backgroundColor: COLORS.transparent,
    },
    style,
  ];

  // Gradient button
  if (variantStyles.background && variant !== 'outline' && variant !== 'text') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        {...props}
      >
        <LinearGradient
          colors={variantStyles.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={containerStyle}
        >
          <ButtonContent />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Normal button (outline, text)
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={containerStyle}
      {...props}
    >
      <ButtonContent />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: LAYOUT.radius.md,
  },
  text: {
    ...TEXT_STYLES.button,
    textAlign: 'center',
  },
  icon: {
    marginRight: LAYOUT.spacing.sm,
  },
});

export default Button;