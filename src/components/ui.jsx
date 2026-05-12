import { Loader2, Trash2 } from 'lucide-react';
import appIcon from '../../assets/icon-ui.png';

export function TopBar({ title, subtitle, left, right }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        {left}
        <div className="logo">
          <img src={appIcon} alt="" />
        </div>
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="topbar-actions">{right}</div>
    </header>
  );
}

export function Panel({ title, icon: Icon, accent = false, noPadding = false, children }) {
  return (
    <section className="panel">
      <header className="panel-header">
        <Icon size={14} />
        <span className={accent ? 'accent-text' : ''}>{title}</span>
      </header>
      <div className={noPadding ? 'panel-body no-padding' : 'panel-body'}>{children}</div>
    </section>
  );
}

export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Button({ children, icon: Icon, variant = 'ghost', disabled, onClick }) {
  return (
    <button className={`button ${variant}`} disabled={disabled} onClick={onClick}>
      {Icon && <Icon size={15} className={Icon === Loader2 ? 'spin' : ''} />}
      {children}
    </button>
  );
}

export function IconAction({ icon: Icon, label, danger = false, onClick }) {
  return (
    <button className={`icon-action ${danger ? 'danger' : ''}`} title={label} onClick={onClick}>
      <Icon size={15} />
    </button>
  );
}

export function StatusPill({ label, tone = 'neutral' }) {
  return <span className={`status-pill ${tone}`}>{label}</span>;
}

export function ResultBadge({ passed }) {
  return <span className={`result-badge ${passed ? 'passed' : 'failed'}`}>{passed ? 'Coincide' : 'No coincide'}</span>;
}

export function PreBlock({ title, value, tone = 'normal' }) {
  return (
    <div className={`pre-block ${tone}`}>
      <span>{title}</span>
      <pre>{value}</pre>
    </div>
  );
}

export function ConfirmDialog({ title, message, onCancel, onConfirm }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <Button onClick={onCancel}>Cancelar</Button>
          <Button variant="danger" icon={Trash2} onClick={onConfirm}>Eliminar</Button>
        </div>
      </div>
    </div>
  );
}
