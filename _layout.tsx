import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from '../src/context/AppContext';
import { colors, spacing, typography } from '../src/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <RootLayoutNav />
      </AppProvider>
    </SafeAreaProvider>
  );
}

function RootLayoutNav() {
  const { isReady, error } = useApp();

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={[typography.h2, { textAlign: 'center' }]}>Something went wrong</Text>
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }]}>
          {error}
        </Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="motorcycle/[id]" options={{ title: 'Motorcycle' }} />
      <Stack.Screen name="motorcycle/form" options={{ title: 'Motorcycle details' }} />
      <Stack.Screen name="motorcycle/list" options={{ title: 'My motorcycles' }} />
      <Stack.Screen name="maintenance/[id]" options={{ title: 'Maintenance record' }} />
      <Stack.Screen name="maintenance/form" options={{ title: 'Maintenance' }} />
      <Stack.Screen name="parts" options={{ title: 'Parts garage' }} />
      <Stack.Screen name="documents" options={{ title: 'Documents' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
});
