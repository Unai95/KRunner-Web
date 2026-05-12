import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ThemeColors } from '../../constants/colors';

type Variant = 'ghost' | 'primary' | 'danger';

interface ButtonProps {
  children?: React.ReactNode;
  icon?: React.ComponentType<{ size: number; color: string }>;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  colors: ThemeColors;
}

export function Button({ children, icon: Icon, variant = 'ghost', disabled, loading, onPress, colors }: ButtonProps) {
  const bg =
    variant === 'primary' ? colors.accent :
    variant === 'danger' ? colors.error :
    colors.panel2;

  const fg =
    variant === 'primary' ? '#000' :
    variant === 'danger' ? '#fff' :
    colors.text;

  const borderColor =
    variant === 'ghost' ? colors.border : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderColor, opacity: disabled ? 0.45 : pressed ? 0.75 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator size={14} color={fg} />
      ) : Icon ? (
        <Icon size={14} color={fg} />
      ) : null}
      {children ? <Text style={[styles.label, { color: fg }]}>{children}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 7,
    borderWidth: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
});
