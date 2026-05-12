export function systemFailure(error) {
  const message = error.message || String(error);
  const cleanMessage = message.replace(/^(LIMIT|ENVIRONMENT|RUNNER):\s*/, '');
  const kind = message.startsWith('LIMIT:')
    ? 'limit'
    : message.startsWith('ENVIRONMENT:')
      ? 'environment'
      : 'system';

  return {
    systemError: cleanMessage,
    errorKind: kind,
    run: { stdout: '', stderr: cleanMessage, code: 1 },
  };
}

export function classifyRunIssue(result, compileError, exitCode) {
  if (!result) return null;
  if (result.systemError) {
    return {
      label: labelForKind(result.errorKind || 'system'),
      hint: result.systemError,
    };
  }
  if (compileError) {
    return {
      label: 'Error de compilacion',
      hint: 'El codigo no se pudo compilar. Revisa el mensaje del compilador debajo.',
    };
  }
  if (exitCode === 124) {
    return {
      label: 'Tiempo excedido',
      hint: 'El programa tardo demasiado. Revisa bucles infinitos o lecturas que esperan mas entrada.',
    };
  }

  const combinedError = `${result.run?.stderr || ''}\n${result.run?.output || ''}`;
  if (/OutOfMemoryError|Java heap space/i.test(combinedError)) {
    return {
      label: 'Memoria excedida',
      hint: 'El programa uso demasiada memoria para el runner local.',
    };
  }
  if (combinedError.includes('[Salida truncada')) {
    return {
      label: 'Salida truncada',
      hint: 'El programa imprimio demasiada salida; se mostro solo una parte.',
    };
  }
  if (typeof exitCode === 'number' && exitCode !== 0) {
    return {
      label: 'Error en runtime',
      hint: 'El programa termino con error. Revisa stderr y el codigo de salida.',
    };
  }
  return null;
}

function labelForKind(kind) {
  if (kind === 'limit') return 'Limite del runner';
  if (kind === 'environment') return 'Entorno incompleto';
  return 'Error del sistema';
}
