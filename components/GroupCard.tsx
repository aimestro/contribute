import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii, spacing } from '@/constants/theme';
import type { Group } from '@/lib/types';

type Props = {
  group: Group;
  subtitle: string;
};

export function GroupCard({ group, subtitle }: Props) {
  return (
    <Link href={`/group/${group.id}`} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View style={styles.badge}>
          <Text style={styles.emoji}>{group.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{group.name}</Text>
          <Text style={styles.sub}>{subtitle}</Text>
        </View>
        <Text style={styles.chev}>›</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.md,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  badge: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 22, color: colors.brand },
  name: {
    fontFamily: fonts.sansBold,
    fontSize: 16,
    color: colors.ink,
  },
  sub: {
    marginTop: 2,
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkMuted,
  },
  chev: {
    fontSize: 28,
    color: colors.inkFaint,
    marginTop: -4,
  },
});
