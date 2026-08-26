import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii, spacing } from '@/constants/theme';
import { formatMoney, formatRelativeDate } from '@/lib/format';
import { getCategory } from '@/lib/categories';
import type { Expense, Person } from '@/lib/types';

type Props = {
  expense: Expense;
  people: Record<string, Person>;
  youId: string;
};

export function ExpenseRow({ expense, people, youId }: Props) {
  const payer = people[expense.paidById];
  const yourShare =
    expense.splits.find((s) => s.personId === youId)?.amount ?? 0;
  const category = getCategory(expense.category);
  const paidByYou = expense.paidById === youId;

  return (
    <Link href={`/expense/${expense.id}`} asChild>
      <Pressable style={({ pressed }) => [styles.row, pressed && { opacity: 0.75 }]}>
        <View style={[styles.icon, { backgroundColor: category.color + '22' }]}>
          <Text style={styles.emoji}>{category.emoji}</Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.title} numberOfLines={1}>
            {expense.description}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {formatRelativeDate(expense.createdAt)} ·{' '}
            {paidByYou ? 'you paid' : `${payer?.name ?? 'Someone'} paid`}{' '}
            {formatMoney(expense.amount)}
          </Text>
        </View>
        <View style={styles.right}>
          <Text
            style={[
              styles.amount,
              paidByYou ? { color: colors.owed } : { color: colors.owe },
            ]}>
            {paidByYou ? '+' : '−'}
            {formatMoney(paidByYou ? expense.amount - yourShare : yourShare)}
          </Text>
          <Text style={styles.shareHint}>
            {paidByYou ? 'your share' : 'you owe'} {formatMoney(yourShare)}
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
  icon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 18, color: colors.ink },
  meta: { flex: 1, minWidth: 0 },
  title: {
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    color: colors.ink,
  },
  sub: {
    marginTop: 2,
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkMuted,
  },
  right: { alignItems: 'flex-end' },
  amount: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
  },
  shareHint: {
    marginTop: 2,
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkFaint,
  },
});
