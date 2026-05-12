import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ThemeColors } from '../../constants/colors';

interface TopBarProps {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  colors: ThemeColors;
}

export function TopBar({ title, subtitle, left, right, colors }: TopBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 8, backgroundColor: colors.topbarBg, borderBottomColor: colors.border }]}>
      <View style={styles.row}>
        <View style={styles.left}>
          {left}
          <View style={styles.titles}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>
            {subtitle ? <Text style={[styles.subtitle, { color: colors.muted }]} numberOfLines={1}>{subtitle}</Text> : null}
          </View>
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  titles: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
});
