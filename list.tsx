import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { colors, radius, spacing, typography } from '../../src/theme';
import { ThemedButton } from '../../src/components/ui';
import { formatMileage } from '../../src/utils/formatters';

export default function MotorcycleListScreen() {
  const router = useRouter();
  const { motorcycles, activeMotorcycle, refreshMotorcycles, setActiveMotorcycle } = useApp();

  useFocusEffect(
    useCallback(() => {
      refreshMotorcycles();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedButton
          title="Add Motorcycle"
          icon="add-circle-outline"
          onPress={() => router.push('/motorcycle/form')}
        />

        <View style={{ height: spacing.lg }} />

        {motorcycles.map((moto) => {
          const isActive = activeMotorcycle?.id === moto.id;
          return (
            <View key={moto.id} style={styles.row}>
              {/* Tapping the main area makes this the active motorcycle and returns to the dashboard */}
              <TouchableOpacity
                style={styles.rowMain}
                activeOpacity={0.7}
                onPress={async () => {
                  await setActiveMotorcycle(moto.id);
                  router.back();
                }}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name="bicycle-outline" size={20} color={colors.textSecondary} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={typography.bodyBold}>
                    {moto.make} {moto.model}
                  </Text>
                  <Text style={[typography.caption, { marginTop: 2 }]}>{formatMileage(moto.currentMileage)}</Text>
                </View>
                {isActive && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.statusOk} style={{ marginRight: spacing.xs }} />
                )}
              </TouchableOpacity>

              {/* Separate tap target: view/edit this motorcycle without changing which one is active */}
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push({ pathname: '/motorcycle/[id]', params: { id: moto.id } })}
              >
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
