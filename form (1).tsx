import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../src/theme';
import { Card, SegmentedControl, ThemedButton } from '../../src/components/ui';
import { FormField, DateField } from '../../src/components/forms';
import { useApp } from '../../src/context/AppContext';
import {
  createCustomMaintenanceType,
  createMaintenanceRecord,
  getMaintenanceRecordById,
  getMaintenanceTypes,
  updateMaintenanceRecord,
} from '../../src/database/maintenanceRepository';
import { getMotorcycleById, updateMotorcycleMileage } from '../../src/database/motorcycleRepository';
import { MaintenanceLocation, MaintenanceType } from '../../src/types';
import { validateCustomTypeName, validateMaintenanceForm } from '../../src/utils/validation';
import { todayIso } from '../../src/utils/calculations';

export default function MaintenanceFormScreen() {
  const { motorcycleId, recordId } = useLocalSearchParams<{ motorcycleId: string; recordId?: string }>();
  const router = useRouter();
  const { refreshMotorcycles } = useApp();
  const isEditMode = !!recordId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [types, setTypes] = useState<MaintenanceType[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [motorcycleCurrentMileage, setMotorcycleCurrentMileage] = useState<number>(0);

  const [selectedType, setSelectedType] = useState<MaintenanceType | null>(null);
  const [typeName, setTypeName] = useState('');
  const [date, setDate] = useState(todayIso());
  const [mileage, setMileage] = useState('');
  const [cost, setCost] = useState('');
  const [partsUsed, setPartsUsed] = useState('');
  const [brand, setBrand] = useState('');
  const [location, setLocation] = useState<MaintenanceLocation>('diy');
  const [notes, setNotes] = useState('');
  const [nextIntervalKm, setNextIntervalKm] = useState('');
  const [nextIntervalMonths, setNextIntervalMonths] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const [typeList, moto] = await Promise.all([getMaintenanceTypes(), getMotorcycleById(motorcycleId)]);
      setTypes(typeList);
      if (moto) setMotorcycleCurrentMileage(moto.currentMileage);

      if (recordId) {
        const record = await getMaintenanceRecordById(recordId);
        if (record) {
          setTypeName(record.typeName);
          setSelectedType(typeList.find((t) => t.id === record.typeId) ?? null);
          setDate(record.date);
          setMileage(String(record.mileage));
          setCost(record.cost != null ? String(record.cost) : '');
          setPartsUsed(record.partsUsed ?? '');
          setBrand(record.brand ?? '');
          setLocation(record.location ?? 'diy');
          setNotes(record.notes ?? '');
          setNextIntervalKm(record.nextIntervalKm != null ? String(record.nextIntervalKm) : '');
          setNextIntervalMonths(record.nextIntervalMonths != null ? String(record.nextIntervalMonths) : '');
        }
      } else if (moto) {
        setMileage(String(moto.currentMileage));
      }
      setLoading(false);
    })();
  }, [motorcycleId, recordId]);

  const handleSelectType = useCallback((type: MaintenanceType) => {
    setSelectedType(type);
    setTypeName(type.name);
    setNextIntervalKm(type.defaultIntervalKm != null ? String(type.defaultIntervalKm) : '');
    setNextIntervalMonths(type.defaultIntervalMonths != null ? String(type.defaultIntervalMonths) : '');
    setPickerOpen(false);
  }, []);

  const handleCreateCustomType = useCallback(
    async (name: string) => {
      const error = validateCustomTypeName(name, types.map((t) => t.name));
      if (error) {
        Alert.alert('Cannot add type', error);
        return;
      }
      const created = await createCustomMaintenanceType(name, null, null);
      setTypes((prev) => [...prev, created]);
      handleSelectType(created);
    },
    [types, handleSelectType]
  );

  const handleSave = async () => {
    const result = validateMaintenanceForm({
      typeName,
      mileage,
      cost,
      nextIntervalKm,
      nextIntervalMonths,
    });
    setErrors(result.errors);
    if (!result.valid) return;

    setSaving(true);
    try {
      const parsedMileage = parseInt(mileage, 10);
      const input = {
        motorcycleId,
        typeId: selectedType?.id ?? null,
        typeName: typeName.trim(),
        date,
        mileage: parsedMileage,
        cost: cost.trim() ? parseFloat(cost.replace(',', '.')) : null,
        partsUsed: partsUsed.trim() || null,
        brand: brand.trim() || null,
        location,
        notes: notes.trim() || null,
        nextIntervalKm: nextIntervalKm.trim() ? parseInt(nextIntervalKm, 10) : null,
        nextIntervalMonths: nextIntervalMonths.trim() ? parseInt(nextIntervalMonths, 10) : null,
      };

      if (isEditMode && recordId) {
        await updateMaintenanceRecord(recordId, input);
      } else {
        await createMaintenanceRecord(input);
      }

      if (parsedMileage > motorcycleCurrentMileage) {
        await updateMotorcycleMileage(motorcycleId, parsedMileage);
        await refreshMotorcycles();
      }

      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert('Something went wrong', 'The record could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.screen} />;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>
          Type<Text style={{ color: colors.primary }}> *</Text>
        </Text>
        <TouchableOpacity style={styles.typeSelector} onPress={() => setPickerOpen(true)} activeOpacity={0.7}>
          <Text style={[typography.body, { color: typeName ? colors.text : colors.textMuted }]}>
            {typeName || 'Choose a maintenance type'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
        </TouchableOpacity>
        {!!errors.typeName && <Text style={styles.errorText}>{errors.typeName}</Text>}

        <DateField label="Date" value={date} onChange={setDate} maximumDate={new Date()} required />

        <FormField
          label="Mileage"
          value={mileage}
          onChangeText={setMileage}
          keyboardType="numeric"
          placeholder="e.g. 64000"
          error={errors.mileage}
          required
        />

        <FormField
          label="Cost"
          value={cost}
          onChangeText={setCost}
          keyboardType="decimal-pad"
          placeholder="0,00"
          prefix="€"
          error={errors.cost}
        />

        <FormField label="Parts used" value={partsUsed} onChangeText={setPartsUsed} placeholder="e.g. Oil + filter" />
        <FormField label="Brand" value={brand} onChangeText={setBrand} placeholder="e.g. Motul 5100" />

        <Text style={styles.label}>Location</Text>
        <View style={{ marginBottom: spacing.md }}>
          <SegmentedControl
            value={location}
            onChange={setLocation}
            options={[
              { value: 'diy', label: 'DIY' },
              { value: 'workshop', label: 'Workshop' },
            ]}
          />
        </View>

        <FormField label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Optional notes" />

        <Card style={{ marginTop: spacing.sm }}>
          <Text style={[typography.h3, { marginBottom: spacing.xs }]}>Next service reminder</Text>
          <Text style={[typography.caption, { marginBottom: spacing.md }]}>
            Leave blank if this item is condition-based rather than on a fixed interval.
          </Text>
          <FormField
            label="Next interval (km)"
            value={nextIntervalKm}
            onChangeText={setNextIntervalKm}
            keyboardType="numeric"
            placeholder="e.g. 10000"
            error={errors.nextIntervalKm}
          />
          <FormField
            label="Next interval (months)"
            value={nextIntervalMonths}
            onChangeText={setNextIntervalMonths}
            keyboardType="numeric"
            placeholder="e.g. 24"
            error={errors.nextIntervalMonths}
          />
        </Card>

        <View style={{ marginTop: spacing.lg }}>
          <ThemedButton title={isEditMode ? 'Save changes' : 'Add Maintenance'} onPress={handleSave} loading={saving} />
        </View>
      </ScrollView>

      <TypePickerModal
        visible={pickerOpen}
        types={types}
        onSelect={handleSelectType}
        onCreateCustom={handleCreateCustomType}
        onClose={() => setPickerOpen(false)}
      />
    </View>
  );
}

// -------------------------------------------------------- TypePickerModal --

function TypePickerModal({
  visible,
  types,
  onSelect,
  onCreateCustom,
  onClose,
}: {
  visible: boolean;
  types: MaintenanceType[];
  onSelect: (type: MaintenanceType) => void;
  onCreateCustom: (name: string) => void;
  onClose: () => void;
}) {
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');

  useEffect(() => {
    if (!visible) {
      setCustomMode(false);
      setCustomName('');
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.pickerCard}>
          <View style={styles.pickerHeader}>
            <Text style={typography.h2}>{customMode ? 'New maintenance type' : 'Maintenance type'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {customMode ? (
            <View>
              <FormField
                label="Name"
                value={customName}
                onChangeText={setCustomName}
                placeholder="e.g. Fork oil"
              />
              <ThemedButton
                title="Add type"
                onPress={() => {
                  if (customName.trim()) onCreateCustom(customName.trim());
                }}
              />
            </View>
          ) : (
            <ScrollView style={{ maxHeight: 380 }}>
              {types.map((type) => (
                <TouchableOpacity key={type.id} style={styles.pickerRow} onPress={() => onSelect(type)}>
                  <Ionicons name={type.icon as any} size={18} color={colors.textSecondary} />
                  <Text style={[typography.body, { marginLeft: spacing.md, flex: 1 }]}>{type.name}</Text>
                  {type.isCustom && (
                    <Text style={[typography.caption, { color: colors.textMuted }]}>Custom</Text>
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.pickerRow} onPress={() => setCustomMode(true)}>
                <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                <Text style={[typography.bodyBold, { marginLeft: spacing.md, color: colors.primary }]}>
                  Add custom type
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  typeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  pickerCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
