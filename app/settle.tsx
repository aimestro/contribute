import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { computePairBalances } from '@/lib/balances';
import { formatMoney, roundMoney } from '@/lib/format';
import { useStore } from '@/lib/store';

export default function SettleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    friendId?: string;
    groupId?: string;
    direction?: string;
  }>();
  const { state, you, settleUp } = useStore();

  const balances = useMemo(
    () =>
      computePairBalances(
        you.id,
        state.expenses,
        state.settlements,
        undefined,
        params.groupId,
      ),
    [you.id, state.expenses, state.settlements, params.groupId],
  );

  const candidates = state.people.filter((p) => !p.isYou);
  const [friendId, setFriendId] = useState(
    params.friendId ??
      candidates.find((p) => Math.abs(balances[p.id] ?? 0) > 0.005)?.id ??
      candidates[0]?.id ??
      '',
  );
  const balance = balances[friendId] ?? 0;
  const defaultYouPay = params.direction
    ? params.direction === 'youPay'
    : balance < 0;
  const [youPay, setYouPay] = useState(defaultYouPay);
  const suggested = Math.abs(balance) > 0.005 ? Math.abs(balance) : 0;
  const [amountText, setAmountText] = useState(
    suggested ? suggested.toFixed(2) : '',
  );
  const [note, setNote] = useState('');

  const amount = roundMoney(parseFloat(amountText) || 0);
  const friend = state.people.find((p) => p.id === friendId);
  const canSave = !!friend && amount > 0;

  const onSave = () => {
    if (!friend || !canSave) return;
    settleUp({
      fromId: youPay ? you.id : friend.id,
      toId: youPay ? friend.id : you.id,
      amount,
      groupId: params.groupId ?? null,
      note: note.trim() || undefined,
    });
    router.back();
  };

  return (
    <Screen>
      <Text style={styles.lead}>
        Record a payment so balances stay honest across groups.
      </Text>

      <Text style={styles.label}>With</Text>
      <View style={styles.chips}>
        {candidates.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => {
              setFriendId(p.id);
              const b = balances[p.id] ?? 0;
              if (Math.abs(b) > 0.005) {
                setYouPay(b < 0);
                setAmountText(Math.abs(b).toFixed(2));
              }
            }}
            style={[styles.chip, friendId === p.id && styles.chipActive]}>
            <Text
              style={[
                styles.chipText,
                friendId === p.id && styles.chipTextActive,
              ]}>
              {p.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {friend ? (
        <Text style={styles.hint}>
          Current balance:{' '}
          {Math.abs(balance) < 0.005
            ? 'settled'
            : balance > 0
              ? `${friend.name} owes you ${formatMoney(balance)}`
              : `you owe ${formatMoney(balance)}`}
        </Text>
      ) : null}

      <Text style={styles.label}>Who paid?</Text>
      <View style={styles.chips}>
        <Pressable
          onPress={() => setYouPay(true)}
          style={[styles.chip, youPay && styles.chipActive]}>
          <Text style={[styles.chipText, youPay && styles.chipTextActive]}>
            You paid {friend?.name ?? 'them'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setYouPay(false)}
          style={[styles.chip, !youPay && styles.chipActive]}>
          <Text style={[styles.chipText, !youPay && styles.chipTextActive]}>
            {friend?.name ?? 'They'} paid you
          </Text>
        </Pressable>
      </View>

      <Field
        label="Amount"
        keyboardType="decimal-pad"
        value={amountText}
        onChangeText={setAmountText}
      />
      <Field
        label="Note (optional)"
        placeholder="Venmo, cash, bank transfer…"
        value={note}
        onChangeText={setNote}
      />

      <Button label="Record settlement" disabled={!canSave} onPress={onSave} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: {
    fontFamily: fonts.sans,
    color: colors.inkMuted,
    marginBottom: spacing.xl,
    lineHeight: 21,
  },
  label: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.inkMuted,
    marginBottom: spacing.sm,
  },
  hint: {
    fontFamily: fonts.sans,
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  chipText: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink },
  chipTextActive: { color: colors.white },
});
