import { StyleSheet, Text, View } from 'react-native';
import type { ThemeColors } from '../../constants/colors';

type Tone = 'success' | 'warning' | 'error' | 'neutral';

interface StatusPillProps {
  label: string;
  tone?: Tone;
  colors: ThemeColors;
}

export function StatusPill({ label, tone = 'neutral', colors }: StatusPillProps) {
  const fg =
    tone === 'success' ? colors.success :
    tone === 'warning' ? colors.warning :
    tone === 'error' ? colors.error :
    colors.muted;

  const bg =
    tone === 'success' ? `${colors.success}22` :
    tone === 'warning' ? `${colors.warning}22` :
    tone === 'error' ? `${colors.error}22` :
    colors.panel2;

  return (
    <View style={[styles.pill, { backgroundColor: bg, borderColor: `${fg}44` }]}>
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
