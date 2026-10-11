import React, { useCallback, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { colors, radius, spacing, typography } from '../../src/theme';
import { Card, EmptyState, StatusBadge, ThemedButton, statusColor } from '../../src/components/ui';
import MaintenanceListItem from '../../src/components/MaintenanceListItem';
import {
  getMaintenanceRecords,
  getUpcomingMaintenanceForMotorcycle,
} from '../../src/database/maintenanceRepository';
import { updateMotorcycleMileage } from '../../src/database/motorcycleRepository';
import { MaintenanceRecord, UpcomingMaintenanceItem } from '../../src/types';
import { formatMileage, formatRemaining } from '../../src/utils/formatters';
import { getOverallStatus } from '../../src/utils/calculations';

const UPCOMING_LIMIT = 4;
const RECENT_LIMIT = 3;

export default function DashboardScreen() {
  const router = useRouter();
  const { activeMotorcycle, refreshMotorcycles } = useApp();

  const [upcoming, setUpcoming] = useState<UpcomingMaintenanceItem[]>([]);
  const [recent, setRecent] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [mileageModalOpen, setMileageModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!activeMotorcycle) {
      setUpcoming([]);
      setRecent([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [upcomingItems, records] = await Promise.all([
      getUpcomingMaintenanceForMotorcycle(activeMotorcycle),
      getMaintenanceRecords(activeMotorcycle.id),
    ]);
    setUpcoming(upcomingItems);
    setRecent(records.slice(0, RECENT_LIMIT));
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMotorcycle?.id, activeMotorcycle?.currentMileage]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (!loading && !activeMotorcycle) {
    return (
      <View style={styles.screen}>
        <EmptyState
          icon="bicycle-outline"
          title="No motorcycle yet"
          message="Add your motorcycle to start tracking maintenance."
          actionLabel="Add motorcycle"
          onAction={() => router.push('/motorcycle/form')}
        />
      </View>
    );
  }

  if (!activeMotorcycle) {
    return <View style={styles.screen} />;
  }

  const overallStatus = getOverallStatus(upcoming);
  const topUpcoming = upcoming[0];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Instrument panel */}
        <View style={styles.panel}>
          <View style={[styles.panelAccent, { backgroundColor: statusColor(overallStatus) }]} />
          <Text style={styles.bikeName}>
            {activeMotorcycle.make.toUpperCase()} {activeMotorcycle.model.toUpperCase()}
          </Text>

          <TouchableOpacity onPress={() => setMileageModalOpen(true)} activeOpacity={0.7}>
            <View style={styles.mileageRow}>
              <Text style={typography.odometer}>{formatMileage(activeMotorcycle.currentMileage)}</Text>
              <Ionicons name="create-outline" size={18} color={colors.textMuted} style={{ marginLeft: spacing.sm }} />
            </View>
          </TouchableOpacity>

          <View style={styles.statusLine}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>MAINTENANCE STATUS</Text>
          </View>
          <StatusBadge status={overallStatus} size="large" />

          {topUpcoming && (
            <View style={styles.nextMaintenance}>
              <Text style={[typography.caption, { color: colors.textMuted }]}>NEXT MAINTENANCE</Text>
              <Text style={typography.bodyBold}>
                {topUpcoming.typeName} — {formatRemaining(topUpcoming.kmRemaining, topUpcoming.daysRemaining)}
              </Text>
            </View>
          )}
        </View>

        {/* Quick actions */}
        <View style={styles.actionsRow}>
          <View style={styles.actionButton}>
            <ThemedButton
              title="Add Maintenance"
              icon="add-circle-outline"
              onPress={() =>
                router.push({ pathname: '/maintenance/form', params: { motorcycleId: activeMotorcycle.id } })
              }
            />
          </View>
        </View>
        <View style={styles.actionsRowSecondary}>
          <View style={styles.actionButtonHalf}>
            <ThemedButton
              title="Add Fuel"
              icon="water-outline"
              variant="secondary"
              onPress={() => router.push('/fuel')}
            />
          </View>
          <View style={styles.actionButtonHalf}>
            <ThemedButton
              title="View Motorcycle"
              icon="bicycle-outline"
              variant="secondary"
              onPress={() => router.push({ pathname: '/motorcycle/[id]', params: { id: activeMotorcycle.id } })}
            />
          </View>
        </View>

        {/* Upcoming */}
        <Text style={styles.sectionLabel}>UPCOMING</Text>
        {upcoming.length === 0 ? (
          <Card style={{ marginBottom: spacing.md }}>
            <Text style={[typography.body, { color: colors.textSecondary }]}>
              Nothing tracked yet. Log a maintenance record with a next interval to see it here.
            </Text>
          </Card>
        ) : (
          upcoming.slice(0, UPCOMING_LIMIT).map((item) => (
            <Card key={item.typeId ?? item.typeName} style={styles.upcomingRow}>
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon as any} size={16} color={colors.textSecondary} />
              </View>
              <Text style={[typography.body, { flex: 1, marginLeft: spacing.md }]}>{item.typeName}</Text>
              <StatusBadge
                status={item.status}
                label={formatRemaining(item.kmRemaining, item.daysRemaining)}
              />
            </Card>
          ))
        )}

        {/* Recent */}
        <Text style={styles.sectionLabel}>RECENT</Text>
        {recent.length === 0 ? (
          <Card>
            <Text style={[typography.body, { color: colors.textSecondary }]}>
              No maintenance logged yet.
            </Text>
          </Card>
        ) : (
          recent.map((r) => (
            <MaintenanceListItem
              key={r.id}
              record={r}
              onPress={() => router.push({ pathname: '/maintenance/[id]', params: { id: r.id } })}
            />
          ))
        )}
      </ScrollView>

      <UpdateMileageModal
        visible={mileageModalOpen}
        currentMileage={activeMotorcycle.currentMileage}
        onClose={() => setMileageModalOpen(false)}
        onSave={async (newMileage) => {
          await updateMotorcycleMileage(activeMotorcycle.id, newMileage);
          await refreshMotorcycles();
          setMileageModalOpen(false);
          loadData();
        }}
      />
    </View>
  );
}

// ---------------------------------------------------- UpdateMileageModal --

function UpdateMileageModal({
  visible,
  currentMileage,
  onClose,
  onSave,
}: {
  visible: boolean;
  currentMileage: number;
  onClose: () => void;
  onSave: (mileage: number) => void;
}) {
  const [value, setValue] = useState(String(currentMileage));
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (visible) {
      setValue(String(currentMileage));
      setError(null);
    }
  }, [visible, currentMileage]);

  const handleSave = () => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 0) {
      setError('Enter a valid mileage');
      return;
    }
    onSave(parsed);
  };

  const isLower = !isNaN(parseInt(value, 10)) && parseInt(value, 10) < currentMileage;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={typography.h2}>Update mileage</Text>
          <View style={styles.modalInputRow}>
            <TextInput
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
              autoFocus
              style={styles.mileageInput}
              placeholderTextColor={colors.textMuted}
            />
          </View>
          {error && <Text style={[typography.caption, { color: colors.danger }]}>{error}</Text>}
          {!error && isLower && (
            <Text style={[typography.caption, { color: colors.statusSoon }]}>
              That's lower than the current reading — make sure that's correct.
            </Text>
          )}
          <View style={{ flexDirection: 'row', marginTop: spacing.lg }}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <ThemedButton title="Cancel" variant="secondary" onPress={onClose} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <ThemedButton title="Save" onPress={handleSave} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  panel: {
    backgroundColor: colors.surfaceHeader,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  panelAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  bikeName: {
    ...typography.h1,
    letterSpacing: 1,
  },
  mileageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  statusLine: {
    marginTop: spacing.lg,
  },
  nextMaintenance: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionsRow: {
    marginBottom: spacing.sm,
  },
  actionsRowSecondary: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  actionButton: {
    width: '100%',
  },
  actionButtonHalf: {
    flex: 1,
  },
  sectionLabel: {
    ...typography.sectionLabel,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  modalInputRow: {
    marginTop: spacing.md,
  },
  mileageInput: {
    ...typography.odometer,
    fontSize: 32,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
