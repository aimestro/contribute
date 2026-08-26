import React, { forwardRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, fonts, radii, spacing } from '@/constants/theme';

type Props = PressableProps & {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  style?: StyleProp<ViewStyle>;
};

export const Button = forwardRef<React.ElementRef<typeof Pressable>, Props>(
  function Button({ label, variant = 'primary', style, disabled, ...rest }, ref) {
    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        disabled={disabled}
        style={({ pressed }) => [
          styles.base,
          variant === 'primary' && styles.primary,
          variant === 'secondary' && styles.secondary,
          variant === 'ghost' && styles.ghost,
          variant === 'danger' && styles.danger,
          pressed && styles.pressed,
          disabled && styles.disabled,
          style,
        ]}
        {...rest}>
        <Text
          style={[
            styles.label,
            (variant === 'secondary' || variant === 'ghost') && styles.labelDark,
            variant === 'danger' && styles.labelLight,
          ]}>
          {label}
        </Text>
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  primary: {
    backgroundColor: colors.brand,
  },
  secondary: {
    backgroundColor: colors.brandSoft,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.line,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.45 },
  label: {
    color: colors.white,
    fontFamily: fonts.sansSemi,
    fontSize: 16,
  },
  labelDark: { color: colors.ink },
  labelLight: { color: colors.white },
});
