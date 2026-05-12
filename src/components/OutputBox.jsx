import { Loader2, Terminal } from 'lucide-react';
import { PreBlock, ResultBadge } from './ui.jsx';

export function OutputBox({ running, hasRun, stdout, stderr, compileError, exitCode, match, issue, expected }) {
  if (running) {
    return <div className="output-muted"><Loader2 className="spin" size={15} /> Compilando y ejecutando...</div>;
  }
  if (!hasRun) {
    return <div className="output-muted">Pulsa Run o Ctrl+Enter para ejecutar.</div>;
  }
  return (
    <div className="output-box">
      {match !== null && <ResultBadge passed={match} />}
      {exitCode !== null && <span className={`exit-code ${exitCode === 0 ? 'ok' : 'bad'}`}>EXIT {exitCode}</span>}
      {issue && <span className="result-badge failed">{issue.label}</span>}
      {issue?.hint && (
        <div className="notice error">
          <Terminal size={15} />
          {issue.hint}
        </div>
      )}
      {compileError && <PreBlock title="Error de compilacion" tone="error" value={compileError} />}
      {stdout && <PreBlock title="stdout" value={stdout} />}
      {stderr && <PreBlock title="stderr" tone="error" value={stderr} />}
      {!stdout && !stderr && !compileError && (
        <div className="notice subtle">
          <Terminal size={15} />
          El programa termino bien, pero no imprimio nada. Si esperas una salida, usa println(...). Auto main solo envuelve tu codigo, no imprime automaticamente la ultima expresion.
          {expected ? ' Hay una salida esperada configurada para este caso.' : ''}
        </div>
      )}
    </div>
  );
}
