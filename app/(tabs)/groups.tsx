import { Link } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GroupCard } from '@/components/GroupCard';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { colors, fonts, spacing } from '@/constants/theme';
import { groupMemberBalances } from '@/lib/balances';
import { formatMoney } from '@/lib/format';
import { useStore } from '@/lib/store';

export default function GroupsScreen() {
  const { state, you } = useStore();

  const cards = useMemo(() => {
    return state.groups.map((group) => {
      const nets = groupMemberBalances(
        group.memberIds,
        state.expenses,
        state.settlements,
        group.id,
      );
      const yours = nets[you.id] ?? 0;
      const subtitle =
        Math.abs(yours) < 0.005
          ? `${group.memberIds.length} members · settled`
          : yours > 0
            ? `${group.memberIds.length} members · you are owed ${formatMoney(yours)}`
            : `${group.memberIds.length} members · you owe ${formatMoney(yours)}`;
      return { group, subtitle };
    });
  }, [state.groups, state.expenses, state.settlements, you.id]);

  return (
    <Screen>
      <Text style={styles.brand}>Groups</Text>
      <Text style={styles.lead}>
        Shared homes, trips, and recurring hangouts — kept fair automatically.
      </Text>

      <Link href="/add-group" asChild>
        <Button label="Create group" style={{ marginBottom: spacing.xl }} />
      </Link>

      {cards.map(({ group, subtitle }) => (
        <GroupCard key={group.id} group={group} subtitle={subtitle} />
      ))}

      {cards.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No groups yet</Text>
          <Text style={styles.emptyBody}>
            Start a group for roommates, travel, or dinner clubs.
          </Text>
        </View>
      ) : null}
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
  empty: { marginTop: spacing.xxl },
  emptyTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 18,
    color: colors.ink,
  },
  emptyBody: {
    marginTop: spacing.sm,
    fontFamily: fonts.sans,
    color: colors.inkMuted,
  },
});
