import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ComingSoon } from '../../src/components/ui';
import { colors } from '../../src/theme';

export default function FuelScreen() {
  return (
    <View style={styles.screen}>
      <ComingSoon
        icon="water-outline"
        title="Fuel Log"
        message="Track fuel-ups, consumption, and cost per km. Coming in the next update."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
});
