import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import type { ThemeColors } from '../constants/colors';
import { normalize } from '../lib/runnerUtils.js';

type Status = 'idle' | 'running' | 'passed' | 'failed';

interface Test {
  id: string;
  name: string;
  expected: string;
}

interface Result {
  systemError?: string;
  compile?: { code: number };
  run?: { code: number; stdout: string };
}

interface TestCaseTabsProps {
  tests: Test[];
  results: Record<string, Result | null | undefined>;
  activeId: string | undefined;
  onSelect: (id: string) => void;
  colors: ThemeColors;
}

function statusFor(test: Test, results: Record<string, Result | null | undefined>): Status {
  const result = results[test.id];
  if (result === null) return 'running';
  if (!result) return 'idle';
  if (result.systemError) return 'failed';
  const compileFailed = result.compile && result.compile.code !== 0;
  const code = typeof result.run?.code === 'number' ? result.run.code : null;
  return !compileFailed && code === 0 && normalize(result.run?.stdout ?? '') === normalize(test.expected)
    ? 'passed'
    : 'failed';
}

export function TestCaseTabs({ tests, results, activeId, onSelect, colors }: TestCaseTabsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.row}>
      {tests.map((test) => {
        const status = statusFor(test, results);
        const isActive = activeId === test.id;
        const iconColor =
          status === 'passed' ? colors.success :
          status === 'failed' ? colors.error :
          colors.muted;
        const borderColor = isActive
          ? (status === 'passed' ? colors.success : status === 'failed' ? colors.error : colors.accent)
          : colors.border;

        return (
          <Pressable
            key={test.id}
            onPress={() => onSelect(test.id)}
            style={[styles.tab, { backgroundColor: isActive ? colors.panel2 : colors.panel, borderColor }]}
          >
            {status === 'running' ? (
              <ActivityIndicator size={12} color={colors.warning} />
            ) : status === 'passed' ? (
              <Check size={12} color={colors.success} />
            ) : status === 'failed' ? (
              <X size={12} color={colors.error} />
            ) : null}
            <Text style={[styles.label, { color: isActive ? colors.text : colors.muted }]}>{test.name}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 2,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 7,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});
