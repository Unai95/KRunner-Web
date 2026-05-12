import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { ThemeColors } from '../../constants/colors';

interface FieldProps {
  label: string;
  children?: React.ReactNode;
  colors: ThemeColors;
}

export function Field({ label, children, colors }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
