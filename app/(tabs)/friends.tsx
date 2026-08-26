import { Link } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';

import { FriendBalanceRow } from '@/components/FriendBalanceRow';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { colors, fonts, spacing } from '@/constants/theme';
import { computePairBalances } from '@/lib/balances';
import { useStore } from '@/lib/store';

export default function FriendsScreen() {
  const { state, you } = useStore();
  const balances = useMemo(
    () => computePairBalances(you.id, state.expenses, state.settlements),
    [you.id, state.expenses, state.settlements],
  );

  const friends = state.people
    .filter((p) => !p.isYou)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Screen>
      <Text style={styles.brand}>Friends</Text>
      <Text style={styles.lead}>
        One-to-one balances across every group and non-group expense.
      </Text>

      <Link href="/add-friend" asChild>
        <Button label="Add friend" style={{ marginBottom: spacing.xl }} />
      </Link>

      {friends.map((person) => (
        <FriendBalanceRow
          key={person.id}
          person={person}
          balance={balances[person.id] ?? 0}
        />
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
});
