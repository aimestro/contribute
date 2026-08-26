import { Link, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ExpenseRow } from '@/components/ExpenseRow';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, fonts, spacing } from '@/constants/theme';
import { computePairBalances, peopleById } from '@/lib/balances';
import { formatMoney } from '@/lib/format';
import { useStore } from '@/lib/store';

export default function FriendDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, you } = useStore();
  const person = state.people.find((p) => p.id === id);
  const people = useMemo(() => peopleById(state.people), [state.people]);
  const balances = useMemo(
    () => computePairBalances(you.id, state.expenses, state.settlements),
    [you.id, state.expenses, state.settlements],
  );

  if (!person) {
    return (
      <Screen>
        <Text style={styles.missing}>Friend not found.</Text>
      </Screen>
    );
  }

  const balance = balances[person.id] ?? 0;
  const shared = state.expenses
    .filter(
      (e) =>
        e.paidById === person.id ||
        e.splits.some((s) => s.personId === person.id),
    )
    .filter(
      (e) =>
        e.paidById === you.id || e.splits.some((s) => s.personId === you.id),
    )
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const status =
    Math.abs(balance) < 0.005
      ? 'You are settled up'
      : balance > 0
        ? `${person.name} owes you ${formatMoney(balance)}`
        : `You owe ${person.name} ${formatMoney(balance)}`;

  return (
    <Screen>
      <View style={styles.header}>
        <Avatar name={person.name} color={person.avatarColor} size={72} />
        <Text style={styles.name}>{person.name}</Text>
        <Text style={styles.email}>{person.email}</Text>
        <Text
          style={[
            styles.status,
            balance > 0 && { color: colors.owed },
            balance < 0 && { color: colors.owe },
          ]}>
          {status}
        </Text>
      </View>

      {Math.abs(balance) > 0.005 ? (
        <Link
          href={{
            pathname: '/settle',
            params: {
              friendId: person.id,
              direction: balance < 0 ? 'youPay' : 'theyPay',
            },
          }}
          asChild>
          <Button label="Settle up" style={{ marginBottom: spacing.lg }} />
        </Link>
      ) : null}

      <Link
        href={{ pathname: '/expense/new', params: { friendId: person.id } }}
        asChild>
        <Button label="Add expense together" variant="secondary" />
      </Link>

      <SectionHeader title="Shared expenses" />
      {shared.map((expense) => (
        <ExpenseRow
          key={expense.id}
          expense={expense}
          people={people}
          youId={you.id}
        />
      ))}
      {shared.length === 0 ? (
        <Text style={styles.missing}>No shared expenses yet.</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: spacing.xl, marginTop: spacing.md },
  name: {
    marginTop: spacing.md,
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.ink,
  },
  email: { fontFamily: fonts.sans, color: colors.inkMuted, marginTop: 4 },
  status: {
    marginTop: spacing.md,
    fontFamily: fonts.sansSemi,
    fontSize: 16,
    color: colors.settled,
  },
  missing: { fontFamily: fonts.sans, color: colors.inkMuted },
});
