import { ArrowLeft, FileCode2, MonitorCog } from 'lucide-react';
import { Button, TopBar } from '../components/ui.jsx';

export function SettingsView({ theme, autoMain, onTheme, onAutoMain, onBack }) {
  return (
    <>
      <TopBar
        title="Ajustes"
        subtitle="KRunner local"
        left={<Button icon={ArrowLeft} onClick={onBack}>Volver</Button>}
      />
      <main className="form-layout">
        <section className="settings-section">
          <div>
            <p className="eyebrow accent">Apariencia</p>
            <h3>Tema</h3>
          </div>
          <div className="mode-switch">
            <button className={theme === 'dark' ? 'active' : ''} onClick={() => onTheme('dark')}>Oscuro</button>
            <button className={theme === 'light' ? 'active' : ''} onClick={() => onTheme('light')}>Claro</button>
          </div>
        </section>

        <section className="settings-section">
          <div>
            <p className="eyebrow accent">Kotlin</p>
            <h3>Plantilla main</h3>
          </div>
          <div className="mode-switch">
            <button className={autoMain ? 'active' : ''} onClick={() => onAutoMain(true)}>Auto main</button>
            <button className={!autoMain ? 'active' : ''} onClick={() => onAutoMain(false)}>Manual</button>
          </div>
          <div className="notice">
            <FileCode2 size={16} />
            Con Auto main puedes escribir solo el cuerpo del programa. Si ya escribes fun main, se respeta tu codigo tal cual.
          </div>
        </section>

        <div className="notice">
          <MonitorCog size={16} />
          KRunner ejecuta todo en local usando Java y el compilador Kotlin empaquetado. No depende de servicios externos.
        </div>
      </main>
    </>
  );
}
