import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Terminal } from 'lucide-react-native';
import type { ThemeColors } from '../constants/colors';
import { PreBlock } from './ui/PreBlock';
import { ResultBadge } from './ui/ResultBadge';

interface Issue {
  label: string;
  hint?: string;
}

interface OutputBoxProps {
  running: boolean;
  hasRun: boolean;
  stdout: string;
  stderr: string;
  compileError: string;
  exitCode: number | null;
  match: boolean | null;
  issue: Issue | null;
  expected: string;
  colors: ThemeColors;
}

export function OutputBox({ running, hasRun, stdout, stderr, compileError, exitCode, match, issue, expected, colors }: OutputBoxProps) {
  if (running) {
    return (
      <View style={styles.muted}>
        <ActivityIndicator size={14} color={colors.warning} />
        <Text style={[styles.mutedText, { color: colors.muted }]}>Compilando y ejecutando...</Text>
      </View>
    );
  }

  if (!hasRun) {
    return (
      <View style={styles.muted}>
        <Text style={[styles.mutedText, { color: colors.muted }]}>Pulsa Ejecutar para ver el resultado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.box}>
      {match !== null && <ResultBadge passed={match} colors={colors} />}
      {exitCode !== null && (
        <View style={[styles.exitCode, { backgroundColor: exitCode === 0 ? `${colors.success}22` : `${colors.error}22`, borderColor: exitCode === 0 ? `${colors.success}44` : `${colors.error}44` }]}>
          <Text style={[styles.exitCodeText, { color: exitCode === 0 ? colors.success : colors.error }]}>EXIT {exitCode}</Text>
        </View>
      )}
      {issue && (
        <>
          <View style={[styles.noticeBg, { backgroundColor: `${colors.error}11`, borderColor: `${colors.error}33` }]}>
            <Terminal size={13} color={colors.error} />
            <Text style={[styles.noticeText, { color: colors.error }]}>{issue.label}</Text>
          </View>
          {issue.hint && (
            <View style={[styles.noticeBg, { backgroundColor: `${colors.warning}11`, borderColor: `${colors.warning}33` }]}>
              <Text style={[styles.noticeText, { color: colors.muted }]}>{issue.hint}</Text>
            </View>
          )}
        </>
      )}
      {compileError && <PreBlock title="Error de compilacion" tone="error" value={compileError} colors={colors} />}
      {stdout ? <PreBlock title="stdout" value={stdout} colors={colors} /> : null}
      {stderr ? <PreBlock title="stderr" tone="error" value={stderr} colors={colors} /> : null}
      {!stdout && !stderr && !compileError && (
        <View style={[styles.noticeBg, { backgroundColor: colors.panel2, borderColor: colors.border }]}>
          <Terminal size={13} color={colors.muted} />
          <Text style={[styles.noticeText, { color: colors.muted }]}>
            El programa termino bien, pero no imprimio nada.{expected ? ' Hay una salida esperada configurada.' : ''}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  muted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  mutedText: {
    fontSize: 13,
  },
  box: {
    gap: 10,
  },
  exitCode: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 5,
    borderWidth: 1,
  },
  exitCodeText: {
    fontSize: 11,
    fontFamily: 'JetBrainsMono',
    fontWeight: '700',
  },
  noticeBg: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    padding: 10,
    borderRadius: 7,
    borderWidth: 1,
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
});
