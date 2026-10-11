import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ComingSoon } from '../src/components/ui';
import { colors } from '../src/theme';

export default function DocumentsScreen() {
  return (
    <View style={styles.screen}>
      <ComingSoon
        icon="document-text-outline"
        title="Documents"
        message="Attach invoices, receipts, and photos to maintenance records. Coming in a future update."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
});
