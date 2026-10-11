import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { colors, radius, spacing, typography } from '../../src/theme';
import { Card, EmptyState, SegmentedControl, StatusBadge, ThemedButton } from '../../src/components/ui';
import MaintenanceListItem from '../../src/components/MaintenanceListItem';
import { getMaintenanceRecords, getUpcomingMaintenanceForMotorcycle } from '../../src/database/maintenanceRepository';
import { MaintenanceRecord, UpcomingMaintenanceItem } from '../../src/types';
import { formatRemaining } from '../../src/utils/formatters';

type Mode = 'upcoming' | 'history';

export default function MaintenanceListScreen() {
  const router = useRouter();
  const { activeMotorcycle } = useApp();

  const [mode, setMode] = useState<Mode>('upcoming');
  const [upcoming, setUpcoming] = useState<UpcomingMaintenanceItem[]>([]);
  const [history, setHistory] = useState<MaintenanceRecord[]>([]);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!activeMotorcycle) {
      setUpcoming([]);
      setHistory([]);
      return;
    }
    const [upcomingItems, records] = await Promise.all([
      getUpcomingMaintenanceForMotorcycle(activeMotorcycle),
      getMaintenanceRecords(activeMotorcycle.id),
    ]);
    setUpcoming(upcomingItems);
    setHistory(records);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMotorcycle?.id, activeMotorcycle?.currentMileage]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const typesInHistory = useMemo(
    () => Array.from(new Set(history.map((r) => r.typeName))).sort(),
    [history]
  );

  const filteredHistory = typeFilter ? history.filter((r) => r.typeName === typeFilter) : history;

  if (!activeMotorcycle) {
    return (
      <View style={styles.screen}>
        <EmptyState
          icon="construct-outline"
          title="No motorcycle yet"
          message="Add a motorcycle first, then log its maintenance here."
          actionLabel="Add motorcycle"
          onAction={() => router.push('/motorcycle/form')}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'history', label: 'History' },
          ]}
        />
        <View style={{ marginTop: spacing.md }}>
          <ThemedButton
            title="Add Maintenance"
            icon="add-circle-outline"
            onPress={() =>
              router.push({ pathname: '/maintenance/form', params: { motorcycleId: activeMotorcycle.id } })
            }
          />
        </View>
      </View>

      {mode === 'upcoming' ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {upcoming.length === 0 ? (
            <Card>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                Nothing tracked yet. Log a maintenance record with a next interval (km or months) to
                see it show up here.
              </Text>
            </Card>
          ) : (
            upcoming.map((item) => (
              <Card key={item.typeId ?? item.typeName} style={styles.upcomingRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name={item.icon as any} size={16} color={colors.textSecondary} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={typography.bodyBold}>{item.typeName}</Text>
                  {!item.hasRecord && (
                    <Text style={[typography.caption, { color: colors.textMuted }]}>
                      Estimated from purchase date/mileage
                    </Text>
                  )}
                </View>
                <StatusBadge
                  status={item.status}
                  label={formatRemaining(item.kmRemaining, item.daysRemaining)}
                />
              </Card>
            ))
          )}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          {typesInHistory.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              <FilterChip label="All" active={typeFilter === null} onPress={() => setTypeFilter(null)} />
              {typesInHistory.map((t) => (
                <FilterChip key={t} label={t} active={typeFilter === t} onPress={() => setTypeFilter(t)} />
              ))}
            </ScrollView>
          )}
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {filteredHistory.length === 0 ? (
              <Card>
                <Text style={[typography.body, { color: colors.textSecondary }]}>
                  No maintenance logged yet.
                </Text>
              </Card>
            ) : (
              filteredHistory.map((r) => (
                <MaintenanceListItem
                  key={r.id}
                  record={r}
                  onPress={() => router.push({ pathname: '/maintenance/[id]', params: { id: r.id } })}
                />
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.chip, active && styles.chipActive]} activeOpacity={0.8}>
      <Text style={[typography.caption, { color: active ? colors.onPrimary : colors.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.md, paddingBottom: 0 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
