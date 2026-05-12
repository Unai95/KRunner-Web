import { StyleSheet, Text, View } from 'react-native';
import type { ThemeColors } from '../../constants/colors';

interface ResultBadgeProps {
  passed: boolean;
  colors: ThemeColors;
}

export function ResultBadge({ passed, colors }: ResultBadgeProps) {
  const color = passed ? colors.success : colors.error;

  return (
    <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: `${color}55` }]}>
      <Text style={[styles.label, { color }]}>{passed ? 'Coincide' : 'No coincide'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
