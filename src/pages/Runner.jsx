import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Check, FileCode2, Loader2, Play, RotateCcw, Terminal, X } from 'lucide-react';
import { KotlinEditor } from '../components/KotlinEditor.jsx';
import { OutputBox } from '../components/OutputBox.jsx';
import { TestCaseTabs } from '../components/TestCaseTabs.jsx';
import { Button, Panel, StatusPill, TopBar } from '../components/ui.jsx';
import { api } from '../lib/api.js';
import { classifyRunIssue, systemFailure } from '../lib/errorClassifier.js';
import { DEFAULT_BODY_CODE, DEFAULT_MAIN_CODE, normalizeExercise } from '../lib/exercises.js';
import { didPass, hasMainFunction, normalize, progressFromResults, withAutoMain } from '../lib/runnerUtils.js';

export function Runner({ exercise, theme, autoMain, onBack, onSaveCode, onProgress }) {
  const tests = useMemo(() => normalizeExercise(exercise).tests, [exercise]);
  const [code, setCode] = useState(exercise.code || DEFAULT_BODY_CODE);
  const [activeTestId, setActiveTestId] = useState(tests[0]?.id);
  const [results, setResults] = useState({});
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    const normalized = normalizeExercise(exercise);
    setCode(normalized.code || DEFAULT_BODY_CODE);
    setActiveTestId(normalized.tests[0]?.id);
    setResults({});
    setHasRun(false);
  }, [exercise.id]);

  useEffect(() => {
    const timer = setTimeout(() => onSaveCode(exercise.id, { code }), 500);
    return () => clearTimeout(timer);
  }, [code, exercise.id]);

  const activeTest = tests.find((test) => test.id === activeTestId) || tests[0];
  const result = activeTest ? results[activeTest.id] : null;
  const stdout = result?.run?.stdout || '';
  const stderr = result?.run?.stderr || '';
  const compileError = result?.compile && result.compile.code !== 0
    ? (result.compile.stderr || result.compile.output || 'Error de compilacion')
    : '';
  const exitCode = typeof result?.run?.code === 'number' ? result.run.code : null;
  const expected = activeTest?.expected || '';
  const issue = classifyRunIssue(result, compileError, exitCode);
  const match = hasRun && expected.trim() && !issue
    ? normalize(stdout) === normalize(expected) && exitCode === 0 && !compileError
    : null;

  const runSingle = async (test) => {
    const harnessMode = hasMainFunction(test.stdin);
    const executableCode = harnessMode
      ? `${code.trimEnd()}\n\n${test.stdin.trimStart()}`
      : autoMain ? withAutoMain(code) : code;
    const runtimeStdin = harnessMode ? '' : test.stdin;
    return api.executeLocal({ code: executableCode, stdin: runtimeStdin, timeoutMs: 5000 });
  };

  const runTest = async (test = activeTest) => {
    if (!test) return;
    setRunning(true);
    setHasRun(true);
    setResults((current) => ({ ...current, [test.id]: null }));
    try {
      const data = await runSingle(test);
      setResults((current) => {
        const next = { ...current, [test.id]: data };
        onProgress(progressFromResults(tests, next));
        return next;
      });
    } catch (error) {
      const failed = systemFailure(error);
      setResults((current) => {
        const next = { ...current, [test.id]: failed };
        onProgress(progressFromResults(tests, next));
        return next;
      });
    } finally {
      setRunning(false);
    }
  };

  const runAll = async () => {
    setRunning(true);
    setHasRun(true);
    const nextResults = {};
    for (const test of tests) {
      setActiveTestId(test.id);
      setResults((current) => ({ ...current, [test.id]: null }));
      try {
        nextResults[test.id] = await runSingle(test);
      } catch (error) {
        nextResults[test.id] = systemFailure(error);
      }
      setResults((current) => ({ ...current, [test.id]: nextResults[test.id] }));
    }
    onProgress(progressFromResults(tests, nextResults));
    setRunning(false);
  };

  const passedCount = tests.filter((test) => didPass(test, results[test.id])).length;

  return (
    <>
      <TopBar
        title={exercise.title}
        subtitle={`Resolviendo - Runner local${autoMain ? ' - Auto main' : ''}`}
        left={<Button icon={ArrowLeft} onClick={onBack}>Volver</Button>}
        right={(
          <>
            <StatusPill label={running ? 'Ejecutando' : 'Listo'} tone={running ? 'warning' : 'success'} />
            <Button icon={RotateCcw} disabled={running} onClick={() => setCode(autoMain ? DEFAULT_BODY_CODE : DEFAULT_MAIN_CODE)}>Reset</Button>
            <Button icon={Play} disabled={running} onClick={runAll}>Run all</Button>
            <Button variant="primary" icon={running ? Loader2 : Play} disabled={running} onClick={() => runTest()}>
              {running ? 'Ejecutando' : 'Run Ctrl+Enter'}
            </Button>
          </>
        )}
      />
      <main className="runner-layout">
        <Panel title="Enunciado" icon={BookOpen} accent>
          <div className="statement">{exercise.statement || 'Este ejercicio no tiene enunciado.'}</div>
        </Panel>

        <Panel title={`Main.kt - ${passedCount}/${tests.length} tests`} icon={FileCode2} accent noPadding>
          <KotlinEditor code={code} theme={theme} onChange={setCode} onRun={() => runTest()} />
        </Panel>

        <section className="io-stack">
          <Panel title="Casos de prueba" icon={Terminal}>
            <TestCaseTabs tests={tests} results={results} activeId={activeTest?.id} onSelect={setActiveTestId} />
          </Panel>
          <Panel title={`${hasMainFunction(activeTest?.stdin) ? 'Main de prueba' : 'Entrada'} - ${activeTest?.name || ''}`} icon={Terminal}>
            <pre className="readonly-io">{activeTest?.stdin || '(sin entrada)'}</pre>
          </Panel>
          <Panel title="Salida esperada" icon={match === true ? Check : match === false ? X : Terminal}>
            <pre className="readonly-io">{activeTest?.expected || '(sin salida esperada)'}</pre>
          </Panel>
          <Panel title="Salida real" icon={Terminal} accent>
            <OutputBox running={running} hasRun={hasRun} stdout={stdout} stderr={stderr} compileError={compileError} exitCode={exitCode} match={match} issue={issue} expected={expected} />
          </Panel>
        </section>
      </main>
    </>
  );
}
