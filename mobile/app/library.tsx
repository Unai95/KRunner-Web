import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { BookOpen, ChevronRight, Pencil, Plus, RotateCcw, Settings, Trash2 } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { useThemeContext } from '../context/ThemeContext';
import { useExercisesContext } from '../context/ExercisesContext';
import { normalizeExercise, emptyExercise, DEFAULT_BODY_CODE } from '../lib/exercises.js';
import { TopBar } from '../components/ui/TopBar';
import { Button } from '../components/ui/Button';
import { StatusPill } from '../components/ui/StatusPill';
import { IconAction } from '../components/ui/IconAction';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export default function LibraryScreen() {
  const { theme } = useThemeContext();
  const c = colors[theme];
  const { exercises, storageWarning, deleteExercise, saveCode } = useExercisesContext();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const targetExercise = exercises.find((ex) => ex.id === deleteTarget);

  const openNew = () => {
    const ex = emptyExercise();
    router.push({ pathname: '/exercise-form/[id]', params: { id: 'new', draft: JSON.stringify(ex) } });
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.bg }]}>
      <TopBar
        title="KRunner"
        subtitle={`${exercises.length} ejercicios · Kotlin`}
        colors={c}
        right={
          <View style={styles.topbarRight}>
            <StatusPill label="API" tone="success" colors={c} />
            <IconAction icon={Settings} colors={c} onPress={() => router.push('/settings')} />
            <Button variant="primary" icon={Plus} onPress={openNew} colors={c}>Nuevo</Button>
          </View>
        }
      />

      {storageWarning ? (
        <View style={[styles.notice, { backgroundColor: `${c.error}15`, borderColor: `${c.error}33` }]}>
          <Text style={{ color: c.error, fontSize: 13 }}>{storageWarning}</Text>
        </View>
      ) : null}

      {exercises.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: c.panel2 }]}>
            <BookOpen size={28} color={c.accent} />
          </View>
          <Text style={[styles.emptyTitle, { color: c.text }]}>No hay ejercicios todavía</Text>
          <Text style={[styles.emptyDesc, { color: c.muted }]}>Crea tu primer ejercicio de Kotlin con enunciado, casos de prueba y una solución inicial.</Text>
          <Button variant="primary" icon={Plus} onPress={openNew} colors={c}>Crear ejercicio</Button>
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(ex) => ex.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: ex, index }) => {
            const normalized = normalizeExercise(ex);
            const progress = normalized.progress;
            const status = progress.status || 'pending';
            const passed = progress.passed;
            const total = progress.total || normalized.tests.length;
            const statusText = status === 'solved' ? 'Resuelto' : status === 'partial' ? `Faltan ${Math.max(total - passed, 0)}` : 'Pendiente';
            const pillColor = status === 'solved' ? c.success : status === 'partial' ? c.warning : c.muted;
            const preview = (ex.statement || '').split('\n').find(Boolean) || 'Sin enunciado';

            return (
              <Pressable
                style={({ pressed }) => [styles.card, { backgroundColor: c.panel, borderColor: c.border, opacity: pressed ? 0.8 : 1 }]}
                onPress={() => router.push({ pathname: '/runner/[id]', params: { id: ex.id } })}
              >
                <View style={styles.cardHead}>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.eyebrow, { color: c.accent }]}>EJ #{String(index + 1).padStart(2, '0')}</Text>
                    <Text style={[styles.cardTitle, { color: c.text }]} numberOfLines={2}>{ex.title || 'Sin título'}</Text>
                    <View style={[styles.progressPill, { backgroundColor: `${pillColor}22`, borderColor: `${pillColor}44` }]}>
                      <Text style={[styles.progressText, { color: pillColor }]}>{statusText} · {passed}/{total}</Text>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <IconAction icon={RotateCcw} colors={c} onPress={() => {
                      saveCode(ex.id, {
                        code: DEFAULT_BODY_CODE,
                        progress: { passed: 0, total: normalized.tests.length, status: 'pending', updatedAt: Date.now() },
                      });
                    }} />
                    <IconAction icon={Pencil} colors={c} onPress={() => {
                      router.push({ pathname: '/exercise-form/[id]', params: { id: ex.id, draft: JSON.stringify(ex) } });
                    }} />
                    <IconAction icon={Trash2} danger colors={c} onPress={() => setDeleteTarget(ex.id)} />
                  </View>
                </View>
                <Text style={[styles.preview, { color: c.muted }]} numberOfLines={2}>
                  {preview.slice(0, 120)}{preview.length > 120 ? '...' : ''}
                </Text>
                <View style={[styles.cardFooter, { borderTopColor: c.border }]}>
                  <Text style={[styles.footerLeft, { color: c.faint }]}>{normalized.tests.length} casos de prueba</Text>
                  <View style={styles.footerRight}>
                    <Text style={[styles.footerAction, { color: c.accent }]}>Resolver</Text>
                    <ChevronRight size={13} color={c.accent} />
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Eliminar ejercicio"
          message={`Se borrará "${targetExercise?.title || 'Sin título'}" y el código guardado en él.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            deleteExercise(deleteTarget);
            setDeleteTarget(null);
          }}
          colors={c}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topbarRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  notice: { margin: 16, padding: 12, borderRadius: 8, borderWidth: 1 },
  list: { padding: 16, gap: 12 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 14 },
  emptyIcon: { width: 64, height: 64, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptyDesc: { fontSize: 14, lineHeight: 21, textAlign: 'center' },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 10 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  cardInfo: { flex: 1, gap: 5 },
  cardActions: { flexDirection: 'row', gap: 4 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  cardTitle: { fontSize: 15, fontWeight: '700', lineHeight: 21 },
  progressPill: { alignSelf: 'flex-start', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 10, borderWidth: 1 },
  progressText: { fontSize: 11, fontWeight: '600' },
  preview: { fontSize: 13, lineHeight: 19 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1 },
  footerLeft: { fontSize: 12 },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  footerAction: { fontSize: 13, fontWeight: '600' },
});
