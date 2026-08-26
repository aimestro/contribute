import { Link, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ExpenseRow } from '@/components/ExpenseRow';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, fonts, spacing } from '@/constants/theme';
import { groupMemberBalances, peopleById } from '@/lib/balances';
import { formatMoney } from '@/lib/format';
import { useStore } from '@/lib/store';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, you } = useStore();
  const group = state.groups.find((g) => g.id === id);
  const people = useMemo(() => peopleById(state.people), [state.people]);

  if (!group) {
    return (
      <Screen>
        <Text style={styles.missing}>Group not found.</Text>
      </Screen>
    );
  }

  const nets = groupMemberBalances(
    group.memberIds,
    state.expenses,
    state.settlements,
    group.id,
  );
  const expenses = state.expenses
    .filter((e) => e.groupId === group.id)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <Screen>
      <Text style={styles.emoji}>{group.emoji}</Text>
      <Text style={styles.title}>{group.name}</Text>
      <Text style={styles.sub}>{group.memberIds.length} members</Text>

      <View style={styles.actions}>
        <Link
          href={{ pathname: '/expense/new', params: { groupId: group.id } }}
          asChild>
          <Button label="Add expense" style={{ flex: 1 }} />
        </Link>
        <Link
          href={{ pathname: '/settle', params: { groupId: group.id } }}
          asChild>
          <Button label="Settle" variant="secondary" style={{ flex: 1 }} />
        </Link>
      </View>

      <SectionHeader title="Balances in group" />
      {group.memberIds.map((memberId) => {
        const person = people[memberId];
        if (!person) return null;
        const value = nets[memberId] ?? 0;
        const label =
          Math.abs(value) < 0.005
            ? 'settled up'
            : value > 0
              ? `gets back ${formatMoney(value)}`
              : `owes ${formatMoney(value)}`;
        return (
          <View key={memberId} style={styles.memberRow}>
            <Avatar name={person.name} color={person.avatarColor} size={40} />
            <View style={{ flex: 1 }}>
              <Text style={styles.memberName}>
                {person.isYou ? 'You' : person.name}
              </Text>
              <Text
                style={[
                  styles.memberBal,
                  value > 0 && { color: colors.owed },
                  value < 0 && { color: colors.owe },
                ]}>
                {label}
              </Text>
            </View>
          </View>
        );
      })}

      <SectionHeader title="Expenses" />
      {expenses.map((expense) => (
        <ExpenseRow
          key={expense.id}
          expense={expense}
          people={people}
          youId={you.id}
        />
      ))}
      {expenses.length === 0 ? (
        <Text style={styles.empty}>No expenses in this group yet.</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: { fontFamily: fonts.sans, color: colors.inkMuted },
  emoji: { fontSize: 40, marginTop: spacing.sm },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.ink,
    letterSpacing: -0.8,
    marginTop: spacing.sm,
  },
  sub: {
    fontFamily: fonts.sans,
    color: colors.inkMuted,
    marginBottom: spacing.xl,
  },
  actions: { flexDirection: 'row', gap: spacing.md },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  memberName: { fontFamily: fonts.sansSemi, color: colors.ink, fontSize: 15 },
  memberBal: { fontFamily: fonts.sans, color: colors.settled, fontSize: 13 },
  empty: { fontFamily: fonts.sans, color: colors.inkMuted },
});
