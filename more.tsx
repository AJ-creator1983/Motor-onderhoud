import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../src/theme';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  path: '/motorcycle/list' | '/parts' | '/documents' | '/settings';
}

const ITEMS: MenuItem[] = [
  { icon: 'bicycle-outline', label: 'Motorcycles', path: '/motorcycle/list' },
  { icon: 'file-tray-stacked-outline', label: 'Parts garage', path: '/parts' },
  { icon: 'document-text-outline', label: 'Documents', path: '/documents' },
  { icon: 'settings-outline', label: 'Settings', path: '/settings' },
];

export default function MoreScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[typography.h1, { marginBottom: spacing.lg }]}>More</Text>
        <View style={styles.list}>
          {ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.path}
              style={[styles.row, index < ITEMS.length - 1 && styles.rowBorder]}
              onPress={() => router.push(item.path)}
              activeOpacity={0.7}
            >
              <Ionicons name={item.icon} size={20} color={colors.textSecondary} />
              <Text style={[typography.body, { flex: 1, marginLeft: spacing.md }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.md },
  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
