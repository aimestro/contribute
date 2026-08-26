import {
  Fraunces_600SemiBold,
  Fraunces_600SemiBold_Italic,
} from '@expo-google-fonts/fraunces';
import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { colors } from '@/constants/theme';
import { StoreProvider } from '@/lib/store';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.paper,
    card: colors.surface,
    text: colors.ink,
    border: colors.line,
    primary: colors.brand,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Fraunces_600SemiBold,
    Fraunces_600SemiBold_Italic,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <StoreProvider>
      <ThemeProvider value={navTheme}>
        <StatusBar style="dark" />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="group/[id]"
            options={{ title: 'Group', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="friend/[id]"
            options={{ title: 'Friend', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="expense/[id]"
            options={{ title: 'Expense', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="expense/new"
            options={{ presentation: 'modal', title: 'Add expense' }}
          />
          <Stack.Screen
            name="settle"
            options={{ presentation: 'modal', title: 'Settle up' }}
          />
          <Stack.Screen
            name="add-group"
            options={{ presentation: 'modal', title: 'New group' }}
          />
          <Stack.Screen
            name="add-friend"
            options={{ presentation: 'modal', title: 'Add friend' }}
          />
        </Stack>
      </ThemeProvider>
    </StoreProvider>
  );
}
