import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Server, Sliders } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { useThemeContext } from '../context/ThemeContext';
import { useSettings } from '../hooks/useSettings';
import { TopBar } from '../components/ui/TopBar';
import { Button } from '../components/ui/Button';
import { Panel } from '../components/ui/Panel';

export default function SettingsScreen() {
  const { theme, setTheme } = useThemeContext();
  const c = colors[theme];
  const { autoMain, setAutoMain, serverUrl, setServerUrl } = useSettings();

  return (
    <View style={[styles.screen, { backgroundColor: c.bg }]}>
      <TopBar
        title="Ajustes"
        colors={c}
        left={<Button icon={ArrowLeft} onPress={() => router.back()} colors={c} />}
      />

      <View style={styles.content}>
        <Panel title="Apariencia" icon={Sliders} colors={c}>
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowLabel, { color: c.text }]}>Tema oscuro</Text>
              <Text style={[styles.rowDesc, { color: c.muted }]}>Cambia entre modo oscuro y claro</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
              trackColor={{ false: c.border, true: c.accent }}
              thumbColor={theme === 'dark' ? c.accent2 : c.faint}
            />
          </View>
        </Panel>

        <Panel title="Editor" icon={Sliders} colors={c}>
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowLabel, { color: c.text }]}>Auto main</Text>
              <Text style={[styles.rowDesc, { color: c.muted }]}>Envuelve tu código en fun main() automáticamente si no lo tiene</Text>
            </View>
            <Switch
              value={autoMain}
              onValueChange={setAutoMain}
              trackColor={{ false: c.border, true: c.accent }}
              thumbColor={autoMain ? c.accent2 : c.faint}
            />
          </View>
        </Panel>

        <Panel title="Servidor de ejecución" icon={Server} colors={c}>
          <Text style={[styles.fieldLabel, { color: c.muted }]}>URL del servidor</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.panel2, borderColor: c.border, color: c.text }]}
            value={serverUrl}
            onChangeText={setServerUrl}
            placeholder="https://krunner-api.up.railway.app"
            placeholderTextColor={c.faint}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <Text style={[styles.hint, { color: c.faint }]}>
            El servidor ejecuta el código Kotlin y devuelve el resultado. Puedes desplegarlo tú mismo o usar el servidor oficial.
          </Text>
        </Panel>

        <View style={[styles.info, { backgroundColor: c.panel, borderColor: c.border }]}>
          <Text style={[styles.infoText, { color: c.muted }]}>
            KRunner Móvil envía el código al servidor de ejecución, que lo compila y ejecuta de forma aislada. El servidor no almacena tu código.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600' },
  rowDesc: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 7, paddingHorizontal: 10, paddingVertical: 9, fontSize: 13 },
  hint: { fontSize: 11, lineHeight: 16, marginTop: 6 },
  info: { borderRadius: 10, borderWidth: 1, padding: 14 },
  infoText: { fontSize: 12, lineHeight: 19 },
});
