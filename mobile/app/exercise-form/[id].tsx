import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AlertTriangle, ArrowLeft, Plus, Save, Trash2 } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useThemeContext } from '../../context/ThemeContext';
import { useExercisesContext } from '../../context/ExercisesContext';
import { emptyExercise, newId, normalizeExercise } from '../../lib/exercises.js';
import { TopBar } from '../../components/ui/TopBar';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { IconAction } from '../../components/ui/IconAction';

interface TestCase {
  id: string;
  name: string;
  stdin: string;
  expected: string;
}

interface Exercise {
  id: string;
  title: string;
  statement: string;
  tests: TestCase[];
  code: string;
  createdAt: number;
  [key: string]: unknown;
}

export default function ExerciseFormScreen() {
  const { id, draft } = useLocalSearchParams<{ id: string; draft: string }>();
  const { theme } = useThemeContext();
  const c = colors[theme];
  const { updateExercise } = useExercisesContext();

  const initial: Exercise = (() => {
    try {
      if (draft) return JSON.parse(draft) as Exercise;
    } catch {}
    return emptyExercise() as Exercise;
  })();

  const [form, setForm] = useState<Exercise>(initial);
  const [error, setError] = useState('');

  const update = (field: keyof Exercise, value: unknown) => setForm((cur) => ({ ...cur, [field]: value }));

  const save = () => {
    if (!form.title.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    updateExercise(normalizeExercise({ ...form, title: form.title.trim() }) as ReturnType<typeof normalizeExercise>);
    router.back();
  };

  const updateTest = (testId: string, patch: Partial<TestCase>) => {
    update('tests', form.tests.map((t) => t.id === testId ? { ...t, ...patch } : t));
  };

  const addTest = () => {
    update('tests', [...form.tests, { id: newId(), name: `Caso ${form.tests.length + 1}`, stdin: '', expected: '' }]);
  };

  const removeTest = (testId: string) => {
    if (form.tests.length === 1) return;
    update('tests', form.tests.filter((t) => t.id !== testId));
  };

  const inputStyle = [styles.input, { backgroundColor: c.panel2, borderColor: c.border, color: c.text }] as const;
  const textareaStyle = [styles.textarea, { backgroundColor: c.panel2, borderColor: c.border, color: c.text }] as const;

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: c.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TopBar
        title={id === 'new' ? 'Nuevo ejercicio' : 'Editar ejercicio'}
        subtitle="Enunciado y casos de prueba"
        colors={c}
        left={<Button icon={ArrowLeft} onPress={() => router.back()} colors={c} />}
        right={<Button variant="primary" icon={Save} onPress={save} colors={c}>Guardar</Button>}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error ? (
          <View style={[styles.errorBox, { backgroundColor: `${c.error}15`, borderColor: `${c.error}33` }]}>
            <AlertTriangle size={15} color={c.error} />
            <Text style={{ color: c.error, fontSize: 13 }}>{error}</Text>
          </View>
        ) : null}

        <Field label="Título" colors={c}>
          <TextInput
            style={inputStyle}
            value={form.title}
            onChangeText={(v) => update('title', v)}
            placeholder="Ej: Suma de dos números"
            placeholderTextColor={c.faint}
          />
        </Field>

        <Field label="Enunciado" colors={c}>
          <TextInput
            style={textareaStyle}
            value={form.statement}
            onChangeText={(v) => update('statement', v)}
            placeholder="Describe qué debe hacer el programa..."
            placeholderTextColor={c.faint}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </Field>

        <View style={styles.testsSection}>
          <View style={styles.testsSectionHead}>
            <View>
              <Text style={[styles.eyebrow, { color: c.accent }]}>TESTS</Text>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Casos de prueba</Text>
            </View>
            <Button icon={Plus} onPress={addTest} colors={c}>Añadir caso</Button>
          </View>

          {form.tests.map((test, index) => (
            <View key={test.id} style={[styles.testCard, { backgroundColor: c.panel, borderColor: c.border }]}>
              <View style={styles.testCardHead}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.testLabel, { color: c.muted }]}>Nombre del caso {index + 1}</Text>
                  <TextInput
                    style={inputStyle}
                    value={test.name}
                    onChangeText={(v) => updateTest(test.id, { name: v })}
                    placeholderTextColor={c.faint}
                  />
                </View>
                <IconAction icon={Trash2} danger colors={c} onPress={() => removeTest(test.id)} />
              </View>

              <Field label="Entrada (stdin)" colors={c}>
                <TextInput
                  style={textareaStyle}
                  value={test.stdin}
                  onChangeText={(v) => updateTest(test.id, { stdin: v })}
                  placeholder="stdin"
                  placeholderTextColor={c.faint}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Field>

              <Field label="Salida esperada (stdout)" colors={c}>
                <TextInput
                  style={textareaStyle}
                  value={test.expected}
                  onChangeText={(v) => updateTest(test.id, { expected: v })}
                  placeholder="stdout esperado"
                  placeholderTextColor={c.faint}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Field>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 8, borderWidth: 1 },
  input: { borderWidth: 1, borderRadius: 7, paddingHorizontal: 10, paddingVertical: 9, fontSize: 14 },
  textarea: { borderWidth: 1, borderRadius: 7, paddingHorizontal: 10, paddingVertical: 9, fontSize: 13, lineHeight: 20 },
  testsSection: { gap: 12 },
  testsSectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  testCard: { borderRadius: 10, borderWidth: 1, padding: 12, gap: 12 },
  testCardHead: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  testLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
});
