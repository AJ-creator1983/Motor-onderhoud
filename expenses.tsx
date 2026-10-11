import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ComingSoon } from '../../src/components/ui';
import { colors } from '../../src/theme';

export default function ExpensesScreen() {
  return (
    <View style={styles.screen}>
      <ComingSoon
        icon="wallet-outline"
        title="Expenses"
        message="See total maintenance, fuel, and ownership costs by category. Coming in the next update."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
});
