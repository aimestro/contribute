import { Alert, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useStore } from '@/lib/store';

export default function AccountScreen() {
  const { you, state, resetDemo } = useStore();

  return (
    <Screen>
      <Text style={styles.brand}>Account</Text>

      <View style={styles.card}>
        <Avatar name={you.name} color={you.avatarColor} size={64} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{you.name}</Text>
          <Text style={styles.email}>{you.email}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{state.groups.length}</Text>
          <Text style={styles.statLabel}>groups</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{state.people.length - 1}</Text>
          <Text style={styles.statLabel}>friends</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{state.expenses.length}</Text>
          <Text style={styles.statLabel}>expenses</Text>
        </View>
      </View>

      <Text style={styles.section}>Pro-inspired extras</Text>
      <Text style={styles.copy}>
        Charts, receipt scan, multi-currency, and CSV export can plug into this
        same local store. This build ships core splitting, balances, and settle-up
        across iOS, Android, and web.
      </Text>

      <Button
        label="Reset demo data"
        variant="ghost"
        style={{ marginTop: spacing.xl }}
        onPress={() => {
          Alert.alert(
            'Reset demo?',
            'This replaces your local Contribute data with the sample household.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Reset', style: 'destructive', onPress: resetDemo },
            ],
          );
        }}
      />
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
    marginBottom: spacing.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  name: { fontFamily: fonts.sansBold, fontSize: 20, color: colors.ink },
  email: {
    marginTop: 4,
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkMuted,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.brandSoft,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.brand,
  },
  statLabel: {
    marginTop: 2,
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkMuted,
  },
  section: {
    marginTop: spacing.xxl,
    fontFamily: fonts.sansBold,
    fontSize: 16,
    color: colors.ink,
  },
  copy: {
    marginTop: spacing.sm,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkMuted,
  },
});
