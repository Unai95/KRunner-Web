import { execFile } from 'node:child_process';
import { mkdtemp, writeFile, rm, access } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { clampTimeout } from './validation.js';

const SERVER_DIR = dirname(fileURLToPath(import.meta.url));
const JAR_CANDIDATES = [
  process.env.KOTLIN_RUNNER_JAR,
  join(SERVER_DIR, 'kotlin-local-runner.jar'),
  resolve(SERVER_DIR, '..', 'runner', 'target', 'kotlin-local-runner-0.1.0.jar'),
].filter(Boolean);

async function findRunnerJar() {
  for (const candidate of JAR_CANDIDATES) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next known location.
    }
  }
  throw new Error('ENVIRONMENT: No encuentro el runner JAR. Ejecuta "npm run build:runner" antes de arrancar el servidor.');
}

function execFileText(command, args, options) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { ...options, windowsHide: true, maxBuffer: 1024 * 1024 * 4 }, (error, stdout, stderr) => {
      if (error) {
        const message = stderr || error.message;
        if (/ENOENT|not recognized|not found/i.test(message)) {
          reject(new Error('ENVIRONMENT: No se encontro Java en el sistema.'));
          return;
        }
        reject(new Error(`RUNNER: ${message}`));
        return;
      }
      resolve(stdout);
    });
  });
}

export async function runKotlin(payload) {
  const code = String(payload.code ?? '');
  const stdin = String(payload.stdin ?? '');
  const timeoutMs = clampTimeout(payload.timeoutMs);
  const jarPath = await findRunnerJar();

  const workDir = await mkdtemp(join(tmpdir(), 'kotlin-server-'));
  const sourcePath = join(workDir, 'Main.kt');
  const stdinPath = join(workDir, 'stdin.txt');
  await writeFile(sourcePath, code, 'utf8');
  await writeFile(stdinPath, stdin, 'utf8');

  try {
    const stdout = await execFileText(
      'java',
      ['-jar', jarPath, sourcePath, stdinPath, String(timeoutMs)],
      { timeout: timeoutMs + 15000 }
    );
    try {
      return JSON.parse(stdout);
    } catch {
      throw new Error('RUNNER: El runner devolvio una respuesta no valida.');
    }
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}
