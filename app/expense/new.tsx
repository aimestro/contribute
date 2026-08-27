"import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { CATEGORIES } from '@/lib/categories';
import { buildSplits, buildEqualSplits } from '@/lib/balances';
import { roundMoney } from '@/lib/format';
import type { CategoryId, SplitMethod } from '@/lib/types';
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
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal');
  const [splitInputs, setSplitInputs] = useState<Record<string, { amount?: number; shares?: number; percent?: number }>>({});

  const amount = roundMoney(parseFloat(amountText) || 0);
  const participantList = Array.from(participantIds);
  const canSave =
    description.trim().length > 0 && amount > 0 && participantIds.size > 0 && isValidSplit();

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

  const updateSplitInput = (personId: string, field: 'amount' | 'shares' | 'percent', value: number) => {
    setSplitInputs((prev) => ({
      ...prev,
      [personId]: { ...prev[personId], [field]: value },
    }));
  };

  const isValidSplit = () => {
    if (participantList.length === 0) return false;
    if (splitMethod === 'equal') return true;
    if (splitMethod === 'exact') {
      const sum = participantList.reduce((a, id) => a + (splitInputs[id]?.amount ?? 0), 0);
      return Math.abs(sum - amount) < 0.005;
    }
    if (splitMethod === 'shares') {
      const totalShares = participantList.reduce((a, id) => a + (splitInputs[id]?.shares ?? 0), 0);
      return totalShares > 0;
    }
    if (splitMethod === 'percent') {
      const sum = participantList.reduce((a, id) => a + (splitInputs[id]?.percent ?? 0), 0);
      return Math.abs(sum - 100) < 0.005;
    }
    return false;
  };

  const getSplitError = () => {
    if (splitMethod === 'exact') {
      const sum = participantList.reduce((a, id) => a + (splitInputs[id]?.amount ?? 0), 0);
      if (Math.abs(sum - amount) > 0.005) return `Sum must equal ${amount.toFixed(2)} (currently ${sum.toFixed(2)})`;
    }
    if (splitMethod === 'shares') {
      const totalShares = participantList.reduce((a, id) => a + (splitInputs[id]?.shares ?? 0), 0);
      if (totalShares === 0) return 'At least one share required';
    }
    if (splitMethod === 'percent') {
      const sum = participantList.reduce((a, id) => a + (splitInputs[id]?.percent ?? 0), 0);
      if (Math.abs(sum - 100) > 0.005) return `Must total 100% (currently ${sum.toFixed(1)}%)`;
    }
    return null;
  };

  const onSave = () => {
    if (!canSave) return;
    const ids = Array.from(participantIds);
    const splitInputArray = ids.map((id) => ({
      personId: id,
      amount: splitInputs[id]?.amount,
      shares: splitInputs[id]?.shares,
      percent: splitInputs[id]?.percent,
    }));
    const splits = buildSplits(splitMethod, amount, splitInputArray);
    addExpense({
      description,
      amount,
      category,
      paidById,
      participantIds: ids,
      groupId,
      splitMethod,
      splits,
    });
    router.back();
  };

  const resetSplitInputs = () => {
    const newInputs: Record<string, { amount?: number; shares?: number; percent?: number }> = {};
    participantList.forEach((id) => {
      if (splitMethod === 'exact') newInputs[id] = { amount: 0 };
      else if (splitMethod === 'shares') newInputs[id] = { shares: 1 };
      else if (splitMethod === 'percent') newInputs[id] = { percent: 0 };
    });
    // Default: payer gets the remainder for exact/percent, or first participant
    if (splitMethod === 'exact' && participantList.length) {
      newInputs[paidById] = { amount: amount };
    } else if (splitMethod === 'percent' && participantList.length) {
      newInputs[participantList[0]] = { percent: 100 };
    }
    setSplitInputs(newInputs);
  };

  // Reset split inputs when method or participants change
  const splitKey = `${splitMethod}-${participantList.sort().join(',')}`;
  const [, forceUpdate] = useState(splitKey);

  return (
    <Screen style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: spacing.xxxl }}
          keyboardShouldPersistTaps="handled"
        >
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

          <Text style={styles.label}>Split method</Text>
          <View style={styles.chips}>
            {(['equal', 'exact', 'shares', 'percent'] as SplitMethod[]).map((m) => (
              <Pressable
                key={m}
                onPress={() => {
                  setSplitMethod(m);
                  // Force reset of split inputs
                  setTimeout(() => forceUpdate((k) => k + '-reset'), 0);
                }}
                style={[
                  styles.chip,
                  splitMethod === m && styles.chipActive,
                ]}>
                <Text
                  style={[
                    styles.chipText,
                    splitMethod === m && styles.chipTextActive,
                  ]}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Split between</Text>
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

          {splitMethod !== 'equal' && participantList.length > 0 && (
            <View style={styles.splitInputs}>
              <Text style={styles.label}>
                {splitMethod === 'exact' && 'Exact amounts'}
                {splitMethod === 'shares' && 'Shares (e.g., 2, 1, 1)'}
                {splitMethod === 'percent' && 'Percentages (must total 100%)'}
              </Text>
              {participantList.map((id) => {
                const person = state.people.find((p) => p.id === id);
                const input = splitInputs[id] ?? {};
                return (
                  <View key={id} style={styles.splitRow}>
                    <Text style={styles.splitName}>{person?.isYou ? 'You' : person?.name}</Text>
                    <Field
                      style={styles.splitField}
                      keyboardType={splitMethod === 'exact' ? 'decimal-pad' : 'numeric'}
                      placeholder={splitMethod === 'exact' ? '0.00' : splitMethod === 'shares' ? 'shares' : '%'}
                      value={
                        splitMethod === 'exact'
                          ? (input.amount ?? '').toString()
                          : splitMethod === 'shares'
                          ? (input.shares ?? '').toString()
                          : (input.percent ?? '').toString()
                      }
                      onChangeText={(text) => {
                        const num = parseFloat(text) || 0;
                        updateSplitInput(
                          id,
                          splitMethod === 'exact' ? 'amount' : splitMethod === 'shares' ? 'shares' : 'percent',
                          num,
                        );
                      }}
                    />
                    {splitMethod === 'percent' && <Text style={styles.percentSign}>%</Text>}
                  </View>
                );
              })}
              {getSplitError() && (
                <Text style={styles.splitError}>{getSplitError()}</Text>
              )}
            </View>
          )}

          <Button
            label="Save expense"
            disabled={!canSave}
            onPress={onSave}
            style={{ marginTop: spacing.xl }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.inkMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
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
  splitInputs: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  splitName: {
    width: 80,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
  },
  splitField: {
    flex: 1,
    maxWidth: 100,
  },
  percentSign: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.inkMuted,
    marginRight: spacing.sm,
  },
  splitError: {
    marginTop: spacing.sm,
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.destructive,
  },
});"
