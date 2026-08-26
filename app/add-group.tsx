import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useStore } from '@/lib/store';

const EMOJIS = ['⌂', '≈', '◎', '△', '◇', '☆', '◍'];

export default function AddGroupScreen() {
  const router = useRouter();
  const { state, addGroup } = useStore();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [memberIds, setMemberIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Screen>
      <Field
        label="Group name"
        placeholder="Apartment, trip, dinner club…"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Icon</Text>
      <View style={styles.chips}>
        {EMOJIS.map((e) => (
          <Pressable
            key={e}
            onPress={() => setEmoji(e)}
            style={[styles.chip, emoji === e && styles.chipActive]}>
            <Text style={styles.emoji}>{e}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Members</Text>
      <Text style={styles.hint}>You are included automatically.</Text>
      <View style={styles.chips}>
        {state.people
          .filter((p) => !p.isYou)
          .map((p) => {
            const on = memberIds.has(p.id);
            return (
              <Pressable
                key={p.id}
                onPress={() => toggle(p.id)}
                style={[styles.chip, on && styles.chipActive]}>
                <Text style={[styles.chipText, on && styles.chipTextActive]}>
                  {p.name}
                </Text>
              </Pressable>
            );
          })}
      </View>

      <Button
        label="Create group"
        disabled={!name.trim()}
        onPress={() => {
          const group = addGroup(name, emoji, Array.from(memberIds));
          router.replace(`/group/${group.id}`);
        }}
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
  hint: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkFaint,
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
    minWidth: 44,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.brandSoft,
    borderColor: colors.brand,
  },
  chipText: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink },
  chipTextActive: { color: colors.brandDark, fontFamily: fonts.sansSemi },
  emoji: { fontSize: 18, color: colors.brand },
});
