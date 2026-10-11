import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { colors, spacing, typography } from '../../src/theme';
import { Card, ThemedButton } from '../../src/components/ui';
import { deleteMotorcycle, getMotorcycleById } from '../../src/database/motorcycleRepository';
import { getMaintenanceRecords, getTotalMaintenanceCost } from '../../src/database/maintenanceRepository';
import { Motorcycle } from '../../src/types';
import { formatCurrency, formatDate, formatMileage } from '../../src/utils/formatters';

export default function MotorcycleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { refreshMotorcycles } = useApp();

  const [motorcycle, setMotorcycle] = useState<Motorcycle | null>(null);
  const [recordCount, setRecordCount] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [moto, records, total] = await Promise.all([
      getMotorcycleById(id),
      getMaintenanceRecords(id),
      getTotalMaintenanceCost(id),
    ]);
    setMotorcycle(moto);
    setRecordCount(records.length);
    setTotalCost(total);
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleDelete = () => {
    if (!motorcycle) return;
    Alert.alert(
      `Delete ${motorcycle.make} ${motorcycle.model}?`,
      'This will delete all of its maintenance history too. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteMotorcycle(motorcycle.id);
            await refreshMotorcycles();
            router.back();
          },
        },
      ]
    );
  };

  if (loading) return <View style={styles.screen} />;
  if (!motorcycle) {
    return (
      <View style={styles.screen}>
        <Text style={[typography.body, { padding: spacing.md }]}>This motorcycle no longer exists.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {motorcycle.isSample && (
          <View style={styles.sampleBanner}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              This is sample data — remove it any time from Settings.
            </Text>
          </View>
        )}

        <Text style={typography.h1}>
          {motorcycle.make} {motorcycle.model}
        </Text>
        {motorcycle.name && (
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
            {motorcycle.name}
          </Text>
        )}

        <Card style={{ marginTop: spacing.lg }}>
          <Row label="Make" value={motorcycle.make} />
          <Row label="Model" value={motorcycle.model} />
          <Row label="Year" value={motorcycle.year != null ? String(motorcycle.year) : '—'} />
          <Row label="Engine size" value={motorcycle.engineSize != null ? `${motorcycle.engineSize} cc` : '—'} />
          <Row label="Current mileage" value={formatMileage(motorcycle.currentMileage)} />
          <Row
            label="Purchase date"
            value={motorcycle.purchaseDate ? formatDate(motorcycle.purchaseDate) : '—'}
          />
          <Row
            label="Purchase mileage"
            value={motorcycle.purchaseMileage != null ? formatMileage(motorcycle.purchaseMileage) : '—'}
            last
          />
        </Card>

        {motorcycle.notes && (
          <Card style={{ marginTop: spacing.md }}>
            <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.xs }]}>
              NOTES
            </Text>
            <Text style={typography.body}>{motorcycle.notes}</Text>
          </Card>
        )}

        <Card style={{ marginTop: spacing.md }}>
          <Row label="Maintenance records" value={String(recordCount)} />
          <Row label="Total maintenance cost" value={formatCurrency(totalCost)} last />
        </Card>

        <View style={{ marginTop: spacing.xl }}>
          <ThemedButton
            title="Edit"
            variant="secondary"
            icon="create-outline"
            onPress={() => router.push({ pathname: '/motorcycle/form', params: { id: motorcycle.id } })}
          />
          <View style={{ height: spacing.sm }} />
          <ThemedButton title="Delete motorcycle" variant="danger" icon="trash-outline" onPress={handleDelete} />
        </View>
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
  sampleBanner: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
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
