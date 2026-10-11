import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, typography } from '../../src/theme';
import { Card, ThemedButton } from '../../src/components/ui';
import { deleteMaintenanceRecord, getMaintenanceRecordById } from '../../src/database/maintenanceRepository';
import { MaintenanceRecord } from '../../src/types';
import { formatCurrency, formatDate, formatMileage } from '../../src/utils/formatters';

export default function MaintenanceDetailScreen() {
  const { id: recordId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [record, setRecord] = useState<MaintenanceRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const r = await getMaintenanceRecordById(recordId);
    setRecord(r);
    setLoading(false);
  }, [recordId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleDelete = () => {
    if (!record) return;
    Alert.alert('Delete this record?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteMaintenanceRecord(record.id);
          router.back();
        },
      },
    ]);
  };

  if (loading) return <View style={styles.screen} />;
  if (!record) {
    return (
      <View style={styles.screen}>
        <Text style={[typography.body, { padding: spacing.md }]}>This record no longer exists.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={typography.h1}>{record.typeName}</Text>
        <Text style={[typography.caption, { marginTop: spacing.xs, marginBottom: spacing.lg }]}>
          {formatDate(record.date)} · {formatMileage(record.mileage)}
        </Text>

        <Card>
          <Row label="Cost" value={record.cost != null ? formatCurrency(record.cost) : '—'} />
          <Row label="Parts used" value={record.partsUsed ?? '—'} />
          <Row label="Brand" value={record.brand ?? '—'} />
          <Row
            label="Done by"
            value={record.location === 'diy' ? 'DIY' : record.location === 'workshop' ? 'Workshop' : '—'}
            last
          />
        </Card>

        {record.notes && (
          <Card style={{ marginTop: spacing.md }}>
            <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.xs }]}>
              NOTES
            </Text>
            <Text style={typography.body}>{record.notes}</Text>
          </Card>
        )}

        {(record.nextIntervalKm != null || record.nextIntervalMonths != null) && (
          <Card style={{ marginTop: spacing.md }}>
            <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.xs }]}>
              NEXT SERVICE REMINDER
            </Text>
            {record.nextIntervalKm != null && (
              <Text style={typography.body}>Every {formatMileage(record.nextIntervalKm)}</Text>
            )}
            {record.nextIntervalMonths != null && (
              <Text style={typography.body}>Every {record.nextIntervalMonths} months</Text>
            )}
          </Card>
        )}

        <View style={{ marginTop: spacing.xl }}>
          <ThemedButton
            title="Edit"
            variant="secondary"
            icon="create-outline"
            onPress={() =>
              router.push({
                pathname: '/maintenance/form',
                params: { motorcycleId: record.motorcycleId, recordId: record.id },
              })
            }
          />
          <View style={{ height: spacing.sm }} />
          <ThemedButton title="Delete record" variant="danger" icon="trash-outline" onPress={handleDelete} />
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
