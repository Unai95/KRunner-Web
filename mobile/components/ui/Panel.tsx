import { StyleSheet, Text, View } from 'react-native';
import type { ThemeColors } from '../../constants/colors';

interface PanelProps {
  title: string;
  icon?: React.ComponentType<{ size: number; color: string }>;
  accent?: boolean;
  noPadding?: boolean;
  children: React.ReactNode;
  colors: ThemeColors;
}

export function Panel({ title, icon: Icon, accent, noPadding, children, colors }: PanelProps) {
  const headerColor = accent ? colors.accent : colors.muted;

  return (
    <View style={[styles.panel, { backgroundColor: colors.panel, borderColor: colors.border }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        {Icon ? <Icon size={13} color={headerColor} /> : null}
        <Text style={[styles.title, { color: headerColor }]}>{title}</Text>
      </View>
      <View style={noPadding ? styles.bodyNoPadding : styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  body: {
    padding: 12,
  },
  bodyNoPadding: {},
});
