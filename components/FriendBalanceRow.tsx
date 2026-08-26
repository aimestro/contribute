import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import type { Person } from '@/lib/types';

import { Avatar } from './ui/Avatar';

type Props = {
  person: Person;
  balance: number;
};

export function FriendBalanceRow({ person, balance }: Props) {
  const settled = Math.abs(balance) < 0.005;
  const label = settled
    ? 'settled up'
    : balance > 0
      ? `owes you ${formatMoney(balance)}`
      : `you owe ${formatMoney(balance)}`;

  return (
    <Link href={`/friend/${person.id}`} asChild>
      <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
        <Avatar name={person.name} color={person.avatarColor} />
        <View style={styles.meta}>
          <Text style={styles.name}>{person.name}</Text>
          <Text
            style={[
              styles.balance,
              settled && { color: colors.settled },
              balance > 0 && { color: colors.owed },
              balance < 0 && { color: colors.owe },
            ]}>
            {label}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  pressed: { opacity: 0.7 },
  meta: { flex: 1 },
  name: {
    fontFamily: fonts.sansSemi,
    fontSize: 16,
    color: colors.ink,
  },
  balance: {
    marginTop: 2,
    fontFamily: fonts.sans,
    fontSize: 13,
  },
});
