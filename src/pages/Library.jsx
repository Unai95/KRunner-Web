import { useState } from 'react';
import { BookOpen, ChevronRight, Pencil, Plus, RotateCcw, Settings, Trash2 } from 'lucide-react';
import { Button, ConfirmDialog, IconAction, StatusPill, TopBar } from '../components/ui.jsx';
import { normalizeExercise } from '../lib/exercises.js';

export function Library({ exercises, storageWarning, onCreate, onEdit, onDelete, onReset, onSolve, onOpenSettings }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const targetExercise = exercises.find((exercise) => exercise.id === deleteTarget);

  return (
    <>
      <TopBar
        title="KRunner"
        subtitle={`${exercises.length} ejercicios - Kotlin local`}
        right={(
          <>
            <StatusPill label="Runner local" tone="success" />
            <IconAction icon={Settings} label="Ajustes" onClick={onOpenSettings} />
            <Button variant="primary" icon={Plus} onClick={onCreate}>Nuevo ejercicio</Button>
          </>
        )}
      />

      <main className="library-layout">
        {storageWarning && <div className="notice error">{storageWarning}</div>}

        <section className="library-heading">
          <div>
            <p className="eyebrow">Biblioteca local</p>
            <h2>Tus ejercicios</h2>
          </div>
          <p>Motor: <span>Local Java/Kotlin</span></p>
        </section>

        {exercises.length ? (
          <section className="exercise-grid">
            {exercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={index}
                onSolve={() => onSolve(exercise.id)}
                onEdit={() => onEdit(exercise.id)}
                onReset={() => onReset(exercise.id)}
                onDelete={() => setDeleteTarget(exercise.id)}
              />
            ))}
          </section>
        ) : (
          <section className="empty-library">
            <div className="empty-library-icon">
              <BookOpen size={28} />
            </div>
            <h3>No hay ejercicios todavia</h3>
            <p>Crea tu primer ejercicio de Kotlin con enunciado, casos de prueba y una solucion inicial.</p>
            <Button variant="primary" icon={Plus} onClick={onCreate}>Crear ejercicio</Button>
          </section>
        )}
      </main>

      {deleteTarget && (
        <ConfirmDialog
          title="Eliminar ejercicio"
          message={`Se borrara "${targetExercise?.title || 'Sin titulo'}" y el codigo guardado en el.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            onDelete(deleteTarget);
            setDeleteTarget(null);
          }}
        />
      )}
    </>
  );
}

function ExerciseCard({ exercise, index, onSolve, onEdit, onReset, onDelete }) {
  const preview = (exercise.statement || '').split('\n').find(Boolean) || 'Sin enunciado';
  const normalized = normalizeExercise(exercise);
  const progress = normalized.progress || {};
  const status = progress.status || 'pending';
  const passed = Number(progress.passed || 0);
  const total = Number(progress.total || normalized.tests.length);
  const statusText = status === 'solved'
    ? 'Resuelto'
    : status === 'partial'
      ? `Faltan ${Math.max(total - passed, 0)}`
      : 'Pendiente';

  return (
    <article className={`exercise-card ${status}`} onClick={onSolve}>
      <div className="exercise-card-head">
        <div>
          <p className="eyebrow accent">EJ #{String(index + 1).padStart(2, '0')}</p>
          <h3>{exercise.title || 'Sin titulo'}</h3>
          <span className={`progress-pill ${status}`}>{statusText} - {passed}/{total}</span>
        </div>
        <div className="icon-row" onClick={(event) => event.stopPropagation()}>
          <IconAction icon={RotateCcw} label="Hacer de nuevo" onClick={onReset} />
          <IconAction icon={Pencil} label="Editar" onClick={onEdit} />
          <IconAction icon={Trash2} label="Eliminar" danger onClick={onDelete} />
        </div>
      </div>
      <p className="exercise-preview">{preview.slice(0, 150)}{preview.length > 150 ? '...' : ''}</p>
      <footer>
        <span>{normalized.tests.length} casos de prueba</span>
        <strong>Resolver <ChevronRight size={14} /></strong>
      </footer>
    </article>
  );
}
