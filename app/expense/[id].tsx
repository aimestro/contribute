import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { colors, fonts, spacing } from '@/constants/theme';
import { getCategory } from '@/lib/categories';
import { formatMoney, formatRelativeDate } from '@/lib/format';
import { peopleById } from '@/lib/balances';
import { useStore } from '@/lib/store';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state, deleteExpense } = useStore();
  const expense = state.expenses.find((e) => e.id === id);
  const people = peopleById(state.people);

  if (!expense) {
    return (
      <Screen>
        <Text style={styles.missing}>Expense not found.</Text>
      </Screen>
    );
  }

  const category = getCategory(expense.category);
  const payer = people[expense.paidById];
  const group = state.groups.find((g) => g.id === expense.groupId);

  return (
    <Screen>
      <Text style={styles.cat}>
        {category.emoji} {category.label}
      </Text>
      <Text style={styles.title}>{expense.description}</Text>
      <Text style={styles.amount}>{formatMoney(expense.amount)}</Text>
      <Text style={styles.meta}>
        {formatRelativeDate(expense.createdAt)}
        {group ? ` · ${group.name}` : ' · non-group'}
      </Text>
      <Text style={styles.meta}>Paid by {payer?.name ?? 'Someone'}</Text>
      {expense.note ? <Text style={styles.note}>{expense.note}</Text> : null}

      <Text style={styles.section}>Split</Text>
      {expense.splits.map((split) => (
        <View key={split.personId} style={styles.splitRow}>
          <Text style={styles.splitName}>
            {people[split.personId]?.name ?? 'Unknown'}
          </Text>
          <Text style={styles.splitAmt}>{formatMoney(split.amount)}</Text>
        </View>
      ))}

      <Button
        label="Delete expense"
        variant="danger"
        style={{ marginTop: spacing.xxl }}
        onPress={() => {
          Alert.alert('Delete expense?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                deleteExpense(expense.id);
                router.back();
              },
            },
          ]);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: { fontFamily: fonts.sans, color: colors.inkMuted },
  cat: {
    fontFamily: fonts.sansSemi,
    color: colors.inkMuted,
    marginTop: spacing.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  amount: {
    fontFamily: fonts.sansBold,
    fontSize: 28,
    color: colors.brand,
    marginTop: spacing.sm,
  },
  meta: {
    marginTop: 6,
    fontFamily: fonts.sans,
    color: colors.inkMuted,
  },
  note: {
    marginTop: spacing.lg,
    fontFamily: fonts.sans,
    color: colors.ink,
    fontStyle: 'italic',
  },
  section: {
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
    fontFamily: fonts.sansBold,
    fontSize: 16,
    color: colors.ink,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  splitName: { fontFamily: fonts.sans, color: colors.ink, fontSize: 15 },
  splitAmt: { fontFamily: fonts.sansSemi, color: colors.ink, fontSize: 15 },
});
