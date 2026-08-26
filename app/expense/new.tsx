import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { CATEGORIES } from '@/lib/categories';
import { buildEqualSplits } from '@/lib/balances';
import { roundMoney } from '@/lib/format';
import type { CategoryId } from '@/lib/types';
import { useStore } from '@/lib/store';

export default function NewExpenseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ groupId?: string; friendId?: string }>();
  const { state, you, addExpense } = useStore();

  const initialParticipants = useMemo(() => {
    if (params.groupId) {
      const group = state.groups.find((g) => g.id === params.groupId);
      return new Set(group?.memberIds ?? [you.id]);
    }
    if (params.friendId) return new Set([you.id, params.friendId]);
    return new Set([you.id]);
  }, [params.groupId, params.friendId, state.groups, you.id]);

  const [description, setDescription] = useState('');
  const [amountText, setAmountText] = useState('');
  const [category, setCategory] = useState<CategoryId>('general');
  const [paidById, setPaidById] = useState(you.id);
  const [participantIds, setParticipantIds] = useState<Set<string>>(initialParticipants);
  const [groupId, setGroupId] = useState<string | null>(params.groupId ?? null);

  const amount = roundMoney(parseFloat(amountText) || 0);
  const canSave =
    description.trim().length > 0 && amount > 0 && participantIds.size > 0;

  const toggleParticipant = (id: string) => {
    setParticipantIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (id === paidById) return prev;
        next.delete(id);
      } else next.add(id);
      return next;
    });
  };

  const onSave = () => {
    if (!canSave) return;
    const ids = Array.from(participantIds);
    addExpense({
      description,
      amount,
      category,
      paidById,
      participantIds: ids,
      groupId,
      splitMethod: 'equal',
      splits: buildEqualSplits(amount, ids),
    });
    router.back();
  };

  return (
    <Screen>
      <Field
        label="Description"
        placeholder="Dinner, tickets, groceries…"
        value={description}
        onChangeText={setDescription}
      />
      <Field
        label="Amount"
        placeholder="0.00"
        keyboardType="decimal-pad"
        value={amountText}
        onChangeText={setAmountText}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.chips}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => setCategory(cat.id)}
            style={[
              styles.chip,
              category === cat.id && styles.chipActive,
            ]}>
            <Text
              style={[
                styles.chipText,
                category === cat.id && styles.chipTextActive,
              ]}>
              {cat.emoji} {cat.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Group (optional)</Text>
      <View style={styles.chips}>
        <Pressable
          onPress={() => setGroupId(null)}
          style={[styles.chip, groupId === null && styles.chipActive]}>
          <Text
            style={[
              styles.chipText,
              groupId === null && styles.chipTextActive,
            ]}>
            None
          </Text>
        </Pressable>
        {state.groups.map((g) => (
          <Pressable
            key={g.id}
            onPress={() => {
              setGroupId(g.id);
              setParticipantIds(new Set(g.memberIds));
            }}
            style={[styles.chip, groupId === g.id && styles.chipActive]}>
            <Text
              style={[
                styles.chipText,
                groupId === g.id && styles.chipTextActive,
              ]}>
              {g.emoji} {g.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Paid by</Text>
      <View style={styles.chips}>
        {state.people
          .filter((p) => participantIds.has(p.id) || p.id === paidById)
          .map((p) => (
            <Pressable
              key={p.id}
              onPress={() => {
                setPaidById(p.id);
                setParticipantIds((prev) => new Set(prev).add(p.id));
              }}
              style={[styles.chip, paidById === p.id && styles.chipActive]}>
              <Text
                style={[
                  styles.chipText,
                  paidById === p.id && styles.chipTextActive,
                ]}>
                {p.isYou ? 'You' : p.name}
              </Text>
            </Pressable>
          ))}
      </View>

      <Text style={styles.label}>Split equally between</Text>
      <View style={styles.chips}>
        {state.people.map((p) => {
          const on = participantIds.has(p.id);
          return (
            <Pressable
              key={p.id}
              onPress={() => toggleParticipant(p.id)}
              style={[styles.chip, on && styles.chipActive]}>
              <Text style={[styles.chipText, on && styles.chipTextActive]}>
                {p.isYou ? 'You' : p.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Button
        label="Save expense"
        disabled={!canSave}
        onPress={onSave}
        style={{ marginTop: spacing.xl }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.inkMuted,
    marginBottom: spacing.sm,
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
  chipText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.ink,
  },
  chipTextActive: { color: colors.white },
});
