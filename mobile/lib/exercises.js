export const DEFAULT_BODY_CODE = 'val input = readLine() ?: ""\nprintln(input)';
export const DEFAULT_MAIN_CODE = 'fun main() {\n    val input = readLine() ?: ""\n    println(input)\n}';

export const EXAMPLE_EXERCISE = {
  id: 'example-media-notas',
  title: 'Media de tres notas',
  statement: `Lee tres notas (numeros decimales) desde la entrada estandar, una por linea, y muestra la media con dos decimales en el siguiente formato exacto:

Media: X.XX

Pistas:
- Usa readLine()!!.toDouble() para convertir cada linea a Double.
- Usa "%.2f".format(media) para formatear con dos decimales.
- Si te sale coma en vez de punto, usa java.util.Locale.US.`,
  tests: [
    { id: 'case-media-1', name: 'Caso 1', stdin: '7.5\n8.0\n6.5', expected: 'Media: 7.33' },
    { id: 'case-media-2', name: 'Caso 2', stdin: '10\n9\n8', expected: 'Media: 9.00' },
  ],
  code: `import java.util.Locale

Locale.setDefault(Locale.US)
val a = readLine()!!.toDouble()
val b = readLine()!!.toDouble()
val c = readLine()!!.toDouble()
val media = (a + b + c) / 3
println("Media: %.2f".format(media))`,
  createdAt: Date.now(),
};

export const newId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `ex-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const emptyExercise = () => ({
  id: newId(),
  title: '',
  statement: '',
  tests: [{ id: newId(), name: 'Caso 1', stdin: '', expected: '' }],
  code: DEFAULT_BODY_CODE,
  createdAt: Date.now(),
});

export const isExerciseLike = (exercise) => (
  Boolean(exercise)
  && typeof exercise === 'object'
  && !Array.isArray(exercise)
);

export const normalizeExercise = (exercise) => {
  const source = isExerciseLike(exercise) ? exercise : {};
  const tests = Array.isArray(source.tests) && source.tests.length
    ? source.tests.filter((test) => test && typeof test === 'object')
    : [{ id: `${source.id || newId()}-case-1`, name: 'Caso 1', stdin: source.stdin || '', expected: source.expected || '' }];

  const progress = source.progress && typeof source.progress === 'object' ? source.progress : {};
  const id = typeof source.id === 'string' && source.id.trim() ? source.id : newId();

  return {
    ...source,
    id,
    title: typeof source.title === 'string' ? source.title : '',
    statement: typeof source.statement === 'string' ? source.statement : '',
    code: typeof source.code === 'string' ? source.code : DEFAULT_BODY_CODE,
    createdAt: Number(source.createdAt || Date.now()),
    tests: (tests.length ? tests : [{ id: `${id}-case-1`, name: 'Caso 1', stdin: '', expected: '' }]).map((test, index) => ({
      id: typeof test.id === 'string' && test.id.trim() ? test.id : `${id}-case-${index + 1}`,
      name: typeof test.name === 'string' && test.name.trim() ? test.name : `Caso ${index + 1}`,
      stdin: typeof test.stdin === 'string' ? test.stdin : '',
      expected: typeof test.expected === 'string' ? test.expected : '',
    })),
    progress: {
      passed: Number(progress.passed || 0),
      total: Number(progress.total || tests.length),
      status: progress.status || 'pending',
      updatedAt: progress.updatedAt || null,
    },
  };
};

export const normalizeExercises = (items) => (
  Array.isArray(items)
    ? items.filter(isExerciseLike).map(normalizeExercise)
    : []
);
