import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing } from '../../src/theme';
import { ThemedButton } from '../../src/components/ui';
import { FormField, DateField } from '../../src/components/forms';
import { useApp } from '../../src/context/AppContext';
import { createMotorcycle, getMotorcycleById, updateMotorcycle } from '../../src/database/motorcycleRepository';
import { validateMotorcycleForm } from '../../src/utils/validation';

export default function MotorcycleFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { refreshMotorcycles, setActiveMotorcycle } = useApp();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [engineSize, setEngineSize] = useState('');
  const [currentMileage, setCurrentMileage] = useState('');
  const [name, setName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState<string | null>(null);
  const [purchaseMileage, setPurchaseMileage] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    (async () => {
      const moto = await getMotorcycleById(id);
      if (moto) {
        setMake(moto.make);
        setModel(moto.model);
        setYear(moto.year != null ? String(moto.year) : '');
        setEngineSize(moto.engineSize != null ? String(moto.engineSize) : '');
        setCurrentMileage(String(moto.currentMileage));
        setName(moto.name ?? '');
        setPurchaseDate(moto.purchaseDate);
        setPurchaseMileage(moto.purchaseMileage != null ? String(moto.purchaseMileage) : '');
        setNotes(moto.notes ?? '');
      }
      setLoading(false);
    })();
  }, [id]);

  const handleSave = async () => {
    const result = validateMotorcycleForm({ make, model, year, engineSize, currentMileage, name, purchaseMileage });
    setErrors(result.errors);
    if (!result.valid) return;

    setSaving(true);
    try {
      const input = {
        make: make.trim(),
        model: model.trim(),
        year: year.trim() ? parseInt(year, 10) : null,
        engineSize: engineSize.trim() ? parseInt(engineSize, 10) : null,
        currentMileage: parseInt(currentMileage, 10),
        name: name.trim() || null,
        purchaseDate,
        purchaseMileage: purchaseMileage.trim() ? parseInt(purchaseMileage, 10) : null,
        notes: notes.trim() || null,
        photoUri: null,
      };

      if (isEditMode && id) {
        await updateMotorcycle(id, input);
        await refreshMotorcycles();
      } else {
        const created = await createMotorcycle(input);
        await refreshMotorcycles();
        await setActiveMotorcycle(created.id);
      }

      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert('Something went wrong', 'The motorcycle could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.screen} />;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <FormField label="Make" value={make} onChangeText={setMake} placeholder="e.g. Yamaha" error={errors.make} required />
        <FormField
          label="Model"
          value={model}
          onChangeText={setModel}
          placeholder="e.g. FZS1000 Fazer"
          error={errors.model}
          required
        />
        <FormField label="Year" value={year} onChangeText={setYear} keyboardType="numeric" placeholder="e.g. 2005" error={errors.year} />
        <FormField
          label="Engine size"
          value={engineSize}
          onChangeText={setEngineSize}
          keyboardType="numeric"
          placeholder="e.g. 998"
          error={errors.engineSize}
        />
        <FormField
          label="Current mileage"
          value={currentMileage}
          onChangeText={setCurrentMileage}
          keyboardType="numeric"
          placeholder="e.g. 64000"
          error={errors.currentMileage}
          required
        />
        <FormField
          label="Registration / name"
          value={name}
          onChangeText={setName}
          placeholder="Optional nickname or plate"
        />
        <DateField label="Purchase date" value={purchaseDate} onChange={setPurchaseDate} maximumDate={new Date()} />
        <FormField
          label="Purchase mileage"
          value={purchaseMileage}
          onChangeText={setPurchaseMileage}
          keyboardType="numeric"
          placeholder="e.g. 42000"
          error={errors.purchaseMileage}
        />
        <FormField label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Optional notes" />

        <View style={{ marginTop: spacing.lg }}>
          <ThemedButton
            title={isEditMode ? 'Save changes' : 'Add Motorcycle'}
            onPress={handleSave}
            loading={saving}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },
});
