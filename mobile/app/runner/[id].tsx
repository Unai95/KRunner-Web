import { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, BookOpen, Check, FileCode2, Play, RotateCcw, Terminal, X } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useThemeContext } from '../../context/ThemeContext';
import { useExercisesContext } from '../../context/ExercisesContext';
import { useSettings } from '../../hooks/useSettings';
import { api } from '../../lib/api';
import { classifyRunIssue, systemFailure } from '../../lib/errorClassifier.js';
import { DEFAULT_BODY_CODE, DEFAULT_MAIN_CODE, normalizeExercise } from '../../lib/exercises.js';
import { didPass, hasMainFunction, normalize, progressFromResults, withAutoMain } from '../../lib/runnerUtils.js';
import { KotlinEditor } from '../../components/KotlinEditor';
import { OutputBox } from '../../components/OutputBox';
import { TestCaseTabs } from '../../components/TestCaseTabs';
import { Button } from '../../components/ui/Button';
import { Panel } from '../../components/ui/Panel';
import { StatusPill } from '../../components/ui/StatusPill';
import { TopBar } from '../../components/ui/TopBar';

type Result = {
  systemError?: string;
  compile?: { code: number; stderr?: string; output?: string };
  run?: { code: number; stdout: string; stderr: string };
};

export default function RunnerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useThemeContext();
  const c = colors[theme];
  const { exercises, saveCode } = useExercisesContext();
  const { autoMain } = useSettings();

  const exercise = exercises.find((ex) => ex.id === id);
  const normalized = useMemo(
    () => (exercise ? normalizeExercise(exercise) : null),
    [exercise?.id]
  );
  const tests = normalized?.tests ?? [];

  const [code, setCode] = useState(exercise?.code || DEFAULT_BODY_CODE);
  const [activeTestId, setActiveTestId] = useState(tests[0]?.id);
  const [results, setResults] = useState<Record<string, Result | null>>({});
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!exercise) return;
    const norm = normalizeExercise(exercise);
    setCode(norm.code || DEFAULT_BODY_CODE);
    setActiveTestId(norm.tests[0]?.id);
    setResults({});
    setHasRun(false);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveCode(id, { code }), 500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [code, id]);

  if (!exercise || !normalized) {
    return (
      <View style={[styles.screen, { backgroundColor: c.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: c.muted }}>Ejercicio no encontrado.</Text>
      </View>
    );
  }

  const activeTest = tests.find((t) => t.id === activeTestId) || tests[0];
  const result = activeTest ? results[activeTest.id] : null;
  const stdout = result?.run?.stdout || '';
  const stderr = result?.run?.stderr || '';
  const compileError = result?.compile && result.compile.code !== 0
    ? (result.compile.stderr || result.compile.output || 'Error de compilación')
    : '';
  const exitCode = typeof result?.run?.code === 'number' ? result.run.code : null;
  const expected = activeTest?.expected || '';
  const issue = classifyRunIssue(result, compileError, exitCode);
  const match = hasRun && expected.trim() && !issue
    ? normalize(stdout) === normalize(expected) && exitCode === 0 && !compileError
    : null;
  const passedCount = tests.filter((t) => didPass(t, results[t.id] as Parameters<typeof didPass>[1])).length;

  const runSingle = async (test: typeof tests[0]) => {
    const harnessMode = hasMainFunction(test.stdin);
    const executableCode = harnessMode
      ? `${code.trimEnd()}\n\n${test.stdin.trimStart()}`
      : autoMain ? withAutoMain(code) : code;
    const runtimeStdin = harnessMode ? '' : test.stdin;
    return api.executeLocal({ code: executableCode, stdin: runtimeStdin, timeoutMs: 5000 }) as Promise<Result>;
  };

  const runTest = async (test = activeTest) => {
    if (!test) return;
    setRunning(true);
    setHasRun(true);
    setResults((cur) => ({ ...cur, [test.id]: null }));
    try {
      const data = await runSingle(test);
      setResults((cur) => {
        const next = { ...cur, [test.id]: data };
        saveCode(id, { progress: progressFromResults(tests, next as Parameters<typeof progressFromResults>[1]) });
        return next;
      });
    } catch (error) {
      const failed = systemFailure(error as Error) as Result;
      setResults((cur) => {
        const next = { ...cur, [test.id]: failed };
        saveCode(id, { progress: progressFromResults(tests, next as Parameters<typeof progressFromResults>[1]) });
        return next;
      });
    } finally {
      setRunning(false);
    }
  };

  const runAll = async () => {
    setRunning(true);
    setHasRun(true);
    const nextResults: Record<string, Result> = {};
    for (const test of tests) {
      setActiveTestId(test.id);
      setResults((cur) => ({ ...cur, [test.id]: null }));
      try {
        nextResults[test.id] = await runSingle(test);
      } catch (error) {
        nextResults[test.id] = systemFailure(error as Error) as Result;
      }
      setResults((cur) => ({ ...cur, [test.id]: nextResults[test.id] }));
    }
    saveCode(id, { progress: progressFromResults(tests, nextResults as Parameters<typeof progressFromResults>[1]) });
    setRunning(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: c.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TopBar
        title={exercise.title || 'Runner'}
        subtitle={`${passedCount}/${tests.length} tests · ${autoMain ? 'Auto main' : 'Manual'}`}
        colors={c}
        left={<Button icon={ArrowLeft} onPress={() => router.back()} colors={c} />}
        right={
          <View style={styles.topbarRight}>
            <StatusPill label={running ? 'Ejecutando' : 'Listo'} tone={running ? 'warning' : 'success'} colors={c} />
            <Button
              icon={RotateCcw}
              disabled={running}
              onPress={() => setCode(autoMain ? DEFAULT_BODY_CODE : DEFAULT_MAIN_CODE)}
              colors={c}
            />
            <Button
              variant="primary"
              icon={Play}
              loading={running}
              disabled={running}
              onPress={() => runTest()}
              colors={c}
            >
              {running ? 'Ejecutando' : 'Run'}
            </Button>
          </View>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Enunciado */}
        <Panel title="Enunciado" icon={BookOpen} accent colors={c}>
          <Text style={[styles.statement, { color: c.muted }]} selectable>
            {exercise.statement || 'Este ejercicio no tiene enunciado.'}
          </Text>
        </Panel>

        {/* Editor */}
        <Panel title={`Main.kt · ${passedCount}/${tests.length} tests`} icon={FileCode2} accent noPadding colors={c}>
          <KotlinEditor code={code} theme={theme} onChange={setCode} onRun={runTest} height={300} />
        </Panel>

        {/* Casos de prueba */}
        <Panel title="Casos de prueba" icon={Terminal} colors={c}>
          <View style={styles.ioSection}>
            <TestCaseTabs
              tests={tests}
              results={results as Record<string, Parameters<typeof TestCaseTabs>[0]['results'][string]>}
              activeId={activeTest?.id}
              onSelect={setActiveTestId}
              colors={c}
            />
          </View>
        </Panel>

        {/* Entrada */}
        <Panel
          title={`${hasMainFunction(activeTest?.stdin) ? 'Main de prueba' : 'Entrada'} · ${activeTest?.name || ''}`}
          icon={Terminal}
          colors={c}
        >
          <Text style={[styles.ioText, { color: activeTest?.stdin ? c.text : c.faint, fontFamily: 'JetBrainsMono' }]} selectable>
            {activeTest?.stdin || '(sin entrada)'}
          </Text>
        </Panel>

        {/* Salida esperada */}
        <Panel
          title="Salida esperada"
          icon={match === true ? Check : match === false ? X : Terminal}
          colors={c}
        >
          <Text style={[styles.ioText, { color: activeTest?.expected ? c.text : c.faint, fontFamily: 'JetBrainsMono' }]} selectable>
            {activeTest?.expected || '(sin salida esperada)'}
          </Text>
        </Panel>

        {/* Salida real */}
        <Panel title="Salida real" icon={Terminal} accent colors={c}>
          <OutputBox
            running={running}
            hasRun={hasRun}
            stdout={stdout}
            stderr={stderr}
            compileError={compileError}
            exitCode={exitCode}
            match={match}
            issue={issue}
            expected={expected}
            colors={c}
          />
        </Panel>

        {/* Botón Run all al final */}
        <Button icon={Play} disabled={running} onPress={runAll} colors={c}>
          Ejecutar todos los casos
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 32 },
  topbarRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statement: { fontSize: 14, lineHeight: 22 },
  ioSection: { gap: 10 },
  ioText: { fontSize: 13, lineHeight: 20 },
});
