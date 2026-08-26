import { Link } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BalanceHero } from '@/components/BalanceHero';
import { ExpenseRow } from '@/components/ExpenseRow';
import { FriendBalanceRow } from '@/components/FriendBalanceRow';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, fonts, spacing } from '@/constants/theme';
import {
  computePairBalances,
  peopleById,
  summarizeBalances,
} from '@/lib/balances';
import { useStore } from '@/lib/store';

export default function HomeScreen() {
  const { state, you } = useStore();

  const balances = useMemo(
    () => computePairBalances(you.id, state.expenses, state.settlements),
    [you.id, state.expenses, state.settlements],
  );
  const summary = useMemo(() => summarizeBalances(balances), [balances]);
  const people = useMemo(() => peopleById(state.people), [state.people]);

  const friendsWithBalance = state.people
    .filter((p) => !p.isYou)
    .map((p) => ({ person: p, balance: balances[p.id] ?? 0 }))
    .filter((row) => Math.abs(row.balance) > 0.005)
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));

  const recent = [...state.expenses]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5);

  return (
    <Screen>
      <BalanceHero
        youOwe={summary.youOwe}
        youAreOwed={summary.youAreOwed}
        net={summary.net}
      />

      <View style={styles.actions}>
        <Link href="/expense/new" asChild>
          <Button label="Add expense" style={{ flex: 1 }} />
        </Link>
        <Link href="/settle" asChild>
          <Button label="Settle up" variant="secondary" style={{ flex: 1 }} />
        </Link>
      </View>

      <SectionHeader
        title="Balances"
        subtitle={
          friendsWithBalance.length
            ? 'People you share costs with'
            : 'No open balances'
        }
      />
      {friendsWithBalance.length === 0 ? (
        <Text style={styles.empty}>You're all square. Nice.</Text>
      ) : (
        friendsWithBalance.slice(0, 6).map(({ person, balance }) => (
          <FriendBalanceRow key={person.id} person={person} balance={balance} />
        ))
      )}

      <SectionHeader title="Recent" subtitle="Latest shared costs" />
      {recent.map((expense) => (
        <ExpenseRow
          key={expense.id}
          expense={expense}
          people={people}
          youId={you.id}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  empty: {
    fontFamily: fonts.sans,
    color: colors.inkMuted,
    marginBottom: spacing.md,
  },
});
