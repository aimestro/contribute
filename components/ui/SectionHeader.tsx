import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export function SectionHeader({ title, subtitle, right }: Props) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: 18,
    color: colors.ink,
  },
  subtitle: {
    marginTop: 2,
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkMuted,
  },
});
