import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { peopleById } from '@/lib/balances';
import { formatMoney, formatRelativeDate } from '@/lib/format';
import { useStore } from '@/lib/store';

export default function ActivityScreen() {
  const { state, you } = useStore();
  const people = useMemo(() => peopleById(state.people), [state.people]);

  const items = useMemo(() => {
    const expenseItems = state.expenses.map((expense) => ({
      id: expense.id,
      at: expense.createdAt,
      kind: 'expense' as const,
      title: expense.description,
      body: `${people[expense.paidById]?.name ?? 'Someone'} paid ${formatMoney(expense.amount)}`,
    }));
    const settlementItems = state.settlements.map((settlement) => ({
      id: settlement.id,
      at: settlement.createdAt,
      kind: 'settlement' as const,
      title: 'Settlement',
      body: `${people[settlement.fromId]?.name ?? 'Someone'} paid ${people[settlement.toId]?.name ?? 'someone'} ${formatMoney(settlement.amount)}`,
    }));
    return [...expenseItems, ...settlementItems].sort(
      (a, b) => +new Date(b.at) - +new Date(a.at),
    );
  }, [state.expenses, state.settlements, people]);

  return (
    <Screen>
      <Text style={styles.brand}>Activity</Text>
      <Text style={styles.lead}>
        A running feed of what you and {you.name === 'You' ? 'friends' : 'your circle'} contributed.
      </Text>

      {items.map((item) => (
        <View key={`${item.kind}-${item.id}`} style={styles.row}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor:
                  item.kind === 'settlement' ? colors.accentSoft : colors.brandSoft,
              },
            ]}>
            <Text style={styles.dotText}>
              {item.kind === 'settlement' ? '↔' : '+'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.date}>{formatRelativeDate(item.at)}</Text>
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: colors.brand,
    letterSpacing: -1,
    marginTop: spacing.md,
  },
  lead: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.inkMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotText: { color: colors.brand, fontSize: 16, fontFamily: fonts.sansBold },
  title: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.ink },
  body: {
    marginTop: 2,
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkMuted,
  },
  date: {
    marginTop: 4,
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkFaint,
  },
});
