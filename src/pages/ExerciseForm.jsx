import { useState } from 'react';
import { AlertTriangle, ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { Button, Field, IconAction, TopBar } from '../components/ui.jsx';
import { emptyExercise, newId } from '../lib/exercises.js';

export function ExerciseForm({ exercise, onCancel, onSave }) {
  const [draft, setDraft] = useState(exercise || emptyExercise());
  const [error, setError] = useState('');

  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  const save = () => {
    if (!draft.title.trim()) {
      setError('El titulo es obligatorio.');
      return;
    }
    onSave({ ...draft, title: draft.title.trim() });
  };

  return (
    <>
      <TopBar
        title={exercise?.title ? 'Editar ejercicio' : 'Nuevo ejercicio'}
        subtitle="Enunciado y casos de prueba"
        left={<Button icon={ArrowLeft} onClick={onCancel}>Volver</Button>}
        right={<Button variant="primary" icon={Save} onClick={save}>Guardar</Button>}
      />
      <main className="form-layout">
        {error && <div className="notice error"><AlertTriangle size={16} />{error}</div>}
        <Field label="Titulo">
          <input value={draft.title} onChange={(event) => update('title', event.target.value)} placeholder="Ej: Suma de dos numeros" />
        </Field>
        <Field label="Enunciado">
          <textarea rows={9} value={draft.statement} onChange={(event) => update('statement', event.target.value)} placeholder="Describe que debe hacer el programa..." />
        </Field>
        <TestCaseEditor tests={draft.tests || []} onChange={(tests) => update('tests', tests)} />
      </main>
    </>
  );
}

function TestCaseEditor({ tests, onChange }) {
  const updateTest = (id, patch) => {
    onChange(tests.map((test) => test.id === id ? { ...test, ...patch } : test));
  };

  const addTest = () => {
    onChange([...tests, { id: newId(), name: `Caso ${tests.length + 1}`, stdin: '', expected: '' }]);
  };

  const removeTest = (id) => {
    if (tests.length === 1) return;
    onChange(tests.filter((test) => test.id !== id));
  };

  return (
    <section className="test-editor">
      <div className="section-header">
        <div>
          <p className="eyebrow accent">Tests</p>
          <h3>Casos de prueba</h3>
        </div>
        <Button icon={Plus} onClick={addTest}>Anadir caso</Button>
      </div>

      {tests.map((test, index) => (
        <article className="test-form-card" key={test.id}>
          <div className="test-form-head">
            <Field label={`Nombre del caso ${index + 1}`}>
              <input value={test.name} onChange={(event) => updateTest(test.id, { name: event.target.value })} />
            </Field>
            <IconAction icon={Trash2} label="Eliminar caso" danger onClick={() => removeTest(test.id)} />
          </div>
          <div className="two-columns">
            <Field label="Entrada">
              <textarea rows={7} value={test.stdin} onChange={(event) => updateTest(test.id, { stdin: event.target.value })} placeholder="stdin" />
            </Field>
            <Field label="Salida esperada">
              <textarea rows={7} value={test.expected} onChange={(event) => updateTest(test.id, { expected: event.target.value })} placeholder="stdout esperado" />
            </Field>
          </div>
        </article>
      ))}
    </section>
  );
}
