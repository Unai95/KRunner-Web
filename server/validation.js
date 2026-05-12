const MAX_CODE_BYTES = 256 * 1024;
const MAX_STDIN_BYTES = 64 * 1024;
const MIN_TIMEOUT_MS = 1000;
const MAX_TIMEOUT_MS = 10000;

function formatBytes(bytes) {
  return bytes >= 1024 ? `${Math.round(bytes / 1024)} KB` : `${bytes} bytes`;
}

export function clampTimeout(value) {
  const timeout = Number(value || 5000);
  if (!Number.isFinite(timeout)) return 5000;
  return Math.max(MIN_TIMEOUT_MS, Math.min(MAX_TIMEOUT_MS, Math.trunc(timeout)));
}

export function validatePayload(body) {
  if (!body || typeof body !== 'object') {
    return 'El cuerpo de la peticion debe ser un objeto JSON.';
  }
  const code = String(body.code ?? '');
  const stdin = String(body.stdin ?? '');

  if (!code.trim()) {
    return 'El campo "code" es obligatorio.';
  }
  if (Buffer.byteLength(code, 'utf8') > MAX_CODE_BYTES) {
    return `LIMIT: El codigo supera el limite de ${formatBytes(MAX_CODE_BYTES)} para el runner.`;
  }
  if (Buffer.byteLength(stdin, 'utf8') > MAX_STDIN_BYTES) {
    return `LIMIT: La entrada supera el limite de ${formatBytes(MAX_STDIN_BYTES)} para el runner.`;
  }
  return null;
}
