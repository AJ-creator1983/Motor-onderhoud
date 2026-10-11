import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ComingSoon } from '../src/components/ui';
import { colors } from '../src/theme';

export default function PartsScreen() {
  return (
    <View style={styles.screen}>
      <ComingSoon
        icon="file-tray-stacked-outline"
        title="Parts Garage"
        message="Keep an inventory of spares — in stock, installed, or used. Coming in a future update."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
});
