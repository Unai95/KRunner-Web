import { Pressable, StyleSheet } from 'react-native';
import type { ThemeColors } from '../../constants/colors';

interface IconActionProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  label?: string;
  danger?: boolean;
  onPress?: () => void;
  colors: ThemeColors;
}

export function IconAction({ icon: Icon, danger, onPress, colors }: IconActionProps) {
  const color = danger ? colors.error : colors.muted;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: danger ? `${colors.error}18` : colors.panel2, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <Icon size={15} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 32,
    height: 32,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
