import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useApp } from '../src/context/AppContext';
import { colors, spacing, typography } from '../src/theme';
import { Card, ThemedButton } from '../src/components/ui';
import { clearSampleData, hasSampleData } from '../src/database/motorcycleRepository';

export default function SettingsScreen() {
  const { refreshMotorcycles } = useApp();
  const [sampleDataPresent, setSampleDataPresent] = useState(false);
  const [clearing, setClearing] = useState(false);

  const checkSampleData = useCallback(async () => {
    setSampleDataPresent(await hasSampleData());
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkSampleData();
    }, [checkSampleData])
  );

  const handleClearSampleData = () => {
    Alert.alert(
      'Remove sample data?',
      'This deletes the demo motorcycle and its maintenance records. Your own data is never affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);
            await clearSampleData();
            await refreshMotorcycles();
            await checkSampleData();
            setClearing(false);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <Row label="App" value="MotoCare" />
          <Row label="Version" value="1.0.0 (Phase 1)" last />
        </Card>

        {sampleDataPresent && (
          <Card style={{ marginTop: spacing.md }}>
            <Text style={[typography.h3, { marginBottom: spacing.xs }]}>Sample data</Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.md }]}>
              MotoCare ships with one demo motorcycle so the app isn't empty on first launch. Remove it
              whenever you're ready to add your own.
            </Text>
            <ThemedButton
              title="Remove sample data"
              variant="danger"
              icon="trash-outline"
              onPress={handleClearSampleData}
              loading={clearing}
            />
          </Card>
        )}

        <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
          All data is stored locally on this device.
        </Text>
      </ScrollView>
    </View>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={[typography.body, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={typography.bodyBold}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
