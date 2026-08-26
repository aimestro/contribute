import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii, spacing } from '@/constants/theme';
import { formatMoney, formatSignedMoney } from '@/lib/format';

type Props = {
  youOwe: number;
  youAreOwed: number;
  net: number;
};

export function BalanceHero({ youOwe, youAreOwed, net }: Props) {
  const settled = Math.abs(net) < 0.005;
  const netLabel = settled
    ? 'All settled up'
    : net > 0
      ? 'Overall, you are owed'
      : 'Overall, you owe';

  return (
    <View style={styles.wrap}>
      <Text style={styles.brand}>Contribute</Text>
      <Text style={styles.netLabel}>{netLabel}</Text>
      <Text
        style={[
          styles.net,
          settled && { color: colors.settled },
          net > 0 && { color: colors.owed },
          net < 0 && { color: colors.owe },
        ]}>
        {settled ? formatMoney(0) : formatSignedMoney(net).replace('+', '')}
      </Text>

      <View style={styles.row}>
        <View style={[styles.chip, styles.oweChip]}>
          <Text style={styles.chipLabel}>you owe</Text>
          <Text style={[styles.chipValue, { color: colors.owe }]}>
            {formatMoney(youOwe)}
          </Text>
        </View>
        <View style={[styles.chip, styles.owedChip]}>
          <Text style={styles.chipLabel}>owed to you</Text>
          <Text style={[styles.chipValue, { color: colors.owed }]}>
            {formatMoney(youAreOwed)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 42,
    color: colors.brand,
    letterSpacing: -1,
    marginBottom: spacing.lg,
  },
  netLabel: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.inkMuted,
  },
  net: {
    fontFamily: fonts.display,
    fontSize: 48,
    color: colors.ink,
    letterSpacing: -1.5,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  chip: {
    flex: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  oweChip: {
    borderLeftWidth: 3,
    borderLeftColor: colors.owe,
  },
  owedChip: {
    borderLeftWidth: 3,
    borderLeftColor: colors.owed,
  },
  chipLabel: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  chipValue: {
    marginTop: 6,
    fontFamily: fonts.sansBold,
    fontSize: 22,
  },
});
