import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ThemeColors } from '../../constants/colors';

type Tone = 'normal' | 'error';

interface PreBlockProps {
  title: string;
  value: string;
  tone?: Tone;
  colors: ThemeColors;
}

export function PreBlock({ title, value, tone = 'normal', colors }: PreBlockProps) {
  const labelColor = tone === 'error' ? colors.error : colors.muted;
  const bgColor = tone === 'error' ? `${colors.error}11` : colors.panel2;
  const borderColor = tone === 'error' ? `${colors.error}33` : colors.border;

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderColor }]}>
      <Text style={[styles.label, { color: labelColor }]}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Text style={[styles.code, { color: colors.text }]} selectable>{value}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 7,
    borderWidth: 1,
    padding: 10,
    gap: 5,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  code: {
    fontFamily: 'JetBrainsMono',
    fontSize: 12,
    lineHeight: 18,
  },
});
